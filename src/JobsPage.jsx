import React, { useState } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Semua",
  "Frontend",
  "Backend",
  "Full Stack",
  "AI / ML",
  "Product",
  "Design",
  "Marketing",
];

const JOB_TYPES = [
  "Semua Tipe",
  "Full-time",
  "Part-time",
  "Freelance",
  "Co-founder",
];

const JOBS = [
  {
    id: 1,
    title: "Frontend Engineer — React / Next.js",
    company: "Helipod",
    category: "Frontend",
    type: "Full-time",
    location: "Remote",
    salary: "Rp 12–18 juta/bulan",
    posted: "2 hari lalu",
    desc: "Bangun UI produk DevOps kami yang dipakai ratusan startup. Stack: React, TypeScript, Tailwind. Kamu harus nyaman kerja async dan shipping cepat.",
    tags: ["React", "TypeScript", "Tailwind"],
    featured: true,
  },
  {
    id: 2,
    title: "AI Engineer — LLM & Agentic Workflow",
    company: "SanPoi Labs",
    category: "AI / ML",
    type: "Full-time",
    location: "Hybrid · Jakarta",
    salary: "Rp 20–30 juta/bulan",
    posted: "3 hari lalu",
    desc: "Build dan maintain pipeline LLM untuk product rekomendasi dan automation internal. Familiar dengan LangChain, OpenAI API, dan vector DB.",
    tags: ["LangChain", "Python", "OpenAI"],
    featured: true,
  },
  {
    id: 3,
    title: "Co-founder — Technical (CTO)",
    company: "Stealth EdTech Startup",
    category: "Full Stack",
    type: "Co-founder",
    location: "Remote",
    salary: "Equity-based",
    posted: "5 hari lalu",
    desc: "Cari technical co-founder untuk EdTech yang fokus di gamified learning. MVP sudah ada, butuh partner untuk scale. Non-dilutive funding sudah secured.",
    tags: ["Next.js", "Supabase", "Equity"],
    featured: false,
  },
  {
    id: 4,
    title: "Product Manager — B2B SaaS",
    company: "HubNesia",
    category: "Product",
    type: "Full-time",
    location: "Hybrid · Bandung",
    salary: "Rp 10–15 juta/bulan",
    posted: "1 minggu lalu",
    desc: "Lead product roadmap untuk platform layanan digital kami. Kamu harus bisa ngomong sama developer dan sekaligus ngerti pain point customer UMKM.",
    tags: ["Roadmap", "B2B", "UMKM"],
    featured: false,
  },
  {
    id: 5,
    title: "Backend Engineer — Node.js / Go",
    company: "AIverse",
    category: "Backend",
    type: "Full-time",
    location: "Remote",
    salary: "Rp 15–22 juta/bulan",
    posted: "1 minggu lalu",
    desc: "Build API dan infrastruktur backend untuk marketplace dan forum AIverse. Familiar dengan PostgreSQL, Redis, dan Docker. Bonus kalau pernah handle skala tinggi.",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    featured: false,
  },
  {
    id: 6,
    title: "UI/UX Designer — Product",
    company: "Buildspace ID",
    category: "Design",
    type: "Freelance",
    location: "Remote",
    salary: "Rp 3–6 juta/proyek",
    posted: "2 minggu lalu",
    desc: "Desain flow dan komponen untuk platform komunitas developer. Kamu harus familiar dengan Figma, punya sense untuk interaction design, dan bisa deliver cepat.",
    tags: ["Figma", "Design System", "UX"],
    featured: false,
  },
  {
    id: 7,
    title: "Growth Marketer — SaaS",
    company: "SanPoi Store",
    category: "Marketing",
    type: "Part-time",
    location: "Remote",
    salary: "Rp 5–8 juta/bulan",
    posted: "2 minggu lalu",
    desc: "Drive acquisition untuk platform gaming commerce kami. Fokus di SEO, content, dan paid social. Bonus kalau ngerti niche gaming Indonesia.",
    tags: ["SEO", "Growth", "Gaming"],
    featured: false,
  },
];

