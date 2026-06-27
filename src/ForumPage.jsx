import React, { useState, useMemo } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Semua",
  "General",
  "SaaS & Produk",
  "AI & Tools",
  "Developer",
  "Marketing",
  "Fundraising",
  "Hire & Collab",
];

const TAGS = [
  "micro-saas", "mvp", "open source", "vibe coding",
  "monetisasi", "landing page", "nextjs", "python",
  "growth", "bootstrap", "b2b", "ai agent",
];

const SORT_OPTIONS = ["Terbaru", "Trending", "Top"];

const POSTS = [
  {
    id: 1,
    author: "nabilfatih",
    authorInitial: "N",
    timeAgo: "2 jam lalu",
    category: "SaaS & Produk",
    flair: "Show & Tell",
    title: "Gua launch SaaS pertama gua setelah 3 bulan vibe coding — ini hasilnya",
    body: "Setelah 3 bulan ngebuild sambil kerja full-time, akhirnya launch. MRR bulan pertama Rp 2.4 juta dari 12 paying user. Bukan angka gede, tapi validasi pertama yang nyata. Ini breakdown apa yang works dan apa yang nggak...",
    upvotes: 142,
    comments: 38,
    tags: ["micro-saas", "mvp", "monetisasi"],
    pinned: true,
  },
  {
    id: 2,
    author: "rizkydev",
    authorInitial: "R",
    timeAgo: "5 jam lalu",
    category: "AI & Tools",
    flair: "Diskusi",
    title: "Mana yang lebih worth untuk solo founder: Windsurf atau Cursor?",
    body: "Udah nyoba dua-duanya selama sebulan terakhir. Windsurf lebih enak untuk greenfield project karena Cascade-nya bisa handle multi-file sekaligus. Tapi Cursor unggul di codebase yang udah gede karena...",
    upvotes: 89,
    comments: 61,
    tags: ["vibe coding", "ai agent"],
    pinned: false,
  },
  {
    id: 3,
    author: "sarahfound",
    authorInitial: "S",
    timeAgo: "8 jam lalu",
    category: "Marketing",
    flair: "Tips",
    title: "Cold email ke 500 UMKM, 11 closing — ini template yang works",
    body: "Gua spent 2 minggu nulis dan A/B test 6 variasi cold email untuk produk HR tool gua. Open rate rata-rata 34%, reply rate 8%, dan 11 yang jadi paying customer. Breakdown lengkapnya di sini...",
    upvotes: 203,
    comments: 44,
    tags: ["b2b", "marketing", "growth"],
    pinned: false,
  },
  {
    id: 4,
    author: "devanto",
    authorInitial: "D",
    timeAgo: "1 hari lalu",
    category: "Developer",
    flair: "Tanya",
    title: "Best stack untuk bikin marketplace akun digital di 2025? Next.js atau Remix?",
    body: "Lagi ngebuild marketplace kecil-kecilan mirip BursaVerse. Sekarang pakai Next.js App Router tapi mulai ngerasa overhead-nya banyak. Ada yang pernah migrate ke Remix atau pakai Hono + Astro?",
    upvotes: 47,
    comments: 29,
    tags: ["nextjs", "developer"],
    pinned: false,
  },
  {
    id: 5,
    author: "milafunding",
    authorInitial: "M",
    timeAgo: "1 hari lalu",
    category: "Fundraising",
    flair: "Resource",
    title: "List 14 investor Indonesia yang aktif invest di early-stage SaaS — updated Juni 2025",
    body: "Gua compile ini setelah 3 bulan fundraising untuk startup gua. Dari 40+ investor yang gua reach out, ini 14 yang actually reply dan ada di stage pre-seed sampai seed untuk produk SaaS...",
    upvotes: 318,
    comments: 52,
    tags: ["fundraising", "bootstrap"],
    pinned: false,
  },
  {
    id: 6,
    author: "opensourceid",
    authorInitial: "O",
    timeAgo: "2 hari lalu",
    category: "Developer",
    flair: "Open Source",
    title: "Gua open-source-in template boilerplate SaaS multi-tenant pakai Next.js + Supabase",
    body: "Udah 6 bulan gua pakai internal di 3 project berbeda. Fitur: auth, billing Stripe, org management, rbac, email dengan Resend, dan dark mode. MIT license, gratis selamanya...",
    upvotes: 276,
    comments: 83,
    tags: ["open source", "nextjs", "python"],
    pinned: false,
  },
  {
    id: 7,
    author: "hireteam",
    authorInitial: "H",
    timeAgo: "3 hari lalu",
    category: "Hire & Collab",
    flair: "Collab",
    title: "Cari co-founder technical untuk fintech UMKM — equity-based",
    body: "Gua founder non-technical dengan background 5 tahun di finance UMKM. Punya 20 LOI dari calon customer, butuh CTO atau lead engineer yang mau equity split 30-40%. Product: platform modal kerja...",
    upvotes: 34,
    comments: 18,
    tags: ["b2b", "bootstrap"],
    pinned: false,
  },
  {
    id: 8,
    author: "growthhack",
    authorInitial: "G",
    timeAgo: "3 hari lalu",
    category: "Marketing",
    flair: "Case Study",
    title: "Dari 0 ke 1000 user organik dalam 60 hari — full breakdown SEO micro-saas",
    body: "Produk: tools generator konten marketing untuk UMKM. Strategi yang gua pakai: long-tail keyword clustering, programmatic SEO untuk 800+ halaman, dan link building dari komunitas dev lokal...",
    upvotes: 189,
    comments: 67,
    tags: ["growth", "landing page", "micro-saas"],
    pinned: false,
  },
];

