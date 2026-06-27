import { useState } from "react";
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
  Outlet,
} from "react-router-dom";
import "./App.css";
import AppsList from "./AppsList";
import NewsPage from "./NewsPage";
import NewsArticlePage from "./NewsArticlePage";
import PerksPage from "./PerksPage";
import RetroPopover from "./RetroPopover";
import OdooPage, { OdooPageWithPopover } from "./OdooPage";
import SolutionsPage from "./SolutionsPage";

import DocsPage from "./DocsPage";
import Footer from "./Footer";
import HppCalculatorPage from "./HppCalculatorPage";
import FranchisePage from "./FranchisePage";
import FranchiseMethodPage from "./FranchiseMethodPage";
import PreppyPage from "./PreppyPage";

import ContactPopover from "./ContactPopover";

const tabs = [
  {
    id: "usage",
    label: "Psikologi Web App",
    accent: "#377cf6",
    image: "/tab-analytics.png",
    title: "Website cerdas yang dirancang khusus memahami pola pengguna",
    description:
      "Dari visual ceria buat audiens anak hingga fitur lead magnet elegan untuk korporat. Setiap inci website dirancang pakai trik psikologi supaya pengunjung nyaman dan tergerak melakukan aksi.",
    stat: "Retensi user 3x lebih tinggi dengan UX berbasis psikologi",
    eyebrow: "Web Apps & Sites",
    primaryLinks: [
      "User Flow Design",
      "Conversion Funnel",
      "Interactive Tools",
      "Lead Magnets",
    ],
    secondaryLinks: [
      "Psychology-driven UX",
      "Gamification elements",
      "Micro-interactions",
      "Trust signals",
    ],
    bulletGroups: [
      {
        heading: "Design",
        items: [
          "Visual hierarchy yang intuitif",
          "Mobile-first responsive",
          "Brand identity konsisten",
        ],
      },
      {
        heading: "Psychology",
        items: [
          "Trigger emotional response",
          "Minimize friction points",
          "Social proof placement",
        ],
      },
      {
        heading: "Convert",
        items: [
          "Clear CTA strategy",
          "Lead capture tools",
          "Analytics integration",
        ],
      },
    ],
  },
  {
    id: "data",
    label: "Konsultasi & ERP",
    accent: "#37d7c8",
    image: "/tab-onboarding.png",
    title: "Integrasikan seluruh operasional ke dalam satu sistem ERP",
    description:
      "Basic kita itu konsultan ERP. Kita paham ribetnya data terpisah. Makanya kita setup sistem Odoo yang menyatukan operasional, sales, dan HR dengan flow yang intuitif dan mudah dipahami tim Anda.",
    stat: "Operational efficiency 40% meningkat dengan Odoo ERP",
    eyebrow: "Odoo ERP Setup",
    primaryLinks: [
      "Sales Pipeline",
      "Inventory",
      "Accounting",
      "HR Management",
    ],
    secondaryLinks: [
      "Custom modules",
      "Data migration",
      "Training & support",
      "Integration setup",
    ],
    bulletGroups: [
      {
        heading: "Setup",
        items: [
          "Module configuration",
          "Workflow customization",
          "User roles & permissions",
        ],
      },
      {
        heading: "Integrate",
        items: [
          "Import existing data",
          "Connect third-party apps",
          "Automate reporting",
        ],
      },
      {
        heading: "Scale",
        items: [
          "Team onboarding",
          "Performance optimization",
          "Ongoing consultation",
        ],
      },
    ],
  },
  {
    id: "issues",
    label: "Habit Mobile Apps",
    accent: "#f3ba3f",
    image: "/tab-debug.png",
    title: "Aplikasi mobile dengan habit design untuk retensi maksimal",
    description:
      "Rahasia app bertahan lama ada di habit design. Kita bangun mobile apps pakai pendekatan psikologi user, menciptakan flow natural yang bikin mereka otomatis terus balik pakai aplikasi Anda.",
    stat: "D30 retention 61% dengan habit design yang proven",
    eyebrow: "Mobile Apps Dev",
    primaryLinks: [
      "Hook Model",
      "Push Notifications",
      "Gamification",
      "Progress Tracking",
    ],
    secondaryLinks: [
      "Onboarding flow",
      "Reward system",
      "Streak mechanics",
      "Social features",
    ],
    bulletGroups: [
      {
        heading: "Hook",
        items: [
          "Trigger → action loop",
          "Variable reward system",
          "Investment mechanics",
        ],
      },
      {
        heading: "Engage",
        items: [
          "Daily active triggers",
          "Progress visualization",
          "Social accountability",
        ],
      },
      {
        heading: "Retain",
        items: [
          "Streak protection",
          "Re-engagement campaigns",
          "Milestone celebrations",
        ],
      },
    ],
  },
  {
    id: "rollout",
    label: "Strategi Growth",
    accent: "#b461f3",
    image: "/tab-rollout.png",
    title: "Strategi growth berbasis data untuk eskalasi bisnis Anda",
    description:
      "Sebagai konsultan growth, kerja kita berlanjut setelah rilis. Kita baca data, lakukan A/B test, dan optimasi fiturnya pakai trik psikologi supaya konversi bisnis Anda meledak pesat.",
    stat: "2x faster growth dengan strategi berbasis data",
    eyebrow: "Growth Consulting",
    primaryLinks: [
      "A/B Testing",
      "Funnel Analysis",
      "User Segmentation",
      "KPI Tracking",
    ],
    secondaryLinks: [
      "Conversion optimization",
      "Content strategy",
      "SEO & SEM",
      "Analytics setup",
    ],
    bulletGroups: [
      {
        heading: "Analyze",
        items: [
          "User behavior tracking",
          "Identify bottlenecks",
          "Competitor benchmarking",
        ],
      },
      {
        heading: "Optimize",
        items: [
          "Run experiments",
          "Iterate based on data",
          "Conversion rate boost",
        ],
      },
      {
        heading: "Scale",
        items: [
          "Automate winning tactics",
          "Expand to new channels",
          "Long-term growth roadmap",
        ],
      },
    ],
  },
];

