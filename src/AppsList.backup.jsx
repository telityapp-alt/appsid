import React from "react";
import RetroPopover from "./RetroPopover";
import { libraryCards } from "./App";

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

export default function AppsList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [selectedApp, setSelectedApp] = React.useState(null);

  const appsData = React.useMemo(() => {
    return libraryCards.map((card, i) => ({
      id: i + 1,
      ...card,
      tagline: card.role, // map role to tagline for the UI
      category: card.team, // map team to category
      upvotes: 150 + i * 23, // static mock upvotes
      status: card.status || "On Development", // default status
    }));
  }, []);

  // Extract unique categories dynamically from libraryCards
  const dynamicCategories = React.useMemo(() => {
    const allCategories = new Set(["All", "Live", "On Development"]);
    libraryCards.forEach(card => {
      if (card.team) allCategories.add(card.team);
      if (card.status) allCategories.add(card.status);
    });
    return Array.from(allCategories);
  }, []);

  // Extract tech stacks dynamically from richContent
  const techStacks = React.useMemo(() => {
    const stacks = new Set();
    libraryCards.forEach(card => {
      const kvBlock = card.richContent?.blocks?.find(b => b.type === "kv");
      if (kvBlock) {
        kvBlock.rows.forEach(row => {
          if (row.label === "Tech Stack" && row.value) {
            // Extract individual techs from string like "React + Vite + Capacitor"
            row.value.split(/[+&,]/).forEach(tech => {
              const trimmed = tech.trim();
              if (trimmed) stacks.add(trimmed);
            });
          }
        });
      }
    });
    return Array.from(stacks).slice(0, 5); // Top 5
  }, []);

  // Extract client industries from card data
  const clientIndustries = React.useMemo(() => {
    const industries = new Set();
    libraryCards.forEach(card => {
      // Extract from team or place field
      if (card.team && card.team.includes("Tech")) {
        const match = card.team.match(/(\w+)\s+Tech/);
        if (match) industries.add(match[1]);
      }
      if (card.place) {
        // Extract industry keywords
        if (card.place.includes("EdTech") || card.place.includes("Learning")) industries.add("Education");
        if (card.place.includes("HR") || card.place.includes("Talent")) industries.add("HR Tech");
        if (card.place.includes("Healthcare") || card.place.includes("Medical")) industries.add("Healthcare");
        if (card.place.includes("SaaS") || card.place.includes("B2B")) industries.add("SaaS");
      }
    });
    return Array.from(industries).slice(0, 4);
  }, []);

  // Get featured project (first Live project, fallback to Preppy)
  const featuredProject = React.useMemo(() => {
    return libraryCards.find(card => card.status?.includes("Live")) || libraryCards[0];
  }, []);

  const filteredApps = appsData.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || app.category === activeCategory || app.status === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="apps-page-layout">
      {/* Left Sidebar: Categories/Tags */}
      <aside className="apps-left-sidebar">
        <h3 className="left-sidebar-title">Categories</h3>
        <div className="tags-list">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              className={`mini-tag-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>

      <div className="apps-main-feed">
        <div
          className="mobile-category-bar"
          role="navigation"
          aria-label="Filter by category"
        >
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              className={`mini-tag-btn${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="apps-list-header">
          <span className="library-kicker">Our Portfolio</span>
          <h2>Produk yang sudah & sedang kami kerjakan</h2>
        </div>

        <div className="apps-toolbar">
          <div className="search-bar-wrap">
            <SearchIcon />
            <input
              type="text"
              placeholder="Cari produk kami..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="apps-list">
          {filteredApps.map((app) => (
            <article
              key={app.id}
              className="app-list-item library-card-style"
              onClick={() => setSelectedApp(app)}
            >
              <div className="app-item-left">
                <div className="app-logo-wrap">
                  <img
                    src={app.image}
                    alt={`${app.name} logo`}
                    className="app-logo"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                  <div className="app-logo-placeholder" aria-hidden="true">
                    <span>{app.name.charAt(0)}</span>
                  </div>
                </div>

                <div className="app-info">
                  <h3 className="app-title">{app.name}</h3>
                  <p className="app-tagline">{app.tagline}</p>
                  <div className="app-meta">
                    <span className="app-meta-comment">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="icon-inline small-icon"
                      >
                        <path d="M5 6.5h14v9H11l-4 3v-3H5z" />
                        <path d="M9 10.5h6" />
                      </svg>
                      <span>12</span>
                    </span>
                    <span className="app-meta-tag">
                      {app.category || "Analytics"}
                    </span>
                    <span className="app-meta-tag">
                      {app.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="app-item-right">
                <button
                  className="upvote-button"
                  aria-label={`Upvote ${app.name}`}
                >
                  <CaretUpIcon />
                  <span className="upvote-count">{app.upvotes}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="apps-sidebar">
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
              <p>{featuredProject.role}</p>
            </div>
          </article>
        </div>

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

        <div className="sidebar-widget">
          <span className="sidebar-eyebrow">Client Industries</span>
          <div className="trust-logos">
            {clientIndustries.map((industry) => (
              <span key={industry}>{industry}</span>
            ))}
          </div>
        </div>
      </aside>
      <RetroPopover app={selectedApp} onClose={() => setSelectedApp(null)} />
    </section>
  );
}
