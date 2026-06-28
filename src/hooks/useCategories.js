/**
 * useCategories()
 *
 * Returns a de-duplicated, sorted list of category strings derived from
 * the `launch_tags` column across all live apps. Always prepends "Semua".
 *
 * Features:
 *   - Module-level TTL cache (5 min) — survives StrictMode double-invoke
 *     and back-navigation without hitting the network again.
 *   - Silent failure — returns ["Semua"] on any error so the UI still works.
 *   - No-op when supabase is null (returns ["Semua"] immediately).
 *
 * @returns {{ categories: string[], loading: boolean }}
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Module-level cache — shared across all hook instances / StrictMode renders
const cache = {
  tags: /** @type {string[]|null} */ (null),
  fetchedAt: 0,
};

export function useCategories() {
  const [rawTags, setRawTags] = useState(cache.tags ?? []);
  const [loading, setLoading] = useState(cache.tags === null && supabase !== null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    // Serve from cache if still fresh
    if (cache.tags !== null && now - cache.fetchedAt < CACHE_TTL_MS) {
      setRawTags(cache.tags);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchTags() {
      try {
        // Fetch only launch_tags from live apps — minimal payload
        const { data, error } = await supabase
          .from("apps")
          .select("launch_tags")
          .eq("status", "live");

        if (error) throw error;

        // Flatten all arrays, deduplicate, filter empties
        const tagSet = new Set();
        (data ?? []).forEach((row) => {
          if (Array.isArray(row.launch_tags)) {
            row.launch_tags.forEach((t) => {
              if (t && typeof t === "string" && t.trim()) {
                tagSet.add(t.trim());
              }
            });
          }
        });

        // Sort with Indonesian locale
        const sorted = Array.from(tagSet).sort((a, b) =>
          a.localeCompare(b, "id")
        );

        if (!cancelled) {
          // Update module-level cache
          cache.tags = sorted;
          cache.fetchedAt = Date.now();
          setRawTags(sorted);
        }
      } catch {
        // Silent failure — leave rawTags as-is (empty array → only "Semua" shown)
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTags();

    // Re-bust cache after TTL so next mount gets fresh data
    const ttlTimer = setTimeout(() => {
      cache.tags = null;
      cache.fetchedAt = 0;
    }, CACHE_TTL_MS);

    return () => {
      cancelled = true;
      clearTimeout(ttlTimer);
    };
  }, []);

  // Always prepend "Semua" (Indonesian for "All")
  const categories = ["Semua", ...rawTags];

  return { categories, loading };
}