const trustLogos = ["Ramp", "Retool", "Linear", "Vercel", "Cursor"];

const heroHighlights = [
  "Paham psikologi user luar dalam",
  "DNA konsultan growth & pakar ERP",
  "Nggak sekadar cantik, tapi narik cuan",
];

export const realShowcaseItems = [
  { img: "/showcase-coolio.jpg", brand: "Coolio Barbershop" },
  { img: "/showcase-rych.jpg", brand: "Rych Water" },
  { img: "/showcase-safubot.jpg", brand: "Safubot" },
  { img: "/showcase-milktea.jpg", brand: "Milk Tea Series" },
  { img: "/showcase-zhengda.jpg", brand: "Zhengda" },
];

export const libraryCards = [
  {
    name: "Preppy",
    role: "Gamified Learning Platform",
    place: "Scholarship & High-Stakes Test Prep",
    team: "EdTech Product",
    status: "Live on Play Store",
    image: "/preppy/hero-web.png",
    overview:
      "Preppy adalah platform belajar bergaya Duolingo untuk persiapan beasiswa, IELTS, dan CPNS. Kami mengubah materi berat dan membosankan menjadi pengalaman belajar yang engaging melalui gamification psychology, AI personalization, dan guerrilla marketing strategy.",
    stats: [
      { label: "30-Day Retention", value: "61%" },
      { label: "Free-to-Paid CVR", value: "18%" },
      { label: "Scholarship Database", value: "5000+" },
    ],
    highlights: [
      "Duolingo-inspired gamification with psychology principles",
      "Cross-platform: PWA + Native (React + Capacitor)",
      "Freemium growth loop dengan guerrilla marketing",
    ],
    strategy: [
      {
        phase: "Behavioral Research",
        desc: "Kami mempelajari psychology framework di balik Duolingo (BJ Fogg's Behavior Model, Hooked Model, Flow Theory) dan mengadaptasinya untuk konteks high-stakes learning.",
        image: "/preppy/flow-behavioral-research.html",
      },
      {
        phase: "Gamification Design",
        desc: "Implementasi 6 core principles: Loss Aversion (streaks), Variable Rewards (XP bonuses), Social Proof (leaderboards), Immediate Feedback, Progressive Mastery, dan Endowed Progress Effect.",
        image: "/preppy/flow-gamification-design.html",
      },
      {
        phase: "Guerrilla Marketing Funnel",
        desc: "Lead dengan 5000+ database beasiswa gratis (awareness), tease AI prediction (consideration), unlock premium strategy (conversion), retain via daily streaks (retention).",
        image: "/preppy/flow-marketing-funnel.html",
      },
      {
        phase: "Cross-Platform Architecture",
        desc: "React + Capacitor + PWA: satu codebase untuk web, Android, iOS. Monorepo dengan pnpm workspaces, TanStack Query state management, JWT auth, hybrid real-time (polling + Socket.io).",
        image: "/preppy/flow-architecture.html",
      },
    ],
    userJourney: [
      {
        step: "Discovery via Free Database",
        tag: "Day 1",
        desc: "User menemukan Preppy melalui pencarian beasiswa. Database 5000+ entries gratis membangun trust dan reciprocity.",
        callout: "70% visitors explore database — first touch dengan brand",
      },
      {
        step: "AI Prediction Hook",
        tag: "Day 1-3",
        desc: "User mencoba AI college prediction tool (free tier). Mereka experience personalized value dan lihat potensi platform.",
        callout: "42% yang explore database mencoba AI prediction",
      },
      {
        step: "Premium Conversion",
        tag: "Day 3-7",
        desc: "User sudah invested time dan data. Premium unlock (full AI strategy, mock interview, adaptive testing) solve pain point mereka untuk competitive edge.",
        callout: "18% convert to paid within 7 days (3x industry average)",
      },
      {
        step: "Habit Formation",
        tag: "Day 7-30",
        desc: "Daily streaks, push notifications, leaderboards, dan achievement unlocks create habit loop. Loss aversion membuat mereka tidak mau break progress.",
        callout: "61% retention at D30 (far exceeds EdTech average of 20-25%)",
      },
    ],
    richContent: {
      title: "Deep Dive: Psychology of Engagement",
      blocks: [
        {
          type: "text",
          content:
            "High-stakes testing (IELTS, CPNS, scholarship essays) traditionally sucks. Expensive prep courses (Rp 2-5 million), boring materials, and 3-5% completion rates for self-study. Kami memecahkan ini dengan gamification psychology yang proven work di Duolingo, tapi untuk konteks yang jauh lebih serius.",
        },
        {
          type: "callout",
          content:
            "Insight kunci: Motivation bukan masalah personal discipline. Ini masalah system design. Struktur yang tepat membuat engagement menjadi effortless.",
        },
        {
          type: "list",
          items: [
            "Loss Aversion & Streaks — Kahneman's Prospect Theory",
            "Variable Rewards — B.F. Skinner's Operant Conditioning",
            "Social Proof & Competition — Cialdini's Influence",
            "Immediate Feedback Loop — Flow State (Csikszentmihalyi)",
            "Progressive Mastery — Zone of Proximal Development (Vygotsky)",
            "Endowed Progress Effect — Nunes & Drèze Research",
          ],
        },
        {
          type: "kv",
          rows: [
            {
              label: "Tech Stack",
              value: "React + Vite + Capacitor + Tailwind",
            },
            { label: "Platform", value: "Web (PWA) + iOS + Android" },
            {
              label: "Animation",
              value: "Framer Motion for Duolingo-level polish",
            },
            {
              label: "Status",
              value: "Live on Google Play Store",
            },
          ],
        },
      ],
    },
    gallery: [
      "/preppy/hero-web.png",
      "/preppy/screen-1.webp",
      "/preppy/screen-2.webp",
    ],
  },
];

