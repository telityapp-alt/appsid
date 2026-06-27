import React, { useState } from "react";
import { Link } from "react-router-dom";

export const newsArticles = [
  {
    id: "series-a-funding",
    slug: "series-a-funding",
    category: "Company",
    title: "Apphunt secures $12M Series A to scale product analytics",
    excerpt: "We're thrilled to announce our latest funding round led by Sequoia Capital, enabling us to bring enterprise-grade tooling to early-stage startups.",
    date: "June 25, 2026",
    author: "Nabil Hasan",
    readTime: "5 min read",
    image: "/news-hero-art.png",
    content: [
      {
        type: "lead",
        text: "It's official: Apphunt has raised $12M in Series A funding. This milestone isn't just about capital—it's about validation from the industry that the way startups build and measure products needs to change.",
      },
      {
        type: "p",
        text: "Since our launch, we've seen incredible adoption from builders who were frustrated by the complexity of legacy analytics platforms. We set out to build a tool that felt native, lightning-fast, and deeply integrated with modern development workflows. This new capital allows us to accelerate that vision.",
      },
      {
        type: "h2",
        text: "What this means for our customers",
      },
      {
        type: "p",
        text: "With this new capital, we are quadrupling down on our core analytics engine. Expect faster queries, more intuitive dashboarding, and a completely revamped alerting system rolling out over the next quarter.",
      },
      {
        type: "p",
        text: "We're also expanding our engineering and design teams. If you're passionate about building tools for builders, we'd love to hear from you.",
      }
    ]
  },
  {
    id: "new-feature-rollout",
    slug: "new-feature-rollout",
    category: "Product",
    title: "Introducing Feature Flags: Ship with confidence",
    excerpt: "Control your releases, test in production, and decouple deployment from release with our new Feature Flags suite.",
    date: "June 22, 2026",
    author: "Sarah Jenks",
    readTime: "3 min read",
    image: "/lib-launch-deck.png",
    content: [
      {
        type: "lead",
        text: "Feature flags are now in open beta for all users on the Pro and Enterprise plans.",
      },
      {
        type: "p",
        text: "Releasing software shouldn't be a nerve-wracking event. By decoupling deployment from release, teams can safely push code to production and gradually turn on features for specific user segments.",
      },
      {
        type: "h2",
        text: "Targeting capabilities",
      },
      {
        type: "p",
        text: "Our new suite allows you to target users based on location, device type, subscription tier, or any custom attribute you send to Apphunt. You can run percentage-based rollouts and seamlessly connect flag evaluations to your core analytics metrics to measure feature impact in real-time.",
      }
    ]
  },
  {
    id: "community-meetup",
    slug: "community-meetup",
    category: "Community",
    title: "Apphunt Community Meetup: Jakarta 2026",
    excerpt: "Join us this August in Jakarta for our first-ever community meetup. Network with fellow founders, share war stories, and get an exclusive preview of our Q4 roadmap.",
    date: "June 18, 2026",
    author: "Community Team",
    readTime: "2 min read",
    image: "/lib-signal-board.png",
    content: [
      {
        type: "lead",
        text: "We are coming to Jakarta! Our vibrant Southeast Asian community has been asking for an in-person event, and we're finally making it happen.",
      },
      {
        type: "p",
        text: "The meetup will feature talks from our engineering team, a fireside chat with local startup founders who have scaled using Apphunt, and plenty of time for networking.",
      },
      {
        type: "h2",
        text: "Event Details",
      },
      {
        type: "p",
        text: "Date: August 15, 2026\nLocation: Sudirman Central Business District (SCBD), Jakarta\nRegistration opens next week. Keep an eye on your inbox!",
      }
    ]
  },
  {
    id: "soc2-compliance",
    slug: "soc2-compliance",
    category: "Company",
    title: "Apphunt achieves SOC 2 Type II Compliance",
    excerpt: "Security and trust are foundational to our platform. We are proud to announce that we have successfully completed our SOC 2 Type II audit.",
    date: "June 10, 2026",
    author: "Security Team",
    readTime: "2 min read",
    image: "/lib-warehouse-one.png",
    content: [
      {
        type: "lead",
        text: "Protecting your data is our highest priority. Today, we're sharing a major milestone in our security program: Apphunt is now officially SOC 2 Type II compliant.",
      },
      {
        type: "p",
        text: "This independent validation confirms that our information security practices, policies, procedures, and operations meet the rigorous SOC 2 standards for security, availability, and confidentiality.",
      },
      {
        type: "p",
        text: "Enterprise customers can request a copy of our latest report through their account manager or our Trust Center.",
      }
    ]
  },
  {
    id: "engineering-v2",
    slug: "engineering-v2",
    category: "Engineering",
    title: "How we rebuilt our data ingestion pipeline",
    excerpt: "A deep dive into our migration to Rust and Kafka, resulting in a 10x throughput increase and reduced latency.",
    date: "May 28, 2026",
    author: "Backend Team",
    readTime: "8 min read",
    image: "/news-card-docker-art.png",
    content: [
      {
        type: "lead",
        text: "Scaling data ingestion is hard. This post explains how we handled hypergrowth by rewriting our core pipeline.",
      }
    ]
  },
  {
    id: "design-system",
    slug: "design-system",
    category: "Design",
    title: "The making of our Retro-Clean design system",
    excerpt: "Exploring the typography, colors, and shadow physics that power the Apphunt interface.",
    date: "May 15, 2026",
    author: "Design Team",
    readTime: "6 min read",
    image: "/news-card-sdk-art.png",
    content: [
      {
        type: "lead",
        text: "Why we chose a brutalist yet elegant aesthetic for a data product.",
      }
    ]
  }
];

