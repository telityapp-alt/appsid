/**
 * useForumUpvote(postId, initialCount)
 *
 * Toggle upvote on a forum post.
 * Optimistic update with rollback on error.
 * Mirrors useUpvote.js pattern exactly, adapted for forum_upvotes table.
 *
 * @param {string} postId
 * @param {number} initialCount
 *
 * @returns {{
 *   upvotes: number,
 *   upvoted: boolean,
 *   loading: boolean,
 *   toggle: () => Promise<void>,
 * }}
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useForumUpvote(postId, initialCount = 0) {
  const [upvotes, setUpvotes] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync initialCount when post changes
  useEffect(() => {
    setUpvotes(initialCount);
  }, [postId, initialCount]);

  // Check if the current auth user has already upvoted this post
  useEffect(() => {
    if (!supabase || !postId) return;

    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data?.user) return;
      supabase
        .from("forum_upvotes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", data.user.id)
        .maybeSingle()
        .then(({ data: row }) => {
          if (!cancelled) setUpvoted(!!row);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function toggle() {
    if (!postId) return;

    if (!supabase) {
      // Demo mode — optimistic only
      setUpvoted((v) => !v);
      setUpvotes((c) => (upvoted ? Math.max(0, c - 1) : c + 1));
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      // Not logged in — caller is responsible for opening auth modal
      // No optimistic update to avoid misleading the user
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
          .from("forum_upvotes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Insert upvote — trigger handles counter increment
        const { error } = await supabase
          .from("forum_upvotes")
          .insert({ post_id: postId, user_id: userId });
        if (error) throw error;
      }

      // Re-fetch canonical count from DB (trigger may have updated it)
      const { data: row } = await supabase
        .from("forum_posts")
        .select("upvote_count")
        .eq("id", postId)
        .single();
      if (row) setUpvotes(row.upvote_count);
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
