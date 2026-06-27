import React, { useState } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────

const PATUNGAN_LIST = [
  {
    id: 1,
    name: "Cursor Pro — 1 Bulan",
    tagline:
      "Editor AI terbaik untuk vibe coding, autocomplete kontekstual + multi-file edit.",
    category: "AI Coding",

    target: 20,
    joined: 13,
    pricePerPerson: 45000,
    totalPrice: 900000,
    deadline: "5 hari lagi",
    status: "open",
    badge: "Hampir penuh",
  },
  {
    id: 2,
    name: "Windsurf Team Plan",
    tagline:
      "Cascade multi-file agent, unlimited completions, cocok buat solo founder.",
    category: "AI Coding",

    target: 10,
    joined: 3,
    pricePerPerson: 60000,
    totalPrice: 600000,
    deadline: "10 hari lagi",
    status: "open",
    badge: null,
  },
  {
    id: 3,
    name: "Perplexity Pro — 3 Bulan",
    tagline:
      "Search AI dengan sitasi real-time, cocok untuk riset pasar dan competitor analysis.",
    category: "Research",

    target: 15,
    joined: 15,
    pricePerPerson: 35000,
    totalPrice: 525000,
    deadline: null,
    status: "full",
    badge: "Penuh",
  },
  {
    id: 4,
    name: "Linear — Team Plan",
    tagline:
      "Issue tracker terbaik untuk indie hacker dan tim kecil. Fast, keyboard-first.",
    category: "Produktivitas",

    target: 8,
    joined: 2,
    pricePerPerson: 75000,
    totalPrice: 600000,
    deadline: "14 hari lagi",
    status: "open",
    badge: "Baru",
  },
  {
    id: 5,
    name: "Figma Professional",
    tagline:
      "Design tool full fitur: unlimited projects, version history, dan dev mode.",
    category: "Design",

    target: 12,
    joined: 9,
    pricePerPerson: 55000,
    totalPrice: 660000,
    deadline: "7 hari lagi",
    status: "open",
    badge: null,
  },
  {
    id: 6,
    name: "Notion AI — Team",
    tagline:
      "Workspace + AI writer untuk dokumentasi produk, roadmap, dan knowledge base tim.",
    category: "Produktivitas",

    target: 10,
    joined: 10,
    pricePerPerson: 40000,
    totalPrice: 400000,
    deadline: null,
    status: "full",
    badge: "Penuh",
  },
];

