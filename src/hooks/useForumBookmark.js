/**
 * useForumBookmark(postId)
 *
 * Toggle bookmark on a forum post.
 * Checks existing bookmark state on mount.
 * Optimistic update with rollback on error.
 *
 * @param {string} postId - UUID of the post to bookmark
 *
 * @returns {{
 *   bookmarked: boolean,
 *   loading: boolean,
 *   toggle: () => Promise<void>,
 * }}
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useForumBookmark(postId) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if the current auth user has already bookmarked this post
  useEffect(() => {
    if (!supabase || !postId) return;

    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data?.user) return;
      supabase
        .from("forum_bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", data.user.id)
        .maybeSingle()
        .then(({ data: row }) => {
          if (!cancelled) setBookmarked(!!row);
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
      setBookmarked((v) => !v);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      // Not logged in — caller is responsible for opening auth modal
      return;
    }

    const userId = authData.user.id;
    const wasBookmarked = bookmarked;

    // Optimistic update
    setBookmarked(!wasBookmarked);

    setLoading(true);
    try {
      if (wasBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("forum_bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Insert bookmark
        const { error } = await supabase
          .from("forum_bookmarks")
          .insert({ post_id: postId, user_id: userId });
        if (error) throw error;
      }
    } catch {
      // Rollback optimistic update
      setBookmarked(wasBookmarked);
    } finally {
      setLoading(false);
    }
  }

  return { bookmarked, loading, toggle };
}