// ─── Flair color map ───────────────────────────────────────────────────────

const FLAIR_STYLE = {
  "Show & Tell": { bg: "#edfaf4", border: "#a3e4c6", color: "#1a6b48" },
  "Diskusi":     { bg: "#f0f4ff", border: "#b8c9f5", color: "#2d4fa0" },
  "Tips":        { bg: "#fff8ec", border: "#f5d68a", color: "#8a5c00" },
  "Tanya":       { bg: "#f5f2ec", border: "#d9d1c2", color: "#55606d" },
  "Resource":    { bg: "#fef2f2", border: "#f5b8b8", color: "#a03030" },
  "Open Source": { bg: "#f0f4ff", border: "#b8c9f5", color: "#2d4fa0" },
  "Collab":      { bg: "#fff8ec", border: "#f5d68a", color: "#8a5c00" },
  "Case Study":  { bg: "#edfaf4", border: "#a3e4c6", color: "#1a6b48" },
};

// ─── Sub-components ────────────────────────────────────────────────────────

function Avatar({ initial, size = 32 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #f6a61e 0%, #cf860d 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontWeight: 800,
      fontSize: size * 0.4,
      color: "#1a1208",
      letterSpacing: "-0.01em",
    }}>
      {initial}
    </div>
  );
}

function FlairBadge({ label }) {
  const s = FLAIR_STYLE[label] || FLAIR_STYLE["Diskusi"];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      height: 20,
      padding: "0 7px",
      borderRadius: 4,
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 700,
    }}>
      {label}
    </span>
  );
}

function UpvoteButton({ count, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        width: 40,
        flexShrink: 0,
        background: active
          ? "linear-gradient(180deg, #fff8ec 0%, #ffefc7 100%)"
          : "#fdfdfc",
        border: `1px solid ${active ? "#c7820e" : "#d9d1c2"}`,
        borderBottomWidth: 2,
        borderRadius: 8,
        cursor: "pointer",
        padding: "6px 0",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        boxShadow: active
          ? "inset 0 -2px 0 #cf860d, 0 1px 0 rgba(129,79,2,.2)"
          : "inset 0 -2px 0 rgba(21,19,16,.07)",
        color: active ? "#8a5c00" : "#55606d",
      }}
    >
      {/* Up arrow — SVG, no icon lib */}
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 12, height: 12 }}
      >
        <path d="M6 2L2 7h8L6 2z" fill={active ? "currentColor" : "none"} strokeWidth="1.5" />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 800, lineHeight: 1 }}>{count}</span>
    </button>
  );
}

