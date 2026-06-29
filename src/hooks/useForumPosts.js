/**
 * useForumPosts({ category, tags, sort, search, pageSize })
 *
 * Fetches forum_posts with join to profiles for author info.
 * Supports filtering, sorting, and cursor-based "load more" pagination.
 * Subscribes to realtime UPDATE events to sync upvote_count / comment_count.
 *
 * @param {object}   opts
 * @param {string}   [opts.category]  Category name. null / "Semua" = all.
 * @param {string[]} [opts.tags]      Tags to filter (array overlap match).
 * @param {string}   [opts.sort]      "terbaru" | "trending" | "top". Default: "terbaru"
 * @param {string}   [opts.search]    Free-text search against title (ilike).
 * @param {number}   [opts.pageSize]  Rows per page. Default: 20
 *
 * @returns {{
 *   posts: object[],
 *   loading: boolean,
 *   error: string|null,
 *   hasMore: boolean,
 *   loadMore: () => void,
 *   refresh: () => void,
 * }}
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

function getSupabaseErrorMessage(error) {
  if (!error) return null;
  const code = String(error?.code ?? error?.message ?? "");
  if (code === "PGRST116" || code.includes("not found"))
    return "Data tidak ditemukan.";
  if (code === "23505" || code.includes("unique"))
    return "Kamu sudah melakukan ini sebelumnya.";
  if (code === "42501" || code.includes("permission"))
    return "Kamu tidak punya akses untuk melakukan ini.";
  if (code === "23503" || code.includes("foreign key"))
    return "Referensi data tidak valid.";
  if (code.includes("network") || code.includes("fetch"))
    return "Koneksi bermasalah. Coba lagi.";
  return "Terjadi kesalahan. Silakan coba lagi.";
}

export function useForumPosts({
  category,
  tags,
  sort = "terbaru",
  search,
  pageSize = 20,
} = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const channelRef = useRef(null);

  // Stable serialization for tags array dependency
  const tagsKey = JSON.stringify(tags ?? []);
  const searchTrimmed = (search ?? "").trim();

  // Build the base query with all active filters
  const buildQuery = useCallback(
    (client) => {
      let q = client
        .from("forum_posts")
        .select(
          "*, profiles!forum_posts_user_id_fkey(id, username, avatar_url)",
        )
        .eq("is_deleted", false);

      if (category && category !== "Semua") {
        q = q.eq("category", category);
      }

      const parsedTags = JSON.parse(tagsKey);
      if (parsedTags.length > 0) {
        q = q.contains("tags", parsedTags);
      }

      if (searchTrimmed) {
        q = q.ilike("title", `%${searchTrimmed}%`);
      }

      return q;
    },
    [category, tagsKey, searchTrimmed],
  );

  // Apply sort order
  const applySort = useCallback(
    (q) => {
      switch (sort) {
        case "trending":
          return q
            .order("is_pinned", { ascending: false })
            .order("comment_count", { ascending: false })
            .order("created_at", { ascending: false });
        case "top":
          return q
            .order("is_pinned", { ascending: false })
            .order("upvote_count", { ascending: false })
            .order("created_at", { ascending: false });
        case "terbaru":
        default:
          return q
            .order("is_pinned", { ascending: false })
            .order("created_at", { ascending: false });
      }
    },
    [sort],
  );

  // Fetch posts
  useEffect(() => {
    if (!supabase) {
      setPosts([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Fetch paginated rows
        const rowQuery = applySort(buildQuery(supabase)).range(
          0,
          page * pageSize - 1,
        );
        const { data: rows, error: rowError } = await rowQuery;

        if (rowError) throw rowError;
        if (cancelled) return;

        // Normalize author fallback
        const normalized = (rows ?? []).map((p) => ({
          ...p,
          author: p.profiles?.username ?? "Pengguna",
          avatar_url: p.profiles?.avatar_url ?? null,
        }));

        setPosts(normalized);

        // Fetch total count (separate head query for efficiency)
        const { count, error: countError } = await buildQuery(supabase).select(
          "*",
          { count: "exact", head: true },
        );

        if (countError) throw countError;
        if (!cancelled) setTotal(count ?? 0);
      } catch (err) {
        if (!cancelled) setError(getSupabaseErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [
    category,
    tagsKey,
    sort,
    searchTrimmed,
    page,
    pageSize,
    buildQuery,
    applySort,
  ]);

  // Realtime: sync upvote_count + comment_count on UPDATE
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("forum_posts_feed_realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "forum_posts" },
        (payload) => {
          const updated = payload.new;
          setPosts((prev) =>
            prev.map((p) =>
              p.id === updated.id
                ? {
                    ...p,
                    upvote_count: updated.upvote_count,
                    comment_count: updated.comment_count,
                    is_pinned: updated.is_pinned,
                    is_locked: updated.is_locked,
                  }
                : p,
            ),
          );
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const refresh = useCallback(() => {
    setPage(1);
    // Force re-fetch by resetting posts so loading state shows
    setPosts([]);
    setTotal(0);
  }, []);

  const hasMore = posts.length < total;

  return { posts, loading, error, hasMore, loadMore, refresh };
}
