import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useUpvote(appId, initialCount = 0) {
  const [upvotes, setUpvotes] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync initialCount when app changes
  useEffect(() => {
    setUpvotes(initialCount);
  }, [appId, initialCount]);

  // Check if the current auth user has already upvoted this app
  useEffect(() => {
    if (!supabase || !appId) return;

    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data?.user) return;
      supabase
        .from("app_upvotes")
        .select("id")
        .eq("app_id", appId)
        .eq("user_id", data.user.id)
        .maybeSingle()
        .then(({ data: row }) => {
          if (!cancelled) setUpvoted(!!row);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [appId]);

  async function toggle() {
    if (!appId) return;

    if (!supabase) {
      // No backend — optimistic only (demo mode)
      setUpvoted((v) => !v);
      setUpvotes((c) => (upvoted ? Math.max(0, c - 1) : c + 1));
      return;
    }

    // Check auth first
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      // Not logged in — optimistic local-only toggle so UI is still responsive
      setUpvoted((v) => !v);
      setUpvotes((c) => (upvoted ? Math.max(0, c - 1) : c + 1));
      return;
    }

    const userId = authData.user.id;
    const wasUpvoted = upvoted;

    // Optimistic update
    setUpvoted(!wasUpvoted);
    setUpvotes((c) => (wasUpvoted ? Math.max(0, c - 1) : c + 1));

    setLoading(true);
    try {
      if (wasUpvoted) {
        // Remove upvote — trigger handles counter decrement
        const { error } = await supabase
          .from("app_upvotes")
          .delete()
          .eq("app_id", appId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Insert upvote — trigger handles counter increment
        const { error } = await supabase
          .from("app_upvotes")
          .insert({ app_id: appId, user_id: userId });
        if (error) throw error;
      }

      // Re-fetch the canonical count from DB (trigger may have updated it)
      const { data: row } = await supabase
        .from("apps")
        .select("upvotes_count")
        .eq("id", appId)
        .single();
      if (row) setUpvotes(row.upvotes_count);
    } catch {
      // Rollback optimistic update
      setUpvoted(wasUpvoted);
      setUpvotes((c) => (wasUpvoted ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLoading(false);
    }
  }

  return { upvotes, upvoted, loading, toggle };
}
