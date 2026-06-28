import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useBansosPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrograms() {
      // No Supabase client — env vars not set, skip fetch silently
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: sbError } = await supabase
          .from("bansos_programs")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (sbError) throw sbError;
        if (!cancelled) {
          // Remap DB shape → same shape PerksPage expects from the old array
          setPrograms((data ?? []).map(remapProgram));
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Gagal memuat program");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPrograms();
    return () => {
      cancelled = true;
    };
  }, []);

  return { programs, loading, error };
}

// Map Supabase column names → shape expected by PerksPage / PerksDetailPopover
function remapProgram(row) {
  return {
    id: row.slug, // PerksPage uses id as key
    eyebrow: row.eyebrow,
    title: row.title,
    desc: row.description,
    chips: row.chips ?? [],
    image: row.image_url, // PerksPage references .image
    author: row.author,
    authorRole: row.author_role,
    date: row.published_date,
    readTime: row.read_time,
    category: row.category,
    tags: row.tags ?? [],
    content: row.content ?? [],
  };
}
