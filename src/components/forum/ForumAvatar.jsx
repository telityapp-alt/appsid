/**
 * ForumAvatar
 *
 * Displays a user avatar — photo if available, otherwise an initial letter
 * with the same gradient used in the existing ForumPage.jsx Avatar component.
 *
 * Props:
 *   username   {string}  Display name (used for initial fallback)
 *   avatarUrl  {string}  Optional image URL
 *   size       {number}  Pixel diameter. Default: 32
 */

import React from "react";

export function ForumAvatar({ username = "?", avatarUrl, size = 32 }) {
  const initial = (username?.[0] ?? "?").toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "1.5px solid #d9d1c2",
        }}
      />
    );
  }

  return (
    <div
      aria-label={username}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #f6a61e 0%, #cf860d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontWeight: 800,
        fontSize: Math.round(size * 0.4),
        color: "#1a1208",
        letterSpacing: "-0.01em",
        userSelect: "none",
      }}
    >
      {initial}
    </div>
  );
}
