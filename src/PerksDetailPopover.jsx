import { useEffect } from "react";

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="icon-inline perks-spark-icon"
    >
      <path d="M8 1.8 9.4 6.6l4.8 1.4-4.8 1.4L8 14.2 6.6 9.4 1.8 8l4.8-1.4z" />
    </svg>
  );
}

function ArrowRight() {
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

function ArticleBlock({ block }) {
  switch (block.type) {
    case "lead":
      return <p className="perks-pop-lead">{block.text}</p>;

    case "h2":
      return <h2 className="perks-pop-h2">{block.text}</h2>;

    case "p":
      return <p className="perks-pop-p">{block.text}</p>;

    case "quote":
      return (
        <blockquote className="perks-pop-quote">
          <span className="perks-pop-quote-text">{block.text}</span>
          {block.attribution && (
            <cite className="perks-pop-quote-attr">
              &mdash; {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "list":
      return (
        <div className="perks-pop-list-block">
          {block.heading && (
            <p className="perks-pop-list-heading">{block.heading}</p>
          )}
          <ul className="perks-pop-list">
            {(block.items || []).map((item, i) => (
              <li key={i} className="perks-pop-list-item">
                <SparkIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "callout":
      return (
        <div className="pop-rich-callout perks-pop-callout">
          <ArrowRight />
          <span>{block.text}</span>
        </div>
      );

    case "kv":
      return (
        <div className="pop-rich-kv">
          {(block.rows || []).map((row, i) => (
            <div key={i} className="pop-rich-kv-row">
              <span className="pop-rich-kv-lbl">{row.label}</span>
              <span className="pop-rich-kv-val">{row.value}</span>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

export default function PerksDetailPopover({ article, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!article) return null;

  const heroSrc = article.heroImage || article.image;
  const authorInitial = (article.author || "A").charAt(0).toUpperCase();

  return (
    <div
      className="retro-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      <div
        className="retro-window pop-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Title bar ── */}
        <div className="retro-titlebar">
          <div className="retro-titlebar-left">
            <div className="pop-dots">
              <button
                className="pop-dot pop-dot-close"
                onClick={onClose}
                aria-label="Close"
              />
              <button className="pop-dot pop-dot-min" aria-label="Minimise" />
              <button className="pop-dot pop-dot-max" aria-label="Maximise" />
            </div>
          </div>
          <div className="retro-titlebar-center pop-tb-center">
            <span className="pop-tb-brand">Apphunt</span>
            <span className="pop-tb-sep">&mdash;</span>
            <span className="pop-tb-name">{article.eyebrow}</span>
          </div>
          <div className="retro-titlebar-right">
            <button
              className="pop-close-x"
              onClick={onClose}
              aria-label="Close"
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

        {/* ── Scrollable body ── */}
        <div className="pop-scroll">
          {/* 1. Hero image strip */}
          <div className="perks-pop-hero">
            {heroSrc ? (
              <img
                src={heroSrc}
                alt={article.title}
                className="perks-pop-hero-img"
              />
            ) : (
              <div className="perks-pop-hero-empty" />
            )}
            <div className="perks-pop-hero-overlay">
              <div className="perks-pop-hero-pills">
                {article.eyebrow && (
                  <span className="pop-label-pill perks-pop-hero-pill">
                    {article.eyebrow}
                  </span>
                )}
                {article.category && (
                  <span className="pop-label-pill perks-pop-hero-pill perks-pop-hero-pill--cat">
                    {article.category}
                  </span>
                )}
              </div>
            </div>
            {article.readTime && (
              <span className="perks-pop-readtime">{article.readTime}</span>
            )}
          </div>

          {/* 2. Article header + body + tags */}
          <div className="pop-content">
            {/* Meta row */}
            <div className="perks-pop-meta">
              <span className="perks-pop-avatar" aria-hidden="true">
                {authorInitial}
              </span>
              <span className="perks-pop-author-info">
                <span className="perks-pop-author-name">
                  {article.author || "Apphunt Team"}
                </span>
                {article.authorRole && (
                  <span className="perks-pop-author-role">
                    {article.authorRole}
                  </span>
                )}
              </span>
              {article.date && (
                <>
                  <span className="perks-pop-dot" aria-hidden="true" />
                  <span className="perks-pop-meta-text">{article.date}</span>
                </>
              )}
              {article.readTime && (
                <>
                  <span className="perks-pop-dot" aria-hidden="true" />
                  <span className="perks-pop-meta-text">{article.readTime}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="perks-pop-title">{article.title}</h1>

            {/* Chips */}
            {article.chips && article.chips.length > 0 && (
              <div className="perks-pop-chips panel-chips">
                {article.chips.map((chip, i) => (
                  <span key={i} className="panel-chip">
                    {chip}
                  </span>
                ))}
              </div>
            )}

            {/* 3. Article body */}
            {article.content && article.content.length > 0 && (
              <div className="perks-pop-body">
                {article.content.map((block, i) => (
                  <ArticleBlock key={i} block={block} />
                ))}
              </div>
            )}

            {/* 4. Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="perks-pop-tags">
                <span className="perks-pop-tags-label">Tagged:</span>
                {article.tags.map((tag, i) => (
                  <span key={i} className="pop-label-pill">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* 5. CTA footer */}
            <div className="pop-cta-footer">
              <button
                type="button"
                className="cta-button"
                style={{ fontSize: 15, height: 44, padding: "0 28px" }}
              >
                Apply now
              </button>
              <button
                type="button"
                className="ghost-button"
                style={{ fontSize: 15, height: 44, padding: "0 28px" }}
              >
                See all programs
              </button>
            </div>
          </div>
        </div>
        {/* /pop-scroll */}
      </div>
      {/* /retro-window */}
    </div>
  );
}
