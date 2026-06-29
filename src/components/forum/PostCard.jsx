/**
 * PostCard
 *
 * A single post card in the forum feed.
 * Handles upvote, bookmark, share, and report actions.
 * Navigates to /forum/:id on title/body click.
 *
 * Props:
 *   post           {object}   Normalized post row from useForumPosts
 *   onTagClick     {(tag: string) => void}
 *   onCategoryClick {(cat: string) => void}
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
        height: 20,
        padding: "0 7px",
        borderRadius: 4,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

// Relative time helper (Indonesian)
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} minggu lalu`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} bulan lalu`;
  return `${Math.floor(diff / 31536000)} tahun lalu`;
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

export function PostCard({ post, onTagClick, onCategoryClick }) {
  const navigate = useNavigate();
  const { user, openAuthModal, isAdmin } = useAuth();
  const {
    upvotes,
    upvoted,
    toggle: toggleUpvote,
  } = useForumUpvote(post.id, post.upvote_count ?? post.upvotes ?? 0);
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
  const [hovered, setHovered] = useState(false);
  const [localPinned, setLocalPinned] = useState(
    post.is_pinned ?? post.pinned ?? false,
  );
  const [localLocked, setLocalLocked] = useState(post.is_locked ?? false);
  const [localDeleted, setLocalDeleted] = useState(post.is_deleted ?? false);

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
    if (error) setLocalDeleted(false);
  }

  if (localDeleted || post.is_deleted) {
    return (
      <article
        style={{
          padding: "14px 16px",
          borderRadius: 10,
          border: "1px solid #e5ddd0",
          background: "#faf8f4",
          color: "#7b8594",
          fontSize: 13,
          fontStyle: "italic",
        }}
      >
        [Post ini telah dihapus]
      </article>
    );
  }

  function handleUpvote() {
    if (!user) {
      openAuthModal();
      return;
    }
    toggleUpvote();
  }

  function handleBookmark() {
    if (!user) {
      openAuthModal();
      return;
    }
    toggleBookmark();
  }

  function handleNavigate() {
    navigate(`/forum/${post.id}`);
  }

  const commentCount = post.comment_count ?? post.comments ?? 0;
  const relTime = post.created_at
    ? timeAgo(post.created_at)
    : (post.timeAgo ?? "");
  const fullDate = post.created_at ? formatFullDate(post.created_at) : "";

  return (
    <>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 10,
          border: "1px solid #d9d1c2",
          borderBottomWidth: 2,
          background: hovered ? "#fffef9" : "#fffdf8",
          boxShadow: hovered
            ? "0 2px 8px rgba(21,19,16,.08), inset 0 -2px 0 rgba(21,19,16,.06)"
            : "inset 0 -2px 0 rgba(21,19,16,.05)",
          transition: "background 120ms ease, box-shadow 120ms ease",
        }}
      >
        {/* ── Upvote column ── */}
        <div style={{ paddingTop: 2, flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleUpvote}
            aria-pressed={upvoted}
            aria-label={`Upvote, ${upvotes} upvotes`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              width: 40,
              background: upvoted
                ? "linear-gradient(180deg,#fff8ec 0%,#ffefc7 100%)"
                : "#fdfdfc",
              border: `1px solid ${upvoted ? "#c7820e" : "#d9d1c2"}`,
              borderBottomWidth: 2,
              borderRadius: 8,
              cursor: "pointer",
              padding: "6px 0",
              boxShadow: upvoted
                ? "inset 0 -2px 0 #cf860d,0 1px 0 rgba(129,79,2,.2)"
                : "inset 0 -2px 0 rgba(21,19,16,.07)",
              color: upvoted ? "#8a5c00" : "#55606d",
              transition: "all 120ms ease",
            }}
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 11, height: 11 }}
            >
              <path d="M6 1L1 6h3v5h4V6h3L6 1z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 800, lineHeight: 1 }}>
              {upvotes}
            </span>
          </button>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            <ForumAvatar
              username={post.author ?? post.profiles?.username ?? "Pengguna"}
              avatarUrl={post.avatar_url ?? post.profiles?.avatar_url}
              size={22}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0d1d38" }}>
              {post.author ?? "Pengguna"}
            </span>
            <span
              title={fullDate}
              style={{ fontSize: 11, color: "#7b8594", cursor: "default" }}
            >
              {relTime}
            </span>
            <span style={{ fontSize: 11, color: "#c8c2b8" }}>·</span>
            <button
              type="button"
              onClick={() => onCategoryClick?.(post.category)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                color: "#55606d",
              }}
            >
              {post.category}
            </button>
            <FlairBadge label={post.flair} />
            {localPinned && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#1a6b48",
                  background: "#edfaf4",
                  border: "1px solid #a3e4c6",
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                📌 Pinned
              </span>
            )}
            {localLocked && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#a03030",
                  background: "#fef2f2",
                  border: "1px solid #f5b8b8",
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                🔒 Terkunci
              </span>
            )}
          </div>

          {/* Title */}
          <button
            type="button"
            onClick={handleNavigate}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              textAlign: "left",
              cursor: "pointer",
              display: "block",
              width: "100%",
            }}
          >
            <h2
              style={{
                margin: "0 0 5px",
                fontSize: 15,
                fontWeight: 800,
                color: "#0d1d38",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
              }}
            >
              {post.title}
            </h2>
          </button>

          {/* Body excerpt */}
          <button
            type="button"
            onClick={handleNavigate}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              textAlign: "left",
              cursor: "pointer",
              display: "block",
              width: "100%",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 13,
                color: "#55606d",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.body}
            </p>
          </button>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginBottom: 10,
              }}
            >
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick?.(tag)}
                  style={{
                    background: "#f0ede8",
                    border: "1px solid #d9d1c2",
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#55606d",
                    cursor: "pointer",
                    transition: "background 120ms, color 120ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#0d1d38";
                    e.currentTarget.style.color = "#fffdf8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f0ede8";
                    e.currentTarget.style.color = "#55606d";
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {/* Comments */}
            <button
              type="button"
              onClick={handleNavigate}
              aria-label={`${commentCount} komentar`}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                color: "#7b8594",
                padding: 0,
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0d1d38")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#7b8594")}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 13, height: 13 }}
              >
                <path d="M14 10c0 1.1-.9 2-2 2H4l-2 2V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6z" />
              </svg>
              {commentCount} komentar
            </button>

            {/* Share */}
            <ShareButton postId={post.id} title={post.title} />

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmark}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? "Hapus bookmark" : "Simpan post"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                color: bookmarked ? "#c7820e" : "#7b8594",
                padding: 0,
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => {
                if (!bookmarked) e.currentTarget.style.color = "#0d1d38";
              }}
              onMouseLeave={(e) => {
                if (!bookmarked) e.currentTarget.style.color = "#7b8594";
              }}
            >
              <svg
                viewBox="0 0 16 16"
                fill={bookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 13, height: 13 }}
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
                fontSize: 12,
                fontWeight: 600,
                color: "#7b8594",
                padding: 0,
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a03030")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#7b8594")}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 13, height: 13 }}
              >
                <path d="M8 1L1 14h14L8 1z" />
                <path d="M8 6v4M8 11v1" />
              </svg>
              Laporkan
            </button>

            {/* Admin controls */}
            {isAdmin && (
              <>
                <span style={{ color: "#e5ddd0", fontSize: 11 }}>|</span>
                <button
                  type="button"
                  onClick={handleAdminPin}
                  disabled={adminLoading}
                  aria-label={localPinned ? "Unpin post" : "Pin post"}
                  title={localPinned ? "Unpin post" : "Pin post"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    color: localPinned ? "#1a6b48" : "#7b8594",
                    padding: 0,
                    opacity: adminLoading ? 0.5 : 1,
                  }}
                >
                  {localPinned ? "📌 Unpin" : "📌 Pin"}
                </button>
                <button
                  type="button"
                  onClick={handleAdminLock}
                  disabled={adminLoading}
                  aria-label={
                    localLocked ? "Buka kunci thread" : "Kunci thread"
                  }
                  title={localLocked ? "Buka kunci thread" : "Kunci thread"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    color: localLocked ? "#a03030" : "#7b8594",
                    padding: 0,
                    opacity: adminLoading ? 0.5 : 1,
                  }}
                >
                  {localLocked ? "🔒 Unlock" : "🔒 Lock"}
                </button>
                <button
                  type="button"
                  onClick={handleAdminDelete}
                  disabled={adminLoading}
                  aria-label="Hapus post (admin)"
                  title="Hapus post (admin)"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#a03030",
                    padding: 0,
                    opacity: adminLoading ? 0.5 : 1,
                  }}
                >
                  🗑 Hapus
                </button>
              </>
            )}
          </div>
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
