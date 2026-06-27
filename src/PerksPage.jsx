import React, { useState } from "react";
import PerksDetailPopover from "./PerksDetailPopover";

const newsFaq = [
  {
    title: "What is this?",
    body: "Builders for Startups membantu founder dan tim kecil merancang produk yang lebih matang sejak hari pertama, lengkap dengan kredit software, partner perks, dan support implementasi.",
    bullets: [
      "Untuk startup tahap awal",
      "Fokus product-led teams",
      "Benefit bisa dipakai lintas stack",
    ],
  },
  {
    title: "How to apply",
    body: "Daftar akun, ceritakan produk yang sedang dibangun, lalu pilih area bantuan yang paling dibutuhkan supaya tim kami bisa menilai kecocokan program dengan cepat.",
    bullets: [
      "Buat akun Builders",
      "Isi startup profile",
      "Tunggu review via email",
    ],
  },
  {
    title: "Who is eligible?",
    body: "Program ini cocok untuk startup muda yang masih dalam fase membangun fondasi produk dan butuh leverage lebih cepat untuk shipping.",
    bullets: [
      "Usia startup di bawah 2 tahun",
      "Pendanaan di bawah $5 juta",
      "Tim masih lean dan builder-heavy",
    ],
  },
  {
    title: "Fine print",
    body: "Beberapa benefit punya masa aktif dan ketentuan partner masing-masing. Semua detail tetap transparan dari awal sebelum Anda claim benefit.",
    bullets: [
      "Kredit berlaku 12 bulan",
      "Tidak bisa digabung semua promo",
      "Subject to partner approval",
    ],
  },
];

