/**
 * CreatePostModal
 *
 * Modal for creating a new forum post.
 * Full form with validation, category/flair/tag selection.
 * Calls useCreatePost hook on submit.
 *
 * Props:
 *   onClose    {() => void}
 *   onSuccess  {(postId: string) => void}  Called after successful submit
 */

import React, { useState, useEffect, useRef } from "react";
import { useCreatePost } from "../../hooks/useCreatePost";
import { supabase } from "../../lib/supabase";

const CATEGORIES = [
  "General",
  "SaaS & Produk",
  "AI & Tools",
  "Developer",
  "Marketing",
  "Fundraising",
  "Hire & Collab",
];

const FLAIRS = [
  "Show & Tell",
  "Diskusi",
  "Tips",
  "Tanya",
  "Resource",
  "Open Source",
  "Collab",
  "Case Study",
];

const FLAIR_STYLE = {
  "Show & Tell": { bg: "#edfaf4", border: "#a3e4c6", color: "#1a6b48" },
  Diskusi: { bg: "#f0f4ff", border: "#b8c9f5", color: "#2d4fa0" },
  Tips: { bg: "#fff8ec", border: "#f5d68a", color: "#8a5c00" },
  Tanya: { bg: "#f5f2ec", border: "#d9d1c2", color: "#55606d" },
  Resource: { bg: "#fef2f2", border: "#f5b8b8", color: "#a03030" },
  "Open Source": { bg: "#f0f4ff", border: "#b8c9f5", color: "#2d4fa0" },
  Collab: { bg: "#fff8ec", border: "#f5d68a", color: "#8a5c00" },
  "Case Study": { bg: "#edfaf4", border: "#a3e4c6", color: "#1a6b48" },
};

const AVAILABLE_TAGS = [
  "micro-saas",
  "mvp",
  "open source",
  "vibe coding",
  "monetisasi",
  "landing page",
  "nextjs",
  "python",
  "growth",
  "bootstrap",
  "b2b",
  "ai agent",
];

