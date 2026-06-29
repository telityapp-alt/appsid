/**
 * ShareButton
 *
 * Copies the post URL to clipboard and shows a brief "Disalin!" confirmation.
 *
 * Props:
 *   postId  {string}  UUID of the post
 *   title   {string}  Post title (used for aria-label)
 */

import React, { useState } from "react";

export function ShareButton({ postId, title }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/forum/${postId}`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for browsers without clipboard API
      window.prompt("Salin link ini:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Bagikan post: ${title}`}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        color: copied ? "#1a6b48" : "#7b8594",
        padding: 0,
        transition: "color 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!copied) e.currentTarget.style.color = "#0d1d38";
      }}
      onMouseLeave={(e) => {
        if (!copied) e.currentTarget.style.color = "#7b8594";
      }}
    >
      {copied ? (
        <>
          {/* Checkmark icon */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 13, height: 13 }}
          >
            <path d="M3 8l4 4 6-7" />
          </svg>
          Disalin!
        </>
      ) : (
        <>
          {/* Share / link icon */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 13, height: 13 }}
          >
            <path d="M4 8a4 4 0 0 1 8 0M4 8a4 4 0 0 0 8 0M4 8H2m10 0h2" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          Bagikan
        </>
      )}
    </button>
  );
}
