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
import MarketplacePage from "./MarketplacePage";
import BursaPage from "./BursaPage";
import ForumPage from "./ForumPage";
import EventsPage from "./EventsPage";
import JobsPage from "./JobsPage";
import ToolsPage from "./ToolsPage";
import PatunganPage from "./PatunganPage";
import ContactPopover from "./ContactPopover";
import AuthModal from "./components/ui/AuthModal";
import { useAuth } from "./context/AuthContext";

const tabs = [
  {
    id: "usage",
    label: "Jelajahi Apps",
    accent: "#377cf6",
    image: "/tab-analytics.png",
    title: "Temukan apps dan tools terbaik buatan developer lokal",
    description:
      "Direktori produk digital Indonesia yang dikurasi. Dari AI tools produktivitas sampai SaaS B2B untuk UMKM. Semua bisa di-upvote, di-review, dan langsung dicoba.",
    stat: "Ratusan produk lokal siap dieksplorasi dan didukung",
    eyebrow: "Apps & Tools",
    primaryLinks: [
      "AI Tools",
      "Produktivitas",
      "Developer Tools",
      "Keuangan & Pajak",
    ],
    secondaryLinks: [
      "Submit produkmu",
      "Upvote favorit",
      "Filter by kategori",
      "Trending minggu ini",
    ],
    bulletGroups: [
      {
        heading: "Discover",
        items: [
          "Kurasi produk lokal terpercaya",
          "Filter by kategori & stack",
          "Preview screenshot langsung",
        ],
      },
      {
        heading: "Support",
        items: [
          "Upvote produk favorit",
          "Bagikan ke komunitas",
          "Review & feedback langsung",
        ],
      },
      {
        heading: "Submit",
        items: [
          "Daftarkan produkmu gratis",
          "Reach builder Indonesia",
          "Grow dengan ekosistem lokal",
        ],
      },
    ],
  },
  {
    id: "data",
    label: "Marketplace",
    accent: "#37d7c8",
    image: "/tab-onboarding.png",
    title: "Akun digital siap pakai untuk agentic coding dan AI workflow",
    description:
      "Beli API key, VPS, akun AI coding, dan GitHub Student Pack dari seller terpercaya. Semua produk dikurasi, ada garansi, dan dikirim cepat tanpa ribet setup manual.",
    stat: "Ribuan transaksi akun digital dari seller terverifikasi",
    eyebrow: "Marketplace Digital",
    primaryLinks: [
      "MiMo API Key",
      "VPS Cloud",
      "ChatGPT Plus",
      "GitHub Student Pack",
    ],
    secondaryLinks: [
      "Windsurf / DevinAI",
      "OpenAgentic Token",
      "Source Code",
      "Lihat semua",
    ],
    bulletGroups: [
      {
        heading: "Beli",
        items: [
          "Checkout langsung tanpa daftar ribet",
          "Stok realtime dari seller aktif",
          "Harga transparan, garansi jelas",
        ],
      },
      {
        heading: "Pakai",
        items: [
          "Kompatibel dengan 9router & omnirouter",
          "Tutorial pemasangan tersedia",
          "Support dari seller langsung",
        ],
      },
      {
        heading: "Jual",
        items: [
          "Daftarkan produk digitalmu",
          "Reach ribuan builder lokal",
          "Kelola stok dan pesanan mudah",
        ],
      },
    ],
  },
  {
    id: "issues",
    label: "Forum",
    accent: "#f3ba3f",
    image: "/tab-debug.png",
    title: "Komunitas builder Indonesia — diskusi, sharing, dan kolaborasi",
    description:
      "Forum untuk founder, developer, dan indie hacker lokal. Share progress, tanya strategi, cari co-founder, atau sekadar diskusi soal tools terbaru yang lagi hype.",
    stat: "Thread aktif dari ratusan builder yang shipping setiap minggu",
    eyebrow: "Komunitas Builder",
    primaryLinks: [
      "Show & Tell",
      "Diskusi SaaS",
      "AI & Tools",
      "Hire & Collab",
    ],
    secondaryLinks: [
      "Tips & Growth",
      "Open Source",
      "Fundraising",
      "Lihat semua thread",
    ],
    bulletGroups: [
      {
        heading: "Share",
        items: [
          "Post progress dan launch",
          "Dapat feedback dari sesama builder",
          "Upvote thread terbaik",
        ],
      },
      {
        heading: "Diskusi",
        items: [
          "Tanya strategi growth & monetisasi",
          "Bahas tools dan stack terbaru",
          "Thread terstruktur per kategori",
        ],
      },
      {
        heading: "Kolaborasi",
        items: [
          "Cari co-founder atau partner",
          "Post lowongan dan proyek",
          "Networking ekosistem lokal",
        ],
      },
    ],
  },
  {
    id: "rollout",
    label: "Patungan & Bursa",
    accent: "#b461f3",
    image: "/tab-rollout.png",
    title: "Patungan tools premium dan akuisisi micro-SaaS lokal",
    description:
      "Gabung patungan bareng builder lain untuk tools mahal seperti Cursor, Figma, dan Linear — bayar sebagian, pakai penuh. Atau jelajahi Bursa untuk beli dan jual produk SaaS Indonesia yang sudah jalan.",
    stat: "Ribuan builder sudah hemat lewat patungan tools bersama",
    eyebrow: "Patungan & Bursa",
    primaryLinks: [
      "Cursor Pro",
      "Windsurf Team",
      "Figma Professional",
      "Linear Team Plan",
    ],
    secondaryLinks: [
      "Lihat semua patungan",
      "Jual SaaS di Bursa",
      "Listing terkurasi",
      "Jelajahi akuisisi",
    ],
    bulletGroups: [
      {
        heading: "Patungan",
        items: [
          "Tools premium harga terjangkau",
          "Progress meter realtime",
          "Notifikasi kalau slot hampir penuh",
        ],
      },
      {
        heading: "Bursa",
        items: [
          "Listing dengan data MRR & revenue",
          "Umur domain transparan",
          "Screening awal due diligence",
        ],
      },
      {
        heading: "Jual",
        items: [
          "Submit SaaS ke Bursa",
          "Reach buyer yang serius",
          "Proses listing mudah dan cepat",
        ],
      },
    ],
  },
];

