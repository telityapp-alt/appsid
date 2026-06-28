import React, { useState } from "react";
import PerksDetailPopover from "./PerksDetailPopover";
import { useBansosPrograms } from "./hooks/useBansosPrograms";
import { useBansoseFaqs } from "./hooks/useBansoseFaqs";
import { SkeletonCard } from "./components/ui/Skeleton";


function ChevronIcon({ open = false }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`icon-inline perks-chevron${open ? " open" : ""}`}
    >
      <path d="M4 6.5 8 10l4-3.5" />
    </svg>
  );
}

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

function PerksPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeArticle, setActiveArticle] = useState(null);

  // Live data dari Supabase
  const { programs: benefitCards, loading: programsLoading } =
    useBansosPrograms();
  const { faqs: newsFaq, loading: faqsLoading } = useBansoseFaqs();

  // Collect all unique tags from benefitCards as categories
  const categories = React.useMemo(() => {
    const tagSet = new Set(["All"]);
    benefitCards.forEach((card) => card.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [benefitCards]);

  const filteredCards = React.useMemo(() => {
    if (activeCategory === "All") return benefitCards;
    return benefitCards.filter((card) => card.tags?.includes(activeCategory));
  }, [activeCategory, benefitCards]);

  return (
    <section className="perks-page" aria-labelledby="perks-page-title">
      <div className="perks-header-row">
        <div>
          <span className="library-kicker">Program Bantuan</span>
          <h1 id="perks-page-title">Bansos AI</h1>
        </div>
        <div className="perks-header-actions">
          <button type="button" className="ghost-button">
            See all programs
          </button>
          <button type="button" className="cta-button">
            Apply now
          </button>
        </div>
      </div>

      <div className="perks-board">
        <aside className="apps-left-sidebar" aria-label="Filter by category">
          <h3 className="left-sidebar-title">Categories</h3>
          <div className="tags-list">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`mini-tag-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <div className="perks-main">
          {/* Mobile category bar */}
          <div
            className="mobile-category-bar"
            role="navigation"
            aria-label="Filter by category"
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

          <section className="perks-hero-panel">
            <div className="perks-hero-copy">
              <span className="perks-hero-eyebrow">Startups program</span>
              <h2>
                Partner perks dan launch support untuk tim kecil yang pengen
                ship seperti tim besar
              </h2>
              <p>
                Formatnya terinspirasi dari editorial launch board, tapi seluruh
                visualnya tetap pakai bahasa Apphunt: hangat, retro-clean, tegas
                di border, dan playful di aksen.
              </p>
              <div className="panel-chips" aria-label="Program benefits">
                <span className="panel-chip">Product credits</span>
                <span className="panel-chip">Partner offers</span>
                <span className="panel-chip">Founder support</span>
                <span className="panel-chip">Launch tooling</span>
              </div>
              <div
                className="trust-strip perks-trust-strip"
                aria-label="Included perks"
              >
                <span className="trust-label">Included:</span>
                <div className="trust-logos">
                  <span>$50k credits</span>
                  <span>$12k partner perks</span>
                  <span>$1.5k merch</span>
                </div>
              </div>
            </div>
          </section>

          <section className="perks-benefit-grid" aria-label="Program perks">
            {filteredCards.map((card) => (
              <article
                key={card.id}
                className="library-card perks-benefit-card"
                onClick={() => setActiveArticle(card)}
                role="button"
                tabIndex={0}
                aria-label={`Read article: ${card.title}`}
                onKeyDown={(e) => e.key === "Enter" && setActiveArticle(card)}
              >
                <div className="perks-card-media">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="perks-benefit-bg"
                  />
                  <div className="perks-card-read-cue">
                    <span>Read</span>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: 12, height: 12 }}
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </div>
                </div>

                <div className="library-card-ribbon perks-card-ribbon">
                  <strong>{card.title}</strong>
                  <span>{card.eyebrow}</span>
                </div>

                <div className="library-card-meta perks-card-meta">
                  <p>{card.desc}</p>
                  <div className="panel-chips">
                    {card.chips.map((chip) => (
                      <span key={chip} className="panel-chip">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>

      {activeArticle && (
        <PerksDetailPopover
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      )}
    </section>
  );
}

export default PerksPage;
