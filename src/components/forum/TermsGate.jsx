/**
 * TermsGate
 *
 * Modal overlay shown to users who haven't accepted community terms yet.
 * Must be accepted before posting or commenting.
 *
 * Props:
 *   onAccepted  {() => void}  Called after successful accept
 *   onClose     {() => void}
 */

import React, { useState, useEffect, useRef } from "react";
import { useAcceptTerms } from "../../hooks/useAcceptTerms";

const RULES = [
  "Dilarang konten SARA (Suku, Agama, Ras, Antargolongan)",
  "Dilarang konten pornografi atau seksual eksplisit",
  "Dilarang ujaran kebencian, kekerasan, atau ancaman",
  "Dilarang penipuan, hoaks, dan informasi menyesatkan",
  "Dilarang spam dan promosi berlebihan",
  "Dilarang pelecehan atau serangan personal",
  "Gunakan bahasa yang sopan dan konstruktif",
  "Pelanggaran berulang akan mengakibatkan pemblokiran akun",
];

export function TermsGate({ onAccepted, onClose }) {
  const [checked, setChecked] = useState(false);
  const { accept, loading, error, accepted } = useAcceptTerms();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus close button on open
  useEffect(() => {
    setTimeout(() => closeButtonRef.current?.focus(), 50);
  }, []);

  // Call onAccepted once the hook confirms acceptance
  useEffect(() => {
    if (accepted) onAccepted();
  }, [accepted, onAccepted]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trap focus inside modal
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
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

  async function handleAccept() {
    if (!checked || loading) return;
    await accept();
  }

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
        background: "rgba(13,29,56,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 16,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-gate-title"
        style={{
          background: "#fffdf8",
          border: "1px solid #d9d1c2",
          borderBottomWidth: 2,
          borderRadius: 14,
          boxShadow:
            "0 12px 40px rgba(21,19,16,.22), inset 0 -3px 0 rgba(21,19,16,.07)",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #ede8e0",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Shield icon */}
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="#0d1d38"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 20, height: 20, flexShrink: 0 }}
              aria-hidden="true"
            >
              <path d="M10 2L3 5.5V10c0 4 3.2 7.1 7 8 3.8-.9 7-4 7-8V5.5L10 2z" />
              <path d="M7 10l2 2 4-4" />
            </svg>
            <h2
              id="terms-gate-title"
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 900,
                color: "#0d1d38",
              }}
            >
              Peraturan Komunitas
            </h2>
          </div>
          <button
            ref={closeButtonRef}
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

        {/* Body — scrollable rules list */}
        <div
          style={{
            padding: "16px 24px",
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 13,
              color: "#55606d",
              lineHeight: 1.55,
            }}
          >
            Sebelum memposting, harap baca dan setujui peraturan komunitas kami.
            Kami ingin menjaga forum ini sebagai ruang yang aman, konstruktif,
            dan bebas dari konten berbahaya.
          </p>

          <ol
            style={{
              margin: 0,
              padding: "0 0 0 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {RULES.map((rule, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  color: "#0d1d38",
                  lineHeight: 1.5,
                  paddingLeft: 4,
                }}
              >
                {rule}
              </li>
            ))}
          </ol>

          {/* Consequence note */}
          <div
            style={{
              marginTop: 16,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#fff8ec",
              border: "1px solid #f5d68a",
              fontSize: 12,
              color: "#8a5c00",
              lineHeight: 1.5,
            }}
          >
            Dengan menggunakan forum ini, kamu tunduk pada Peraturan Komunitas
            AppVerse. Moderator berhak menghapus konten dan membatasi akun yang
            melanggar ketentuan.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px 20px",
            borderTop: "1px solid #ede8e0",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Checkbox */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              fontSize: 13,
              color: "#0d1d38",
              lineHeight: 1.45,
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              style={{
                marginTop: 2,
                width: 16,
                height: 16,
                accentColor: "#f6a61e",
                cursor: "pointer",
                flexShrink: 0,
              }}
              aria-required="true"
            />
            Saya telah membaca dan menyetujui peraturan komunitas ini
          </label>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                padding: "8px 12px",
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

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
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
              type="button"
              onClick={handleAccept}
              disabled={!checked || loading}
              aria-disabled={!checked || loading}
              style={{
                background: checked && !loading ? "#f6a61e" : "#c8c2b8",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 800,
                color: checked && !loading ? "#1a1208" : "#fffdf8",
                cursor: checked && !loading ? "pointer" : "not-allowed",
                transition: "background 120ms",
                boxShadow:
                  checked && !loading
                    ? "inset 0 -2px 0 rgba(21,19,16,.15)"
                    : "none",
              }}
            >
              {loading ? "Menyimpan..." : "Setuju & Lanjutkan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
