import React from "react";
import RetroPopover from "./RetroPopover";
import { useApps } from "./hooks/useApps";
import { useUpvote } from "./hooks/useUpvote";
import SubmitAppModal from "./components/SubmitAppModal";

const CATEGORIES = [
  "All",
  "EdTech Product",
  "Analytics",
  "Developer Tools",
  "Productivity",
  "SaaS",
  "Live",
  "On Development",
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-inline">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4 4" />
    </svg>
  );
}

function CaretUpIcon() {
  return (
    <svg
      viewBox="0 0 10 10"
      aria-hidden="true"
      className="icon-inline upvote-icon"
    >
      <path d="M2 6.5 5 3.5l3 3" />
    </svg>
  );
}

// Each list item manages its own upvote state independently
function AppListItemWithUpvote({ app, onClick }) {
  const { upvotes, upvoted, toggle } = useUpvote(app.id, app.upvotes);

  return (
    <article
      className="app-list-item"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Buka detail ${app.name}`}
    >
      <img
        src={app.image}
        alt={app.name}
        className="app-list-thumb"
        width={56}
        height={56}
      />
      <div className="app-info">
        <span className="app-name">{app.name}</span>
        <span className="app-tagline">{app.tagline}</span>
      </div>
      <span className="app-category-badge">{app.category}</span>
      <div className="app-actions">
        <button
          className={`upvote-button${upvoted ? " upvoted" : ""}`}
          aria-label={`Upvote ${app.name}`}
          aria-pressed={upvoted}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
        >
          <CaretUpIcon />
          <span className="upvote-count">{upvotes}</span>
        </button>
      </div>
    </article>
  );
}

export default function AppsList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [selectedApp, setSelectedApp] = React.useState(null);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);

  // useApps handles filtering by category + search server-side (or in fallback)
  const {
    apps: appsData,
    loading,
    error,
  } = useApps({
    category: activeCategory === "All" ? null : activeCategory,
    search: searchQuery,
  });

  const techStacks = React.useMemo(() => {
    const stacks = new Set();
    appsData.forEach((app) => {
      const kvBlock = app.richContent?.blocks?.find((b) => b.type === "kv");
      if (kvBlock) {
        kvBlock.rows.forEach((row) => {
          if (row.label === "Tech Stack" && row.value) {
            row.value.split(/[+&,]/).forEach((tech) => {
              const trimmed = tech.trim();
              if (trimmed) stacks.add(trimmed);
            });
          }
        });
      }
    });
    return Array.from(stacks).slice(0, 5);
  }, [appsData]);

  const clientIndustries = React.useMemo(() => {
    const industries = new Set();
    appsData.forEach((app) => {
      if (app.category) {
        if (
          app.category.includes("EdTech") ||
          app.category.includes("Learning")
        )
          industries.add("Education");
        if (app.category.includes("HR") || app.category.includes("Talent"))
          industries.add("HR Tech");
        if (
          app.category.includes("Healthcare") ||
          app.category.includes("Medical")
        )
          industries.add("Healthcare");
        if (app.category.includes("SaaS") || app.category.includes("B2B"))
          industries.add("SaaS");
      }
      if (app.tags) {
        app.tags.forEach((tag) => {
          if (tag.includes("EdTech") || tag.includes("Learning"))
            industries.add("Education");
          if (tag.includes("HR") || tag.includes("Talent"))
            industries.add("HR Tech");
          if (tag.includes("Healthcare") || tag.includes("Medical"))
            industries.add("Healthcare");
          if (tag.includes("SaaS") || tag.includes("B2B"))
            industries.add("SaaS");
        });
      }
    });
    return Array.from(industries).slice(0, 4);
  }, [appsData]);

  const featuredProject = React.useMemo(() => {
    return (
      appsData.find((app) => app.status?.toLowerCase().includes("live")) ??
      appsData[0] ??
      null
    );
  }, [appsData]);

  return (
    <section className="apps-page-layout">
      <aside className="apps-left-sidebar">
        <h3 className="left-sidebar-title">Categories</h3>
        <div className="tags-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tag-filter-btn${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>

      <div className="apps-main">
        <div className="apps-main-header">
          <div className="search-bar">
            <SearchIcon />
            <input
              type="search"
              placeholder="Cari app atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Cari aplikasi"
            />
          </div>
          <button
            className="cta-button"
            onClick={() => setShowSubmitModal(true)}
            style={{ whiteSpace: "nowrap" }}
          >
            + Submit App
          </button>
        </div>

        {loading && (
          <div className="apps-loading" aria-live="polite">
            Memuat...
          </div>
        )}

        {error && (
          <div className="apps-error" role="alert">
            Gagal memuat apps: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="apps-list">
            {appsData.length === 0 ? (
              <p className="apps-empty">Tidak ada app yang cocok.</p>
            ) : (
              appsData.map((app) => (
                <AppListItemWithUpvote
                  key={app.id}
                  app={app}
                  onClick={() => setSelectedApp(app)}
                />
              ))
            )}
          </div>
        )}
      </div>

      <aside className="apps-sidebar">
        {featuredProject && (
          <div className="sidebar-widget">
            <span className="sidebar-eyebrow">Featured Project</span>
            <article className="library-card featured-card">
              <div className="library-card-hero">
                <div className="library-card-screenshot-wrap">
                  <img
                    src={featuredProject.image}
                    alt={`${featuredProject.name} showcase`}
                    className="library-card-screenshot"
                  />
                </div>
              </div>
              <div className="library-card-ribbon">
                <strong>{featuredProject.name}</strong>
                <span>{featuredProject.status}</span>
              </div>
              <div className="library-card-meta">
                <p>{featuredProject.tagline}</p>
              </div>
            </article>
          </div>
        )}

        {techStacks.length > 0 && (
          <div className="sidebar-widget">
            <span className="sidebar-eyebrow">Tech Stack</span>
            <div className="panel-chips">
              {techStacks.map((chip) => (
                <span key={chip} className="panel-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}

        {clientIndustries.length > 0 && (
          <div className="sidebar-widget">
            <span className="sidebar-eyebrow">Client Industries</span>
            <div className="trust-logos">
              {clientIndustries.map((industry) => (
                <span key={industry}>{industry}</span>
              ))}
            </div>
          </div>
        )}
      </aside>

      <RetroPopover app={selectedApp} onClose={() => setSelectedApp(null)} />
      <SubmitAppModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />
    </section>
  );
}
