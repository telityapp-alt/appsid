/**
 * useForumReport()
 *
 * Report a forum post or comment.
 * Handles duplicate-report detection via Postgres unique constraint (23505).
 *
 * @returns {{
 *   report: (fields: { targetType: string, targetId: string, reason: string, notes?: string }) => Promise<void>,
 *   loading: boolean,
 *   error: string|null,
 *   success: boolean,
 *   reset: () => void,
 * }}
 */

import { useState } from "react";
import { supabase } from "../lib/supabase";

const VALID_TARGET_TYPES = ["post", "comment"];
const VALID_REASONS = [
  "spam",
  "harassment",
  "misinformation",
  "off_topic",
  "self_promo",
  "sara",
  "pornografi",
  "kekerasan",
  "penipuan",
  "other",
];

export function useForumReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setError(null);
    setSuccess(false);
  }

  /**
   * @param {{ targetType: 'post'|'comment', targetId: string, reason: string, notes?: string }} fields
   */
  async function report({ targetType, targetId, reason, notes = "" }) {
    setError(null);
    setSuccess(false);

    if (!supabase) {
      setError("Tidak dapat terhubung ke server.");
      return;
    }

    // Validation
    if (!VALID_TARGET_TYPES.includes(targetType)) {
      setError("Jenis laporan tidak valid.");
      return;
    }
    if (!targetId) {
      setError("Target laporan tidak valid.");
      return;
    }
    if (!VALID_REASONS.includes(reason)) {
      setError("Alasan laporan tidak valid.");
      return;
    }
    if (notes && notes.length > 500) {
      setError("Catatan maksimal 500 karakter.");
      return;
    }

    // Auth check
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setError("Kamu harus login untuk melaporkan konten.");
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from("forum_reports")
        .insert({
          reporter_id: authData.user.id,
          target_type: targetType,
          target_id: targetId,
          reason,
          notes: notes.trim() || null,
        });

      if (insertError) {
        // Unique constraint = already reported
        const code = String(insertError?.code ?? "");
        if (code === "23505" || insertError?.message?.includes("unique")) {
          setError("Kamu sudah melaporkan ini sebelumnya.");
        } else if (
          code === "42501" ||
          insertError?.message?.includes("permission")
        ) {
          setError("Kamu tidak punya akses untuk melaporkan ini.");
        } else {
          setError("Terjadi kesalahan. Silakan coba lagi.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return { report, loading, error, success, reset };
}
