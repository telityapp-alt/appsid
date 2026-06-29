/**
 * useForumCommentUpvote(commentId, initialCount)
 *
 * Toggle upvote on a forum comment.
 * Optimistic update with rollback on error.
 * Same pattern as useForumUpvote, adapted for forum_comment_upvotes table.
 *
 * @param {string} commentId
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

export function useForumCommentUpvote(commentId, initialCount = 0) {
  const [upvotes, setUpvotes] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync initialCount when comment changes
  useEffect(() => {
    setUpvotes(initialCount);
  }, [commentId, initialCount]);

  // Check if the current auth user has already upvoted this comment
  useEffect(() => {
    if (!supabase || !commentId) return;

    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data?.user) return;
      supabase
        .from("forum_comment_upvotes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", data.user.id)
        .maybeSingle()
        .then(({ data: row }) => {
          if (!cancelled) setUpvoted(!!row);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [commentId]);

  async function toggle() {
    if (!commentId) return;

    if (!supabase) {
      // Demo mode — optimistic only
      setUpvoted((v) => !v);
      setUpvotes((c) => (upvoted ? Math.max(0, c - 1) : c + 1));
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      // Not logged in — caller is responsible for opening auth modal
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
          .from("forum_comment_upvotes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Insert upvote — trigger handles counter increment
        const { error } = await supabase
          .from("forum_comment_upvotes")
          .insert({ comment_id: commentId, user_id: userId });
        if (error) throw error;
      }

      // Re-fetch canonical count from DB
      const { data: row } = await supabase
        .from("forum_comments")
        .select("upvote_count")
        .eq("id", commentId)
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
