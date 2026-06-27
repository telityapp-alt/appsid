import React from "react";
import { useNavigate } from "react-router-dom";

// ─── Tools registry ────────────────────────────────────────────────────────

const TOOLS = [
  {
    id: "hpp-calculator",
    name: "HPP Calculator",
    tagline: "Hitung harga pokok produksi dengan akurat",
    desc: "Kalkulator HPP untuk produk fisik maupun digital. Masukkan komponen biaya dan dapatkan breakdown lengkap harga pokok, margin, dan rekomendasi harga jual.",
    category: "Keuangan",
    route: "/hpp-calculator",
    emoji: "🧮",
    badge: null,
  },
  {
    id: "docs",
    name: "Docs",
    tagline: "Dokumentasi lengkap platform Apphunt",
    desc: "Panduan lengkap penggunaan platform, API reference, dan resource untuk developer yang ingin integrate dengan ekosistem Apphunt.",
    category: "Developer",
    route: "/docs",
    emoji: "📄",
    badge: null,
  },
];

// ─── Card ──────────────────────────────────────────────────────────────────

function ToolCard({ tool }) {
  const navigate = useNavigate();

  return (
    <article
      className="library-card"
      style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
      onClick={() => navigate(tool.route)}
    >
      {/* Hero */}
      <div className="library-card-hero">
        <div
          className="library-card-screenshot-wrap"
          style={{
            background: "linear-gradient(135deg, #f5f2ec 0%, #ede8de 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 120,
            position: "relative",
          }}
        >
          <span style={{ fontSize: 48, lineHeight: 1 }}>{tool.emoji}</span>
          {tool.badge && (
            <span
              className="library-card-chip"
              style={{ position: "absolute", top: 10, left: 10, fontSize: 11, padding: "2px 8px" }}
            >
              {tool.badge}
            </span>
          )}
        </div>
      </div>

      {/* Ribbon */}
      <div className="library-card-ribbon">
        <strong>{tool.name}</strong>
        <span>{tool.category}</span>
      </div>

      {/* Meta */}
      <div
        className="library-card-meta"
        style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", flex: 1 }}
      >
        <p style={{
          fontSize: 12,
          color: "#55606d",
          margin: "0 0 8px",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {tool.desc}
        </p>

        <div style={{ marginTop: "auto" }}>
          <button
            type="button"
            className="cta-button"
            style={{ width: "100%", fontSize: 13, height: 34 }}
            onClick={(e) => { e.stopPropagation(); navigate(tool.route); }}
          >
            Buka tool
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  return (
    <div style={{ padding: "0 0 60px" }}>

      {/* ── Banner ──────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #1a1208 0%, #2e1f06 60%, #3d2a08 100%)",
        borderRadius: "0 0 14px 14px",
        padding: "52px 48px 44px",
        marginBottom: 36,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 70% at 80% 50%, rgba(246,166,30,.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <p style={{ fontSize: 13, fontWeight: 700, color: "#f6a61e", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
          Tools
        </p>
        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#fffdf8",
          margin: "0 0 12px",
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          maxWidth: 500,
        }}>
          Toolkit untuk builder
        </h1>
        <p style={{
          fontSize: 16,
          color: "#c9b99a",
          margin: 0,
          lineHeight: 1.5,
          maxWidth: 460,
        }}>
          Kumpulan tools praktis untuk founder, developer, dan maker Indonesia. Gratis, langsung pakai.
        </p>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 24px" }}>

        {/* Count */}
        <p style={{ fontSize: 13, color: "#55606d", margin: "0 0 16px" }}>
          <strong style={{ color: "#0d1d38" }}>{TOOLS.length}</strong> tools tersedia
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
