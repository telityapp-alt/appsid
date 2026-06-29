/**
 * ReportModal
 *
 * Modal for reporting a forum post or comment.
 * Calls useForumReport hook on submit.
 *
 * Props:
 *   targetType  {'post'|'comment'}
 *   targetId    {string}  UUID of the post or comment
 *   onClose     {() => void}
 */

import React, { useState, useEffect, useRef } from "react";
import { useForumReport } from "../../hooks/useForumReport";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Pelecehan / Serangan personal" },
  { value: "misinformation", label: "Informasi menyesatkan" },
  { value: "sara", label: "Konten SARA" },
  { value: "pornografi", label: "Pornografi / Konten seksual" },
  { value: "kekerasan", label: "Kekerasan / Ancaman" },
  { value: "penipuan", label: "Penipuan / Hoaks" },
  { value: "off_topic", label: "Di luar topik" },
  { value: "self_promo", label: "Promosi diri berlebihan" },
  { value: "other", label: "Lainnya" },
];

export function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const { report, loading, error, success, reset } = useForumReport();
  const firstRadioRef = useRef(null);

  // Focus first radio on open
  useEffect(() => {
    setTimeout(() => firstRadioRef.current?.focus(), 50);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Reset state when reopened
  useEffect(() => {
    reset();
    setReason("");
    setNotes("");
  }, [targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason) return;
    await report({ targetType, targetId, reason, notes });
  }

  const targetLabel = targetType === "post" ? "postingan" : "komentar";

  return (
    /* Backdrop */
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,29,56,0.45)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        style={{
          background: "#fffdf8",
          border: "1px solid #d9d1c2",
          borderBottomWidth: 2,
          borderRadius: 14,
          boxShadow:
            "0 8px 32px rgba(21,19,16,.18), inset 0 -3px 0 rgba(21,19,16,.07)",
          width: "100%",
          maxWidth: 440,
          padding: "24px 24px 20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            id="report-modal-title"
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              color: "#0d1d38",
            }}
          >
            Laporkan {targetLabel}
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
              style={{ width: 16, height: 16 }}
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {success ? (
          /* Success state */
          <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#0d1d38" }}>
              Laporan terkirim
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#55606d" }}>
              Tim kami akan meninjau {targetLabel} ini.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#0d1d38",
                color: "#fffdf8",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#55606d" }}>
              Pilih alasan laporan kamu:
            </p>

            {/* Reason list */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 14,
              }}
            >
              {REASONS.map((r, i) => (
                <label
                  key={r.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${reason === r.value ? "#c7820e" : "#e5ddd0"}`,
                    background: reason === r.value ? "#fff8ec" : "transparent",
                    transition: "border-color 120ms, background 120ms",
                  }}
                >
                  <input
                    ref={i === 0 ? firstRadioRef : null}
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    style={{ accentColor: "#c7820e", width: 15, height: 15 }}
                  />
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#0d1d38" }}
                  >
                    {r.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Notes — only when "other" */}
            {reason === "other" && (
              <div style={{ marginBottom: 14 }}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  placeholder="Jelaskan alasanmu (opsional)..."
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #d9d1c2",
                    background: "#faf8f4",
                    fontSize: 13,
                    color: "#0d1d38",
                    resize: "vertical",
                    fontFamily: "inherit",
                    outline: "none",
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
                  {notes.length}/500
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p
                style={{
                  margin: "0 0 12px",
                  padding: "8px 10px",
                  borderRadius: 7,
                  background: "#fef2f2",
                  border: "1px solid #f5b8b8",
                  fontSize: 12,
                  color: "#a03030",
                }}
              >
                {error}
              </p>
            )}

            {/* Actions */}
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "none",
                  border: "1px solid #d9d1c2",
                  borderRadius: 8,
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#55606d",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!reason || loading}
                style={{
                  background: reason && !loading ? "#0d1d38" : "#c8c2b8",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fffdf8",
                  cursor: reason && !loading ? "pointer" : "not-allowed",
                  transition: "background 120ms",
                }}
              >
                {loading ? "Mengirim..." : "Kirim laporan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
