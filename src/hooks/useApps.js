/**
 * useApps({ category, search, sort, pageSize })
 *
 * Fetches live app rows from the Supabase `apps` table with:
 *   - Server-side search (.ilike on name + tagline)
 *   - Server-side category filter (array contains)
 *   - 3-way sort: "upvotes" | "newest" | "today"
 *   - range()-based pagination with a "load more" cursor
 *   - Realtime subscription for upvotes_count updates
 *   - Graceful fallback to empty state when supabase is null
 *
 * @param {object} opts
 * @param {string} [opts.category]   launch_tag to filter by. null/"Semua" = all.
 * @param {string} [opts.search]     free-text search against name + tagline.
 * @param {string} [opts.sort]       "upvotes" | "newest" | "today". Default: "upvotes"
 * @param {number} [opts.pageSize]   rows per page. Default: 20
 *
 * @returns {{
 *   apps: NormalizedApp[],
 *   loading: boolean,
 *   error: string|null,
 *   total: number,
 *   hasMore: boolean,
 *   loadMore: () => void,
 * }}
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { normalizeAppRow } from "../lib/normalizeAppRow";

// ---------------------------------------------------------------------------
// Fallback data — shown when Supabase env vars are missing (demo / offline)
// ---------------------------------------------------------------------------
const FALLBACK_APPS = [
  {
    id: "preppy",
    slug: "preppy",
    name: "Preppy",
    tagline: "Belajar beasiswa & IELTS dengan gamifikasi ala Duolingo",
    category: "EdTech Product",
    status: "live",
    image: "/preppy/hero-web.png",
    logo_url: "/preppy/hero-web.png",
    gallery: [
      "/preppy/hero-web.png",
      "/preppy/screen-1.webp",
      "/preppy/screen-2.webp",
    ],
    upvotes: 42,
    upvotes_count: 42,
    overview:
      "Preppy adalah platform belajar bergaya Duolingo untuk persiapan beasiswa, IELTS, dan CPNS.",
    stats: [
      { label: "30-Day Retention", value: "61%" },
      { label: "Free-to-Paid CVR", value: "18%" },
      { label: "Scholarship Database", value: "5000+" },
    ],
    highlights: [
      "Duolingo-inspired gamification with psychology principles",
      "Cross-platform: PWA + Native (React + Capacitor)",
      "Freemium growth loop dengan guerrilla marketing",
    ],
    strategy: [],
    userJourney: [],
    richContent: {
      title: "Deep Dive: Psychology of Engagement",
      blocks: [
        {
          type: "kv",
          rows: [
            {
              label: "Tech Stack",
              value: "React + Vite + Capacitor + Tailwind",
            },
            { label: "Platform", value: "Web (PWA) + iOS + Android" },
            { label: "Status", value: "Live on Google Play Store" },
          ],
        },
      ],
    },
    launch_tags: ["EdTech Product"],
    tags: ["EdTech", "Gamification", "PWA", "Mobile"],
    builtWith: ["React", "Vite", "Capacitor", "Tailwind", "Framer Motion"],
    pricingType: "freemium",
    pricing_type: "freemium",
    launchDate: "2026-06-28",
    launch_date: "2026-06-28",
    website: null,
    makers: [],
    app_makers: [],
    reviews_count: 0,
  },
];

const DEFAULT_PAGE_SIZE = 20;

export function useApps({
  category = null,
  search = "",
  sort = "upvotes",
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const clientMissing = supabase === null;

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(!clientMissing);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  // Track the current channel so cleanup can unsubscribe it
  const channelRef = useRef(null);
  // Flag to skip stale async results after deps changed
  const cancelledRef = useRef(false);

  // ------------------------------------------------------------------
  // Reset to page 0 + clear list whenever filters change
  // ------------------------------------------------------------------
  useEffect(() => {
    setPage(0);
    setApps([]);
    setError(null);
  }, [category, search, sort]);

  // ------------------------------------------------------------------
  // Core fetch effect — re-runs when page or filters change
  // ------------------------------------------------------------------
  useEffect(() => {
    if (clientMissing) {
      // --- Offline / no-env fallback: filter client-side ---
      let filtered = FALLBACK_APPS;
      if (category && category !== "Semua") {
        filtered = filtered.filter((a) =>
          (a.launch_tags ?? []).includes(category),
        );
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.tagline.toLowerCase().includes(q),
        );
      }
      setApps(filtered);
      setTotal(filtered.length);
      setLoading(false);
      return;
    }

    cancelledRef.current = false;
    setLoading(true);

    async function fetchApps() {
      try {
        // Select apps + makers in one shot
        let query = supabase
          .from("apps")
          .select(
            `id, slug, name, tagline, logo_url, gallery_images,
             launch_tags, upvotes_count, reviews_count,
             launch_date, status, pricing_type, created_at,
             description, website_url, built_with, is_open_source,
             app_makers ( id, name, avatar_url, role, twitter_handle, order_index )`,
            { count: "exact" },
          )
          .eq("status", "live");

        // --- Category filter (array contains) ---
        if (category && category !== "Semua") {
          query = query.contains("launch_tags", [category]);
        }

        // --- Server-side search (name OR tagline) ---
        if (search && search.trim()) {
          const q = `%${search.trim()}%`;
          query = query.or(`name.ilike.${q},tagline.ilike.${q}`);
        }

        // --- Sort ---
        if (sort === "upvotes") {
          query = query.order("upvotes_count", { ascending: false });
        } else if (sort === "newest") {
          query = query.order("created_at", { ascending: false });
        } else if (sort === "today") {
          const today = new Date().toISOString().slice(0, 10);
          query = query
            .eq("launch_date", today)
            .order("upvotes_count", { ascending: false });
        }

        // --- Pagination ---
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error: sbError, count } = await query;

        if (cancelledRef.current) return;

        if (sbError) {
          setError(sbError.message ?? "Gagal memuat apps");
          setLoading(false);
          return;
        }

        const normalized = (data ?? []).map(normalizeAppRow);

        setApps((prev) => (page === 0 ? normalized : [...prev, ...normalized]));
        setTotal(count ?? 0);
        setError(null);
      } catch (err) {
        if (!cancelledRef.current) {
          setError(err?.message ?? "Terjadi kesalahan saat memuat apps");
        }
      } finally {
        if (!cancelledRef.current) {
          setLoading(false);
        }
      }
    }

    fetchApps();

    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search, sort, page, pageSize, clientMissing]);

  // ------------------------------------------------------------------
  // Realtime subscription — upvotes_count updates only
  // ------------------------------------------------------------------
  useEffect(() => {
    if (clientMissing) return;

    // Unsubscribe from previous channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel("apps-upvotes-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "apps",
        },
        (payload) => {
          const updated = payload.new;
          if (!updated?.id) return;
          setApps((prev) =>
            prev.map((app) =>
              app.id === updated.id
                ? {
                    ...app,
                    upvotes_count: updated.upvotes_count,
                    upvotes: updated.upvotes_count,
                  }
                : app,
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
  }, [clientMissing]);

  // ------------------------------------------------------------------
  // Pagination helpers
  // ------------------------------------------------------------------
  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const hasMore = apps.length < total;

  return {
    apps,
    loading,
    error,
    total,
    hasMore,
    loadMore,
  };
}
