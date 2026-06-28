import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { useUpvote } from "./hooks/useUpvote";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────

function IcoChevLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

function IcoChevRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

function IcoTriangle({ filled = false }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M6 1l5 9H1z"
        fill={filled ? "#f6a61e" : "none"}
        stroke={filled ? "#c7820e" : "currentColor"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcoExternal() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8" />
      <path d="M8 1h4v4" />
      <path d="M12 1L6 7" />
    </svg>
  );
}

function IcoShare() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11.5" cy="2.5" r="1.5" />
      <circle cx="11.5" cy="12.5" r="1.5" />
      <circle cx="3.5" cy="7.5" r="1.5" />
      <path d="M5 7.5h4.5M9.5 3.5L5.5 6.5M9.5 11.5L5.5 8.5" />
    </svg>
  );
}

function IcoBookmark() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M2 1h9v11l-4.5-3L2 12V1z" />
    </svg>
  );
}

function IcoX() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M7.65 5.52L12.1 0h-1.06L7.17 4.82 4.08 0H.5l4.67 6.79L.5 13h1.06l4.08-4.97L8.92 13H12.5L7.65 5.52zm-1.44 1.76l-.47-.68L1.94.88h1.62l3.03 4.33.47.68 3.94 5.63h-1.62L6.21 7.28z" />
    </svg>
  );
}

function IcoInstagram() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <rect x="1" y="1" width="11" height="11" rx="3" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="9.8" cy="3.2" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffMon = Math.floor(diffDay / 30);
  const diffYr = Math.floor(diffDay / 365);
  if (diffSec < 60) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  if (diffDay < 30) return `${diffDay} hari lalu`;
  if (diffMon < 12) return `${diffMon} bulan lalu`;
  return `${diffYr} tahun lalu`;
}