const CATEGORIES = [
  "Semua",
  "AI Coding",
  "Research",
  "Produktivitas",
  "Design",
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatIDR(n) {
  if (n >= 1_000_000)
    return `Rp ${(n / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ─── Progress Bar ──────────────────────────────────────────────────────────

function ProgressMeter({ joined, target }) {
  const pct = Math.min(100, Math.round((joined / target) * 100));
  const isFull = joined >= target;

  // Color based on fill
  const barColor = isFull ? "#1a6b48" : pct >= 70 ? "#c7820e" : "#f6a61e";
  const trackColor = isFull ? "#edfaf4" : "#f5f2ec";

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Track */}
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: trackColor,
          border: "1px solid #d9d1c2",
          overflow: "hidden",
          marginBottom: 5,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: barColor,
            transition: "width 600ms cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>
      {/* Label row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isFull ? "#1a6b48" : "#0d1d38",
          }}
        >
          {joined} / {target} orang
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#7b8594" }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── Participant Avatars ───────────────────────────────────────────────────

function ParticipantDots({ joined, target }) {
  const shown = Math.min(joined, 6);
  const remaining = joined > 6 ? joined - 6 : 0;
  // Deterministic initials from index
  const initials = ["A", "R", "D", "S", "M", "F"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex" }}>
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: `hsl(${(i * 47 + 20) % 360}, 45%, 55%)`,
              border: "2px solid #fffdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 800,
              color: "#fff",
              marginLeft: i === 0 ? 0 : -6,
              zIndex: shown - i,
              position: "relative",
            }}
          >
            {initials[i]}
          </div>
        ))}
        {remaining > 0 && (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#f5f2ec",
              border: "2px solid #fffdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 800,
              color: "#55606d",
              marginLeft: -6,
              position: "relative",
              zIndex: 0,
            }}
          >
            +{remaining}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 11,
          color: "#7b8594",
          fontWeight: 600,
          marginLeft: 4,
        }}
      >
        sudah bergabung
      </span>
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────

function PatunganCard({ item }) {
  const isFull = item.status === "full";
  const spotsLeft = item.target - item.joined;

  return (
    <article
      className="library-card"
      style={{
        display: "flex",
        flexDirection: "column",
        opacity: isFull ? 0.8 : 1,
      }}
    >
      {/* Hero */}
      <div className="library-card-hero">
        <div
          className="library-card-screenshot-wrap"
          style={{ position: "relative" }}
        >
          <div className="library-card-placeholder" style={{ display: "flex" }}>
            <span className="placeholder-label">{item.name}</span>
          </div>

          {/* Status badge */}
          {item.badge && (
            <span
              className="library-card-chip"
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                fontSize: 11,
                padding: "2px 8px",
                background: isFull
                  ? "#edfaf4"
                  : item.badge === "Baru"
                    ? "#f0f4ff"
                    : "#fff8ec",
                border: isFull
                  ? "1px solid #a3e4c6"
                  : item.badge === "Baru"
                    ? "1px solid #b8c9f5"
                    : "1px solid #f5d68a",
                color: isFull
                  ? "#1a6b48"
                  : item.badge === "Baru"
                    ? "#2d4fa0"
                    : "#8a5c00",
              }}
            >
              {item.badge}
            </span>
          )}

          {/* Deadline */}
          {item.deadline && (
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
              {item.deadline}
            </span>
          )}
        </div>
      </div>

      {/* Ribbon */}
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
        {/* Desc */}
        <p
          style={{
            fontSize: 12,
            color: "#55606d",
            margin: "0 0 10px",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.tagline}
        </p>

        {/* Participant avatars */}
        <ParticipantDots joined={item.joined} target={item.target} />

        {/* Progress meter */}
        <ProgressMeter joined={item.joined} target={item.target} />

        {/* Price row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderTop: "1px solid #f0ebe2",
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#0d1d38",
                letterSpacing: "-0.03em",
              }}
            >
              {formatIDR(item.pricePerPerson)}
            </div>
            <div style={{ fontSize: 11, color: "#7b8594", fontWeight: 600 }}>
              per orang
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#55606d", fontWeight: 600 }}>
              Total {formatIDR(item.totalPrice)}
            </div>
            {!isFull && (
              <div style={{ fontSize: 11, color: "#8a5c00", fontWeight: 700 }}>
                {spotsLeft} slot tersisa
              </div>
            )}
          </div>
        </div>

        {/* CTA — always footer */}
        <div style={{ marginTop: "auto" }}>
          {isFull ? (
            <button
              type="button"
              className="ghost-button"
              style={{ width: "100%", fontSize: 13, height: 34 }}
              disabled
            >
              Penuh — notifikasi saya
            </button>
          ) : (
            <button
              type="button"
              className="cta-button"
              style={{ width: "100%", fontSize: 13, height: 34 }}
            >
              Ikut patungan
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function PatunganPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showFull, setShowFull] = useState(false);

  const filtered = PATUNGAN_LIST.filter((item) => {
    const matchCat =
      activeCategory === "Semua" || item.category === activeCategory;
    const matchFull = showFull || item.status !== "full";
    return matchCat && matchFull;
  });

  const openCount = PATUNGAN_LIST.filter((i) => i.status === "open").length;
  const fullCount = PATUNGAN_LIST.filter((i) => i.status === "full").length;

  return (
    <div style={{ padding: "0 0 60px" }}>
      {/* ── Banner ──────────────────────────────────────────────────── */}
      <section className="perks-hero-panel" style={{ marginBottom: "28px" }}>
        <div className="perks-hero-copy">
          <span className="perks-hero-eyebrow">Patungan</span>
          <h2>Patungan tools bareng komunitas</h2>
          <p>
            Bayar lebih murah untuk tools premium dengan sistem patungan. Gabung
            dengan builder Indonesia lainnya dan hemat sampai 80%.
          </p>
          <div className="hero-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="cta-button"
              style={{ fontSize: 14, height: 38 }}
            >
              Usulkan tools
            </button>
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: 14, height: 38 }}
            >
              Cara kerja
            </button>
          </div>
        </div>
      </section>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 28,
          padding: "0 24px",
        }}
      >
        {/* Sidebar */}
        <aside
          className="apps-left-sidebar"
          style={{ alignSelf: "start", position: "sticky", top: 20 }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#55606d",
              margin: "0 0 8px",
              letterSpacing: "-0.01em",
            }}
          >
            Kategori
          </p>
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

          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#55606d",
              margin: "0 0 8px",
              letterSpacing: "-0.01em",
            }}
          >
            Status
          </p>
          <div className="tags-list" style={{ marginBottom: 20 }}>
            <button
              type="button"
              className={`mini-tag-btn${!showFull ? " active" : ""}`}
              onClick={() => setShowFull(false)}
            >
              Masih buka
            </button>
            <button
              type="button"
              className={`mini-tag-btn${showFull ? " active" : ""}`}
              onClick={() => setShowFull(true)}
            >
              Semua
            </button>
          </div>

          {/* Stats card */}
          <div
            style={{
              padding: "12px 14px",
              border: "1px solid #d9d1c2",
              borderBottomWidth: 2,
              borderRadius: 10,
              background: "#fffdf8",
              boxShadow: "inset 0 -2px 0 rgba(21,19,16,.07)",
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#0d1d38",
                margin: "0 0 8px",
              }}
            >
              Ringkasan
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ fontSize: 12, color: "#55606d", fontWeight: 600 }}
                >
                  Buka
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 800, color: "#0d1d38" }}
                >
                  {openCount}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ fontSize: 12, color: "#55606d", fontWeight: 600 }}
                >
                  Penuh
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 800, color: "#1a6b48" }}
                >
                  {fullCount}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ fontSize: 12, color: "#55606d", fontWeight: 600 }}
                >
                  Total tools
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 800, color: "#0d1d38" }}
                >
                  {PATUNGAN_LIST.length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              fontSize: 13,
              color: "#55606d",
            }}
          >
            <strong style={{ color: "#0d1d38" }}>{filtered.length}</strong>{" "}
            patungan tersedia
            <span className="hero-dot" />
            <span>{openCount} masih buka</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((item) => <PatunganCard key={item.id} item={item} />)
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#7b8594",
                  fontSize: 14,
                  border: "1px solid #d9d1c2",
                  borderRadius: 10,
                  background: "#fffdf8",
                }}
              >
                Tidak ada patungan yang sesuai filter.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
