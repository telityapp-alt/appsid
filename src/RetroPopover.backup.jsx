import React, { useEffect, useState, useRef } from "react";

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

export default function RetroPopover({ app, onClose }) {
  const [gallerySlide, setGallerySlide] = useState(0);
  const [strategySlide, setStrategySlide] = useState(0);
  const autoRef = useRef(null);

  useEffect(() => {
    setGallerySlide(0);
    setStrategySlide(0);
  }, [app]);

  useEffect(() => {
    if (!app) return;
    const imgs = (app.gallery ?? [app.image]).filter(Boolean);
    if (imgs.length <= 1) return;
    autoRef.current = setInterval(
      () => setGallerySlide((s) => (s + 1) % imgs.length),
      3500,
    );
    return () => clearInterval(autoRef.current);
  }, [app]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!app) return null;

  const gallery = (app.gallery ?? [app.image]).filter(Boolean);
  const strategy = app.strategy ?? [];
  const stats = app.stats ?? [];
  const highlights = app.highlights ?? [];
  const userJourney = app.userJourney ?? [];
  const richContent = app.richContent ?? null;
  const currentPhase = strategy[strategySlide];

  function prevG() {
    clearInterval(autoRef.current);
    setGallerySlide((s) => (s - 1 + gallery.length) % gallery.length);
  }
  function nextG() {
    clearInterval(autoRef.current);
    setGallerySlide((s) => (s + 1) % gallery.length);
  }

  return (
    <div className="retro-backdrop" onClick={onClose}>
      <div
        className="retro-window pop-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="retro-titlebar">
          <div className="retro-titlebar-left">
            <div className="pop-dots">
              <button
                className="pop-dot pop-dot-close"
                onClick={onClose}
                aria-label="Tutup"
              />
              <button className="pop-dot pop-dot-min" aria-label="Minimise" />
              <button className="pop-dot pop-dot-max" aria-label="Maximise" />
            </div>
          </div>
          <div className="retro-titlebar-center pop-tb-center">
            <span className="pop-tb-brand">Apphunt</span>
            <span className="pop-tb-sep">—</span>
            <span className="pop-tb-name">{app.name}</span>
          </div>
          <div className="retro-titlebar-right">
            <button
              className="pop-close-x"
              onClick={onClose}
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

        {/* Full-width scroll */}
        <div className="pop-scroll">
          {/* ── 1. GALLERY HERO ── */}
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
              <div className="pop-gallery-overlay">
                <span className="pop-label-pill">{app.role}</span>
                {gallery.length > 1 && (
                  <span className="pop-gallery-counter">
                    {gallerySlide + 1} / {gallery.length}
                  </span>
                )}
              </div>
            </div>
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

          {/* ── 2. PROJECT HEADER ── */}
          <div className="pop-content">
            <header className="pop-project-header">
              <div className="pop-project-meta">
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
                <div className="pop-project-meta-info">
                  <h2 className="pop-project-name">{app.name}</h2>
                  <div className="pop-project-chips">
                    <span className="pop-label-pill">{app.role}</span>
                    {app.team && (
                      <span className="pop-label-pill">{app.team}</span>
                    )}
                  </div>
                </div>
              </div>

              {stats.length > 0 && (
                <div className="pop-stats-row">
                  {stats.map((s) => (
                    <div key={s.label} className="pop-stat">
                      <span className="pop-stat-val">{s.value}</span>
                      <span className="pop-stat-lbl">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </header>

            {/* ── 3. OVERVIEW ── */}
            {app.overview && (
              <section className="pop-section">
                <span className="pop-label-pill">Tentang proyek ini</span>
                <p className="pop-overview">{app.overview}</p>
              </section>
            )}

            {/* ── 4. HIGHLIGHTS ── */}
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

            {/* ── 5. METHODOLOGY ── */}
            {strategy.length > 0 && (
              <section className="pop-section">
                <div className="pop-carousel-hd">
                  <span className="pop-label-pill">Metodologi</span>
                  <div className="pop-carousel-nav">
                    <button
                      className="sc-nav-btn"
                      onClick={() =>
                        setStrategySlide((s) => Math.max(s - 1, 0))
                      }
                      disabled={strategySlide === 0}
                      aria-label="Sebelumnya"
                    >
                      <ChevLeft />
                    </button>
                    <span className="pop-counter">
                      {strategySlide + 1} / {strategy.length}
                    </span>
                    <button
                      className="sc-nav-btn"
                      onClick={() =>
                        setStrategySlide((s) =>
                          Math.min(s + 1, strategy.length - 1),
                        )
                      }
                      disabled={strategySlide === strategy.length - 1}
                      aria-label="Selanjutnya"
                    >
                      <ChevRight />
                    </button>
                  </div>
                </div>

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

                {currentPhase && (
                  <div className="pop-phase-card" key={strategySlide}>
                    <div className="pop-phase-hd">
                      <span className="pop-phase-num">
                        0{strategySlide + 1}
                      </span>
                      <h3 className="pop-phase-title">{currentPhase.phase}</h3>
                    </div>
                    <p className="pop-phase-desc">{currentPhase.desc}</p>
                    <div className="pop-phase-img-slot">
                      {currentPhase.image ? (
                        currentPhase.image.endsWith('.html') ? (
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

            {/* ── 6. USER JOURNEY ── */}
            {userJourney.length > 0 && (
              <section className="pop-section">
                <span className="pop-label-pill">User journey</span>
                <div className="pop-journey">
                  {userJourney.map((step, i) => (
                    <div key={step.step} className="pop-journey-step">
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

            {/* ── 7. DYNAMIC RICH CONTENT ── */}
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

            {/* ── 8. CTA FOOTER ── */}
            <footer className="pop-cta-footer">
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
