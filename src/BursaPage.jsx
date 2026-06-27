import React, { useState, useMemo } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────

const PRICE_RANGES = [
  { label: "Semua Harga", min: 0, max: Infinity },
  { label: "< Rp 5 juta", min: 0, max: 5_000_000 },
  { label: "Rp 5–50 juta", min: 5_000_000, max: 50_000_000 },
  { label: "Rp 50–500 juta", min: 50_000_000, max: 500_000_000 },
  { label: "> Rp 500 juta", min: 500_000_000, max: Infinity },
];

const MRR_RANGES = [
  { label: "Semua MRR", min: 0 },
  { label: "MRR > Rp 1 juta", min: 1_000_000 },
  { label: "MRR > Rp 5 juta", min: 5_000_000 },
  { label: "MRR > Rp 20 juta", min: 20_000_000 },
];

const CATEGORIES = [
  "Semua Kategori",
  "Tools",
  "Produktivitas",
  "Gaming Commerce",
  "E-Commerce",
  "Developer Tools",
  "AI & Automation",
];

const STATUS_COLORS = {
  MVP: { bg: "#f0f4ff", border: "#b8c9f5", color: "#2d4fa0" },
  Aktif: { bg: "#edfaf4", border: "#a3e4c6", color: "#1a6b48" },
  Bertumbuh: { bg: "#fff8ec", border: "#f5d68a", color: "#8a5c00" },
  "For Sale": { bg: "#fef2f2", border: "#f5b8b8", color: "#a03030" },
};