export function CreatePostModal({ onClose, onSuccess, onNeedsTerms }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [flair, setFlair] = useState("");
  const [tags, setTags] = useState([]);

  const { submit, loading, error, cooldownSeconds } = useCreatePost();
  const titleRef = useRef(null);
  // null = still checking, true = accepted, false = not accepted
  const [termsChecked, setTermsChecked] = useState(null);

  // On mount: if onNeedsTerms is provided, verify the user has accepted terms.
  // Query profiles.terms_accepted_at; if NULL, delegate to parent via onNeedsTerms().
  useEffect(() => {
    if (!onNeedsTerms) {
      setTermsChecked(true);
      return;
    }
    let cancelled = false;
    async function checkTerms() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          if (!cancelled) setTermsChecked(true);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("terms_accepted_at")
          .eq("id", authData.user.id)
          .maybeSingle();
        if (!cancelled) {
          if (!profile?.terms_accepted_at) {
            onNeedsTerms();
          } else {
            setTermsChecked(true);
          }
        }
      } catch {
        // On error, allow the form to render rather than blocking the user
        if (!cancelled) setTermsChecked(true);
      }
    }
    checkTerms();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus title on open
  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 50);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trap focus inside modal
  const modalRef = useRef(null);
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function toggleTag(tag) {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
          ? [...prev, tag]
          : prev,
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data, error: submitError } = await submit({
      title,
      body,
      category,
      flair,
      tags,
    });
    if (data && !submitError) {
      onSuccess?.(data.id);
    }
  }

  const canSubmit =
    title.trim().length >= 5 &&
    body.trim().length >= 10 &&
    category &&
    flair &&
    !loading &&
    cooldownSeconds === 0;

  const INPUT_STYLE = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #d9d1c2",
    background: "#faf8f4",
    fontSize: 14,
    color: "#0d1d38",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 120ms",
  };

  const LABEL_STYLE = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#55606d",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  // Don't render the form while the terms check is in flight
  if (termsChecked === null) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,29,56,0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        style={{
          background: "#fffdf8",
          border: "1px solid #d9d1c2",
          borderBottomWidth: 2,
          borderRadius: 14,
          boxShadow:
            "0 12px 40px rgba(21,19,16,.2), inset 0 -3px 0 rgba(21,19,16,.07)",
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px 24px 20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            id="create-post-title"
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 900,
              color: "#0d1d38",
            }}
          >
            Buat Postingan
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#7b8594",
              padding: 4,
              borderRadius: 6,
              lineHeight: 1,
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ width: 17, height: 17 }}
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Title */}
          <div>
            <label htmlFor="post-title" style={LABEL_STYLE}>
              Judul <span style={{ color: "#a03030" }}>*</span>
            </label>
            <input
              ref={titleRef}
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tulis judul yang jelas dan deskriptif..."
              maxLength={300}
              required
              style={INPUT_STYLE}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#c7820e")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d9d1c2")}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: 11,
                color: "#7b8594",
                marginTop: 3,
              }}
            >
              {title.length}/300
            </div>
          </div>

          {/* Category + Flair row */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {/* Category */}
            <div>
              <label htmlFor="post-category" style={LABEL_STYLE}>
                Kategori <span style={{ color: "#a03030" }}>*</span>
              </label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{ ...INPUT_STYLE, cursor: "pointer" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#c7820e")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d9d1c2")}
              >
                <option value="">Pilih kategori...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Flair */}
            <div>
              <label style={LABEL_STYLE}>
                Flair <span style={{ color: "#a03030" }}>*</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {FLAIRS.map((f) => {
                  const s = FLAIR_STYLE[f];
                  const active = flair === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFlair(f)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 24,
                        padding: "0 9px",
                        borderRadius: 5,
                        border: `1px solid ${active ? s.border : "#d9d1c2"}`,
                        background: active ? s.bg : "transparent",
                        color: active ? s.color : "#7b8594",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 120ms",
                        outline: active ? `2px solid ${s.border}` : "none",
                        outlineOffset: 1,
                      }}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Body */}
          <div>
            <label htmlFor="post-body" style={LABEL_STYLE}>
              Isi postingan <span style={{ color: "#a03030" }}>*</span>
            </label>
            <textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ceritakan lebih detail... (Ctrl+Enter untuk submit)"
              rows={7}
              required
              style={{
                ...INPUT_STYLE,
                resize: "vertical",
                lineHeight: 1.6,
                minHeight: 140,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#c7820e")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d9d1c2")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canSubmit)
                  handleSubmit(e);
              }}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: 11,
                color: "#7b8594",
                marginTop: 3,
              }}
            >
              {body.length} karakter
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={LABEL_STYLE}>
              Tags{" "}
              <span
                style={{
                  color: "#7b8594",
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                (opsional, maks 5)
              </span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {AVAILABLE_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    disabled={!active && tags.length >= 5}
                    style={{
                      background: active ? "#0d1d38" : "#f0ede8",
                      color: active ? "#fffdf8" : "#55606d",
                      border: `1px solid ${active ? "#0d1d38" : "#d9d1c2"}`,
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor:
                        !active && tags.length >= 5 ? "not-allowed" : "pointer",
                      opacity: !active && tags.length >= 5 ? 0.4 : 1,
                      transition: "all 120ms",
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "#fef2f2",
                border: "1px solid #f5b8b8",
                fontSize: 13,
                color: "#a03030",
              }}
            >
              {error}
            </div>
          )}

          {/* Community rules reminder */}
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#7b8594",
              lineHeight: 1.5,
            }}
          >
            Dengan posting, kamu menyetujui{" "}
            <span style={{ color: "#0d1d38", fontWeight: 600 }}>
              Peraturan Komunitas
            </span>{" "}
            kami. Konten yang melanggar dapat dihapus dan akun dapat dibatasi.
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              paddingTop: 4,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "1px solid #d9d1c2",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: "#55606d",
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                background: canSubmit ? "#f6a61e" : "#c8c2b8",
                border: "none",
                borderRadius: 8,
                padding: "8px 24px",
                fontSize: 14,
                fontWeight: 800,
                color: canSubmit ? "#1a1208" : "#fffdf8",
                cursor: canSubmit ? "pointer" : "not-allowed",
                transition: "background 120ms",
                boxShadow: canSubmit
                  ? "inset 0 -2px 0 rgba(21,19,16,.15)"
                  : "none",
              }}
            >
              {loading
                ? "Memposting..."
                : cooldownSeconds > 0
                  ? `Tunggu ${cooldownSeconds}d...`
                  : "Posting sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
