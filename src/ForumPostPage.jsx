/**
 * ForumPostPage
 *
 * Route: /forum/:postId
 *
 * Fetches a single post + comments via useForumPost.
 * Renders PostDetail component.
 * Handles 404, deleted posts, and loading/error states.
 */

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForumPost } from "./hooks/useForumPost";
import { PostDetail } from "./components/forum/PostDetail";

// Skeleton loader for post detail
function PostDetailSkeleton() {
  const pulse = {
    background: "linear-gradient(90deg, #f0ede8 25%, #e5ddd0 50%, #f0ede8 75%)",
    backgroundSize: "200% 100%",
    animation: "forum-skeleton-pulse 1.4s ease-in-out infinite",
    borderRadius: 6,
  };

  return (
    <>
      <style>{`
        @keyframes forum-skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        style={{
          background: "#fffdf8",
          border: "1px solid #d9d1c2",
          borderBottomWidth: 2,
          borderRadius: 14,
          padding: "24px 24px",
        }}
      >
        {/* Breadcrumb skeleton */}
        <div style={{ ...pulse, height: 12, width: 220, marginBottom: 18 }} />
        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div
            style={{ ...pulse, width: 30, height: 30, borderRadius: "50%" }}
          />
          <div style={{ ...pulse, width: 80, height: 12 }} />
          <div style={{ ...pulse, width: 60, height: 12 }} />
        </div>
        {/* Title */}
        <div style={{ ...pulse, height: 28, width: "80%", marginBottom: 10 }} />
        <div style={{ ...pulse, height: 28, width: "50%", marginBottom: 20 }} />
        {/* Body */}
        {[100, 95, 88, 72, 60].map((w, i) => (
          <div
            key={i}
            style={{ ...pulse, height: 14, width: `${w}%`, marginBottom: 8 }}
          />
        ))}
        <div style={{ ...pulse, height: 14, width: "40%", marginBottom: 24 }} />
        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            paddingTop: 16,
            borderTop: "1px solid #f0ede8",
          }}
        >
          <div style={{ ...pulse, height: 32, width: 90, borderRadius: 8 }} />
          <div style={{ ...pulse, height: 32, width: 80, borderRadius: 8 }} />
          <div style={{ ...pulse, height: 32, width: 70, borderRadius: 8 }} />
        </div>
      </div>
    </>
  );
}

export default function ForumPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { post, comments, loading, error, refresh } = useForumPost(postId);

  // Set document title
  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} — Forum Appverse`;
    } else {
      document.title = "Forum — Appverse";
    }
    return () => {
      document.title = "Appverse ID";
    };
  }, [post?.title]);

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "24px 16px 60px",
      }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "#7b8594",
          padding: "0 0 16px",
          transition: "color 120ms",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0d1d38")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#7b8594")}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 14, height: 14 }}
        >
          <path d="M10 3L5 8l5 5" />
        </svg>
        Kembali ke Forum
      </button>

      {/* Loading */}
      {loading && <PostDetailSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#fffdf8",
            border: "1px solid #d9d1c2",
            borderRadius: 14,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 16,
              fontWeight: 700,
              color: "#0d1d38",
            }}
          >
            {error}
          </p>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#7b8594" }}>
            Coba muat ulang halaman atau kembali ke feed.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button
              type="button"
              onClick={refresh}
              style={{
                background: "#0d1d38",
                color: "#fffdf8",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Coba lagi
            </button>
            <button
              type="button"
              onClick={() => navigate("/forum")}
              style={{
                background: "none",
                border: "1px solid #d9d1c2",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 600,
                color: "#55606d",
                cursor: "pointer",
              }}
            >
              Ke Forum
            </button>
          </div>
        </div>
      )}

      {/* Post tidak ditemukan (no error but no post) */}
      {!loading && !error && !post && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#fffdf8",
            border: "1px solid #d9d1c2",
            borderRadius: 14,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 16,
              fontWeight: 700,
              color: "#0d1d38",
            }}
          >
            Post tidak ditemukan
          </p>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#7b8594" }}>
            Post ini mungkin sudah dihapus atau link-nya salah.
          </p>
          <button
            type="button"
            onClick={() => navigate("/forum")}
            style={{
              background: "#0d1d38",
              color: "#fffdf8",
              border: "none",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Kembali ke Forum
          </button>
        </div>
      )}

      {/* Post dihapus */}
      {!loading && !error && post?.is_deleted && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#fffdf8",
            border: "1px solid #d9d1c2",
            borderRadius: 14,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 16,
              fontWeight: 700,
              color: "#0d1d38",
            }}
          >
            Post ini sudah dihapus
          </p>
          <button
            type="button"
            onClick={() => navigate("/forum")}
            style={{
              background: "#0d1d38",
              color: "#fffdf8",
              border: "none",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Kembali ke Forum
          </button>
        </div>
      )}

      {/* Main content */}
      {!loading && !error && post && !post.is_deleted && (
        <PostDetail post={post} comments={comments} onRefresh={refresh} />
      )}
    </div>
  );
}
