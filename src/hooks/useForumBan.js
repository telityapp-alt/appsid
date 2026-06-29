/**
 * useForumBan()
 *
 * Checks if the current authenticated user has an active forum ban.
 * Reads from forum_user_bans WHERE user_id = auth.uid()
 *   AND is_active = true
 *   AND (expires_at IS NULL OR expires_at > now())
 *
 * @returns {{
 *   isBanned: boolean,
 *   banInfo: { reason: string, ban_type: string, expires_at: string|null }|null,
 *   loading: boolean,
 *   error: string|null,
 * }}
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useForumBan() {
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function checkBan() {
      setLoading(true);
      setError(null);

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          if (!cancelled) {
            setIsBanned(false);
            setBanInfo(null);
            setLoading(false);
          }
          return;
        }

        const { data, error: queryError } = await supabase
          .from("forum_user_bans")
          .select("reason, ban_type, expires_at")
          .eq("user_id", authData.user.id)
          .eq("is_active", true)
          .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
          .maybeSingle();

        if (!cancelled) {
          if (queryError) {
            console.error("[useForumBan] query error:", queryError);
            setError(queryError.message ?? "Gagal memeriksa status akun.");
            setIsBanned(false);
            setBanInfo(null);
          } else if (data) {
            setIsBanned(true);
            setBanInfo({
              reason: data.reason,
              ban_type: data.ban_type,
              expires_at: data.expires_at ?? null,
            });
          } else {
            setIsBanned(false);
            setBanInfo(null);
          }
        }
      } catch (err) {
        console.error("[useForumBan] unexpected error:", err);
        if (!cancelled) {
          setIsBanned(false);
          setBanInfo(null);
          setError("Gagal memeriksa status akun.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkBan();
    return () => { cancelled = true; };
  }, []);

  return { isBanned, banInfo, loading, error };
}
