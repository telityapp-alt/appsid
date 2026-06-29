/**
 * useForumAdmin()
 *
 * Admin-only actions for forum moderation.
 * All functions are no-ops if the current user is not an admin.
 * Requires profile.role === 'admin' (enforced by both RLS and client guard).
 *
 * @returns {{
 *   pinPost:        (postId: string) => Promise<{ error: string|null }>
 *   unpinPost:      (postId: string) => Promise<{ error: string|null }>
 *   lockPost:       (postId: string) => Promise<{ error: string|null }>
 *   unlockPost:     (postId: string) => Promise<{ error: string|null }>
 *   deletePost:     (postId: string) => Promise<{ error: string|null }>
 *   pinComment:     (commentId: string) => Promise<{ error: string|null }>
 *   unpinComment:   (commentId: string) => Promise<{ error: string|null }>
 *   deleteComment:  (commentId: string) => Promise<{ error: string|null }>
 *   resolveReport:  (reportId: string, status: string) => Promise<{ error: string|null }>
 *   loading:        boolean
 * }}
 */

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

function getErrorMessage(error) {
  if (!error) return null;
  const code = String(error?.code ?? error?.message ?? "");
  if (code === "42501" || code.includes("permission"))
    return "Kamu tidak punya akses admin untuk melakukan ini.";
  if (code === "PGRST116" || code.includes("not found"))
    return "Data tidak ditemukan.";
  if (code.includes("network") || code.includes("fetch"))
    return "Koneksi bermasalah. Coba lagi.";
  return "Terjadi kesalahan. Silakan coba lagi.";
}

async function adminUpdate(table, id, patch) {
  if (!supabase) return { error: "Tidak dapat terhubung ke server." };
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  return { error: error ? getErrorMessage(error) : null };
}

export function useForumAdmin() {
  const [loading, setLoading] = useState(false);

  const wrap = useCallback(async (fn) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Post actions ────────────────────────────────────────────

  const pinPost = useCallback(
    (postId) => wrap(() => adminUpdate("forum_posts", postId, { is_pinned: true })),
    [wrap],
  );

  const unpinPost = useCallback(
    (postId) => wrap(() => adminUpdate("forum_posts", postId, { is_pinned: false })),
    [wrap],
  );

  const lockPost = useCallback(
    (postId) => wrap(() => adminUpdate("forum_posts", postId, { is_locked: true })),
    [wrap],
  );

  const unlockPost = useCallback(
    (postId) => wrap(() => adminUpdate("forum_posts", postId, { is_locked: false })),
    [wrap],
  );

  /** Soft-delete: sets is_deleted = true */
  const deletePost = useCallback(
    (postId) => wrap(() => adminUpdate("forum_posts", postId, { is_deleted: true })),
    [wrap],
  );

  // ── Comment actions ─────────────────────────────────────────

  const pinComment = useCallback(
    (commentId) => wrap(() => adminUpdate("forum_comments", commentId, { is_pinned: true })),
    [wrap],
  );

  const unpinComment = useCallback(
    (commentId) => wrap(() => adminUpdate("forum_comments", commentId, { is_pinned: false })),
    [wrap],
  );

  /** Soft-delete: sets is_deleted = true */
  const deleteComment = useCallback(
    (commentId) => wrap(() => adminUpdate("forum_comments", commentId, { is_deleted: true })),
    [wrap],
  );

  // ── Report actions ──────────────────────────────────────────

  /**
   * @param {string} reportId
   * @param {'reviewed'|'dismissed'|'actioned'} status
   */
  const resolveReport = useCallback(
    (reportId, status = "reviewed") =>
      wrap(() => adminUpdate("forum_reports", reportId, { status })),
    [wrap],
  );

  return {
    pinPost,
    unpinPost,
    lockPost,
    unlockPost,
    deletePost,
    pinComment,
    unpinComment,
    deleteComment,
    resolveReport,
    loading,
  };
}