const benefitCards = [
  {
    id: "cash",
    eyebrow: "Funding Fuel",
    title: "$50,000 product credits",
    desc: "Dipakai untuk event volume besar, insight board, support tooling, dan observability tanpa bikin burn rate ngaco.",
    chips: ["Credits", "12 months"],
    image: "/news-card-cash-art.png",
    author: "Nabil Hasan",
    authorRole: "Product Lead",
    date: "June 20, 2025",
    readTime: "4 min read",
    category: "Startup Program",
    tags: ["Credits", "Startup", "Product"],
    content: [
      {
        type: "lead",
        text: "Kami memberikan $50,000 kredit produk langsung ke tangan founder — bukan janji, bukan syarat tersembunyi. Kredit ini dirancang untuk menutup gap antara ide dan ship.",
      },
      {
        type: "h2",
        text: "Kenapa $50k, bukan lebih kecil?",
      },
      {
        type: "p",
        text: "Startup tahap awal sering stuck di observability dan tooling bukan karena malas, tapi karena budget habis sebelum MVP selesai. Angka $50k dipilih supaya cukup untuk satu siklus launch penuh tanpa harus kompromi di tools penting.",
      },
      {
        type: "quote",
        text: "Kredit ini bukan subsidi — ini akselerator. Tim yang pakai dengan benar bisa ship 3x lebih cepat di bulan pertama.",
        attribution: "Tim Builders",
      },
      {
        type: "h2",
        text: "Apa saja yang bisa dicover?",
      },
      {
        type: "list",
        heading: "Kredit berlaku untuk:",
        items: [
          "Event pipeline dan volume analytics besar",
          "Insight board dan dashboard real-time",
          "Support tooling dan observability stack",
          "Testing infrastructure dan load simulation",
          "Data ingestion dan transformation layer",
        ],
      },
      {
        type: "callout",
        text: "Kredit otomatis aktif setelah approval — tidak perlu konfigurasi billing manual.",
      },
      {
        type: "kv",
        rows: [
          { label: "Nilai kredit", value: "$50,000 USD" },
          { label: "Masa aktif", value: "12 bulan" },
          { label: "Dapat digabung", value: "Dengan partner perks lain" },
          { label: "Syarat utama", value: "Startup < 2 tahun, funding < $5M" },
        ],
      },
    ],
  },
  {
    id: "merch",
    eyebrow: "Founder Energy",
    title: "$1,500 team swag",
    desc: "Starter pack buat bikin tim kecil terasa seperti movement: tees, stickers, launch packs, dan conference extras.",
    chips: ["Swag", "Team kit"],
    image: "/news-card-merch-art.png",
    author: "Nabil Hasan",
    authorRole: "Brand Lead",
    date: "June 18, 2025",
    readTime: "2 min read",
    category: "Startup Program",
    tags: ["Swag", "Brand", "Team"],
    content: [
      {
        type: "lead",
        text: "Brand bukan soal logo di website. Brand adalah rasa yang dirasakan tim kamu setiap pagi waktu buka laptop. $1,500 merch pack ini buat momen itu terasa nyata.",
      },
      {
        type: "h2",
        text: "Isi starter pack",
      },
      {
        type: "list",
        items: [
          "Tees premium dengan print tahan lama",
          "Sticker sheet edisi founder",
          "Launch day kit untuk event dan demo",
          "Conference extras: lanyard, badge holder, notebook",
          "Custom packaging dengan nama startup",
        ],
      },
      {
        type: "callout",
        text: "Desain bisa dikustomisasi dengan logo startup kamu — tim kami bantu prosesnya.",
      },
      {
        type: "kv",
        rows: [
          { label: "Nilai", value: "$1,500 USD" },
          { label: "Pengiriman", value: "Worldwide" },
          { label: "Lead time", value: "2–3 minggu setelah approval" },
        ],
      },
    ],
  },
  {
    id: "status",
    eyebrow: "Reliability",
    title: "$1,500 incident support",
    desc: "Kalau ada chaos saat launch, Anda dapat room bernapas lebih besar buat tooling incident dan ritual operasionalnya.",
    chips: ["Incident", "Ops"],
    image: "/news-card-status-art.png",
    author: "Nabil Hasan",
    authorRole: "Ops Lead",
    date: "June 15, 2025",
    readTime: "3 min read",
    category: "Startup Program",
    tags: ["Incident", "Reliability", "Ops"],
    content: [
      {
        type: "lead",
        text: "Launch day chaos adalah realita. Status page down, alert storm, pagerduty nonstop — $1,500 incident support ini buat kamu punya runway lebih panjang buat handle semua itu tanpa panik soal cost.",
      },
      {
        type: "h2",
        text: "Apa yang dicakup?",
      },
      {
        type: "list",
        items: [
          "Status page hosting dan custom domain",
          "On-call tooling dan alert routing",
          "Incident timeline dan post-mortem tooling",
          "Integration dengan PagerDuty, OpsGenie, dll",
        ],
      },
      {
        type: "quote",
        text: "Bukan soal kalau incident terjadi — tapi seberapa cepat kamu recover dan belajar dari itu.",
        attribution: "Builders SRE Team",
      },
      {
        type: "kv",
        rows: [
          { label: "Nilai", value: "$1,500 USD" },
          { label: "Masa aktif", value: "12 bulan" },
          { label: "Tipe support", value: "Tooling credit" },
        ],
      },
    ],
  },
  {
    id: "sdk",
    eyebrow: "Build Faster",
    title: "50% off SDK workflows",
    desc: "Percepat API docs, client generation, dan setup integration supaya engineer fokus ke problem inti, bukan plumbing.",
    chips: ["SDK", "Automation"],
    image: "/news-card-sdk-art.png",
    author: "Nabil Hasan",
    authorRole: "DX Lead",
    date: "June 12, 2025",
    readTime: "3 min read",
    category: "Startup Program",
    tags: ["SDK", "DX", "Automation"],
    content: [
      {
        type: "lead",
        text: "50% diskon untuk SDK workflows berarti engineer kamu bisa generate client library, API docs, dan integration scaffolding dengan setengah budget — dan double kecepatan.",
      },
      {
        type: "h2",
        text: "Apa yang termasuk?",
      },
      {
        type: "list",
        items: [
          "Automated API docs generation",
          "Client SDK generation (TypeScript, Python, Go)",
          "Integration scaffolding templates",
          "Webhook setup dan testing tooling",
          "OpenAPI spec validation",
        ],
      },
      {
        type: "callout",
        text: "Tim yang pakai SDK workflows rata-rata hemat 8 jam per sprint dari setup manual.",
      },
      {
        type: "kv",
        rows: [
          { label: "Diskon", value: "50% selama 12 bulan" },
          { label: "Berlaku untuk", value: "Semua SDK workflow tiers" },
          { label: "Syarat", value: "Startup eligible program" },
        ],
      },
    ],
  },
  {
    id: "search",
    eyebrow: "AI Search",
    title: "$5,000 search infra credit",
    desc: "Untuk tim yang bangun experience AI, credit ini bantu ngetes retrieval, ranking, dan query scale tanpa takut mahal di awal.",
    chips: ["Search", "AI stack"],
    image: "/news-card-search-art.png",
    author: "Nabil Hasan",
    authorRole: "AI Lead",
    date: "June 10, 2025",
    readTime: "4 min read",
    category: "Startup Program",
    tags: ["AI", "Search", "Infrastructure"],
    content: [
      {
        type: "lead",
        text: "$5,000 search infra credit untuk tim yang serius bangun AI-powered experience. Cukup untuk ngetes retrieval pipeline, ranking tuning, dan query scale — sebelum revenue kamu bisa nutupin cost-nya.",
      },
      {
        type: "h2",
        text: "Kenapa search infra itu mahal di awal?",
      },
      {
        type: "p",
        text: "Vector database, embedding generation, dan re-ranking pipeline punya cost yang tidak linear. Startup sering underestimate biaya scaling dari 1K ke 100K documents. Credit ini buat kamu punya runway eksperimen yang cukup panjang.",
      },
      {
        type: "list",
        heading: "Use cases yang bisa dicakup:",
        items: [
          "Semantic search dan hybrid retrieval",
          "RAG (Retrieval-Augmented Generation) pipeline",
          "Query ranking dan relevance tuning",
          "Embedding model evaluation",
          "Multi-tenant search architecture",
        ],
      },
      {
        type: "callout",
        text: "Credit ini juga bisa dipakai untuk vector database storage dan embedding API calls.",
      },
      {
        type: "kv",
        rows: [
          { label: "Nilai kredit", value: "$5,000 USD" },
          { label: "Masa aktif", value: "12 bulan" },
          { label: "Stack support", value: "Pinecone, Weaviate, Qdrant, dll" },
        ],
      },
    ],
  },
  {
    id: "docker",
    eyebrow: "Infra Boost",
    title: "$5,000 build pipeline credit",
    desc: "Remote caching, container acceleration, dan pipeline lebih ngebut buat tim yang push berkali-kali sehari.",
    chips: ["Docker", "CI/CD"],
    image: "/news-card-docker-art.png",
    author: "Nabil Hasan",
    authorRole: "Infra Lead",
    date: "June 8, 2025",
    readTime: "3 min read",
    category: "Startup Program",
    tags: ["Docker", "CI/CD", "Build"],
    content: [
      {
        type: "lead",
        text: "Tim yang push 20x sehari tidak boleh nunggu build 15 menit. $5,000 build pipeline credit ini untuk remote caching, container layer optimization, dan CI yang terasa instant.",
      },
      {
        type: "h2",
        text: "Yang bisa kamu percepat",
      },
      {
        type: "list",
        items: [
          "Remote build cache dengan hit rate >80%",
          "Docker layer caching dan multi-stage optimization",
          "Parallel test runner configuration",
          "Container registry dengan smart pull policy",
          "Build artifact storage dan retention",
        ],
      },
      {
        type: "quote",
        text: "Build time turun dari 14 menit ke 2 menit setelah aktifkan remote caching. Literally game changer untuk velocity.",
        attribution: "Founder, YC W24",
      },
      {
        type: "callout",
        text: "Setup bisa selesai dalam 30 menit — tim kami provide runbook dan support onboarding.",
      },
      {
        type: "kv",
        rows: [
          { label: "Nilai kredit", value: "$5,000 USD" },
          { label: "Masa aktif", value: "12 bulan" },
          { label: "Compatible", value: "GitHub Actions, CircleCI, GitLab CI" },
          { label: "Setup time", value: "< 30 menit" },
        ],
      },
    ],
  },
];

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

  // Collect all unique tags from benefitCards as categories
  const categories = React.useMemo(() => {
    const tagSet = new Set(["All"]);
    benefitCards.forEach((card) => card.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, []);

  const filteredCards = React.useMemo(() => {
    if (activeCategory === "All") return benefitCards;
    return benefitCards.filter((card) => card.tags?.includes(activeCategory));
  }, [activeCategory]);

  return (
    <section className="perks-page" aria-labelledby="perks-page-title">
      <div className="perks-header-row">
        <div>
          <span className="library-kicker">News</span>
          <h1 id="perks-page-title">Builders for startups</h1>
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
                visualnya tetap pakai bahasa Builders: hangat, retro-clean,
                tegas di border, dan playful di aksen.
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
