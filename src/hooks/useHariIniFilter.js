import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getTodayWIB } from "../lib/dateUtils";

/**
 * Fetches all live apps that have launch_date === today in WIB.
 * Returns { apps, loading, error, isEmpty }.
 *
 * isEmpty === true when query succeeded but returned 0 results.
 */
export function useHariIniFilter() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchToday() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        // Fallback: no client available
        setApps([]);
        setLoading(false);
        return;
      }

      const todayWIB = getTodayWIB();

      const { data, error: supaError } = await supabase
        .from("apps")
        .select(
          "id, name, slug, tagline, logo_url, upvotes_count, launch_date, pricing_type, status",
        )
        .eq("launch_date", todayWIB)
        .eq("status", "live")
        .order("upvotes_count", { ascending: false });

      if (cancelled) return;

      if (supaError) {
        setError(supaError.message);
        setLoading(false);
        return;
      }

      setApps(data ?? []);
      setLoading(false);
    }

    fetchToday();
    return () => { cancelled = true; };
  }, []);

  return {
    apps,
    loading,
    error,
    isEmpty: !loading && !error && apps.length === 0,
  };
}
