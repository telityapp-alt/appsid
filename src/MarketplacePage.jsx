import React, { useState, useMemo } from "react";

// ─── Icons ─────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-inline">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4 4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        width: 12,
        height: 12,
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: 4,
      }}
    >
      <path d="M8 2 L13 4 L13 8 C13 11 8 14 8 14 C8 14 3 11 3 8 L3 4 Z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        width: 12,
        height: 12,
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: 4,
      }}
    >
      <path d="M2 2h5l7 7-5 5-7-7V2z" />
      <circle cx="5" cy="5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "MiMo",
  "VPS",
  "ChatGPT",
  "Windsurf / DevinAI",
  "Github Developer Pack",
  "OpenAgentic",
  "Source Code",
];

const LISTINGS = [
  {
    id: 1,
    name: "MiMo Api Key Senilai 30 USD",
    category: "MiMo",
    desc: "MiMo api key via tumpuk 9router. Pengguna akan mendapatkan apikey resmi dari Xiaomi MiMo senilai 30 USD (fresh, tidak dishare, baru dibuat ketika order masuk). Jaminan awet karena metodenya legal (program referral mimo). Semua model xiaomi mimo termasuk MiMo 2.5 Pro didukung.",
    price: 20000,
    stock: 6,
    sold: 594,
    guarantee: "Pengembalian Dana",
    guaranteeDays: null,
    featured: true,
    badge: "🔥 Laris",
  },
  {
    id: 2,
    name: "OpenAgentic.dev Refresh Token",
    category: "OpenAgentic",
    desc: "OpenAgentic.dev Refresh token siap tempel ke 9router, Omnirouter. Model-model sesuai model yang didukung OpenAgentic, misal opus 4.7 dan lain-lain. Produk berbentuk refresh token yang bisa langsung diimport ke router favoritmu untuk coding.",
    price: 14900,
    stock: 0,
    sold: 220,
    guarantee: null,
    guaranteeDays: null,
    featured: false,
    badge: null,
  },
  {
    id: 3,
    name: "Windsurf / DevinAI — Full Quota",
    category: "Windsurf / DevinAI",
    desc: "Windsurf / DevinAI, Siap dipecut pecut kuota full.",
    price: 27000,
    stock: 0,
    sold: 431,
    guarantee: "Garansi akun",
    guaranteeDays: 1,
    featured: false,
    badge: null,
  },
  {
    id: 4,
    name: "Windsurf / DevinAI + Extra Usage 20 USD",
    category: "Windsurf / DevinAI",
    desc: "Windsurf / DevinAI dengan extra usage hingga 20 USD. Klik LIHAT BENEFIT untuk mengetahui detail benefit Windsurf.",
    price: 23000,
    stock: 0,
    sold: 120,
    guarantee: "Refund",
    guaranteeDays: 1,
    featured: false,
    badge: null,
  },
  {
    id: 5,
    name: "Github Student Developer Pack — 2 Tahun",
    category: "Github Developer Pack",
    desc: "Akun github student dengan benefit lengkap berlaku 2 tahun. Termasuk Digital Ocean $200 credit, beberapa domain gratis, dan benefit lengkap lainnya. KECUALI akses Copilot.",
    price: 46500,
    stock: 0,
    sold: 524,
    guarantee: "Refund",
    guaranteeDays: 3,
    featured: true,
    badge: "⭐ Best Value",
  },
  {
    id: 6,
    name: "Github Student Developer Pack",
    category: "Github Developer Pack",
    desc: "Akun github student dengan benefit lengkap berlaku setahun sampai dua tahun. Semua benefit KECUALI Digital Ocean. Membeli berarti paham cara memakainya.",
    price: 23800,
    stock: 0,
    sold: 298,
    guarantee: null,
    guaranteeDays: null,
    featured: false,
    badge: null,
  },
  {
    id: 7,
    name: "VPS Digital Ocean 4CPU/8GB RAM/154GB SSD — Singapore",
    category: "VPS",
    desc: "VPS Digital Ocean 4CPU (Intel) 8GB RAM 154GB SSD OS Ubuntu, Region Singapore. 1 Bulan. Cocok untuk trial SaaS, OpenClaw, host 9Router, host omnirouter, cliproxy, testing pasar SaaS.",
    price: 35000,
    stock: 0,
    sold: 164,
    guarantee: "Replace akun 1 kali",
    guaranteeDays: 20,
    featured: false,
    badge: null,
  },
  {
    id: 8,
    name: "Alibaba ECS 2CPU / 4GB RAM — Ubuntu Singapore",
    category: "VPS",
    desc: "Alibaba ECS 2 CPU / 4 GB RAM Ubuntu Region Singapore. Validity Until Jul 29, 2026. 100 Mbps peak bandwidth. Cocok untuk trial SaaS, OpenClaw, host 9Router, omnirouter, cliproxy.",
    price: 60000,
    stock: 0,
    sold: 120,
    guarantee: "Penggantian akun 1 kali",
    guaranteeDays: 30,
    featured: false,
    badge: null,
  },
  {
    id: 9,
    name: "VPS Alibaba Murah Meriah — 1 Tahun",
    category: "VPS",
    desc: "RDP/VPS by Alibaba Cloud. 1 vCPU 1GB RAM. Region ID/UK/US/SG. Download Up to 100 Mbps. Masa Aktif 1 Tahun. OS: Debian, Ubuntu, CentOS, Windows Server 2012.",
    price: 51500,
    stock: 0,
    sold: 19,
    guarantee: "Replace Akun",
    guaranteeDays: 60,
    featured: false,
    badge: null,
  },
  {
    id: 10,
    name: "ChatGPT Plus 1 Bulan — Pengiriman Malam Ini",
    category: "ChatGPT",
    desc: "ChatGPT Plus 1 Bulan. Akun fresh baru, dibuat begitu payment berhasil. Bukan invite bisnis. Cocok untuk agentic coding, bisa dipakai untuk 9router, omnirouter, cliproxy. Pembeli mendapat akun berupa email dan password, tidak disharing.",
    price: 6000,
    stock: 0,
    sold: 126,
    guarantee: "Mendapat akun pengganti 1X",
    guaranteeDays: 1,
    featured: false,
    badge: "⚡ Fast",
  },
  {
    id: 11,
    name: "ChatGPT Plus 1 Bulan",
    category: "ChatGPT",
    desc: "ChatGPT Plus 1 Bulan. Akun fresh baru, dibuat begitu payment berhasil. Bukan invite bisnis. Cocok untuk agentic coding, 9router, omnirouter, cliproxy. Berupa email dan password, tidak disharing.",
    price: 6300,
    stock: 0,
    sold: 448,
    guarantee: "Mendapat akun pengganti 1X",
    guaranteeDays: 1,
    featured: false,
    badge: null,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatIDR(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ListingCard({ item }) {
  const isOutOfStock = item.stock === 0;

  return (
    <article
      className="library-card"
      style={{
        opacity: isOutOfStock ? 0.75 : 1,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image area */}
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
          <span style={{ fontSize: 48, lineHeight: 1 }}>
            {item.name.charAt(0)}
          </span>
          {item.badge && (
            <span
              className="library-card-chip"
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                fontSize: 11,
                padding: "2px 8px",
              }}
            >
              {item.badge}
            </span>
          )}
          {isOutOfStock && (
            <span
              className="library-card-chip"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: 11,
                padding: "2px 8px",
                background: "#ffeaea",
                border: "1px solid #f5c2c2",
                color: "#b94a4a",
              }}
            >
              Stock Habis
            </span>
          )}
        </div>
      </div>

      {/* Title + category */}
      <div className="library-card-ribbon">
        <strong>{item.name}</strong>
        <span>{item.category}</span>
      </div>

      {/* Meta + price + CTA */}
      <div
        className="library-card-meta"
        style={{
          padding: "10px 12px 12px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* desc truncated */}
        <p
          style={{
            fontSize: 12,
            color: "#55606d",
            margin: "0 0 8px",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "auto",
          }}
        >
          {item.desc}
        </p>

        {/* price + sold row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0d1d38",
              letterSpacing: "-0.03em",
            }}
          >
            {formatIDR(item.price)}
          </span>
          <span className="app-meta-tag" style={{ fontSize: 11 }}>
            Dibeli: {item.sold.toLocaleString("id-ID")}
          </span>
        </div>

        {/* guarantee */}
        {item.guarantee && (
          <p
            style={{
              fontSize: 11,
              color: "#55606d",
              margin: "0 0 8px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              minHeight: "auto",
            }}
          >
            <ShieldIcon />
            {item.guarantee}
            {item.guaranteeDays ? ` ${item.guaranteeDays} hari` : ""}
          </p>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: 5, marginTop: "auto" }}>
          {isOutOfStock ? (
            <button
              type="button"
              className="ghost-button"
              style={{ flex: 1, fontSize: 11, height: 30, padding: "0 8px" }}
              disabled
            >
              Notifikasi Saya
            </button>
          ) : (
            <>
              <button
                type="button"
                className="cta-button"
                style={{ flex: 1, fontSize: 11, height: 30, padding: "0 8px" }}
              >
                Beli Sekarang
              </button>
              <button
                type="button"
                className="ghost-button"
                style={{ flex: 1, fontSize: 11, height: 30, padding: "0 8px" }}
              >
                + Keranjang
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function MarketplaceBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f6a61e 0%, #e8900a 100%)",
        border: "2px solid #c7820e",
        borderRadius: 12,
        padding: "28px 32px",
        marginBottom: 28,
        boxShadow:
          "inset 0 -3px 0 rgba(21,19,16,0.12), 0 1px 3px rgba(21,19,16,0.07)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative bg glyph */}
      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 700,
          color: "#7a3e00",
          background: "rgba(255,255,255,0.35)",
          border: "1px solid rgba(122,62,0,0.2)",
          borderRadius: 6,
          padding: "2px 10px",
          marginBottom: 10,
        }}
      >
        Marketplace Akun Digital
      </span>

      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 22,
          fontWeight: 800,
          color: "#11222b",
          letterSpacing: "-0.035em",
          lineHeight: 1.2,
        }}
      >
        Jual & beli akun digital dari seller terpercaya
      </h2>
      <p
        style={{
          margin: "0 0 18px",
          fontSize: 14,
          color: "#3d2000",
          maxWidth: 480,
        }}
      >
        Kami mendukung vibe coder, solo developer, dan innovator untuk membuat
        karya. Akun ini bisa dipakai untuk agentic coding di 9router dan tools
        lainnya.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="cta-button"
          style={{
            background: "#11222b",
            borderColor: "#0d1d38",
            boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.3)",
            color: "#fff",
          }}
        >
          Lihat Akun Tersedia
        </button>
        <button type="button" className="ghost-button">
          Submit App
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("All");

  const filteredListings = useMemo(() => {
    return LISTINGS.filter((item) => {
      const matchCat =
        activeCategory === "All" || item.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "all" ||
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const totalActive = LISTINGS.filter((i) => i.stock > 0).length;
  const categories = CATEGORIES;

  return (
    <section
      className="apps-page-layout"
      aria-labelledby="marketplace-title"
      style={{ gridTemplateColumns: "200px minmax(0, 1fr)" }}
    >
      {/* ── Left Sidebar ── */}
      <aside className="apps-left-sidebar" aria-label="Filter kategori">
        <h3 className="left-sidebar-title">Kategori</h3>
        <div className="tags-list">
          {categories.map((cat) => (
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
      </aside>

      {/* ── Center Feed ── */}
      <div className="apps-main-feed">
        {/* Mobile category bar */}
        <div
          className="mobile-category-bar"
          role="navigation"
          aria-label="Filter kategori"
        >
          {categories.map((cat) => (
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

        {/* Banner */}
        <MarketplaceBanner />

        {/* Header */}
        <div className="apps-list-header">
          <span className="library-kicker">Marketplace</span>
          <h2 id="marketplace-title">Akun Digital Tersedia</h2>
        </div>

        {/* Search */}
        <div className="apps-toolbar">
          <div className="search-bar-wrap">
            <SearchIcon />
            <input
              type="text"
              placeholder="Cari akun, tools, VPS..."
              className="search-input"
              value={searchQuery === "All" ? "" : searchQuery}
              onChange={(e) => setSearchQuery(e.target.value || "All")}
            />
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
            fontSize: 13,
            color: "#55606d",
          }}
        >
          <span>
            <strong style={{ color: "#0d1d38" }}>
              {filteredListings.length}
            </strong>{" "}
            item tersedia
          </span>
          <span className="hero-dot" />
          <span>
            <strong style={{ color: "#0d1d38" }}>{totalActive}</strong> listing
            aktif
          </span>
        </div>

        {/* Listing cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "40px 0",
                textAlign: "center",
                color: "#7a8699",
                fontSize: 14,
              }}
            >
              Tidak ada item yang cocok dengan pencarian kamu.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