const LISTINGS = [
  {
    id: 1,
    name: "HubNesia",
    tagline: "Semua Layanan Digital dalam Satu Platform",
    category: "Tools",
    status: "MVP",
    stack: ["Web", "NextJs", "Postgre"],
    price: 1_200_000,
    mrr: null,
    revenue12m: null,
    domainAge: 4,
    growth: null,
    featured: false,
  },
  {
    id: 2,
    name: "Helipod",
    tagline:
      "Co-DevOps platform: deploy web apps, APIs & AI workloads in minutes.",
    category: "Developer Tools",
    status: "Aktif",
    stack: ["Web"],
    price: 300_000_000,
    mrr: null,
    revenue12m: null,
    domainAge: 2,
    growth: null,
    featured: true,
  },
  {
    id: 3,
    name: "SanPoi Store",
    tagline:
      "Platform gaming commerce berbasis whitelabel dengan ribuan transaksi historis.",
    category: "Gaming Commerce",
    status: "Bertumbuh",
    stack: ["Web", "Next.js", "Google Analytics"],
    price: 12_000_000,
    mrr: null,
    revenue12m: 80_000_000,
    domainAge: 12,
    growth: "+10.0% MoM",
    featured: false,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatIDR(n) {
  if (n >= 1_000_000_000)
    return `Rp ${(n / 1_000_000_000).toFixed(1).replace(".0", "")} M`;
  if (n >= 1_000_000)
    return `Rp ${(n / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StackPill({ label }) {
  return (
    <span
      className="library-card-chip"
      style={{
        fontSize: 10,
        padding: "2px 7px",
        marginRight: 4,
        marginBottom: 4,
      }}
    >
      {label}
    </span>
  );
}

function MetaRow({ label, value, private: isPrivate }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: "1px solid #f0ebe2",
      }}
    >
      <span style={{ fontSize: 12, color: "#7b8594", fontWeight: 600 }}>
        {label}
      </span>
      {isPrivate ? (
        <span style={{ fontSize: 12, color: "#b0a898" }}>Info privat</span>
      ) : (
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0d1d38" }}>
          {value}
        </span>
      )}
    </div>
  );
}

function SidebarLabel({ children }) {
  return (
    <p
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#55606d",
        margin: "0 0 8px",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </p>
  );
}

function BursaCard({ item }) {
  const status = STATUS_COLORS[item.status] || STATUS_COLORS["MVP"];
  return (
    <article
      className="library-card"
      style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
    >
      {/* Hero image area */}
      <div className="library-card-hero">
        <div
          className="library-card-screenshot-wrap"
          style={{ position: "relative" }}
        >
          <div className="library-card-placeholder" style={{ display: "flex" }}>
            <span className="placeholder-label">{item.name}</span>
          </div>

          {/* Status badge */}
          <span
            className="library-card-chip"
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              fontSize: 11,
              padding: "2px 8px",
              background: status.bg,
              border: `1px solid ${status.border}`,
              color: status.color,
            }}
          >
            {item.status}
          </span>

          {/* Featured badge */}
          {item.featured && (
            <span
              className="library-card-chip"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: 11,
                padding: "2px 8px",
              }}
            >
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Title ribbon */}
      <div className="library-card-ribbon">
        <strong>{item.name}</strong>
        <span>{item.category}</span>
      </div>

      {/* Body */}
      <div
        className="library-card-meta"
        style={{
          padding: "10px 12px 12px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Tagline */}
        <p
          style={{
            fontSize: 12,
            color: "#55606d",
            margin: "0 0 10px",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.tagline}
        </p>

        {/* Stack pills */}
        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 8 }}>
          {item.stack.map((s) => (
            <StackPill key={s} label={s} />
          ))}
        </div>

        {/* Metrics */}
        <div style={{ marginBottom: 10 }}>
          <MetaRow label="Harga Jual" value={formatIDR(item.price)} />
          <MetaRow
            label="MRR"
            private={!item.mrr}
            value={item.mrr ? formatIDR(item.mrr) : null}
          />
          <MetaRow
            label="Pendapatan 12 Bulan"
            private={!item.revenue12m}
            value={item.revenue12m ? formatIDR(item.revenue12m) : null}
          />
          <MetaRow label="Umur Domain" value={`${item.domainAge} bulan`} />
        </div>

        {/* Growth */}
        {item.growth && (
          <p
            style={{
              fontSize: 11,
              color: "#1a6b48",
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Pertumbuhan: {item.growth}
          </p>
        )}

        {/* CTA — always footer */}
        <div style={{ marginTop: "auto" }}>
          <button
            type="button"
            className="cta-button"
            style={{ width: "100%", fontSize: 13, height: 34 }}
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </article>
  );
}

function DueDiligenceCard({ title, desc }) {
  return (
    <div
      style={{
        border: "1px solid #d9d1c2",
        borderBottomWidth: 2,
        borderRadius: 10,
        background: "#fffdf8",
        padding: "16px 18px",
        boxShadow:
          "inset 0 -3px 0 rgba(21,19,16,.09), 0 1px 3px rgba(21,19,16,.07)",
      }}
    >
      <strong
        style={{
          fontSize: 14,
          color: "#0d1d38",
          display: "block",
          marginBottom: 6,
        }}
      >
        {title}
      </strong>
      <p style={{ fontSize: 13, color: "#55606d", margin: 0, lineHeight: 1.5 }}>
        {desc}
      </p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function BursaPage() {
  const [activeCategory, setActiveCategory] = useState("Semua Kategori");
  const [activePriceRange, setActivePriceRange] = useState(0);
  const [activeMRR, setActiveMRR] = useState(0);
  const [applied, setApplied] = useState({
    cat: "Semua Kategori",
    price: 0,
    mrr: 0,
  });

  const filteredListings = useMemo(() => {
    const pr = PRICE_RANGES[applied.price];
    const mr = MRR_RANGES[applied.mrr];
    return LISTINGS.filter((l) => {
      const matchCat =
        applied.cat === "Semua Kategori" || l.category === applied.cat;
      const matchPrice = l.price >= pr.min && l.price < pr.max;
      const matchMRR = !mr.min || (l.mrr != null && l.mrr >= mr.min);
      return matchCat && matchPrice && matchMRR;
    });
  }, [applied]);

  function applyFilters() {
    setApplied({
      cat: activeCategory,
      price: activePriceRange,
      mrr: activeMRR,
    });
  }

  return (
    <div style={{ padding: "0 0 60px" }}>
      <section className="perks-hero-panel" style={{ marginBottom: "36px" }}>
        <div className="perks-hero-copy">
          <span className="perks-hero-eyebrow">BursaVerse</span>
          <h2>Micro-SaaS Marketplace</h2>
          <p>
            Listing terkurasi dengan data MRR, revenue, dan umur domain. Cocok
            untuk founder yang ingin scale lebih cepat lewat akuisisi produk
            jadi.
          </p>
          <div className="hero-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="cta-button"
              style={{ fontSize: 14, height: 38 }}
            >
              Jelajahi Listing
            </button>
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: 14, height: 38 }}
            >
              Jual SaaS Anda
            </button>
          </div>
        </div>
      </section>

      {/* ── Main layout: sidebar + cards ──────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 28,
          padding: "0 24px",
        }}
      >
        {/* Left sidebar */}
        <aside
          className="apps-left-sidebar"
          style={{ alignSelf: "start", position: "sticky", top: 20 }}
        >
          <SidebarLabel>Kategori</SidebarLabel>
          <div className="tags-list" style={{ marginBottom: 20 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`mini-tag-btn${activeCategory === cat ? " active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <SidebarLabel>Rentang Harga</SidebarLabel>
          <div className="tags-list" style={{ marginBottom: 20 }}>
            {PRICE_RANGES.map((pr, i) => (
              <button
                key={pr.label}
                type="button"
                className={`mini-tag-btn${activePriceRange === i ? " active" : ""}`}
                onClick={() => setActivePriceRange(i)}
              >
                {pr.label}
              </button>
            ))}
          </div>

          <SidebarLabel>MRR Minimum</SidebarLabel>
          <div className="tags-list" style={{ marginBottom: 20 }}>
            {MRR_RANGES.map((mr, i) => (
              <button
                key={mr.label}
                type="button"
                className={`mini-tag-btn${activeMRR === i ? " active" : ""}`}
                onClick={() => setActiveMRR(i)}
              >
                {mr.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="cta-button"
            style={{ width: "100%", fontSize: 13, height: 34 }}
            onClick={applyFilters}
          >
            Terapkan Filter
          </button>
        </aside>

        {/* Right — listings */}
        <main>
          {/* Stats row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
              fontSize: 13,
              color: "#55606d",
            }}
          >
            <span>Peluang Akuisisi Aktif</span>
            <span className="hero-dot" />
            <span>
              <strong style={{ color: "#0d1d38" }}>
                {filteredListings.length}
              </strong>{" "}
              listing tersedia
            </span>
          </div>

          {/* Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
              marginBottom: 48,
            }}
          >
            {filteredListings.length > 0 ? (
              filteredListings.map((item) => (
                <BursaCard key={item.id} item={item} />
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#7b8594",
                  fontSize: 14,
                }}
              >
                Tidak ada listing yang sesuai filter.
              </div>
            )}
          </div>

          {/* Due Diligence section */}
          <div
            style={{
              borderTop: "1px solid #d9d1c2",
              paddingTop: 32,
              marginBottom: 32,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0d1d38",
                margin: "0 0 6px",
                letterSpacing: "-0.03em",
              }}
            >
              Due Diligence
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#55606d",
                margin: "0 0 20px",
                maxWidth: 560,
                lineHeight: 1.5,
              }}
            >
              BursaVerse memberi konteks metrik penting untuk screening awal
              akuisisi. Lanjutkan verifikasi dengan review legal, akses
              analytics, dan validasi domain via WHOIS.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              <DueDiligenceCard
                title="Revenue Context"
                desc="MRR dan TTM membantu buyer mengukur valuasi awal dan risiko cashflow."
              />
              <DueDiligenceCard
                title="Domain Maturity"
                desc="Input umur domain dari seller ditampilkan transparan, dengan arahan validasi WHOIS."
              />
              <DueDiligenceCard
                title="Featured Curation"
                desc="Listing unggulan menyorot aset dengan performa lebih stabil untuk buyer baru."
              />
              <DueDiligenceCard
                title="Contact Guard"
                desc="CTA contact seller hanya untuk user login agar proses akuisisi lebih aman."
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
