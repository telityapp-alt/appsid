import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useBansoseFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFaqs() {
      // No Supabase client — env vars not set, skip fetch silently
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: sbError } = await supabase
          .from("bansos_faqs")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (sbError) throw sbError;
        if (!cancelled) setFaqs(data ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Gagal memuat FAQ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFaqs();
    return () => {
      cancelled = true;
    };
  }, []);

  return { faqs, loading, error };
}
