/**
 * PostDetail
 *
 * Full view of a forum post with all metadata, actions, and comment thread.
 *
 * Props:
 *   post      {object}    Normalized post from useForumPost
 *   comments  {object[]}  Normalized comments array from useForumPost
 *   onRefresh {() => void}
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForumUpvote } from "../../hooks/useForumUpvote";
import { useForumBookmark } from "../../hooks/useForumBookmark";
import { useForumAdmin } from "../../hooks/useForumAdmin";
import { ForumAvatar } from "./ForumAvatar";
import { ShareButton } from "./ShareButton";
import { ReportModal } from "./ReportModal";
import { CommentThread } from "./CommentThread";

const FLAIR_STYLE = {
  "Show & Tell": { bg: "#edfaf4", border: "#a3e4c6", color: "#1a6b48" },
  Diskusi: { bg: "#f0f4ff", border: "#b8c9f5", color: "#2d4fa0" },
  Tips: { bg: "#fff8ec", border: "#f5d68a", color: "#8a5c00" },
  Tanya: { bg: "#f5f2ec", border: "#d9d1c2", color: "#55606d" },
  Resource: { bg: "#fef2f2", border: "#f5b8b8", color: "#a03030" },
  "Open Source": { bg: "#f0f4ff", border: "#b8c9f5", color: "#2d4fa0" },
  Collab: { bg: "#fff8ec", border: "#f5d68a", color: "#8a5c00" },
  "Case Study": { bg: "#edfaf4", border: "#a3e4c6", color: "#1a6b48" },
};

function FlairBadge({ label }) {
  const s = FLAIR_STYLE[label] ?? FLAIR_STYLE["Diskusi"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: 5,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} minggu lalu`;
  return `${Math.floor(diff / 2592000)} bulan lalu`;
}

function formatFullDate(dateStr) {
  if (!dateStr) return "";
  return (
    new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " WIB"
  );
}

export function PostDetail({ post, comments = [], onRefresh }) {
  const navigate = useNavigate();
  const { user, openAuthModal, isAdmin } = useAuth();
  const {
    upvotes,
    upvoted,
    toggle: toggleUpvote,
  } = useForumUpvote(post.id, post.upvote_count ?? 0);
  const { bookmarked, toggle: toggleBookmark } = useForumBookmark(post.id);
  const {
    pinPost,
    unpinPost,
    lockPost,
    unlockPost,
    deletePost,
    loading: adminLoading,
  } = useForumAdmin();
  const [showReport, setShowReport] = useState(false);
  const [localPinned, setLocalPinned] = useState(post.is_pinned ?? false);
  const [localLocked, setLocalLocked] = useState(post.is_locked ?? false);
  const [localDeleted, setLocalDeleted] = useState(false);

  const relTime = post.created_at ? timeAgo(post.created_at) : "";
  const fullDate = post.created_at ? formatFullDate(post.created_at) : "";
  const commentCount = post.comment_count ?? comments.length;

  async function handleAdminPin() {
    const wasPinned = localPinned;
    setLocalPinned(!wasPinned);
    const { error } = wasPinned
      ? await unpinPost(post.id)
      : await pinPost(post.id);
    if (error) setLocalPinned(wasPinned);
  }

  async function handleAdminLock() {
    const wasLocked = localLocked;
    setLocalLocked(!wasLocked);
    const { error } = wasLocked
      ? await unlockPost(post.id)
      : await lockPost(post.id);
    if (error) setLocalLocked(wasLocked);
  }

  async function handleAdminDelete() {
    if (!window.confirm("Hapus post ini? Tindakan ini tidak dapat dibatalkan."))
      return;
    setLocalDeleted(true);
    const { error } = await deletePost(post.id);
    if (error) {
      setLocalDeleted(false);
      return;
    }
    navigate?.("/forum");
  }

  return (
    <>
      <article
        style={{
          background: "#fffdf8",
          border: "1px solid #d9d1c2",
          borderBottomWidth: 2,
          borderRadius: 14,
          boxShadow:
            "inset 0 -3px 0 rgba(21,19,16,.07), 0 1px 3px rgba(21,19,16,.04)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "20px 24px 0" }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 14,
              fontSize: 12,
              color: "#7b8594",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/forum")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#7b8594",
                fontSize: 12,
                fontWeight: 600,
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0d1d38")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#7b8594")}
            >
              Forum
            </button>
            <span>›</span>
            <span style={{ fontWeight: 600, color: "#55606d" }}>
              {post.category}
            </span>
            <span>›</span>
            <span
              style={{
                color: "#0d1d38",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 240,
              }}
            >
              {post.title}
            </span>
          </nav>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <ForumAvatar
              username={post.author ?? "Pengguna"}
              avatarUrl={post.avatar_url}
              size={30}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0d1d38" }}>
              {post.author ?? "Pengguna"}
            </span>
            <span
              title={fullDate}
              style={{ fontSize: 12, color: "#7b8594", cursor: "default" }}
            >
              {relTime}
            </span>
            <span style={{ fontSize: 12, color: "#c8c2b8" }}>·</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#55606d" }}>
              {post.category}
            </span>
            <FlairBadge label={post.flair} />
            {localPinned && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#1a6b48",
                  background: "#edfaf4",
                  border: "1px solid #a3e4c6",
                  borderRadius: 4,
                  padding: "2px 7px",
                }}
              >
                📌 Pinned
              </span>
            )}
            {localLocked && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#a03030",
                  background: "#fef2f2",
                  border: "1px solid #f5b8b8",
                  borderRadius: 4,
                  padding: "2px 7px",
                }}
              >
                🔒 Terkunci
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              margin: "0 0 14px",
              fontSize: 22,
              fontWeight: 900,
              color: "#0d1d38",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            {post.title}
          </h1>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "0 24px 16px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "#2a3340",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {post.body}
          </p>
        </div>

        {/* ── Tags ── */}
        {post.tags?.length > 0 && (
          <div
            style={{
              padding: "0 24px 16px",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "#f0ede8",
                  border: "1px solid #d9d1c2",
                  borderRadius: 20,
                  padding: "2px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#55606d",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Action bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            padding: "12px 24px 16px",
            borderTop: "1px solid #f0ede8",
          }}
        >
          {/* Upvote */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuthModal();
                return;
              }
              toggleUpvote();
            }}
            aria-pressed={upvoted}
            aria-label={`Upvote, ${upvotes} upvotes`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              background: upvoted
                ? "linear-gradient(180deg,#fff8ec 0%,#ffefc7 100%)"
                : "#fdfdfc",
              border: `1px solid ${upvoted ? "#c7820e" : "#d9d1c2"}`,
              borderBottomWidth: 2,
              boxShadow: upvoted
                ? "inset 0 -2px 0 #cf860d"
                : "inset 0 -2px 0 rgba(21,19,16,.07)",
              color: upvoted ? "#8a5c00" : "#55606d",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 120ms",
            }}
          >
            <svg
              viewBox="0 0 12 12"
              fill={upvoted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 12, height: 12 }}
            >
              <path d="M6 1L1 6h3v5h4V6h3L6 1z" />
            </svg>
            {upvotes} upvote{upvotes !== 1 ? "s" : ""}
          </button>

          {/* Comment count (decorative) */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              fontWeight: 600,
              color: "#7b8594",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 14, height: 14 }}
            >
              <path d="M14 10c0 1.1-.9 2-2 2H4l-2 2V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6z" />
            </svg>
            {commentCount} komentar
          </span>

          {/* Share */}
          <ShareButton postId={post.id} title={post.title} />

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuthModal();
                return;
              }
              toggleBookmark();
            }}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Hapus bookmark" : "Simpan post"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              fontWeight: 600,
              color: bookmarked ? "#c7820e" : "#7b8594",
              padding: 0,
              transition: "color 120ms",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 14, height: 14 }}
            >
              <path d="M3 2h10a1 1 0 0 1 1 1v11l-5-3-5 3V3a1 1 0 0 1 1-1z" />
            </svg>
            {bookmarked ? "Tersimpan" : "Simpan"}
          </button>

          {/* Report */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuthModal();
                return;
              }
              setShowReport(true);
            }}
            aria-label="Laporkan post"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              fontWeight: 600,
              color: "#7b8594",
              padding: 0,
              transition: "color 120ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#a03030")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#7b8594")}
          >
            Laporkan
          </button>

          {/* Admin controls */}
          {isAdmin && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: "auto",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#7b8594",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Admin:
              </span>
              <button
                type="button"
                onClick={handleAdminPin}
                disabled={adminLoading}
                style={{
                  background: localPinned ? "#edfaf4" : "#f5f2ec",
                  border: `1px solid ${localPinned ? "#a3e4c6" : "#d9d1c2"}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: localPinned ? "#1a6b48" : "#55606d",
                  cursor: "pointer",
                  opacity: adminLoading ? 0.5 : 1,
                }}
              >
                {localPinned ? "📌 Unpin" : "📌 Pin"}
              </button>
              <button
                type="button"
                onClick={handleAdminLock}
                disabled={adminLoading}
                style={{
                  background: localLocked ? "#fef2f2" : "#f5f2ec",
                  border: `1px solid ${localLocked ? "#f5b8b8" : "#d9d1c2"}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: localLocked ? "#a03030" : "#55606d",
                  cursor: "pointer",
                  opacity: adminLoading ? 0.5 : 1,
                }}
              >
                {localLocked ? "🔒 Unlock" : "🔒 Lock"}
              </button>
              <button
                type="button"
                onClick={handleAdminDelete}
                disabled={adminLoading || localDeleted}
                style={{
                  background: "#fef2f2",
                  border: "1px solid #f5b8b8",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#a03030",
                  cursor: "pointer",
                  opacity: adminLoading ? 0.5 : 1,
                }}
              >
                🗑 Hapus post
              </button>
            </div>
          )}
        </div>

        {/* ── Comments ── */}
        <div
          style={{
            padding: "0 24px 24px",
            borderTop: "1px solid #e5ddd0",
            paddingTop: 20,
          }}
        >
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: 15,
              fontWeight: 800,
              color: "#0d1d38",
            }}
          >
            {commentCount} Komentar
          </h2>
          <CommentThread
            postId={post.id}
            comments={comments}
            locked={localLocked}
            onRefresh={onRefresh}
          />
        </div>
      </article>

      {showReport && (
        <ReportModal
          targetType="post"
          targetId={post.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
