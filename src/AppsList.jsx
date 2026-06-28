import React from "react";
import RetroPopover from "./RetroPopover";
import { useApps } from "./hooks/useApps";
import { useCategories } from "./hooks/useCategories";
import { useUpvote } from "./hooks/useUpvote";
import SubmitAppModal from "./components/SubmitAppModal";
import { useAuth } from "./hooks/useAuth";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Skeleton loader — shown while first page is loading
// ---------------------------------------------------------------------------
function AppListSkeleton() {
  return (
    <ul className="app-list" aria-busy="true" aria-label="Memuat daftar apps">
      {Array.from({ length: 5 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className="skeleton-item" aria-hidden="true">
          <span className="skeleton-logo" />
          <span className="skeleton-body">
            <span className="skeleton-line skeleton-name" />
            <span className="skeleton-line skeleton-tagline" />
          </span>
          <span className="skeleton-upvote" />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Sort controls
// ---------------------------------------------------------------------------
const SORT_OPTIONS = [
  { value: "upvotes", label: "Terpopuler" },
  { value: "newest", label: "Terbaru" },
  { value: "today", label: "Hari ini" },
];

function SortControls({ activeSort, onChange }) {
  return (
    <div className="sort-controls" role="group" aria-label="Urutkan apps">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`mini-tag-btn${activeSort === opt.value ? " active" : ""}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={activeSort === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single app list item — owns its own optimistic upvote state
// ---------------------------------------------------------------------------
function AppListItem({ app, onClick }) {
  const { upvotes, upvoted, pending, toggle } = useUpvote(
    app.id,
    app.upvotes_count ?? app.upvotes ?? 0,
  );

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
        src={app.logo_url ?? app.image}
        alt={app.name}
        className="app-list-thumb"
        width={56}
        height={56}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = "/placeholder-app.png";
        }}
      />
      <div className="app-info">
        <span className="app-name">{app.name}</span>
        <span className="app-tagline">{app.tagline}</span>
      </div>
      <span className="app-category-badge">
        {app.category ?? app.launch_tags?.[0] ?? "General"}
      </span>
      <div className="app-actions">
        <button
          className={`upvote-button${upvoted ? " upvoted" : ""}${pending ? " pending" : ""}`}
          aria-label={`Upvote ${app.name}`}
          aria-pressed={upvoted}
          disabled={pending}
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AppsList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("Semua");
  const [activeSort, setActiveSort] = React.useState("upvotes");
  const [selectedApp, setSelectedApp] = React.useState(null);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const { user } = useAuth();

  // Live category list from Supabase (with "Semua" prepended)
  const { categories } = useCategories();

  // Live app list from Supabase
  const {
    apps: appsData,
    loading,
    error,
    hasMore,
    loadMore,
  } = useApps({
    category: activeCategory === "Semua" ? null : activeCategory,
    search: searchQuery,
    sort: activeSort,
  });

  // Debounced search — reset category when user types so results make sense
  const [searchInput, setSearchInput] = React.useState("");
  const searchTimer = React.useRef(null);
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchQuery(val);
      if (val) setActiveCategory("Semua");
    }, 300);
  }

  function handleSubmitClick() {
    if (user) {
      setShowSubmitModal(true);
    } else {
      setShowAuthModal(true);
    }
  }

  // Sidebar: tech stacks derived from richContent kv blocks
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
      // Also pull from builtWith
      (app.builtWith ?? []).forEach((t) => {
        if (t) stacks.add(t);
      });
    });
    return Array.from(stacks).slice(0, 5);
  }, [appsData]);

  // Sidebar: client industries inferred from categories
  const clientIndustries = React.useMemo(() => {
    const industries = new Set();
    appsData.forEach((app) => {
      const cat = app.category ?? "";
      if (cat.includes("EdTech") || cat.includes("Learning"))
        industries.add("Education");
      if (cat.includes("Finance") || cat.includes("Keuangan"))
        industries.add("Finance");
      if (cat.includes("Health") || cat.includes("Kesehatan"))
        industries.add("Healthcare");
      if (cat.includes("SaaS") || cat.includes("B2B"))
        industries.add("Enterprise");
      if (cat.includes("Developer") || cat.includes("Tools"))
        industries.add("Developer Tools");
    });
    return Array.from(industries).slice(0, 6);
  }, [appsData]);

  // Featured project = first app in the list (highest upvotes by default sort)
  const featuredProject = appsData[0] ?? null;

  return (
    <section className="apps-page-layout">
      {/* ---------------------------------------------------------------- */}
      {/* Main column                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="apps-main-col">
        {/* Toolbar: search + submit */}
        <div className="apps-toolbar">
          <label className="search-wrap" htmlFor="apps-search">
            <SearchIcon />
            <input
              id="apps-search"
              type="search"
              className="search-input"
              placeholder="Cari apps..."
              value={searchInput}
              onChange={handleSearchChange}
              aria-label="Cari apps"
            />
          </label>
          <button
            className="cta-btn"
            onClick={handleSubmitClick}
            aria-label="Submit app baru"
          >
            + Submit App
          </button>
        </div>

        {/* Category filter tabs */}
        <nav className="category-tabs" aria-label="Filter kategori">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`mini-tag-btn${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Sort controls */}
        <SortControls activeSort={activeSort} onChange={setActiveSort} />

        {/* App list body */}
        {loading && appsData.length === 0 ? (
          <AppListSkeleton />
        ) : error ? (
          <p className="app-list-error" role="alert">
            {error}
          </p>
        ) : appsData.length === 0 ? (
          <p className="app-list-empty">
            Tidak ada apps ditemukan.{" "}
            {searchQuery && (
              <button
                className="link-btn"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
              >
                Hapus pencarian
              </button>
            )}
          </p>
        ) : (
          <>
            <ul className="app-list" aria-label="Daftar apps">
              {appsData.map((app) => (
                <li key={app.id}>
                  <AppListItem app={app} onClick={() => setSelectedApp(app)} />
                </li>
              ))}
            </ul>

            {/* Load more */}
            {hasMore && (
              <div className="app-list-loadmore">
                <button
                  className="mini-tag-btn"
                  onClick={loadMore}
                  disabled={loading}
                  aria-label="Muat lebih banyak apps"
                >
                  {loading ? "Memuat..." : "Muat lebih banyak"}
                </button>
              </div>
            )}

            {/* Loading more indicator */}
            {loading && appsData.length > 0 && (
              <p className="app-list-loading-more" aria-live="polite">
                Memuat...
              </p>
            )}
          </>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Sidebar                                                           */}
      {/* ---------------------------------------------------------------- */}
      <aside className="apps-sidebar">
        {featuredProject && (
          <div className="sidebar-widget">
            <span className="sidebar-eyebrow">Featured</span>
            <article className="library-card featured-card">
              <div className="library-card-hero">
                <div className="library-card-screenshot-wrap">
                  <img
                    src={featuredProject.logo_url ?? featuredProject.image}
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

      {/* ---------------------------------------------------------------- */}
      {/* Overlays                                                          */}
      {/* ---------------------------------------------------------------- */}
      <RetroPopover app={selectedApp} onClose={() => setSelectedApp(null)} />
      <SubmitAppModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />
      {showAuthModal && <div style={{ display: "none" }} aria-hidden="true" />}
    </section>
  );
}
