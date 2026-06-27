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
    badge: null,
  },
  {
    id: "docs",
    name: "Docs",
    tagline: "Dokumentasi lengkap platform Apphunt",
    desc: "Panduan lengkap penggunaan platform, API reference, dan resource untuk developer yang ingin integrate dengan ekosistem Apphunt.",
    category: "Developer",
    route: "/docs",
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
          style={{ position: "relative" }}
        >
          <div className="library-card-placeholder" style={{ display: "flex" }}>
            <span className="placeholder-label">{tool.name}</span>
          </div>
          {tool.badge && (
            <span
              className="library-card-chip"
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                fontSize: 11,
                padding: "2px 8px",
                zIndex: 3,
              }}
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
        style={{
          padding: "10px 12px 12px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "#55606d",
            margin: "0 0 8px",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {tool.desc}
        </p>

        <div style={{ marginTop: "auto" }}>
          <button
            type="button"
            className="cta-button"
            style={{ width: "100%", fontSize: 13, height: 34 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(tool.route);
            }}
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
      <section className="perks-hero-panel" style={{ marginBottom: "36px" }}>
        <div className="perks-hero-copy">
          <span className="perks-hero-eyebrow">Tools</span>
          <h2>Toolkit untuk builder</h2>
          <p>
            Kumpulan tools praktis untuk founder, developer, dan maker
            Indonesia. Gratis, langsung pakai.
          </p>
        </div>
      </section>

      {/* ── Grid ────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 24px" }}>
        {/* Count */}
        <p style={{ fontSize: 13, color: "#55606d", margin: "0 0 16px" }}>
          <strong style={{ color: "#0d1d38" }}>{TOOLS.length}</strong> tools
          tersedia
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
