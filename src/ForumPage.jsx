import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useForumPosts } from "./hooks/useForumPosts";
import { PostCard } from "./components/forum/PostCard";
import { CreatePostModal } from "./components/forum/CreatePostModal";
import { TermsGate } from "./components/forum/TermsGate";

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Semua",
  "General",
  "SaaS & Produk",
  "AI & Tools",
  "Developer",
  "Marketing",
  "Fundraising",
  "Hire & Collab",
];

const TAGS = [
  "micro-saas",
  "mvp",
  "open source",
  "vibe coding",
  "monetisasi",
  "landing page",
  "nextjs",
  "python",
  "growth",
  "bootstrap",
  "b2b",
  "ai agent",
];

const SORT_OPTIONS = [
  { label: "Terbaru", value: "terbaru" },
  { label: "Trending", value: "trending" },
  { label: "Top", value: "top" },
];

// ─── Skeleton loader ────────────────────────────────────────────────────────

function PostCardSkeleton() {
  const pulse = {
    background: "linear-gradient(90deg,#f0ede8 25%,#e5ddd0 50%,#f0ede8 75%)",
    backgroundSize: "200% 100%",
    animation: "forum-pulse 1.4s ease-in-out infinite",
    borderRadius: 5,
  };
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 10,
        border: "1px solid #d9d1c2",
        borderBottomWidth: 2,
        background: "#fffdf8",
      }}
    >
      <div
        style={{
          ...pulse,
          width: 40,
          height: 56,
          borderRadius: 8,
          flexShrink: 0,
        }}
      />
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{ ...pulse, width: 22, height: 22, borderRadius: "50%" }}
          />
          <div style={{ ...pulse, width: 80, height: 12, marginTop: 5 }} />
          <div style={{ ...pulse, width: 50, height: 12, marginTop: 5 }} />
        </div>
        <div style={{ ...pulse, width: "75%", height: 16 }} />
        <div style={{ ...pulse, width: "95%", height: 12 }} />
        <div style={{ ...pulse, width: "60%", height: 12 }} />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ForumPage() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeTag, setActiveTag] = useState(null);
  const [activeSort, setActiveSort] = useState("terbaru");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTermsGate, setShowTermsGate] = useState(false);

  // Debounce search 300ms
  const debounceRef = useRef(null);
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const { posts, loading, error, hasMore, loadMore, refresh } = useForumPosts({
    category: activeCategory,
    tags: activeTag ? [activeTag] : [],
    sort: activeSort,
    search: debouncedSearch,
    pageSize: 20,
  });

  function handleCreatePost() {
    if (!user) {
      openAuthModal();
      return;
    }
    setShowCreateModal(true);
  }

  function handleNeedsTerms() {
    setShowCreateModal(false);
    setShowTermsGate(true);
  }

  function handlePostCreated(postId) {
    setShowCreateModal(false);
    navigate(`/forum/${postId}`);
  }

  function handleTagClick(tag) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  function handleCategoryClick(cat) {
    setActiveCategory(cat || "Semua");
  }

  return (
    <>
      <style>{`
        @keyframes forum-pulse {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .mini-tag-btn {
          display: inline-flex; align-items: center;
          height: 28px; padding: 0 12px; border-radius: 20px;
          border: 1px solid #d9d1c2; background: transparent;
          color: #55606d; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 120ms ease; white-space: nowrap;
          font-family: inherit;
        }
        .mini-tag-btn:hover { border-color: #0d1d38; color: #0d1d38; background: #f5f2ec; }
        .mini-tag-btn.active { background: #0d1d38; color: #fffdf8; border-color: #0d1d38; }
        .tags-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .hero-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: #c8c2b8; display: inline-block; flex-shrink: 0;
        }
      `}</style>

      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 60px" }}
      >
        {/* ── Page header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 4px",
                fontSize: 22,
                fontWeight: 900,
                color: "#0d1d38",
                letterSpacing: "-0.02em",
              }}
            >
              Forum
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#7b8594" }}>
              Diskusi, sharing, dan kolaborasi untuk builder Indonesia
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreatePost}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              height: 38,
              padding: "0 18px",
              borderRadius: 8,
              background: "#f6a61e",
              border: "none",
              boxShadow: "inset 0 -2px 0 rgba(21,19,16,.18)",
              color: "#1a1208",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              transition: "background 120ms, transform 80ms",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e09518")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f6a61e")}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              style={{ width: 13, height: 13 }}
            >
              <path d="M7 1v12M1 7h12" />
            </svg>
            Buat postingan
          </button>
        </div>

        {/* ── Search ── */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="#7b8594"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              pointerEvents: "none",
            }}
          >
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10 10l3 3" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari postingan..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 38,
              paddingLeft: 34,
              paddingRight: 12,
              borderRadius: 8,
              border: "1px solid #d9d1c2",
              background: "#faf8f4",
              fontSize: 13,
              color: "#0d1d38",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 120ms",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c7820e")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#d9d1c2")}
          />
        </div>

        {/* ── Body: sidebar + feed ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ── Sidebar ── */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              position: "sticky",
              top: 16,
            }}
          >
            {/* Categories */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#55606d",
                  margin: "0 0 8px",
                  letterSpacing: "-0.01em",
                }}
              >
                Kategori
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`mini-tag-btn${activeCategory === cat ? " active" : ""}`}
                    style={{
                      justifyContent: "flex-start",
                      borderRadius: 7,
                      paddingLeft: 10,
                    }}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#55606d",
                  margin: "0 0 8px",
                  letterSpacing: "-0.01em",
                }}
              >
                Tag populer
              </p>
              <div className="tags-list">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`mini-tag-btn${activeTag === tag ? " active" : ""}`}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Panduan singkat */}
            <div
              style={{
                padding: "12px 14px",
                border: "1px solid #d9d1c2",
                borderBottomWidth: 2,
                borderRadius: 10,
                background: "#fffdf8",
                boxShadow: "inset 0 -2px 0 rgba(21,19,16,.07)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#0d1d38",
                  margin: "0 0 6px",
                }}
              >
                Panduan forum
              </p>
              {[
                "Judul yang jelas dan spesifik",
                "Satu topik per postingan",
                "Tidak ada spam atau self-promo berlebihan",
                "Berikan konteks yang cukup",
              ].map((rule) => (
                <p
                  key={rule}
                  style={{
                    fontSize: 11,
                    color: "#55606d",
                    margin: "0 0 4px",
                    lineHeight: 1.5,
                    display: "flex",
                    gap: 5,
                  }}
                >
                  <span
                    style={{ color: "#f6a61e", fontWeight: 800, flexShrink: 0 }}
                  >
                    ·
                  </span>
                  {rule}
                </p>
              ))}
            </div>
          </aside>

          {/* ── Feed ── */}
          <main>
            {/* Sort bar + active filters */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {/* Active filter chips */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#55606d",
                  flexWrap: "wrap",
                }}
              >
                {activeCategory !== "Semua" && (
                  <>
                    <span className="hero-dot" />
                    <span style={{ fontWeight: 600 }}>{activeCategory}</span>
                  </>
                )}
                {activeTag && (
                  <>
                    <span className="hero-dot" />
                    <span
                      style={{
                        height: 22,
                        padding: "0 8px",
                        borderRadius: 5,
                        border: "1px solid #c7820e",
                        background: "#fff8ec",
                        color: "#8a5c00",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      #{activeTag}
                      <button
                        type="button"
                        onClick={() => setActiveTag(null)}
                        aria-label="Hapus filter tag"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: "inherit",
                          fontWeight: 800,
                          fontSize: 12,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  </>
                )}
                {debouncedSearch && (
                  <>
                    <span className="hero-dot" />
                    <span
                      style={{
                        fontSize: 12,
                        fontStyle: "italic",
                        color: "#7b8594",
                      }}
                    >
                      "{debouncedSearch}"
                    </span>
                  </>
                )}
              </div>

              {/* Sort pills */}
              <div style={{ display: "flex", gap: 5 }}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`mini-tag-btn${activeSort === opt.value ? " active" : ""}`}
                    onClick={() => setActiveSort(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: 10,
                  marginBottom: 12,
                  background: "#fef2f2",
                  border: "1px solid #f5b8b8",
                  fontSize: 13,
                  color: "#a03030",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={refresh}
                  style={{
                    background: "#a03030",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* Post list */}
            <div style={{ display: "grid", gap: 10 }}>
              {/* Loading skeletons */}
              {loading &&
                posts.length === 0 &&
                [1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}

              {/* Posts */}
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onTagClick={handleTagClick}
                  onCategoryClick={handleCategoryClick}
                />
              ))}

              {/* Empty state */}
              {!loading && !error && posts.length === 0 && (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    border: "1px dashed #d9d1c2",
                    borderRadius: 12,
                    background: "#fffdf8",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#0d1d38",
                    }}
                  >
                    {debouncedSearch || activeTag || activeCategory !== "Semua"
                      ? "Tidak ada postingan yang sesuai filter"
                      : "Belum ada postingan"}
                  </p>
                  <p
                    style={{
                      margin: "0 0 18px",
                      fontSize: 13,
                      color: "#7b8594",
                    }}
                  >
                    {debouncedSearch || activeTag || activeCategory !== "Semua"
                      ? "Coba ubah filter atau kata kunci pencarian."
                      : "Jadilah yang pertama memulai diskusi!"}
                  </p>
                  <button
                    type="button"
                    onClick={handleCreatePost}
                    style={{
                      background: "#f6a61e",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 20px",
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#1a1208",
                      cursor: "pointer",
                      boxShadow: "inset 0 -2px 0 rgba(21,19,16,.15)",
                    }}
                  >
                    Buat postingan pertama
                  </button>
                </div>
              )}
            </div>

            {/* Load more */}
            {hasMore && !loading && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  type="button"
                  onClick={loadMore}
                  style={{
                    background: "#fffdf8",
                    border: "1px solid #d9d1c2",
                    borderBottomWidth: 2,
                    borderRadius: 8,
                    padding: "9px 24px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0d1d38",
                    cursor: "pointer",
                    transition: "background 120ms",
                    boxShadow: "inset 0 -2px 0 rgba(21,19,16,.07)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f5f2ec")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#fffdf8")
                  }
                >
                  Muat lebih banyak
                </button>
              </div>
            )}

            {/* Loading more indicator */}
            {loading && posts.length > 0 && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: "#7b8594",
                  fontSize: 13,
                }}
              >
                Memuat...
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Terms gate — shown when user hasn't accepted community rules yet */}
      {showTermsGate && (
        <TermsGate
          onAccepted={() => {
            setShowTermsGate(false);
            setShowCreateModal(true);
          }}
          onClose={() => setShowTermsGate(false)}
        />
      )}

      {/* Create post modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePostCreated}
          onNeedsTerms={handleNeedsTerms}
        />
      )}
    </>
  );
}