function isLaunchingToday(launch_date) {
  if (!launch_date) return false;
  const wibNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
  const wibLaunch = new Date(
    new Date(launch_date).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
  return (
    wibNow.getFullYear() === wibLaunch.getFullYear() &&
    wibNow.getMonth() === wibLaunch.getMonth() &&
    wibNow.getDate() === wibLaunch.getDate()
  );
}

function StarRating({ rating = 0, count = 0 }) {
  const stars = [1, 2, 3, 4, 5];
  const gradId = `star-grad-${Math.round(rating * 10)}`;
  const fraction = rating % 1;
  return (
    <div
      className="ph-star-row"
      style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset={`${fraction * 100}%`} stopColor="#f6a61e" />
            <stop offset={`${fraction * 100}%`} stopColor="#d9d1c2" />
          </linearGradient>
        </defs>
      </svg>
      {stars.map((s) => {
        const filled = s <= Math.floor(rating);
        const half = !filled && s === Math.ceil(rating) && fraction > 0;
        return (
          <svg
            key={s}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={`ph-star${filled ? " filled" : half ? " half" : ""}`}
          >
            <polygon
              points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.5 2.7,10.5 3.5,7 1,4.8 4.5,4.5"
              fill={filled ? "#f6a61e" : half ? `url(#${gradId})` : "#d9d1c2"}
              stroke="none"
            />
          </svg>
        );
      })}
      {count > 0 && (
        <span
          className="ph-star-count"
          style={{ fontSize: 12, color: "#7b8594", marginLeft: 2 }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function Avatar({ src, name, size = 32 }) {
  const [err, setErr] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        className="ph-pop-avatar"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      className="ph-pop-avatar-fallback"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: "#e8e3d9",
        color: "#7b6f5a",
        fontSize: size * 0.38,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {initials}
    </div>
  );
}

// ── normalizeApp ──────────────────────────────────────────────────────────────

function normalizeApp(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? null,
    slug: raw.slug ?? raw.id ?? "",
    name: raw.name ?? "App",
    tagline: raw.tagline ?? raw.short_description ?? "",
    description: raw.description ?? raw.tagline ?? "",
    website_url: raw.website_url ?? raw.website ?? null,
    logo_url: raw.logo_url ?? raw.image ?? null,
    gallery_images: Array.isArray(raw.gallery_images)
      ? raw.gallery_images
      : Array.isArray(raw.gallery)
        ? raw.gallery
        : [],
    launch_tags: Array.isArray(raw.launch_tags)
      ? raw.launch_tags
      : raw.role
        ? [raw.role]
        : raw.category
          ? [raw.category]
          : [],
    is_open_source: raw.is_open_source ?? false,
    pricing_type: raw.pricing_type ?? null,
    twitter_handle: raw.twitter_handle ?? null,
    instagram_handle: raw.instagram_handle ?? null,
    upvotes_count: raw.upvotes_count ?? raw.upvotes ?? 0,
    reviews_count: raw.reviews_count ?? 0,
    launch_date: raw.launch_date ?? raw.created_at ?? null,
    created_at: raw.created_at ?? null,
    app_makers: Array.isArray(raw.app_makers)
      ? raw.app_makers
      : Array.isArray(raw.team)
        ? raw.team.map((m) => ({
            name: m.name ?? "Anggota Tim",
            avatar_url: m.avatar ?? m.avatar_url ?? null,
            role: m.role ?? "",
            website_url: m.website_url ?? null,
            twitter_handle: m.twitter_handle ?? null,
          }))
        : [],
    app_comments: Array.isArray(raw.app_comments) ? raw.app_comments : [],
    built_with: Array.isArray(raw.built_with) ? raw.built_with : [],
    first_comment: raw.first_comment ?? null,
    status: raw.status ?? "live",
  };
}

// ── pricingBadge ──────────────────────────────────────────────────────────────

function pricingBadge(pricing_type) {
  const map = {
    free: {
      label: "Gratis",
      bg: "#e8f5e9",
      color: "#2e7d32",
      border: "#a5d6a7",
    },
    paid: {
      label: "Berbayar",
      bg: "#e3f2fd",
      color: "#1565c0",
      border: "#90caf9",
    },
    freemium: {
      label: "Freemium",
      bg: "#f3e5f5",
      color: "#6a1b9a",
      border: "#ce93d8",
    },
    free_options: {
      label: "Ada versi gratis",
      bg: "#e0f2f1",
      color: "#00695c",
      border: "#80cbc4",
    },
  };
  return map[pricing_type] ?? null;
}

// ── Style constants ───────────────────────────────────────────────────────────

const S = {
  tbUpvote: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    height: 26,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid #d9d1c2",
    background: "linear-gradient(180deg,#fff 0%,#f5f2ec 100%)",
    boxShadow: "inset 0 -1px 0 rgba(196,138,40,0.14)",
    color: "#374352",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 150ms ease, box-shadow 150ms ease",
    flexShrink: 0,
  },
  tbUpvoteActive: {
    background: "#f6a61e",
    borderColor: "#c7820e",
    boxShadow: "inset 0 -2px 0 #cf860d",
    color: "#111",
  },
};

// ── Main Component ────────────────────────────────────────────────────────

export default function RetroPopover({
  app: rawApp,
  onClose,
  onUpvote = null,
}) {
  const app = normalizeApp(rawApp);
  if (!app) return null;

  const { upvotes, upvoted, loading, toggle } = useUpvote(
    app?.id,
    app?.upvotes_count,
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [gallerySlide, setGallerySlide] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const autoRef = useRef(null);
  const hoverRef = useRef(false);

  // Reset state when app changes
  useEffect(() => {
    setGallerySlide(0);
    setActiveTab("overview");
    setShowFullDesc(false);
  }, [app.id]);

  // Scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // onUpvote callback
  useEffect(() => {
    if (upvoted && onUpvote) onUpvote(rawApp);
  }, [upvoted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Gallery data
  const gallery = (
    app.gallery_images?.length
      ? app.gallery_images
      : app.logo_url
        ? [app.logo_url]
        : []
  ).filter(Boolean);

  // Gallery auto-advance
  useEffect(() => {
    if (gallery.length <= 1) return;
    autoRef.current = setInterval(() => {
      setGallerySlide((s) => (s + 1) % gallery.length);
    }, 3500);
    return () => clearInterval(autoRef.current);
  }, [gallery.length]);

  const prevG = useCallback(() => {
    clearInterval(autoRef.current);
    setGallerySlide((s) => (s - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const nextG = useCallback(() => {
    clearInterval(autoRef.current);
    setGallerySlide((s) => (s + 1) % gallery.length);
  }, [gallery.length]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  return (
    <div className="retro-backdrop" onClick={handleClose}>
      <div
        className="retro-window pop-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TITLE BAR ──────────────────────────────────────────── */}
        <div className="retro-titlebar">
          <div className="retro-titlebar-left">
            <div className="pop-dots">
              <button
                className="pop-dot pop-dot-close"
                onClick={handleClose}
                aria-label="Tutup"
              />
              <button className="pop-dot pop-dot-min" aria-label="Minimise" />
              <button className="pop-dot pop-dot-max" aria-label="Maximise" />
            </div>
          </div>
          <div className="retro-titlebar-center pop-tb-center">
            <span className="pop-tb-brand">AppVerse</span>
            <span className="pop-tb-sep">—</span>
            <span className="pop-tb-name">{app.name}</span>
          </div>
          <div
            className="retro-titlebar-right"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {/* upvote button in titlebar — wired to useUpvote hook */}
            <button
              style={{ ...S.tbUpvote, ...(upvoted ? S.tbUpvoteActive : {}) }}
              onClick={toggle}
              aria-label={`Upvote ${app.name}`}
              aria-pressed={upvoted}
            >
              <IcoTriangle filled={upvoted} />
              {upvotes}
            </button>
            <button
              className="pop-close-x"
              onClick={handleClose}
              aria-label="Tutup"
            >
              <svg
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ width: 13, height: 13 }}
              >
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>
        {/* ── SCROLLABLE BODY ───────────────────────────────────────────── */}
        <div className="pop-scroll">
          <div className="ph-pop-layout">
            {/* LEFT COLUMN */}
            <div className="ph-pop-main">
              {/* SECTION A — Hero Header */}
              <div className="ph-pop-hero">
                <div className="ph-pop-logo-wrap">
                  {app.logo_url ? (
                    <img
                      src={app.logo_url}
                      alt={app.name}
                      className="ph-pop-logo"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="ph-pop-logo-fallback"
                    style={{ display: app.logo_url ? "none" : "flex" }}
                  >
                    {app.name?.charAt(0)}
                  </div>
                </div>
                <div className="ph-pop-hero-body">
                  <div className="ph-pop-hero-top">
                    <h1 className="ph-pop-app-name">{app.name}</h1>
                    {isLaunchingToday(app.launch_date) && (
                      <span className="ph-pop-today-badge">
                        🚀 Launching Today
                      </span>
                    )}
                    {app.website_url && (
                      <a
                        href={app.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ph-pop-website-link"
                        aria-label="Buka website"
                      >
                        <IcoExternal />
                      </a>
                    )}
                  </div>
                  <p className="ph-pop-tagline">{app.tagline}</p>
                  <div className="ph-pop-meta-row">
                    <StarRating
                      rating={app.rating ?? 0}
                      count={app.reviews_count}
                    />
                    {app.upvotes_count > 0 && (
                      <span className="ph-pop-meta-item">
                        <IcoTriangle filled /> {app.upvotes_count} upvote
                      </span>
                    )}
                    {app.status && (
                      <span className="ph-pop-status-chip">{app.status}</span>
                    )}
                  </div>
                  <div className="ph-pop-hero-actions">
                    {app.website_url && (
                      <a
                        href={app.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ph-pop-cta-btn"
                      >
                        Kunjungi Website <IcoExternal />
                      </a>
                    )}
                    <button
                      className={`ph-pop-follow-btn${followed ? " active" : ""}`}
                      onClick={() => setFollowed((f) => !f)}
                    >
                      {followed ? "Mengikuti ✓" : "Ikuti"}
                    </button>
                  </div>
                  {app.launch_tags.length > 0 && (
                    <div className="ph-pop-tags-row">
                      {app.launch_tags.map((t) => (
                        <span key={t} className="ph-pop-tag-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION B — Description */}
              <div className="ph-pop-desc">
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: showFullDesc ? "2000px" : "4.5em",
                    transition: "max-height 300ms ease",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#374352",
                      lineHeight: 1.65,
                      ...(showFullDesc
                        ? {}
                        : {
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }),
                    }}
                  >
                    {app.description || app.tagline}
                  </p>
                </div>
                {(app.description || app.tagline || "").length > 200 && (
                  <button
                    onClick={() => setShowFullDesc((v) => !v)}
                    style={{
                      fontSize: 13,
                      color: "#f6a61e",
                      fontWeight: 700,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 0",
                    }}
                  >
                    {showFullDesc ? "tutup ↑" : "lihat selengkapnya ↓"}
                  </button>
                )}
              </div>

              {/* SECTION C — Nav Tabs */}
              <nav className="ph-pop-tabs" role="tablist">
                {[
                  { label: "Overview", value: "overview" },
                  { label: `Ulasan (${app.reviews_count})`, value: "ulasan" },
                  { label: "Forum", value: "forum" },
                  { label: "Tim", value: "tim" },
                  { label: "Lainnya", value: "lainnya" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    role="tab"
                    aria-selected={activeTab === tab.value}
                    tabIndex={activeTab === tab.value ? 0 : -1}
                    className={
                      "ph-pop-tab" + (activeTab === tab.value ? " active" : "")
                    }
                    onClick={() => {
                      setTabVisible(false);
                      setTimeout(() => {
                        setActiveTab(tab.value);
                        setTabVisible(true);
                      }, 100);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* TAB PANELS */}
              <div
                className="ph-pop-tab-panel"
                style={{
                  opacity: tabVisible ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
              >
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div>
                    {gallery.length > 0 && (
                      <div
                        className="ph-pop-gallery"
                        onMouseEnter={() => {
                          hoverRef.current = true;
                          clearInterval(autoRef.current);
                        }}
                        onMouseLeave={() => {
                          hoverRef.current = false;
                          if (gallery.length > 1) {
                            autoRef.current = setInterval(
                              () =>
                                setGallerySlide(
                                  (s) => (s + 1) % gallery.length,
                                ),
                              3500,
                            );
                          }
                        }}
                      >
                        <div className="ph-pop-gallery-main">
                          <img
                            key={gallerySlide}
                            src={gallery[gallerySlide]}
                            alt={`Tampilan ${gallerySlide + 1}`}
                            className="ph-pop-gallery-img"
                          />
                          {gallery.length > 1 && (
                            <>
                              <button
                                className="ph-pop-gallery-arrow left"
                                onClick={prevG}
                                aria-label="Sebelumnya"
                              >
                                <IcoChevLeft />
                              </button>
                              <button
                                className="ph-pop-gallery-arrow right"
                                onClick={nextG}
                                aria-label="Selanjutnya"
                              >
                                <IcoChevRight />
                              </button>
                              <span className="ph-pop-gallery-counter">
                                {gallerySlide + 1} / {gallery.length}
                              </span>
                            </>
                          )}
                        </div>
                        {gallery.length > 1 && (
                          <div className="ph-pop-gallery-dots">
                            {gallery.map((_, i) => (
                              <button
                                key={i}
                                className={
                                  "ph-pop-gallery-dot" +
                                  (i === gallerySlide ? " active" : "")
                                }
                                onClick={() => {
                                  clearInterval(autoRef.current);
                                  setGallerySlide(i);
                                }}
                                aria-label={`Gambar ${i + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="ph-pop-pricing-row">
                      {(() => {
                        const b = pricingBadge(app.pricing_type);
                        return b ? (
                          <span
                            className="ph-pop-pricing-badge"
                            style={{
                              background: b.bg,
                              color: b.color,
                              border: `1px solid ${b.border}`,
                            }}
                          >
                            {b.label}
                          </span>
                        ) : null;
                      })()}
                      {app.launch_tags.map((t) => (
                        <span key={t} className="ph-pop-tag-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ULASAN TAB */}
                {activeTab === "ulasan" && (
                  <div className="ph-pop-reviews-empty">
                    <p
                      style={{
                        color: "#7b8594",
                        fontSize: 14,
                        textAlign: "center",
                        padding: "32px 0",
                      }}
                    >
                      {app.reviews_count > 0
                        ? `${app.reviews_count} ulasan tersedia.`
                        : "Belum ada ulasan."}
                    </p>
                  </div>
                )}

                {/* FORUM TAB */}
                {activeTab === "forum" && (
                  <div className="ph-pop-comments">
                    {app.first_comment && (
                      <div className="ph-pop-comment">
                        <Avatar
                          src={app.first_comment.avatar_url}
                          name={app.first_comment.author}
                          size={36}
                        />
                        <div className="ph-pop-comment-body">
                          <div className="ph-pop-comment-meta">
                            <strong>{app.first_comment.author}</strong>
                            <span className="ph-pop-comment-time">
                              {timeAgo(app.first_comment.created_at)}
                            </span>
                          </div>
                          <p className="ph-pop-comment-text">
                            {app.first_comment.body}
                          </p>
                        </div>
                      </div>
                    )}
                    {app.app_comments.map((c, i) => (
                      <div key={c.id ?? i} className="ph-pop-comment">
                        <Avatar src={c.avatar_url} name={c.author} size={36} />
                        <div className="ph-pop-comment-body">
                          <div className="ph-pop-comment-meta">
                            <strong>{c.author}</strong>
                            <span className="ph-pop-comment-time">
                              {timeAgo(c.created_at)}
                            </span>
                          </div>
                          <p className="ph-pop-comment-text">{c.body}</p>
                        </div>
                      </div>
                    ))}
                    {!app.first_comment && app.app_comments.length === 0 && (
                      <p
                        style={{
                          color: "#7b8594",
                          fontSize: 14,
                          textAlign: "center",
                          padding: "32px 0",
                        }}
                      >
                        Belum ada diskusi.
                      </p>
                    )}
                    <a
                      href={`/forum?app=${app.slug}`}
                      className="ph-pop-forum-link"
                    >
                      Lihat semua diskusi →
                    </a>
                  </div>
                )}

                {/* TIM TAB */}
                {activeTab === "tim" && (
                  <div>
                    {app.app_makers.length > 0 && (
                      <div className="ph-pop-team-grid">
                        {app.app_makers.map((m, i) => (
                          <div key={m.name ?? i} className="ph-pop-maker-card">
                            <Avatar
                              src={m.avatar_url}
                              name={m.name}
                              size={48}
                            />
                            <div className="ph-pop-maker-info">
                              <strong className="ph-pop-maker-name">
                                {m.name}
                              </strong>
                              {m.role && (
                                <span className="ph-pop-maker-role">
                                  {m.role}
                                </span>
                              )}
                              <div className="ph-pop-maker-links">
                                {m.website_url && (
                                  <a
                                    href={m.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ph-pop-maker-link"
                                  >
                                    <IcoExternal />
                                  </a>
                                )}
                                {m.twitter_handle && (
                                  <a
                                    href={`https://twitter.com/${m.twitter_handle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ph-pop-maker-link"
                                  >
                                    <IcoX />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {app.built_with.length > 0 && (
                      <div className="ph-pop-built-with">
                        <span className="ph-pop-sidebar-eyebrow">
                          DIBANGUN DENGAN
                        </span>
                        <div className="ph-pop-built-chips">
                          {app.built_with.map((t) => (
                            <span key={t} className="ph-pop-built-chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {app.app_makers.length === 0 &&
                      app.built_with.length === 0 && (
                        <p
                          style={{
                            color: "#7b8594",
                            fontSize: 14,
                            textAlign: "center",
                            padding: "32px 0",
                          }}
                        >
                          Informasi tim belum tersedia.
                        </p>
                      )}
                  </div>
                )}

                {/* LAINNYA TAB */}
                {activeTab === "lainnya" && (
                  <div className="ph-pop-lainnya">
                    {app.is_open_source && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "4px 10px",
                          borderRadius: 6,
                          background: "#e8f5e9",
                          color: "#2e7d32",
                          border: "1px solid #a5d6a7",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Open Source
                      </span>
                    )}
                    {pricingBadge(app.pricing_type) &&
                      (() => {
                        const b = pricingBadge(app.pricing_type);
                        return (
                          <div style={{ marginTop: 12 }}>
                            <span className="ph-pop-sidebar-eyebrow">
                              HARGA
                            </span>
                            <span
                              className="ph-pop-pricing-badge"
                              style={{
                                background: b.bg,
                                color: b.color,
                                border: `1px solid ${b.border}`,
                                display: "inline-flex",
                                marginLeft: 8,
                              }}
                            >
                              {b.label}
                            </span>
                          </div>
                        );
                      })()}
                  </div>
                )}
              </div>
              {/* /tab-panel */}
            </div>
            {/* /ph-pop-main */}

            {/* RIGHT COLUMN — SIDEBAR */}
            <aside className="ph-pop-sidebar">
              {/* Upvote block */}
              <div className="ph-pop-upvote-block">
                <button
                  className={"ph-pop-upvote-btn" + (upvoted ? " active" : "")}
                  onClick={toggle}
                  aria-pressed={upvoted}
                  disabled={loading}
                >
                  <IcoTriangle filled={upvoted} />
                  <span className="ph-pop-upvote-count">{upvotes}</span>
                  <span className="ph-pop-upvote-label">Upvote</span>
                </button>
              </div>

              {/* Follow block */}
              <button
                className={"ph-pop-follow-block" + (followed ? " active" : "")}
                onClick={() => setFollowed((f) => !f)}
              >
                {followed ? "Mengikuti ✓" : "Ikuti"}
              </button>

              <div className="ph-pop-sidebar-divider" />

              {/* Save to collection */}
              <button
                className={"ph-pop-sidebar-action" + (saved ? " active" : "")}
                onClick={() => setSaved((s) => !s)}
              >
                <IcoBookmark /> {saved ? "Tersimpan" : "Tambah ke Koleksi"}
              </button>

              {/* Share */}
              <button
                className="ph-pop-sidebar-action"
                onClick={() =>
                  navigator.share?.({
                    title: app.name,
                    url: app.website_url || window.location.href,
                  })
                }
              >
                <IcoShare /> Bagikan
              </button>

              <div className="ph-pop-sidebar-divider" />

              {/* Info Perusahaan */}
              <div className="ph-pop-sidebar-section">
                <span className="ph-pop-sidebar-eyebrow">INFO PERUSAHAAN</span>
                {app.website_url && (
                  <a
                    href={app.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ph-pop-sidebar-row"
                  >
                    <IcoExternal />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {app.website_url
                        .replace(/^https?:\/\//, "")
                        .replace(/\/$/, "")}
                    </span>
                  </a>
                )}
                {app.is_open_source && (
                  <span
                    style={{
                      display: "inline-flex",
                      marginTop: 4,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      border: "1px solid #a5d6a7",
                      fontSize: 12,
                    }}
                  >
                    Open Source
                  </span>
                )}
                {app.twitter_handle && (
                  <div className="ph-pop-sidebar-row">
                    <IcoX /> <span>@{app.twitter_handle}</span>
                  </div>
                )}
              </div>

              {/* Info Peluncuran */}
              <div className="ph-pop-sidebar-section">
                <span className="ph-pop-sidebar-eyebrow">INFO PELUNCURAN</span>
                {(app.launch_date || app.created_at) && (
                  <div className="ph-pop-sidebar-row">
                    Diluncurkan tahun{" "}
                    {new Date(app.launch_date || app.created_at).getFullYear()}
                  </div>
                )}
                <a
                  href={`/forum?app=${app.slug}`}
                  className="ph-pop-sidebar-row ph-pop-forum-link"
                >
                  Lihat di forum →
                </a>
              </div>

              {/* Sosial */}
              {(app.twitter_handle || app.instagram_handle) && (
                <div className="ph-pop-sidebar-section">
                  <span className="ph-pop-sidebar-eyebrow">SOSIAL</span>
                  {app.twitter_handle && (
                    <a
                      href={`https://twitter.com/${app.twitter_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ph-pop-sidebar-row"
                    >
                      <IcoX /> @{app.twitter_handle}
                    </a>
                  )}
                  {app.instagram_handle && (
                    <a
                      href={`https://instagram.com/${app.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ph-pop-sidebar-row"
                    >
                      <IcoInstagram /> {app.instagram_handle}
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