function CaretIcon() {
  return (
    <svg
      viewBox="0 0 10 10"
      aria-hidden="true"
      className="icon-inline caret-icon"
    >
      <path d="M2 3.5 5 6.5l3-3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-inline">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4 4" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-inline">
      <path d="M5 6.5h14v9H11l-4 3v-3H5z" />
      <path d="M9 10.5h6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-inline">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 19c1.4-3 4-4.5 6.5-4.5S17.1 16 18.5 19" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="icon-inline small-icon"
    >
      <path d="m5 3 7 5-7 5z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="icon-inline small-icon"
    >
      <path d="M6.2 10.2 4.5 12A2.5 2.5 0 0 1 1 8.5l1.8-1.8" />
      <path d="m9.8 5.8 1.7-1.8A2.5 2.5 0 1 1 15 7.5l-1.8 1.8" />
      <path d="m5.5 10.5 5-5" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="icon-inline small-icon"
    >
      <path d="M3 8a5 5 0 0 1 10 0" />
      <rect x="2" y="8" width="2.5" height="4" rx="1" />
      <rect x="11.5" y="8" width="2.5" height="4" rx="1" />
      <path d="M12 13c0 1.1-.9 2-2 2H8" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="icon-inline">
      <path d="M6 4.5h2.4v9H6zm3.6 0H12v9H9.6z" />
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

function HeaderLogo() {
  return (
    <div
      style={{
        fontSize: "24px",
        fontWeight: 900,
        color: "#11222b",
        letterSpacing: "-0.05em",
        fontFamily: "monospace",
      }}
    >
      Apphunt
    </div>
  );
}

function Wordmark() {
  return (
    <div className="wordmark" aria-label="Apphunt wordmark">
      <span
        className="wordmark-text"
        style={{
          fontSize: "28px",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "#11222b",
          fontFamily: "inherit",
        }}
      >
        Apphunt
      </span>
    </div>
  );
}

function CardGlyphs() {
  return (
    <div className="library-glyphs" aria-hidden="true">
      <span>✦</span>
      <span>◎</span>
      <span>◌</span>
    </div>
  );
}

function MiniAppWindow({ variant }) {
  return (
    <div className={`mini-app-window ${variant}`}>
      <div className="mini-toolbar">
        <span />
        <span />
        <span />
      </div>
      <div className="mini-canvas">
        {variant === "analytics" && (
          <>
            <div className="mini-chart-bars">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="mini-chart-line" />
            <div className="mini-kpi-row">
              <b />
              <b />
              <b />
            </div>
          </>
        )}
        {variant === "checklist" && (
          <>
            <div className="mini-sidebar" />
            <div className="mini-checklist">
              <i />
              <i />
              <i />
              <i />
            </div>
          </>
        )}
        {variant === "warehouse" && (
          <>
            <div className="mini-code-block">
              <i />
              <i />
              <i />
            </div>
            <div className="mini-table-grid" />
          </>
        )}
        {variant === "incidents" && (
          <>
            <div className="mini-alert-pill" />
            <div className="mini-timeline">
              <i />
              <i />
              <i />
            </div>
          </>
        )}
        {variant === "flags" && (
          <>
            <div className="mini-toggle-row">
              <i />
              <i />
              <i />
            </div>
            <div className="mini-segment-card" />
          </>
        )}
        {variant === "experiments" && (
          <>
            <div className="mini-split-panels">
              <i />
              <i />
            </div>
            <div className="mini-metric-strip" />
          </>
        )}
        {variant === "support" && (
          <>
            <div className="mini-ticket-stack">
              <i />
              <i />
              <i />
            </div>
            <div className="mini-avatar-dot" />
          </>
        )}
        {variant === "review" && (
          <>
            <div className="mini-review-grid">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="mini-footer-chart" />
          </>
        )}
      </div>
    </div>
  );
}

// Converts a card name to a URL-safe slug
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Home page — renders hero + product panel + library
function HomePage() {
  const [activeTab, setActiveTab] = useState("usage");
  const [contactOpen, setContactOpen] = useState(false);
  const navigate = useNavigate();
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <Wordmark />
          <h1>Bangun apps & web pakai strategi growth dan psikologi user</h1>
          <p>
            Berawal sebagai konsultan growth & ERP, kami racik web dan aplikasi
            lewat lensa psikologi user. Dari visual asik untuk anak sampai lead
            magnet solid untuk korporat, semua dipikirin matang.
          </p>
          <p>
            Kita nggak asal ngoding. Semua dirancang pakai ilmu psikologi biar
            ngena di user, plus fondasi sistem growth & ERP yang pastinya bikin
            performa bisnis melesat tajam.
          </p>

          <ul className="hero-highlights" aria-label="Key benefits">
            {heroHighlights.map((item) => (
              <li key={item}>
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="hero-actions">
            <button
              type="button"
              className="cta-button"
              onClick={() => navigate("/apps")}
            >
              Our Apps
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setContactOpen(true)}
            >
              Contact Me
            </button>
          </div>

          <div className="hero-links">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setContactOpen(true);
              }}
            >
              <LinkIcon />
              MCP
            </a>
            <span className="hero-dot" />
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setContactOpen(true);
              }}
            >
              <PlayIcon />
              Watch a demo
            </a>
            <span className="hero-dot" />
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setContactOpen(true);
              }}
            >
              <HeadsetIcon />
              Talk to a human
            </a>
          </div>

          <div
            className="trust-strip"
            aria-label="Trusted by teams shipping weekly"
          >
            <span className="trust-label">Teams shipping weekly:</span>
            <div className="trust-logos">
              {trustLogos.map((logo) => (
                <span key={logo}>{logo}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-marquee-container">
            <div className="hero-marquee-track">
              {Array(4)
                .fill(realShowcaseItems)
                .flat()
                .map((item, idx) => (
                  <div key={idx} className="hero-marquee-card">
                    <img
                      src={item.img}
                      alt={`Showcase ${item.brand}`}
                      className="hero-marquee-image"
                    />
                    <button
                      type="button"
                      className="cta-button hero-marquee-btn"
                    >
                      Propose to {item.brand}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="product-panel"
        style={{ "--panel-accent": currentTab.accent }}
      >
        <div className="tabs" role="tablist" aria-label="Product areas">
          {tabs.map((tab) => {
            const isActive = tab.id === currentTab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`tab-button${isActive ? " active" : ""}`}
                style={isActive ? { "--tab-accent": tab.accent } : undefined}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="panel-card">
          <button
            type="button"
            className="panel-pause"
            aria-label="Pause carousel"
          >
            <PauseIcon />
          </button>

          <div className="panel-copy">
            <span className="panel-eyebrow">{currentTab.eyebrow}</span>
            <h2>{currentTab.title}</h2>
            <p>{currentTab.description}</p>

            <div className="panel-chips" aria-label="Top modules">
              {currentTab.primaryLinks.map((link) => (
                <span key={link} className="panel-chip">
                  {link}
                </span>
              ))}
            </div>
          </div>

          <div className="panel-visual">
            <img
              src={currentTab.image}
              alt={`${currentTab.label} visual`}
              className="panel-generated-image"
            />
          </div>

          <div className="panel-columns">
            {currentTab.bulletGroups.map((group) => (
              <section key={group.heading} className="link-column">
                <h3>{group.heading}</h3>
                <ul className="feature-list">
                  {group.items.map((item) => (
                    <li key={item}>
                      <CheckIcon />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div
            className="panel-footer-links"
            aria-label="Additional capabilities"
          >
            {currentTab.secondaryLinks.map((link) => (
              <a
                href="/"
                key={link}
                onClick={(event) => event.preventDefault()}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="library-section" aria-labelledby="library-title">
        <div className="library-copy">
          <div>
            <span className="library-kicker">Library</span>
            <h2 id="library-title">Galeri mahakarya portofolio agensi kami</h2>
          </div>
          <p>
            Berbagai hasil mahakarya dari tim Apphunt. Dari desain ERP
            interaktif sampai sistem operasi bisnis kompleks yang dirancang
            mengutamakan kemudahan navigasi dan psikologi pengguna.
          </p>
        </div>

        <div className="library-grid">
          {libraryCards.map((card) => (
            <article
              key={card.name}
              className="library-card"
              onClick={() => navigate("/portfolio/" + toSlug(card.name))}
              style={{ cursor: "pointer" }}
            >
              <div className="library-card-hero">
                <div className="library-card-screenshot-wrap">
                  <img
                    src={card.image}
                    alt={`${card.name} interface screenshot`}
                    className="library-card-screenshot"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                  <div className="library-card-placeholder" aria-hidden="true">
                    <span className="placeholder-label">{card.name}</span>
                  </div>
                </div>
              </div>

              <div className="library-card-ribbon">
                <strong>{card.name}</strong>
                <span>{card.role}</span>
              </div>

              <div className="library-card-meta">
                <p>{card.place}</p>
                <div className="library-card-chip">{card.team}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Popover rendered on /portfolio/:slug route, overlaid on home */}
      <Outlet />

      {/* Contact Popover */}
      <ContactPopover
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </>
  );
}

// Popover route — reads slug, finds card, renders RetroPopover
function PortfolioPopover() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const card = libraryCards.find((c) => toSlug(c.name) === slug) ?? null;

  return <RetroPopover app={card} onClose={() => navigate("/")} />;
}

// Apps page — wraps AppsList, passes navigate for popover slug routing
function AppsPage() {
  return <AppsList />;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="page-shell">
      <div className="texture-rail" aria-hidden="true" />
      <div className="site-frame">
        <header className="topbar">
          <div className="topbar-left">
            <HeaderLogo />
            <nav className="topnav" aria-label="Primary">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/apps"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Apps
              </NavLink>
              <NavLink
                to="/perks"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Gratisan
              </NavLink>

              <NavLink
                to="/news"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                News
              </NavLink>
            </nav>
          </div>
          <div className="topbar-right">
            <button type="button" className="cta-button topbar-cta">
              Start free
            </button>
            <button type="button" className="icon-button" aria-label="Search">
              <SearchIcon />
            </button>
            <button type="button" className="icon-button" aria-label="Messages">
              <MessageIcon />
            </button>
            <button
              type="button"
              className="icon-button avatar-button"
              aria-label="Account"
            >
              <UserIcon />
            </button>
            <button
              type="button"
              className="hamburger-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((m) => !m)}
            >
              {menuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="icon-inline"
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="icon-inline"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {menuOpen && (
          <div
            className="mobile-nav-overlay"
            onClick={() => setMenuOpen(false)}
          >
            <nav
              className="mobile-nav"
              onClick={(e) => e.stopPropagation()}
              aria-label="Mobile navigation"
            >
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/apps"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Apps
              </NavLink>
              <NavLink
                to="/perks"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Gratisan
              </NavLink>

              <NavLink
                to="/news"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                News
              </NavLink>
              <div className="mobile-nav-cta">
                <button
                  type="button"
                  className="cta-button"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Start free
                </button>
              </div>
            </nav>
          </div>
        )}

        <Routes>
          {/* Home — with nested popover route so layout stays intact */}
          <Route path="/" element={<MainShell wide={false} />}>
            <Route index element={<HomePage />} />
            <Route path="portfolio/:slug" element={<HomePageWithPopover />} />
          </Route>

          {/* Solutions */}
          <Route path="/solutions" element={<MainShell wide={true} />}>
            <Route index element={<SolutionsPage />} />
            <Route path=":step" element={<SolutionsPage />} />
          </Route>

          <Route path="franchise" element={<FranchisePage />} />
          <Route path="franchise/:id" element={<FranchiseMethodPage />} />

          {/* Odoo */}
          <Route path="/odoo" element={<MainShell wide={false} />}>
            <Route index element={<OdooPage />} />
            <Route path="portfolio/:slug" element={<OdooPageWithPopover />} />
          </Route>

          {/* Apps */}
          <Route path="/apps" element={<MainShell wide={true} />}>
            <Route index element={<AppsPage />} />
            <Route path=":slug" element={<AppsPageWithPopover />} />
          </Route>

          {/* Perks */}
          <Route
            path="/perks"
            element={
              <main className="content content-wide">
                <PerksPage />
              </main>
            }
          />

          {/* News */}
          <Route
            path="/news"
            element={
              <main className="content content-wide">
                <NewsPage />
              </main>
            }
          />
          <Route path="/news/:slug" element={<NewsArticlePage />} />

          {/* Tools */}
          <Route path="/hpp-calculator" element={<MainShell wide={true} />}>
            <Route index element={<HppCalculatorPage />} />
          </Route>

          {/* Docs */}
          <Route path="/docs" element={<MainShell wide={true} />}>
            <Route index element={<DocsPage />} />
            <Route path=":docId" element={<DocsPage />} />
          </Route>

          {/* Preppy Case Study */}
          <Route
            path="/preppy"
            element={
              <main
                className="content"
                style={{ padding: 0, maxWidth: "100%" }}
              >
                <PreppyPage />
              </main>
            }
          />
        </Routes>

        <Footer />
      </div>
    </div>
  );
}

// Shared layout shell that sets content class based on 'wide' prop
function MainShell({ wide }) {
  return (
    <main className={`content${wide ? " content-wide" : ""}`}>
      <Outlet />
    </main>
  );
}

// Home with popover — renders home content plus popover overlay
function HomePageWithPopover() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const card = libraryCards.find((c) => toSlug(c.name) === slug) ?? null;

  return (
    <>
      <HomePage />
      <RetroPopover app={card} onClose={() => navigate("/")} />
    </>
  );
}

// Apps page with popover overlay
function AppsPageWithPopover() {
  const { slug } = useParams();
  const navigate = useNavigate();
  // mockApps are in AppsList — we look up by slug from name
  const mockApps = [
    {
      id: 1,
      name: "Signal board",
      tagline: "Realtime funnels and cohort health analytics cockpit",
      image: "/lib-signal-board.png",
      upvotes: 428,
      category: "Analytics",
    },
    {
      id: 2,
      name: "Flow pilot",
      tagline: "Onboarding command center for activation checkpoints",
      image: "/lib-flow-pilot.png",
      upvotes: 315,
      category: "Analytics",
    },
    {
      id: 3,
      name: "Warehouse one",
      tagline: "Data workspace for models, syncs, and QA",
      image: "/lib-warehouse-one.png",
      upvotes: 289,
      category: "Productivity",
    },
    {
      id: 4,
      name: "Issue radar",
      tagline: "Debug investigation hub for alerts and traces",
      image: "/lib-issue-radar.png",
      upvotes: 194,
      category: "Developer Tools",
    },
    {
      id: 5,
      name: "Launch deck",
      tagline: "Feature rollout control and segment impact reads",
      image: "/lib-launch-deck.png",
      upvotes: 156,
      category: "Developer Tools",
    },
  ];
  const app = mockApps.find((a) => toSlug(a.name) === slug) ?? null;

  return (
    <>
      <AppsPage />
      <RetroPopover app={app} onClose={() => navigate("/apps")} />
    </>
  );
}

export default App;