function PostCard({ post }) {
  const [upvoted, setUpvoted] = useState(false);
  const [votes, setVotes] = useState(post.upvotes);

  function toggleUpvote() {
    if (upvoted) {
      setVotes((v) => v - 1);
    } else {
      setVotes((v) => v + 1);
    }
    setUpvoted((u) => !u);
  }

  return (
    <article
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        border: "1px solid #d9d1c2",
        borderBottomWidth: 2,
        borderRadius: 10,
        background: post.pinned ? "linear-gradient(180deg, #fffdf8 0%, #fffbf2 100%)" : "#fffdf8",
        boxShadow: "inset 0 -3px 0 rgba(21,19,16,.07), 0 1px 3px rgba(21,19,16,.06)",
        cursor: "pointer",
        transition: "transform 260ms cubic-bezier(.22,1,.36,1), box-shadow 260ms cubic-bezier(.22,1,.36,1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(2px)";
        e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(21,19,16,.05), 0 1px 2px rgba(21,19,16,.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "inset 0 -3px 0 rgba(21,19,16,.07), 0 1px 3px rgba(21,19,16,.06)";
      }}
    >
      {/* Upvote column */}
      <div style={{ paddingTop: 2 }}>
        <UpvoteButton count={votes} active={upvoted} onToggle={toggleUpvote} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Meta row: author · time · category · flair · pinned */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <Avatar initial={post.authorInitial} size={22} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0d1d38" }}>{post.author}</span>
          <span style={{ fontSize: 11, color: "#7b8594" }}>{post.timeAgo}</span>
          <span className="hero-dot" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#55606d" }}>{post.category}</span>
          <FlairBadge label={post.flair} />
          {post.pinned && (
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#8a5c00",
              background: "#fff8ec",
              border: "1px solid #f5d68a",
              borderRadius: 4,
              padding: "0 6px",
              height: 20,
              display: "inline-flex",
              alignItems: "center",
            }}>
              Pinned
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          margin: "0 0 6px",
          fontSize: 16,
          fontWeight: 800,
          color: "#0d1d38",
          letterSpacing: "-0.02em",
          lineHeight: 1.3,
        }}>
          {post.title}
        </h3>

        {/* Body preview — 2 lines max */}
        <p style={{
          margin: "0 0 10px",
          fontSize: 13,
          color: "#55606d",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {post.body}
        </p>

        {/* Footer: tags + actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          {/* Tags */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{
                height: 22,
                padding: "0 8px",
                borderRadius: 5,
                border: "1px solid #e0d8cc",
                background: "#f5f2ec",
                color: "#55606d",
                fontSize: 11,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: "#7b8594",
              padding: 0,
              transition: "color 120ms ease",
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#0d1d38"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#7b8594"}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M14 10c0 1.1-.9 2-2 2H4l-2 2V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6z" />
              </svg>
              {post.comments} komentar
            </button>
            <button type="button" style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: "#7b8594",
              padding: 0,
              transition: "color 120ms ease",
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#0d1d38"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#7b8594"}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M4 8a4 4 0 0 1 8 0M4 8a4 4 0 0 0 8 0M4 8H2m10 0h2" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              Bagikan
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeTag, setActiveTag]           = useState(null);
  const [activeSort, setActiveSort]         = useState("Terbaru");

  const filtered = useMemo(() => {
    let list = [...POSTS];

    // Category filter
    if (activeCategory !== "Semua") {
      list = list.filter((p) => p.category === activeCategory);
    }

    // Tag filter
    if (activeTag) {
      list = list.filter((p) => p.tags.includes(activeTag));
    }

    // Sort
    if (activeSort === "Trending") {
      list = [...list].sort((a, b) => b.comments - a.comments);
    } else if (activeSort === "Top") {
      list = [...list].sort((a, b) => b.upvotes - a.upvotes);
    }
    // Terbaru — original order (pinned first)
    const pinned   = list.filter((p) => p.pinned);
    const unpinned = list.filter((p) => !p.pinned);
    return [...pinned, ...unpinned];
  }, [activeCategory, activeTag, activeSort]);

  return (
    <div style={{ padding: "0 0 60px" }}>

      {/* ── Banner Hero ─────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #1a1208 0%, #2e1f06 60%, #3d2a08 100%)",
        borderRadius: "0 0 14px 14px",
        padding: "52px 48px 44px",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 80% at 85% 50%, rgba(246,166,30,.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <p style={{ fontSize: 13, fontWeight: 700, color: "#f6a61e", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
          Forum
        </p>
        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#fffdf8",
          margin: "0 0 12px",
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          maxWidth: 540,
        }}>
          Diskusi untuk builder Indonesia
        </h1>
        <p style={{
          fontSize: 16,
          color: "#c9b99a",
          margin: "0 0 24px",
          lineHeight: 1.5,
          maxWidth: 480,
        }}>
          Tanya, share, dan connect dengan sesama founder, developer, dan maker. Semua topik soal ngebuild produk digital Indonesia.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="cta-button" style={{ fontSize: 14, height: 38 }}>
            Buat postingan
          </button>
          <button type="button" className="ghost-button" style={{
            fontSize: 14,
            height: 38,
            color: "#fffdf8",
            borderColor: "rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.08)",
          }}>
            Lihat panduan
          </button>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 28, padding: "0 24px" }}>

        {/* ── Left sidebar ──────────────────────────────────────────── */}
        <aside className="apps-left-sidebar" style={{ alignSelf: "start", position: "sticky", top: 20 }}>

          {/* New post CTA */}
          <button type="button" className="cta-button" style={{ width: "100%", fontSize: 13, height: 34, marginBottom: 4 }}>
            Buat postingan
          </button>

          {/* Kategori */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#55606d", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              Kategori
            </p>
            <div className="tags-list">
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
          </div>

          {/* Popular tags */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#55606d", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              Tag populer
            </p>
            <div className="tags-list">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`mini-tag-btn${activeTag === tag ? " active" : ""}`}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Panduan singkat */}
          <div style={{
            padding: "12px 14px",
            border: "1px solid #d9d1c2",
            borderBottomWidth: 2,
            borderRadius: 10,
            background: "#fffdf8",
            boxShadow: "inset 0 -2px 0 rgba(21,19,16,.07)",
          }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#0d1d38", margin: "0 0 6px" }}>Panduan forum</p>
            {[
              "Judul yang jelas dan spesifik",
              "Satu topik per postingan",
              "Tidak ada spam atau self-promo berlebihan",
              "Berikan konteks yang cukup",
            ].map((rule) => (
              <p key={rule} style={{ fontSize: 11, color: "#55606d", margin: "0 0 4px", lineHeight: 1.5, display: "flex", gap: 5 }}>
                <span style={{ color: "#f6a61e", fontWeight: 800, flexShrink: 0 }}>·</span>
                {rule}
              </p>
            ))}
          </div>

        </aside>

        {/* ── Feed ──────────────────────────────────────────────────── */}
        <main>

          {/* Sort bar + stats */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>

            {/* Stats */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#55606d" }}>
              <strong style={{ color: "#0d1d38" }}>{filtered.length}</strong> postingan
              {activeCategory !== "Semua" && (
                <>
                  <span className="hero-dot" />
                  <span style={{ fontWeight: 600 }}>{activeCategory}</span>
                </>
              )}
              {activeTag && (
                <>
                  <span className="hero-dot" />
                  <span style={{
                    height: 22,
                    padding: "0 8px",
                    borderRadius: 5,
                    border: "1px solid #c7820e",
                    background: "#fff8ec",
                    color: "#8a5c00",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}>
                    {activeTag}
                    <button
                      type="button"
                      onClick={() => setActiveTag(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", fontWeight: 800, fontSize: 12, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                </>
              )}
            </div>

            {/* Sort pills */}
            <div style={{ display: "flex", gap: 5 }}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`mini-tag-btn${activeSort === opt ? " active" : ""}`}
                  onClick={() => setActiveSort(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Post list */}
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.length > 0 ? (
              filtered.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "#7b8594",
                fontSize: 14,
                border: "1px solid #d9d1c2",
                borderRadius: 10,
                background: "#fffdf8",
              }}>
                Tidak ada postingan yang sesuai filter.
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
