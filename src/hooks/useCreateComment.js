/**
 * useCreateComment(postId)
 *
 * Submit a comment or reply to a forum post.
 * 10-second rate limiting via localStorage.
 * Returns the full inserted row (with profile join) on success,
 * so the caller (CommentThread) can do an optimistic splice.
 *
 * @param {string} postId - UUID of the parent post
 *
 * @returns {{
 *   submit: (fields: { body: string, parentId?: string|null }) => Promise<{ data: object|null, error: string|null }>,
 *   loading: boolean,
 *   error: string|null,
 * }}
 */

import { useState } from "react";
import { supabase } from "../lib/supabase";

const COOLDOWN_MS = 10_000;
const LS_KEY = "forum_last_comment_at";

// Client-side keyword filter — mirrors useCreatePost for UX consistency.
const BANNED_PATTERNS = [
  // sara
  "anjing lu",
  "babi lu",
  "kafir",
  "bangsa sampah",
  // pornografi
  "kontol",
  "memek",
  "ngentot",
  "bokep",
  // kekerasan
  "bunuh dia",
  "hajar dia",
];

function containsBannedPattern(text) {
  const lower = (text ?? "").toLowerCase();
  return BANNED_PATTERNS.some((p) => lower.includes(p));
}

function getSupabaseErrorMessage(error) {
  if (!error) return null;
  // DB-level content policy trigger
  if (
    error?.code === "P0001" &&
    error?.message?.includes("CONTENT_POLICY_VIOLATION")
  )
    return "Konten melanggar kebijakan komunitas (kata terlarang terdeteksi).";
  const code = String(error?.code ?? error?.message ?? "");
  if (code === "42501" || code.includes("permission"))
    return "Kamu tidak punya akses untuk berkomentar di sini.";
  if (code === "23503" || code.includes("foreign key"))
    return "Post atau komentar yang dituju tidak ditemukan.";
  if (code.includes("network") || code.includes("fetch"))
    return "Koneksi bermasalah. Coba lagi.";
  return "Terjadi kesalahan. Silakan coba lagi.";
}

export function useCreateComment(postId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {{ body: string, parentId?: string|null }} fields
   * @returns {Promise<{ data: object|null, error: string|null }>}
   */
  async function submit({ body, parentId = null }) {
    setError(null);

    if (!supabase) {
      const msg = "Tidak dapat terhubung ke server.";
      setError(msg);
      return { data: null, error: msg };
    }

    // Validation
    const trimmedBody = (body ?? "").trim();
    if (!trimmedBody || trimmedBody.length < 1) {
      const msg = "Komentar tidak boleh kosong.";
      setError(msg);
      return { data: null, error: msg };
    }
    if (containsBannedPattern(trimmedBody)) {
      const msg =
        "Konten melanggar kebijakan komunitas. Silakan periksa kembali komentar Anda.";
      setError(msg);
      return { data: null, error: msg };
    }
    if (trimmedBody.length > 5000) {
      const msg = "Komentar maksimal 5000 karakter.";
      setError(msg);
      return { data: null, error: msg };
    }

    // Rate limit check
    const lastAt = parseInt(localStorage.getItem(LS_KEY) ?? "0", 10);
    if (lastAt) {
      const elapsed = Date.now() - lastAt;
      if (elapsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        const msg = `Tunggu ${remaining} detik sebelum berkomentar lagi.`;
        setError(msg);
        return { data: null, error: msg };
      }
    }

    // Auth check
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      const msg = "Kamu harus login untuk berkomentar.";
      setError(msg);
      return { data: null, error: msg };
    }

    // Ban check
    const { data: banData } = await supabase
      .from("forum_user_bans")
      .select("reason, ban_type, expires_at")
      .eq("user_id", authData.user.id)
      .eq("is_active", true)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .maybeSingle();
    if (banData) {
      const msg = "Akun kamu dibatasi dari forum. Alasan: " + banData.reason;
      setError(msg);
      return { data: null, error: msg };
    }

    setLoading(true);
    try {
      const { data: row, error: insertError } = await supabase
        .from("forum_comments")
        .insert({
          post_id: postId,
          user_id: authData.user.id,
          body: trimmedBody,
          parent_id: parentId ?? null,
        })
        .select(
          "*, profiles!forum_comments_user_id_fkey(id, username, avatar_url)",
        )
        .single();

      if (insertError) throw insertError;

      // Set rate limit timestamp on success
      localStorage.setItem(LS_KEY, String(Date.now()));

      // Normalize author for immediate use in CommentThread
      const normalized = {
        ...row,
        author: row.profiles?.username ?? "Pengguna",
        avatar_url: row.profiles?.avatar_url ?? null,
      };

      return { data: normalized, error: null };
    } catch (err) {
      const msg = getSupabaseErrorMessage(err);
      setError(msg);
      return { data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}
