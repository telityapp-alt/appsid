import React, { useState } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Semua",
  "Workshop",
  "Webinar",
  "Hackathon",
  "Meetup",
  "Conference",
];

const EVENTS = [
  {
    id: 1,
    title: "Vibe Coding Night — Jakarta",
    category: "Meetup",
    date: "12 Jul 2026",
    time: "19:00 WIB",
    location: "Offline · Jakarta Selatan",
    organizer: "AIverse Community",
    desc: "Malam ngoding bareng, demo produk, dan networking dengan sesama indie hacker dan solo founder Jakarta. Bawa laptop, bawa semangat.",
    attendees: 48,
    maxAttendees: 60,
    badge: "Hampir penuh",
    featured: true,
  },
  {
    id: 2,
    title: "Workshop: Launch SaaS MVP dalam 30 Hari",
    category: "Workshop",
    date: "19 Jul 2026",
    time: "10:00 WIB",
    location: "Online · Zoom",
    organizer: "AIverse x Buildspace ID",
    desc: "Step-by-step dari idea validation, landing page, payment integration, sampai ke first paying customer. Praktis dan langsung bisa dieksekusi.",
    attendees: 210,
    maxAttendees: 500,
    badge: null,
    featured: true,
  },
  {
    id: 3,
    title: "AI Hackathon Indonesia 2026",
    category: "Hackathon",
    date: "26–27 Jul 2026",
    time: "08:00 WIB",
    location: "Hybrid · Bandung + Online",
    organizer: "AIverse x Google Developers",
    desc: "48 jam ngebuild produk AI terbaik. Total hadiah Rp 50 juta. Kategori: AI Tools, EdTech, HealthTech, dan Agri-tech.",
    attendees: 320,
    maxAttendees: 400,
    badge: "Hadiah Rp 50jt",
    featured: false,
  },
  {
    id: 4,
    title: "Webinar: Monetisasi Open Source",
    category: "Webinar",
    date: "3 Agu 2026",
    time: "20:00 WIB",
    location: "Online · YouTube Live",
    organizer: "AIverse",
    desc: "Gimana caranya open source project bisa jadi revenue stream? Bahas model sponsorship, SaaS wrapper, dan dual licensing.",
    attendees: 89,
    maxAttendees: null,
    badge: null,
    featured: false,
  },
  {
    id: 5,
    title: "Meetup: Indie Hackers Surabaya",
    category: "Meetup",
    date: "9 Agu 2026",
    time: "18:30 WIB",
    location: "Offline · Surabaya",
    organizer: "Indie Hackers ID",
    desc: "Gathering bulanan untuk founder dan developer Surabaya. Format: 3 lightning talk + open networking. Gratis, tapi daftar dulu.",
    attendees: 22,
    maxAttendees: 40,
    badge: "Baru",
    featured: false,
  },
  {
    id: 6,
    title: "ProductFest ID 2026",
    category: "Conference",
    date: "23 Agu 2026",
    time: "09:00 WIB",
    location: "Offline · Jakarta",
    organizer: "ProductFest x AIverse",
    desc: "Konferensi product management dan startup terbesar di Indonesia. 20+ speaker, 1.000+ peserta, expo produk lokal.",
    attendees: 650,
    maxAttendees: 1000,
    badge: null,
    featured: false,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filtered =
    activeCategory === "Semua"
      ? EVENTS
      : EVENTS.filter((e) => e.category === activeCategory);

  const featured = EVENTS.filter((e) => e.featured);

  return (
    <div style={{ padding: "0 0 60px" }}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="perks-hero-panel" style={{ marginBottom: "36px" }}>
        <div className="perks-hero-copy">
          <span className="perks-hero-eyebrow">AI Events</span>
          <h2>Events untuk builder Indonesia</h2>
          <p>
            Workshop, hackathon, meetup, dan konferensi yang relevan untuk
            developer, founder, dan indie hacker lokal.
          </p>
          <div className="hero-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="cta-button"
              style={{ fontSize: 14, height: 38 }}
            >
              Submit event
            </button>
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: 14, height: 38 }}
            >
              Langganan kalender
            </button>
          </div>
        </div>
      </section>

      <div style={{ padding: "0 24px" }}>
        {/* ── Featured events ───────────────────────────────────────────── */}
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
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 20,
            }}
          >
            {featured.map((event) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* ── Sidebar + grid ────────────────────────────────────────────── */}
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
          </aside>

          {/* Event list */}
          <main>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#7b8594",
                margin: "0 0 16px",
              }}
            >
              {filtered.length} event ditemukan
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map((event) => (
                <EventListCard key={event.id} event={event} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Event Card ───────────────────────────────────────────────────

function FeaturedEventCard({ event }) {
  const pct = event.maxAttendees
    ? Math.round((event.attendees / event.maxAttendees) * 100)
    : null;

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
            <span className="placeholder-label">{event.title}</span>
          </div>
        </div>
        {event.badge && (
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
            {event.badge}
          </span>
        )}
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
          {event.category}
        </span>
      </div>

      {/* Ribbon */}
      <div className="library-card-ribbon">
        <strong>{event.title}</strong>
        <span>{event.organizer}</span>
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
            gap: 12,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0d1d38" }}>
            {event.date}
          </span>
          <span style={{ fontSize: 12, color: "#7b8594" }}>{event.time}</span>
          <span style={{ fontSize: 12, color: "#7b8594" }}>
            {event.location}
          </span>
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
          {event.desc}
        </p>

        {/* Progress meter */}
        {pct !== null && (
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: "#55606d" }}>
                {event.attendees} / {event.maxAttendees} peserta
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f6a61e" }}>
                {pct}%
              </span>
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 999,
                background: "#ede8df",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: pct + "%",
                  background: "#f6a61e",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto" }}>
          <button
            type="button"
            className="cta-button"
            style={{ width: "100%", fontSize: 13, height: 34 }}
          >
            Daftar sekarang
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Event List Card ───────────────────────────────────────────────────────

function EventListCard({ event }) {
  const pct = event.maxAttendees
    ? Math.round((event.attendees / event.maxAttendees) * 100)
    : null;

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
      {/* Date block */}
      <div
        style={{
          minWidth: 52,
          textAlign: "center",
          background: "#f5ecd9",
          border: "1px solid #d9d1c2",
          borderRadius: 8,
          padding: "8px 6px",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#f6a61e",
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          {event.date.split(" ")[1]}
        </p>
        <p
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0d1d38",
            letterSpacing: "-0.04em",
            margin: 0,
            lineHeight: 1,
          }}
        >
          {event.date.split(" ")[0]}
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
            flexWrap: "wrap",
          }}
        >
          <span
            className="library-card-chip"
            style={{ fontSize: 11, padding: "2px 8px" }}
          >
            {event.category}
          </span>
          {event.badge && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#f6a61e",
                background: "rgba(246,166,30,.12)",
                border: "1px solid rgba(246,166,30,.3)",
                borderRadius: 4,
                padding: "2px 7px",
              }}
            >
              {event.badge}
            </span>
          )}
          <span style={{ fontSize: 11, color: "#7b8594" }}>
            {event.time} · {event.location}
          </span>
        </div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#0d1d38",
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          {event.title}
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
          {event.desc}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#7b8594" }}>
            oleh {event.organizer}
          </span>
          {pct !== null && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: pct >= 80 ? "#b45309" : "#55606d",
              }}
            >
              {event.attendees}
              {event.maxAttendees ? `/${event.maxAttendees}` : ""} peserta
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ alignSelf: "center", flexShrink: 0 }}>
        <button
          type="button"
          className="cta-button"
          style={{ fontSize: 12, height: 32, padding: "0 14px" }}
        >
          Daftar
        </button>
      </div>
    </div>
  );
}
