/**
 * useCreatePost()
 *
 * Validates and submits a new forum post.
 * Includes client-side rate limiting (30s cooldown via localStorage).
 *
 * @returns {{
 *   submit: (fields: object) => Promise<{ data: { id: string }|null, error: string|null }>,
 *   loading: boolean,
 *   error: string|null,
 *   cooldownSeconds: number,
 * }}
 */

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const COOLDOWN_MS = 30_000;
const LS_KEY = "forum_last_post_at";

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
    return "Kamu tidak punya akses untuk melakukan ini.";
  if (code === "23505" || code.includes("unique"))
    return "Postingan duplikat terdeteksi. Silakan coba lagi.";
  if (code.includes("network") || code.includes("fetch"))
    return "Koneksi bermasalah. Coba lagi.";
  return "Terjadi kesalahan. Silakan coba lagi.";
}

// Client-side keyword filter — DB trigger is the real enforcement,
// this gives instant UX feedback before the round-trip.
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

function validate({ title, body, category, flair, tags }) {
  if (!title || title.trim().length < 5) return "Judul minimal 5 karakter.";
  if (title.trim().length > 300) return "Judul maksimal 300 karakter.";
  if (!body || body.trim().length < 10)
    return "Isi postingan minimal 10 karakter.";
  if (!category || !category.trim()) return "Pilih kategori terlebih dahulu.";
  if (!flair || !flair.trim()) return "Pilih flair terlebih dahulu.";
  if (tags && !Array.isArray(tags)) return "Format tags tidak valid.";
  if (tags && tags.length > 5) return "Maksimal 5 tag per postingan.";
  if (containsBannedPattern(title) || containsBannedPattern(body))
    return "Konten melanggar kebijakan komunitas. Silakan periksa kembali postingan Anda.";
  return null;
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const intervalRef = useRef(null);

  // Restore cooldown on mount (e.g. after page refresh)
  useEffect(() => {
    const lastAt = parseInt(localStorage.getItem(LS_KEY) ?? "0", 10);
    if (!lastAt) return;
    const elapsed = Date.now() - lastAt;
    const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
    if (remaining > 0) startCooldown(remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCooldown(seconds) {
    setCooldownSeconds(seconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldownSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /**
   * @param {{ title: string, body: string, category: string, flair: string, tags?: string[] }} fields
   * @returns {Promise<{ data: { id: string }|null, error: string|null }>}
   */
  async function submit({ title, body, category, flair, tags = [] }) {
    setError(null);

    if (!supabase) {
      const msg = "Tidak dapat terhubung ke server.";
      setError(msg);
      return { data: null, error: msg };
    }

    // Client-side validation
    const validationError = validate({ title, body, category, flair, tags });
    if (validationError) {
      setError(validationError);
      return { data: null, error: validationError };
    }

    // Rate limit check
    const lastAt = parseInt(localStorage.getItem(LS_KEY) ?? "0", 10);
    if (lastAt) {
      const elapsed = Date.now() - lastAt;
      if (elapsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        startCooldown(remaining);
        const msg = `Tunggu ${remaining} detik sebelum posting lagi.`;
        setError(msg);
        return { data: null, error: msg };
      }
    }

    // Auth check
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      const msg = "Kamu harus login untuk membuat postingan.";
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
        .from("forum_posts")
        .insert({
          user_id: authData.user.id,
          title: title.trim(),
          body: body.trim(),
          category,
          flair,
          tags: tags ?? [],
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Set rate limit timestamp on success
      localStorage.setItem(LS_KEY, String(Date.now()));
      startCooldown(Math.ceil(COOLDOWN_MS / 1000));

      return { data: { id: row.id }, error: null };
    } catch (err) {
      const msg = getSupabaseErrorMessage(err);
      setError(msg);
      return { data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error, cooldownSeconds };
}
