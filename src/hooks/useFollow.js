import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

/**
 * useFollow(appId, initialFollowCount)
 *
 * Manages follow/unfollow state for a single app.
 * - Loads initial follow status from app_follows table
 * - Optimistic toggle with rollback on error
 * - Exposes { following, followCount, loading, toggle }
 */
export function useFollow(appId, initialFollowCount = 0) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(initialFollowCount);
  const [loading, setLoading] = useState(false);

  // Sync initialFollowCount when app changes
  useEffect(() => {
    setFollowCount(initialFollowCount);
  }, [appId, initialFollowCount]);

  // Load initial follow state for the current user
  useEffect(() => {
    if (!supabase || !appId || !user) {
      setFollowing(false);
      return;
    }

    let cancelled = false;

    async function loadInitialState() {
      // Get app's current follow count
      const { data: appData } = await supabase
        .from("apps")
        .select("followers_count")
        .eq("id", appId)
        .maybeSingle();

      if (!cancelled && appData?.followers_count !== undefined) {
        setFollowCount(appData.followers_count);
      }

      // Check if current user follows this app
      const { data: followRow } = await supabase
        .from("app_follows")
        .select("id")
        .eq("app_id", appId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setFollowing(!!followRow);
      }
    }

    loadInitialState();
    return () => { cancelled = true; };
  }, [appId, user]);

  const toggle = useCallback(async () => {
    if (!appId) return;

    // No supabase or no user — optimistic local only
    if (!supabase || !user) {
      setFollowing((f) => !f);
      setFollowCount((c) => (following ? Math.max(0, c - 1) : c + 1));
      return;
    }

    const wasFollowing = following;

    // Optimistic update
    setFollowing(!wasFollowing);
    setFollowCount((c) => (wasFollowing ? Math.max(0, c - 1) : c + 1));
    setLoading(true);

    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from("app_follows")
          .delete()
          .eq("app_id", appId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("app_follows")
          .insert({ app_id: appId, user_id: user.id });
        if (error) throw error;
      }

      // Refresh canonical count from DB
      const { data: row } = await supabase
        .from("apps")
        .select("followers_count")
        .eq("id", appId)
        .maybeSingle();
      if (row?.followers_count !== undefined) {
        setFollowCount(row.followers_count);
      }
    } catch {
      // Rollback
      setFollowing(wasFollowing);
      setFollowCount((c) => (wasFollowing ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLoading(false);
    }
  }, [appId, user, following]);

  return { following, followCount, loading, toggle };
}