const trustLogos = ["Tokopedia", "Gojek", "Traveloka", "Bukalapak", "Kalibrr"];

const heroHighlights = [
  "Apps, tools, forum, dan marketplace dalam satu ekosistem",
  "Kurated untuk developer, founder, dan builder Indonesia",
  "Dari patungan tools sampai akuisisi micro-SaaS",
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
      AIverse
    </div>
  );
}

function Wordmark() {
  return (
    <div className="wordmark" aria-label="AIverse wordmark">
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
        AIverse
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
          <h1>Ekosistem digital Indonesia dalam satu tempat</h1>
          <p>
            AIverse adalah rumah bagi developer, indie hacker, dan founder
            Indonesia. Temukan apps terbaik, ikut diskusi komunitas, patungan
            tools premium, dan akuisisi micro-SaaS — semua di satu platform.
          </p>
          <p>
            Dari marketplace akun digital sampai bursa SaaS lokal, kami kurasi
            ekosistem yang nyata dan relevan buat builder Indonesia yang mau
            gerak cepat.
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
            <span className="trust-label">Dipakai builder dari:</span>
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
            <span className="library-kicker">Produk unggulan</span>
            <h2 id="library-title">
              Produk digital pilihan dari ekosistem AIverse
            </h2>
          </div>
          <p>
            Beberapa produk terkurasi yang sudah live dan dipakai builder
            Indonesia. Dari platform edtech sampai SaaS B2B untuk HR dan
            operasional.
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

      {/* ── Marketplace Preview ─────────────────────────────────────── */}
      <section
        style={{
          marginTop: 48,
          paddingBottom: 48,
          borderTop: "1px solid #d9d1c2",
        }}
      >
        <div className="library-copy" style={{ marginTop: 32 }}>
          <div>
            <span className="library-kicker">Marketplace</span>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0d1d38",
                margin: "6px 0 8px",
              }}
            >
              Akun digital siap pakai
            </h2>
            <p style={{ fontSize: 15, color: "#55606d", margin: 0 }}>
              API key, VPS, akun AI coding — langsung checkout tanpa setup
              ribet.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: 13, height: 34 }}
              onClick={() => navigate("/marketplace")}
            >
              Lihat semua
            </button>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
            marginTop: 24,
          }}
        >
          {[
            {
              name: "MiMo Api Key 30 USD",
              category: "MiMo",
              desc: "API key resmi Xiaomi MiMo fresh, semua model termasuk MiMo 2.5 Pro.",
              price: 20000,
              sold: 594,
            },
            {
              name: "Windsurf / DevinAI",
              category: "Windsurf / DevinAI",
              desc: "Akun Windsurf siap dipakai, kuota full untuk agentic coding harian.",
              price: 27000,
              sold: 431,
            },
            {
              name: "GitHub Student Pack",
              category: "Github Developer Pack",
              desc: "Akun GitHub Student benefit lengkap, berlaku sampai 2 tahun ke depan.",
              price: 23800,
              sold: 298,
            },
            {
              name: "ChatGPT Plus 1 Bulan",
              category: "ChatGPT",
              desc: "Akun ChatGPT Plus fresh, cocok untuk agentic coding via 9router.",
              price: 6300,
              sold: 448,
            },
          ].map((item) => (
            <article
              key={item.name}
              className="library-card"
              style={{
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
              }}
              onClick={() => navigate("/marketplace")}
            >
              <div className="library-card-hero">
                <div
                  className="library-card-screenshot-wrap"
                  style={{
                    background: "#f0ede6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="library-card-placeholder" aria-hidden="true">
                    <span className="placeholder-label">{item.name}</span>
                  </div>
                </div>
                <span
                  className="library-card-chip"
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontSize: 11,
                    padding: "2px 8px",
                  }}
                >
                  {item.category}
                </span>
              </div>
              <div className="library-card-ribbon">
                <strong>{item.name}</strong>
                <span>{item.category}</span>
              </div>
              <div
                className="library-card-meta"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  padding: "10px 12px 12px",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#55606d",
                    margin: "0 0 8px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.desc}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0d1d38",
                    margin: "0 0 4px",
                  }}
                >
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
                <p
                  style={{ fontSize: 11, color: "#7b8594", margin: "0 0 10px" }}
                >
                  Terjual {item.sold}x
                </p>
                <div style={{ marginTop: "auto" }}>
                  <button
                    type="button"
                    className="cta-button"
                    style={{ width: "100%", fontSize: 13, height: 34 }}
                  >
                    Beli sekarang
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Forum Highlights ─────────────────────────────────────────────── */}
      <section
        style={{
          marginTop: 48,
          paddingBottom: 48,
          borderTop: "1px solid #d9d1c2",
        }}
      >
        <div className="library-copy" style={{ marginTop: 32 }}>
          <div>
            <span className="library-kicker">Forum</span>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0d1d38",
                margin: "6px 0 8px",
              }}
            >
              Diskusi dari komunitas builder
            </h2>
            <p style={{ fontSize: 15, color: "#55606d", margin: 0 }}>
              Thread terbaru dari founder, developer, dan indie hacker
              Indonesia.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: 13, height: 34 }}
              onClick={() => navigate("/forum")}
            >
              Lihat semua
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 24,
          }}
        >
          {[
            {
              id: 1,
              author: "nabilfatih",
              authorInitial: "N",
              timeAgo: "2 jam lalu",
              category: "SaaS & Produk",
              flair: "Show & Tell",
              title:
                "Gua launch SaaS pertama gua setelah 3 bulan vibe coding — ini hasilnya",
              upvotes: 142,
              comments: 38,
            },
            {
              id: 2,
              author: "rizkydev",
              authorInitial: "R",
              timeAgo: "5 jam lalu",
              category: "AI & Tools",
              flair: "Diskusi",
              title:
                "Mana yang lebih worth untuk solo founder: Windsurf atau Cursor?",
              upvotes: 89,
              comments: 61,
            },
            {
              id: 3,
              author: "sarahfound",
              authorInitial: "S",
              timeAgo: "8 jam lalu",
              category: "Marketing",
              flair: "Tips",
              title:
                "Cold email ke 500 UMKM, 11 closing — ini template yang works",
              upvotes: 203,
              comments: 44,
            },
          ].map((post) => (
            <div
              key={post.id}
              onClick={() => navigate("/forum")}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: "16px",
                border: "1px solid #d9d1c2",
                borderBottomWidth: 2,
                borderRadius: 10,
                background: "#fffdf8",
                cursor: "pointer",
                boxShadow:
                  "inset 0 -3px 0 rgba(21,19,16,.09), 0 1px 3px rgba(21,19,16,.07)",
                transition: "transform 260ms cubic-bezier(.22,1,.36,1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(2px)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  minWidth: 40,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "#f0ede6",
                    border: "1px solid #d9d1c2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0d1d38",
                  }}
                >
                  {post.authorInitial}
                </div>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#0d1d38" }}
                >
                  {post.upvotes}
                </span>
                <span style={{ fontSize: 10, color: "#7b8594" }}>votes</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#f6a61e",
                      background: "rgba(246,166,30,.12)",
                      border: "1px solid rgba(246,166,30,.3)",
                      borderRadius: 4,
                      padding: "2px 7px",
                    }}
                  >
                    {post.flair}
                  </span>
                  <span
                    style={{ fontSize: 11, fontWeight: 600, color: "#7b8594" }}
                  >
                    {post.category}
                  </span>
                  <span style={{ fontSize: 11, color: "#7b8594" }}>
                    {post.timeAgo}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0d1d38",
                    margin: "0 0 6px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {post.title}
                </p>
                <span style={{ fontSize: 12, color: "#7b8594" }}>
                  {post.comments} komentar · oleh {post.author}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Patungan Teaser ──────────────────────────────────────────────── */}
      <section
        style={{
          marginTop: 48,
          paddingBottom: 48,
          borderTop: "1px solid #d9d1c2",
        }}
      >
        <div className="library-copy" style={{ marginTop: 32 }}>
          <div>
            <span className="library-kicker">Patungan</span>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0d1d38",
                margin: "6px 0 8px",
              }}
            >
              Tools premium, harga patungan
            </h2>
            <p style={{ fontSize: 15, color: "#55606d", margin: 0 }}>
              Gabung bareng builder lain, bayar sebagian, nikmatin tools kelas
              satu.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: 13, height: 34 }}
              onClick={() => navigate("/patungan")}
            >
              Ikut patungan
            </button>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
            marginTop: 24,
          }}
        >
          {[
            {
              id: 1,
              name: "Cursor Pro — 1 Bulan",
              category: "AI Coding",
              tagline:
                "Editor AI terbaik untuk vibe coding, autocomplete kontekstual + multi-file edit.",
              target: 20,
              joined: 13,
              pricePerPerson: 45000,
              deadline: "5 hari lagi",
              badge: "Hampir penuh",
              status: "open",
            },
            {
              id: 2,
              name: "Windsurf Team Plan",
              category: "AI Coding",
              tagline:
                "Cascade multi-file agent, unlimited completions, cocok buat solo founder.",
              target: 10,
              joined: 3,
              pricePerPerson: 60000,
              deadline: "10 hari lagi",
              badge: null,
              status: "open",
            },
            {
              id: 4,
              name: "Linear — Team Plan",
              category: "Produktivitas",
              tagline:
                "Issue tracker terbaik untuk indie hacker dan tim kecil. Fast, keyboard-first.",
              target: 8,
              joined: 2,
              pricePerPerson: 75000,
              deadline: "14 hari lagi",
              badge: "Baru",
              status: "open",
            },
          ].map((item) => {
            const pct = Math.round((item.joined / item.target) * 100);
            return (
              <article
                key={item.id}
                className="library-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/patungan")}
              >
                <div className="library-card-hero">
                  <div
                    className="library-card-screenshot-wrap"
                    style={{
                      background: "#f0ede6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      className="library-card-placeholder"
                      aria-hidden="true"
                    >
                      <span className="placeholder-label">{item.name}</span>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className="library-card-chip"
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        fontSize: 11,
                        padding: "2px 8px",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="library-card-ribbon">
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                </div>
                <div
                  className="library-card-meta"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    padding: "10px 12px 12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: "#55606d",
                      margin: "0 0 10px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.tagline}
                  </p>
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#55606d",
                        }}
                      >
                        {item.joined} / {item.target} orang
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#f6a61e",
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 999,
                        background: "#ede8df",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: pct + "%",
                          background: "#f6a61e",
                          borderRadius: 999,
                          transition: "width 400ms ease",
                        }}
                      />
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#0d1d38",
                      margin: "0 0 2px",
                    }}
                  >
                    Rp {item.pricePerPerson.toLocaleString("id-ID")} / orang
                  </p>
                  {item.deadline && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#7b8594",
                        margin: "0 0 10px",
                      }}
                    >
                      {item.deadline}
                    </p>
                  )}
                  <div style={{ marginTop: "auto" }}>
                    <button
                      type="button"
                      className="cta-button"
                      style={{ width: "100%", fontSize: 13, height: 34 }}
                    >
                      Ikut sekarang
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Bursa Teaser ─────────────────────────────────────────────────── */}
      <section
        style={{
          marginTop: 48,
          paddingBottom: 60,
          borderTop: "1px solid #d9d1c2",
        }}
      >
        <div className="library-copy" style={{ marginTop: 32 }}>
          <div>
            <span className="library-kicker">Bursa</span>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0d1d38",
                margin: "6px 0 8px",
              }}
            >
              Akuisisi micro-SaaS Indonesia
            </h2>
            <p style={{ fontSize: 15, color: "#55606d", margin: 0 }}>
              Listing terkurasi dengan data MRR, revenue, dan umur domain untuk
              screening awal.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: 13, height: 34 }}
              onClick={() => navigate("/bursa")}
            >
              Jelajahi listing
            </button>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
            marginTop: 24,
          }}
        >
          {[
            {
              id: 1,
              name: "HubNesia",
              tagline: "Semua Layanan Digital dalam Satu Platform",
              category: "Tools",
              status: "MVP",
              statusColor: {
                bg: "#f0f4ff",
                border: "#b8c9f5",
                color: "#2d4fa0",
              },
              price: 1200000,
              domainAge: 4,
              growth: null,
            },
            {
              id: 2,
              name: "Helipod",
              tagline:
                "Co-DevOps platform: deploy web apps, APIs & AI workloads in minutes.",
              category: "Developer Tools",
              status: "Aktif",
              statusColor: {
                bg: "#edfaf4",
                border: "#a3e4c6",
                color: "#1a6b48",
              },
              price: 300000000,
              domainAge: 2,
              growth: null,
            },
            {
              id: 3,
              name: "SanPoi Store",
              tagline:
                "Platform gaming commerce berbasis whitelabel dengan ribuan transaksi historis.",
              category: "Gaming Commerce",
              status: "Bertumbuh",
              statusColor: {
                bg: "#fff8ec",
                border: "#f5d68a",
                color: "#8a5c00",
              },
              price: 12000000,
              domainAge: 12,
              growth: "+10.0% MoM",
            },
          ].map((item) => (
            <article
              key={item.id}
              className="library-card"
              style={{
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
              }}
              onClick={() => navigate("/bursa")}
            >
              <div className="library-card-hero">
                <div
                  className="library-card-screenshot-wrap"
                  style={{
                    background: "#f0ede6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="library-card-placeholder" aria-hidden="true">
                    <span className="placeholder-label">{item.name}</span>
                  </div>
                </div>
                <span
                  className="library-card-chip"
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontSize: 11,
                    padding: "2px 8px",
                    background: item.statusColor.bg,
                    borderColor: item.statusColor.border,
                    color: item.statusColor.color,
                  }}
                >
                  {item.status}
                </span>
              </div>
              <div className="library-card-ribbon">
                <strong>{item.name}</strong>
                <span>{item.category}</span>
              </div>
              <div
                className="library-card-meta"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  padding: "10px 12px 12px",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#55606d",
                    margin: "0 0 10px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.tagline}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px 12px",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#7b8594",
                        margin: "0 0 1px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Harga jual
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#0d1d38",
                        margin: 0,
                      }}
                    >
                      Rp {(item.price / 1000000).toFixed(1)}jt
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#7b8594",
                        margin: "0 0 1px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Umur domain
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#0d1d38",
                        margin: 0,
                      }}
                    >
                      {item.domainAge} bulan
                    </p>
                  </div>
                  {item.growth && (
                    <div style={{ gridColumn: "span 2" }}>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#7b8594",
                          margin: "0 0 1px",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Pertumbuhan
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#1a6b48",
                          margin: 0,
                        }}
                      >
                        {item.growth}
                      </p>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <button
                    type="button"
                    className="cta-button"
                    style={{ width: "100%", fontSize: 13, height: 34 }}
                  >
                    Lihat detail
                  </button>
                </div>
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();

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
                to="/bansos"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Bansos AI
              </NavLink>
              <NavLink
                to="/marketplace"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Marketplace
              </NavLink>
              <NavLink
                to="/bursa"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Bursa
              </NavLink>
              <NavLink
                to="/forum"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Forum
              </NavLink>
              <NavLink
                to="/tools"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Tools
              </NavLink>
              <NavLink
                to="/patungan"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
              >
                Patungan
              </NavLink>

              {/* More dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                  style={{
                    height: 32,
                    padding: "0 10px",
                    borderRadius: 8,
                    border: "1px solid transparent",
                    background: "transparent",
                    fontSize: 16,
                    fontWeight: 600,
                    color: moreOpen ? "#0d1d38" : "#2e3137",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "inherit",
                  }}
                >
                  More
                  <svg
                    viewBox="0 0 10 6"
                    width="10"
                    height="6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{
                      opacity: 0.6,
                      transition: "transform 160ms",
                      transform: moreOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <path d="M1 1l4 4 4-4" />
                  </svg>
                </button>

                {moreOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      minWidth: 160,
                      background: "#fffdf8",
                      border: "1px solid #d9d1c2",
                      borderBottomWidth: 2,
                      borderRadius: 10,
                      boxShadow:
                        "inset 0 -3px 0 rgba(21,19,16,.09), 0 4px 16px rgba(21,19,16,.12)",
                      padding: "6px",
                      zIndex: 200,
                    }}
                  >
                    {[
                      { to: "/events", label: "Events" },
                      { to: "/jobs", label: "Jobs" },
                      { to: "/news", label: "News" },
                    ].map(({ to, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) =>
                          isActive ? "active-nav" : undefined
                        }
                        style={({ isActive }) => ({
                          display: "block",
                          padding: "8px 12px",
                          borderRadius: 7,
                          fontSize: 15,
                          fontWeight: 600,
                          color: isActive ? "#0d1d38" : "#2e3137",
                          background: isActive
                            ? "rgba(246,166,30,.12)"
                            : "transparent",
                          textDecoration: "none",
                        })}
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
          <div className="topbar-right">
            {!authLoading &&
              (user ? (
                <button
                  type="button"
                  className="ghost-button topbar-cta"
                  onClick={() => signOut()}
                  style={{ height: 38, borderRadius: 9, fontSize: 14 }}
                >
                  Keluar
                </button>
              ) : (
                <button
                  type="button"
                  className="cta-button topbar-cta"
                  onClick={() => setAuthOpen(true)}
                  style={{ height: 38, borderRadius: 9 }}
                >
                  Masuk
                </button>
              ))}
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
                to="/bansos"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Bansos AI
              </NavLink>

              <NavLink
                to="/marketplace"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Marketplace
              </NavLink>
              <NavLink
                to="/bursa"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Bursa
              </NavLink>
              <NavLink
                to="/forum"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Forum
              </NavLink>
              <NavLink
                to="/tools"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Tools
              </NavLink>
              <NavLink
                to="/patungan"
                className={({ isActive }) =>
                  isActive ? "active-nav" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                Patungan
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

          {/* Bansos AI */}
          <Route
            path="/bansos"
            element={
              <main className="content content-wide">
                <PerksPage />
              </main>
            }
          />

          {/* Patungan */}
          <Route
            path="/patungan"
            element={
              <main className="content content-wide">
                <PatunganPage />
              </main>
            }
          />

          {/* Tools index */}
          <Route
            path="/tools"
            element={
              <main className="content content-wide">
                <ToolsPage />
              </main>
            }
          />

          {/* Forum */}
          <Route
            path="/forum"
            element={
              <main className="content content-wide">
                <ForumPage />
              </main>
            }
          />

          {/* Events */}
          <Route
            path="/events"
            element={
              <main className="content content-wide">
                <EventsPage />
              </main>
            }
          />

          {/* Jobs */}
          <Route
            path="/jobs"
            element={
              <main className="content content-wide">
                <JobsPage />
              </main>
            }
          />

          {/* Bursa */}
          <Route
            path="/bursa"
            element={
              <main className="content content-wide">
                <BursaPage />
              </main>
            }
          />

          {/* Marketplace */}
          <Route
            path="/marketplace"
            element={
              <main className="content content-wide">
                <MarketplacePage />
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

      {/* Auth Modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
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
