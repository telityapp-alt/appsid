import { useState, useEffect, useRef, useCallback } from "react";

/* ── Icon helpers ─────────────────────────────────────── */
function ChevLeft() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
function ChevRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="icon-inline bullet-icon"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="m5.2 8.1 1.8 1.9 3.8-4" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1 }}
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
function UpvoteIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="currentColor"
      style={{ width: 11, height: 11, flexShrink: 0 }}
    >
      <path d="M7 1L13 9H1L7 1Z" />
    </svg>
  );
}

/* ── Inline style constants ───────────────────────────── */
const S = {
  /* upvote button in titlebar */
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
  /* info row below gallery */
  infoRow: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  appIdentity: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minWidth: 220,
    flex: "1 1 220px",
  },
  appIdentityTop: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  /* status / category badges */
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    height: 22,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid #b7e0c0",
    background: "#edfaf1",
    color: "#2a7a48",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  devBadge: {
    display: "inline-flex",
    alignItems: "center",
    height: 22,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid #d9d1c2",
    background: "#f5f2ec",
    color: "#7b8594",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  categoryBadge: {
    display: "inline-flex",
    alignItems: "center",
    height: 22,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid #d9c8f5",
    background: "#f3eeff",
    color: "#6d3dbc",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  /* section eyebrow label */
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#a09888",
    marginBottom: 12,
    display: "block",
  },
  /* tagline under app name in info row */
  tagline: {
    margin: "2px 0 0",
    fontSize: 14,
    color: "#55606d",
    lineHeight: 1.45,
  },
  /* tags row */
  tagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tagPill: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid #d9d1c2",
    background: "#fffdf8",
    color: "#55606d",
    fontSize: 11,
    fontWeight: 600,
  },
  /* makers chips */
  makersRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  makerChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    height: 26,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid #d9d1c2",
    background: "#fff",
    color: "#374352",
    fontSize: 12,
    fontWeight: 600,
  },
  makerDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    background: "linear-gradient(135deg,#f6a61e,#e07b0a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  /* upvote CTA button in identity block */
  upvoteCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    padding: "0 14px",
    borderRadius: 999,
    border: "1.5px solid #d9d1c2",
    background: "linear-gradient(180deg,#fff 0%,#f5f2ec 100%)",
    boxShadow: "inset 0 -2px 0 rgba(196,138,40,0.18)",
    color: "#374352",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 150ms,box-shadow 150ms,border-color 150ms",
    alignSelf: "flex-start",
  },
  upvoteCtaActive: {
    background: "#f6a61e",
    borderColor: "#c7820e",
    boxShadow: "inset 0 -2px 0 #cf860d",
    color: "#111",
  },
  /* website button */
  websiteBtn: {
    fontSize: 15,
    height: 44,
    padding: "0 28px",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },
};

