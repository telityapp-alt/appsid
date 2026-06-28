import React from "react";
import RetroPopover from "./RetroPopover";
import { useApps } from "./hooks/useApps";
import { useCategories } from "./hooks/useCategories";
import { useUpvote } from "./hooks/useUpvote";
import { useAuthGuard } from "./hooks/useAuthGuard";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./context/ToastContext";
import SubmitAppModal from "./components/SubmitAppModal";
import { LaunchTodayBadge, PricingBadge } from "./components/AppStatusBadge";

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
// Skeleton loader
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
// Empty state for "Hari ini" filter with zero results
// ---------------------------------------------------------------------------
function EmptyHariIni() {
  return (
    <div
      role="status"
      aria-label="Belum ada apps yang diluncurkan hari ini"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 40 }}>🚀</span>
      <p
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#29405f",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        Belum ada yang launch hari ini
      </p>
      <p style={{ fontSize: 13, color: "#7b8594", margin: 0 }}>
        Cek lagi nanti — produk baru biasanya launch pagi WIB.
      </p>
    </div>
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
          type="button"
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
  const { requireAuth } = useAuthGuard();
  const { showToast } = useToast();
  const {
    upvotes,
    upvoted,
    loading: upvoteLoading,
    toggle,
  } = useUpvote(app.id, app.upvotes_count ?? app.upvotes ?? 0);

  function handleUpvote(e) {
    e.stopPropagation();
    requireAuth(async () => {
      try {
        await toggle();
        showToast(
          upvoted ? "Upvote dihapus" : `Upvote untuk ${app.name} berhasil!`,
          "success",
        );
      } catch {
        showToast("Gagal melakukan upvote. Coba lagi.", "error");
      }
    });
  }

  return (
    <article
      className="app-list-item library-card-style"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Buka detail ${app.name}`}
    >
      {/* Left: logo + info */}
      <div className="app-item-left">
        <div className="app-logo-wrap">
          <img
            src={app.logo_url ?? app.image}
            alt={app.name}
            className="app-logo"
            width={48}
            height={48}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
          <div className="app-logo-placeholder" style={{ display: "none" }}>
            {app.name?.charAt(0) ?? "?"}
          </div>
        </div>

        <div className="app-info">
          <h3 className="app-title">{app.name}</h3>
          <p className="app-tagline">{app.tagline}</p>
          {/* Status chips */}
          <div className="app-meta">
            <LaunchTodayBadge launchDate={app.launch_date} />
            <PricingBadge pricingType={app.pricing_type} />
            {(app.category ?? app.launch_tags?.[0]) && (
              <span className="app-meta-tag">
                {app.category ?? app.launch_tags?.[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: upvote */}
      <button
        type="button"
        className={`upvote-button${upvoted ? " upvoted" : ""}${upvoteLoading ? " pending" : ""}`}
        aria-label={`Upvote ${app.name}`}
        aria-pressed={upvoted}
        disabled={upvoteLoading}
        onClick={handleUpvote}
      >
        <CaretUpIcon />
        <span className="upvote-count">{upvotes}</span>
      </button>
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
  const [searchInput, setSearchInput] = React.useState("");
  const searchTimer = React.useRef(null);

  const { user, openAuthModal } = useAuth();
  const { categories } = useCategories();

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
      openAuthModal(() => setShowSubmitModal(true));
    }
  }

  // Sidebar: tech stacks from richContent kv + builtWith
  const techStacks = React.useMemo(() => {
    const stacks = new Set();
    appsData.forEach((app) => {
      const kvBlock = app.richContent?.blocks?.find((b) => b.type === "kv");
      if (kvBlock) {
        kvBlock.rows.forEach((row) => {
          if (row.label === "Tech Stack" && row.value) {
            row.value.split(/[+&,]/).forEach((t) => {
              const trimmed = t.trim();
              if (trimmed) stacks.add(trimmed);
            });
          }
        });
      }
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

  const featuredProject = appsData[0] ?? null;
  const isHariIniEmpty =
    activeSort === "today" && !loading && !error && appsData.length === 0;

  return (
    <section className="apps-page-layout">
      {/* ---------------------------------------------------------------- */}
      {/* Left sidebar — categories                                         */}
      {/* ---------------------------------------------------------------- */}
      <aside className="apps-left-sidebar">
        <p className="left-sidebar-title">Kategori</p>
        <nav className="tags-list" aria-label="Filter kategori">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`mini-tag-btn${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Main feed                                                         */}
      {/* ---------------------------------------------------------------- */}
      <div className="apps-main-feed">
        {/* Toolbar */}
        <div className="apps-toolbar">
          <div className="search-bar-wrap">
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
          </div>
          <button
            type="button"
            className="cta-button"
            onClick={handleSubmitClick}
            aria-label="Submit app baru"
            style={{ height: 40, fontSize: 14, padding: "0 18px" }}
          >
            + Submit App
          </button>
        </div>

        {/* Sort controls */}
        <SortControls activeSort={activeSort} onChange={setActiveSort} />

        {/* App list body */}
        {loading && appsData.length === 0 ? (
          <AppListSkeleton />
        ) : error ? (
          <p className="app-list-error" role="alert">
            {error}
          </p>
        ) : isHariIniEmpty ? (
          <EmptyHariIni />
        ) : appsData.length === 0 ? (
          <p className="app-list-empty">
            Tidak ada apps ditemukan.{" "}
            {searchQuery && (
              <button
                type="button"
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

            {hasMore && (
              <div className="app-list-loadmore">
                <button
                  type="button"
                  className="mini-tag-btn"
                  onClick={loadMore}
                  disabled={loading}
                  aria-label="Muat lebih banyak apps"
                >
                  {loading ? "Memuat..." : "Muat lebih banyak"}
                </button>
              </div>
            )}

            {loading && appsData.length > 0 && (
              <p className="app-list-loading-more" aria-live="polite">
                Memuat...
              </p>
            )}
          </>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Right sidebar                                                     */}
      {/* ---------------------------------------------------------------- */}
      <aside className="apps-sidebar">
        {featuredProject && (
          <div className="sidebar-widget">
            <span className="sidebar-eyebrow">Featured</span>
            <article
              className="library-card"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="library-card-hero">
                <div className="library-card-screenshot-wrap">
                  <img
                    src={featuredProject.logo_url ?? featuredProject.image}
                    alt={`${featuredProject.name} showcase`}
                    className="library-card-screenshot"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="library-card-ribbon">
                <strong>{featuredProject.name}</strong>
                <span>
                  {featuredProject.launch_tags?.[0] ?? featuredProject.status}
                </span>
              </div>
              <div
                className="library-card-meta"
                style={{ padding: "8px 12px 12px" }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#55606d",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {featuredProject.tagline}
                </p>
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
    </section>
  );
}