const categories = ["All", "Product", "Company", "Community", "Engineering", "Design"];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-inline">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M15 15l4 4" strokeLinecap="round" />
    </svg>
  );
}

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredArticles = newsArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="news-gallery-page" style={{ maxWidth: '100%' }}>
      <section className="perks-hero-panel" style={{ marginBottom: "60px" }}>
        <div className="perks-hero-copy">
          <span className="perks-hero-eyebrow">Latest News</span>
          <h2>
            Product updates, company announcements, and community highlights.
          </h2>
          <p>
            Stay up to date with the latest from the Apphunt team and our global
            community of product makers.
          </p>
        </div>
      </section>

      <section className="news-page-layout">
        {/* Left Sidebar: Categories/Tags */}
        <aside className="apps-left-sidebar">
          <h3 className="left-sidebar-title">Categories</h3>
          <div className="tags-list">
            {categories.map((cat) => (
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

        {/* Main Feed: Search & Grid */}
        <div className="apps-main-feed">
          <div
            className="mobile-category-bar"
            role="navigation"
            aria-label="Filter by category"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                className={`mini-tag-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="apps-toolbar">
            <div className="search-bar-wrap">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search articles..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="news-gallery-grid">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/news/${article.slug}`}
                  className="library-card"
                  style={{ textDecoration: "none", color: "inherit", cursor: "pointer", display: "flex", flexDirection: "column" }}
                >
                  <div className="library-card-hero">
                    <div className="library-card-screenshot-wrap">
                      <img
                        src={article.image}
                        alt={`${article.title} thumbnail`}
                        className="library-card-screenshot"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling.style.display = "flex";
                        }}
                      />
                      <div className="library-card-placeholder" aria-hidden="true">
                        <span className="placeholder-label">{article.title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="library-card-ribbon">
                    <strong>{article.title}</strong>
                    <span>{article.category}</span>
                  </div>

                  <div className="library-card-meta">
                    <p>{article.excerpt}</p>
                    <div className="library-card-chip">{article.date}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <p>No articles found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
