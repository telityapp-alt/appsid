/**
 * useForumPost(postId)
 *
 * Fetches a single forum post + all its comments (with nested replies).
 * Increments view_count via RPC on mount.
 * Subscribes to realtime INSERT events on forum_comments for this post.
 *
 * @param {string} postId - UUID of the post
 *
 * @returns {{
 *   post: object|null,
 *   comments: object[],
 *   loading: boolean,
 *   error: string|null,
 *   refresh: () => void,
 * }}
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

function getSupabaseErrorMessage(error) {
  if (!error) return null;
  const code = String(error?.code ?? error?.message ?? "");
  if (code === "PGRST116" || code.includes("not found"))
    return "Post tidak ditemukan.";
  if (code === "42501" || code.includes("permission"))
    return "Kamu tidak punya akses untuk melihat ini.";
  if (code.includes("network") || code.includes("fetch"))
    return "Koneksi bermasalah. Coba lagi.";
  return "Terjadi kesalahan. Silakan coba lagi.";
}

export function useForumPost(postId) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchKey, setFetchKey] = useState(0);

  const channelRef = useRef(null);

  const refresh = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  // Fetch post + comments
  useEffect(() => {
    if (!postId) {
      setPost(null);
      setComments([]);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setPost(null);
      setComments([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Fetch post with author profile
        const { data: postRow, error: postError } = await supabase
          .from("forum_posts")
          .select(
            "*, profiles!forum_posts_user_id_fkey(id, username, avatar_url)",
          )
          .eq("id", postId)
          .single();

        if (postError) throw postError;
        if (cancelled) return;

        const normalizedPost = postRow
          ? {
              ...postRow,
              author: postRow.profiles?.username ?? "Pengguna",
              avatar_url: postRow.profiles?.avatar_url ?? null,
            }
          : null;

        setPost(normalizedPost);

        // Fetch all comments for this post, oldest first
        const { data: commentRows, error: commentError } = await supabase
          .from("forum_comments")
          .select(
            "*, profiles!forum_comments_user_id_fkey(id, username, avatar_url)",
          )
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (commentError) throw commentError;
        if (cancelled) return;

        const normalizedComments = (commentRows ?? []).map((c) => ({
          ...c,
          author: c.profiles?.username ?? "Pengguna",
          avatar_url: c.profiles?.avatar_url ?? null,
        }));

        setComments(normalizedComments);

        // Increment view count — fire and forget, ignore errors
        supabase
          .rpc("increment_forum_view_count", { post_id: postId })
          .then(() => {})
          .catch(() => {});
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
  }, [postId, fetchKey]);

  // Realtime: append new comments as they arrive
  useEffect(() => {
    if (!supabase || !postId) return;

    // Clean up previous channel before subscribing
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`forum_comments_post_${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const newId = payload.new?.id;
          if (!newId) return;

          // Re-fetch the full row with profile join — realtime payload lacks joins
          const { data: fullRow } = await supabase
            .from("forum_comments")
            .select(
              "*, profiles!forum_comments_user_id_fkey(id, username, avatar_url)",
            )
            .eq("id", newId)
            .single();

          if (!fullRow) return;

          const normalized = {
            ...fullRow,
            author: fullRow.profiles?.username ?? "Pengguna",
            avatar_url: fullRow.profiles?.avatar_url ?? null,
          };

          // Only append if not already in the list (avoids duplicate from optimistic insert)
          setComments((prev) => {
            if (prev.some((c) => c.id === normalized.id)) return prev;
            return [...prev, normalized];
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [postId]);

  return { post, comments, loading, error, refresh };
}
