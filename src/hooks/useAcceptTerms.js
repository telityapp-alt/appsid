/**
 * useAcceptTerms()
 *
 * Updates profiles.terms_accepted_at = now() for the current user.
 *
 * @returns {{
 *   accept: () => Promise<void>,
 *   loading: boolean,
 *   error: string|null,
 *   accepted: boolean,
 * }}
 */

import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useAcceptTerms() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(false);

  async function accept() {
    setError(null);
    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        const msg = "Kamu harus login untuk menyetujui peraturan.";
        setError(msg);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq("id", authData.user.id);

      if (updateError) {
        console.error("[useAcceptTerms] update error:", updateError);
        setError("Gagal menyimpan persetujuan. Silakan coba lagi.");
        return;
      }

      setAccepted(true);
    } catch (err) {
      console.error("[useAcceptTerms] unexpected error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return { accept, loading, error, accepted };
}