const TYPE_COLORS = {
  "Full-time": { bg: "#edfaf4", border: "#a3e4c6", color: "#1a6b48" },
  "Part-time": { bg: "#f0f4ff", border: "#b8c9f5", color: "#2d4fa0" },
  Freelance: { bg: "#fff8ec", border: "#f5d68a", color: "#8a5c00" },
  "Co-founder": { bg: "#fdf0ff", border: "#e0b8f5", color: "#6b1a8a" },
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeType, setActiveType] = useState("Semua Tipe");

  const filtered = JOBS.filter((j) => {
    const catMatch =
      activeCategory === "Semua" || j.category === activeCategory;
    const typeMatch = activeType === "Semua Tipe" || j.type === activeType;
    return catMatch && typeMatch;
  });

  const featured = JOBS.filter((j) => j.featured);

  return (
    <div style={{ padding: "0 0 60px" }}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="perks-hero-panel" style={{ marginBottom: "36px" }}>
        <div className="perks-hero-copy">
          <span className="perks-hero-eyebrow">Job Portal</span>
          <h2>Karir di ekosistem builder Indonesia</h2>
          <p>
            Lowongan dari startup, indie hacker, dan produk digital lokal. Dari
            full-time sampai co-founder, remote sampai hybrid.
          </p>
          <div className="hero-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="cta-button"
              style={{ fontSize: 14, height: 38 }}
            >
              Post lowongan
            </button>
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: 14, height: 38 }}
            >
              Buat profil kandidat
            </button>
          </div>
        </div>
      </section>

      <div style={{ padding: "0 24px" }}>
        {/* ── Featured jobs ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#7b8594",
              letterSpacing: "0.07em",
              margin: "0 0 16px",
            }}
          >
            Unggulan
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {featured.map((job) => (
              <FeaturedJobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        {/* ── Sidebar + list ────────────────────────────────────────────── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 28 }}
        >
          {/* Sidebar */}
          <aside
            className="apps-left-sidebar"
            style={{ alignSelf: "start", position: "sticky", top: 20 }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#7b8594",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                margin: "0 0 8px",
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
                fontSize: 11,
                fontWeight: 700,
                color: "#7b8594",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}
            >
              Tipe kerja
            </p>
            <div className="tags-list">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`mini-tag-btn${activeType === type ? " active" : ""}`}
                  onClick={() => setActiveType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </aside>

          {/* Job list */}
          <main>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#7b8594",
                margin: "0 0 16px",
              }}
            >
              {filtered.length} lowongan ditemukan
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map((job) => (
                <JobListCard key={job.id} job={job} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Job Card ─────────────────────────────────────────────────────

function FeaturedJobCard({ job }) {
  const typeStyle = TYPE_COLORS[job.type] || TYPE_COLORS["Full-time"];

  return (
    <article
      className="library-card"
      style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
    >
      {/* Hero placeholder */}
      <div className="library-card-hero">
        <div
          className="library-card-screenshot-wrap"
          style={{
            background: "#f0ede6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="library-card-placeholder" aria-hidden="true">
            <span className="placeholder-label">{job.company}</span>
          </div>
        </div>
        <span
          className="library-card-chip"
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontSize: 11,
            padding: "2px 8px",
            background: typeStyle.bg,
            borderColor: typeStyle.border,
            color: typeStyle.color,
          }}
        >
          {job.type}
        </span>
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
          {job.category}
        </span>
      </div>

      {/* Ribbon */}
      <div className="library-card-ribbon">
        <strong>{job.title}</strong>
        <span>{job.company}</span>
      </div>

      {/* Meta */}
      <div
        className="library-card-meta"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "10px 12px 12px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0d1d38" }}>
            {job.salary}
          </span>
          <span style={{ fontSize: 12, color: "#7b8594" }}>{job.location}</span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: "#55606d",
            margin: "0 0 10px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {job.desc}
        </p>
        <div
          style={{
            display: "flex",
            gap: 5,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="library-card-chip"
              style={{ fontSize: 10, padding: "2px 7px" }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div style={{ marginTop: "auto" }}>
          <button
            type="button"
            className="cta-button"
            style={{ width: "100%", fontSize: 13, height: 34 }}
          >
            Lamar sekarang
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Job List Card ─────────────────────────────────────────────────────────

function JobListCard({ job }) {
  const typeStyle = TYPE_COLORS[job.type] || TYPE_COLORS["Full-time"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        padding: "16px",
        border: "1px solid #d9d1c2",
        borderBottomWidth: 2,
        borderRadius: 10,
        background: "#fffdf8",
        cursor: "pointer",
        boxShadow:
          "inset 0 -3px 0 rgba(21,19,16,.09), 0 1px 3px rgba(21,19,16,.07)",
        transition: "transform 260ms cubic-bezier(.22,1,.36,1)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(2px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
    >
      {/* Company avatar */}
      <div
        style={{
          minWidth: 44,
          height: 44,
          borderRadius: 10,
          background: "#f5ecd9",
          border: "1px solid #d9d1c2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 800,
          color: "#0d1d38",
          flexShrink: 0,
        }}
      >
        {job.company[0]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: typeStyle.bg,
              border: `1px solid ${typeStyle.border}`,
              color: typeStyle.color,
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            {job.type}
          </span>
          <span
            className="library-card-chip"
            style={{ fontSize: 10, padding: "2px 7px" }}
          >
            {job.category}
          </span>
          <span style={{ fontSize: 11, color: "#7b8594" }}>
            {job.location} · {job.posted}
          </span>
        </div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#0d1d38",
            margin: "0 0 2px",
            letterSpacing: "-0.02em",
          }}
        >
          {job.title}
        </p>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#55606d",
            margin: "0 0 6px",
          }}
        >
          {job.company} · {job.salary}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "#55606d",
            margin: "0 0 8px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {job.desc}
        </p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="library-card-chip"
              style={{ fontSize: 10, padding: "2px 7px" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ alignSelf: "center", flexShrink: 0 }}>
        <button
          type="button"
          className="cta-button"
          style={{ fontSize: 12, height: 32, padding: "0 14px" }}
        >
          Lamar
        </button>
      </div>
    </div>
  );
}