/* ── Main component ───────────────────────────────────── */
export default function RetroPopover({ app, onClose, onUpvote = null }) {
  const [gallerySlide, setGallerySlide] = useState(0);
  const [strategySlide, setStrategySlide] = useState(0);
  const [localUpvotes, setLocalUpvotes] = useState(0);
  const [upvoted, setUpvoted] = useState(false);
  const autoRef = useRef(null);

  /* reset slide indices whenever the app changes */
  useEffect(() => {
    setGallerySlide(0);
    setStrategySlide(0);
    setUpvoted(false);
    setLocalUpvotes(app?.upvotes ?? 0);
  }, [app]);

  /* scroll lock */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [app]);

  /* auto-advance gallery — 4 s interval, restart when app changes */
  useEffect(() => {
    if (!app) return;
    const imgs = (app.gallery?.length ? app.gallery : [app.image]).filter(
      Boolean,
    );
    if (imgs.length <= 1) return;
    autoRef.current = setInterval(
      () => setGallerySlide((s) => (s + 1) % imgs.length),
      4000,
    );
    return () => clearInterval(autoRef.current);
  }, [app]);

  /* Escape key */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  /* guard */
  if (!app) return null;

  const gallery = (app.gallery?.length ? app.gallery : [app.image]).filter(
    Boolean,
  );
  const strategy = app.strategy ?? [];
  const stats = app.stats ?? [];
  const highlights = app.highlights ?? [];
  const userJourney = app.userJourney ?? [];
  const richContent = app.richContent ?? null;
  const tags = app.tags ?? [];
  const makers = app.makers ?? [];
  const currentPhase = strategy[strategySlide];

  /* gallery nav — clears auto-advance */
  const prevG = useCallback(() => {
    clearInterval(autoRef.current);
    setGallerySlide((s) => (s - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const nextG = useCallback(() => {
    clearInterval(autoRef.current);
    setGallerySlide((s) => (s + 1) % gallery.length);
  }, [gallery.length]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  /* upvote handler */
  function handleUpvote() {
    if (upvoted) return;
    setUpvoted(true);
    setLocalUpvotes((n) => n + 1);
    if (typeof onUpvote === "function") onUpvote(app);
  }

  /* badge style for status */
  function statusStyle(status) {
    if (!status) return S.devBadge;
    const s = status.toLowerCase();
    if (s.includes("live") || s.includes("store")) return S.statusBadge;
    return S.devBadge;
  }

  return (
    <div className="retro-backdrop" onClick={handleClose}>
      <div
        className="retro-window pop-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TITLE BAR ────────────────────────────────── */}
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
            {/* upvote button in titlebar */}
            <button
              style={{
                ...S.tbUpvote,
                ...(upvoted ? S.tbUpvoteActive : {}),
              }}
              onClick={handleUpvote}
              aria-label={`Upvote ${app.name}`}
              aria-pressed={upvoted}
            >
              <UpvoteIcon />
              {localUpvotes}
            </button>

            {/* close X */}
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

        {/* ── SCROLLABLE BODY ───────────────────────────── */}
        <div className="pop-scroll">
          {/* ── 1. GALLERY HERO ───────────────────────── */}
          <div className="pop-gallery">
            <div className="pop-gallery-slide">
              {gallery[gallerySlide] ? (
                <img
                  key={gallerySlide}
                  src={gallery[gallerySlide]}
                  alt={"Tampilan " + (gallerySlide + 1)}
                  className="pop-gallery-img"
                />
              ) : (
                <div className="pop-gallery-empty">
                  <span>{app.name}</span>
                </div>
              )}

              {gallery.length > 1 && (
                <>
                  <button
                    className="pop-gallery-arrow pop-gallery-prev"
                    onClick={prevG}
                    aria-label="Sebelumnya"
                  >
                    <ChevLeft />
                  </button>
                  <button
                    className="pop-gallery-arrow pop-gallery-next"
                    onClick={nextG}
                    aria-label="Selanjutnya"
                  >
                    <ChevRight />
                  </button>
                </>
              )}

              {/* counter pill bottom-left */}
              {gallery.length > 1 && (
                <div className="pop-gallery-overlay">
                  <span className="pop-gallery-counter">
                    {gallerySlide + 1} / {gallery.length}
                  </span>
                </div>
              )}
            </div>

            {/* dot indicators */}
            {gallery.length > 1 && (
              <div className="pop-gallery-dots">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    className={
                      "pop-gallery-dot" + (i === gallerySlide ? " active" : "")
                    }
                    onClick={() => {
                      clearInterval(autoRef.current);
                      setGallerySlide(i);
                    }}
                    aria-label={"Gambar " + (i + 1)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── MAIN CONTENT ──────────────────────────── */}
          <div className="pop-content">
            {/* ── 2. INFO ROW: identity + stats ─────── */}
            <div style={S.infoRow}>
              {/* LEFT: app identity */}
              <div style={S.appIdentity}>
                <div style={S.appIdentityTop}>
                  {/* logo */}
                  <div className="pop-project-logo">
                    <img
                      src={app.image}
                      alt={app.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className="pop-logo-fallback"
                      style={{ display: "none" }}
                    >
                      {app.name?.charAt(0)}
                    </div>
                  </div>

                  {/* name + tagline */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      className="pop-project-name"
                      style={{ marginBottom: 4 }}
                    >
                      {app.name}
                    </h2>
                    {app.tagline && <p style={S.tagline}>{app.tagline}</p>}
                  </div>
                </div>

                {/* badges row */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {app.category && (
                    <span style={S.categoryBadge}>{app.category}</span>
                  )}
                  {app.status && (
                    <span style={statusStyle(app.status)}>{app.status}</span>
                  )}
                </div>

                {/* upvote CTA */}
                <button
                  style={{
                    ...S.upvoteCta,
                    ...(upvoted ? S.upvoteCtaActive : {}),
                  }}
                  onClick={handleUpvote}
                  aria-pressed={upvoted}
                >
                  <UpvoteIcon />
                  {upvoted ? "Divote!" : `▲ ${localUpvotes}`}
                </button>

                {/* tags */}
                {tags.length > 0 && (
                  <div style={S.tagsRow}>
                    {tags.map((t) => (
                      <span key={t} style={S.tagPill}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* makers */}
                {makers.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <span style={S.eyebrow}>Makers</span>
                    <div style={S.makersRow}>
                      {makers.map((m) => (
                        <span key={m} style={S.makerChip}>
                          <span style={S.makerDot}>
                            {m.charAt(0).toUpperCase()}
                          </span>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: stats grid */}
              {stats.length > 0 && (
                <div
                  style={{
                    flex: "1 1 260px",
                    minWidth: 220,
                  }}
                >
                  <span style={S.eyebrow}>Stats</span>
                  <div
                    className="pop-stats-row"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`,
                    }}
                  >
                    {stats.map((s) => (
                      <div key={s.label} className="pop-stat">
                        <span className="pop-stat-val">{s.value}</span>
                        <span className="pop-stat-lbl">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── 3. OVERVIEW ───────────────────────── */}
            {app.overview && (
              <section className="pop-section">
                <span className="pop-label-pill">Tentang proyek ini</span>
                <p className="pop-overview">{app.overview}</p>
              </section>
            )}

            {/* ── 4. HIGHLIGHTS ─────────────────────── */}
            {highlights.length > 0 && (
              <section className="pop-section">
                <span className="pop-label-pill">Mengapa kami</span>
                <div className="pop-highlights-grid">
                  {highlights.map((h) => (
                    <div key={h} className="pop-highlight-card">
                      <CheckIcon />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── 5. HOW WE BUILT IT (Strategy tabs) ── */}
            {strategy.length > 0 && (
              <section className="pop-section">
                <div className="pop-carousel-hd">
                  <span className="pop-label-pill">How We Built It</span>
                </div>

                {/* tab bar */}
                <div className="pop-step-tabs">
                  {strategy.map((ph, i) => (
                    <button
                      key={ph.phase}
                      className={
                        "pop-step-tab" + (i === strategySlide ? " active" : "")
                      }
                      onClick={() => setStrategySlide(i)}
                    >
                      {ph.phase}
                    </button>
                  ))}
                </div>

                {/* content panel */}
                {currentPhase && (
                  <div className="pop-phase-card" key={strategySlide}>
                    <div className="pop-phase-hd">
                      <span className="pop-phase-num">
                        {String(strategySlide + 1).padStart(2, "0")}
                      </span>
                      <h3 className="pop-phase-title">{currentPhase.phase}</h3>
                    </div>
                    <p className="pop-phase-desc">{currentPhase.desc}</p>
                    <div className="pop-phase-img-slot">
                      {currentPhase.image ? (
                        currentPhase.image.endsWith(".html") ? (
                          <iframe
                            src={currentPhase.image}
                            title={currentPhase.phase}
                            className="pop-phase-iframe"
                            frameBorder="0"
                          />
                        ) : (
                          <img
                            src={currentPhase.image}
                            alt={currentPhase.phase}
                            className="pop-phase-img"
                          />
                        )
                      ) : (
                        <div className="pop-phase-img-ph">
                          <span>Screenshot · {currentPhase.phase}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── 6. USER JOURNEY ───────────────────── */}
            {userJourney.length > 0 && (
              <section className="pop-section">
                <span className="pop-label-pill">User Journey</span>
                <div className="pop-journey">
                  {userJourney.map((step, i) => (
                    <div key={step.step ?? i} className="pop-journey-step">
                      <div className="pop-journey-left">
                        <div className="pop-journey-node">
                          <span className="pop-journey-num">{i + 1}</span>
                        </div>
                        {i < userJourney.length - 1 && (
                          <div className="pop-journey-line" />
                        )}
                      </div>
                      <div className="pop-journey-body">
                        <div className="pop-journey-hd">
                          <span className="pop-journey-title">{step.step}</span>
                          {step.tag && (
                            <span className="pop-journey-tag">{step.tag}</span>
                          )}
                        </div>
                        <p className="pop-journey-desc">{step.desc}</p>
                        {step.callout && (
                          <div className="pop-journey-callout">
                            <ArrowIcon />
                            <span>{step.callout}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── 7. RICH CONTENT BLOCKS ────────────── */}
            {richContent && (
              <section className="pop-section">
                {richContent.title && (
                  <span className="pop-label-pill">{richContent.title}</span>
                )}
                <div className="pop-rich-body">
                  {(richContent.blocks ?? []).map((block, i) => {
                    if (block.type === "text")
                      return (
                        <p key={i} className="pop-rich-text">
                          {block.content}
                        </p>
                      );
                    if (block.type === "list")
                      return (
                        <ul key={i} className="pop-rich-list">
                          {block.items.map((item, j) => (
                            <li key={j}>
                              <span className="pop-rich-bullet" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    if (block.type === "callout")
                      return (
                        <div key={i} className="pop-rich-callout">
                          <ArrowIcon />
                          <span>{block.content}</span>
                        </div>
                      );
                    if (block.type === "kv")
                      return (
                        <div key={i} className="pop-rich-kv">
                          {block.rows.map((row, j) => (
                            <div key={j} className="pop-rich-kv-row">
                              <span className="pop-rich-kv-lbl">
                                {row.label}
                              </span>
                              <span className="pop-rich-kv-val">
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    return null;
                  })}
                </div>
              </section>
            )}

            {/* ── 8. CTA FOOTER ─────────────────────── */}
            <footer className="pop-cta-footer">
              {app.website && (
                <a
                  href={app.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-button"
                  style={S.websiteBtn}
                >
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: 13, height: 13, flexShrink: 0 }}
                  >
                    <circle cx="7" cy="7" r="6" />
                    <path d="M7 1c-1.5 2-2.5 3.7-2.5 6s1 4 2.5 6" />
                    <path d="M7 1c1.5 2 2.5 3.7 2.5 6s-1 4-2.5 6" />
                    <path d="M1 7h12" />
                  </svg>
                  Kunjungi Website
                </a>
              )}
              <button
                className="cta-button"
                style={{ fontSize: 15, height: 44, padding: "0 28px" }}
              >
                Minta proposal gratis
              </button>
              <button
                className="ghost-button"
                style={{ fontSize: 15, height: 44, padding: "0 28px" }}
              >
                Lihat portofolio lain
              </button>
            </footer>
          </div>
          {/* /pop-content */}
        </div>
        {/* /pop-scroll */}
      </div>
    </div>
  );
}
