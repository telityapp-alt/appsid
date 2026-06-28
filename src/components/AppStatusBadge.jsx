import React from "react";
import { isLaunchingToday } from "../lib/dateUtils";

// Pricing chip styles aligned to design system tokens
const PRICING_STYLES = {
  free: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    color: "#166534",
    label: "Gratis",
  },
  freemium: {
    background: "#fffdf8",
    border: "1px solid #f6a61e",
    color: "#92400e",
    label: "Freemium",
  },
  paid: {
    background: "#faf5ff",
    border: "1px solid #c4b5fd",
    color: "#5b21b6",
    label: "Berbayar",
  },
  free_options: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    color: "#166534",
    label: "Ada versi gratis",
  },
};

const CHIP_BASE = {
  display: "inline-flex",
  alignItems: "center",
  height: 20,
  padding: "0 7px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.01em",
  lineHeight: 1,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

/**
 * "Baru hari ini" amber chip — shown only when launch_date === today (WIB).
 */
export function LaunchTodayBadge({ launchDate }) {
  if (!isLaunchingToday(launchDate)) return null;
  return (
    <span
      style={{
        ...CHIP_BASE,
        background: "#fff8e6",
        border: "1px solid #f6a61e",
        color: "#92400e",
      }}
      title="Diluncurkan hari ini"
    >
      🚀 Baru hari ini
    </span>
  );
}

/**
 * Pricing chip — Gratis / Freemium / Berbayar
 */
export function PricingBadge({ pricingType }) {
  const style = PRICING_STYLES[pricingType];
  if (!style) return null;
  return (
    <span
      style={{
        ...CHIP_BASE,
        background: style.background,
        border: style.border,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  );
}
