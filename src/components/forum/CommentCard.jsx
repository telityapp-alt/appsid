/**
 * CommentCard
 *
 * Renders a single comment or reply.
 * Supports upvote, reply trigger, soft-delete (owner), and report.
 *
 * Props:
 *   comment    {object}   Normalized comment row from useForumPost
 *   depth      {0|1}      0 = top-level, 1 = reply
 *   onReply    {(comment) => void}   Called when user clicks Reply
 *   onDelete   {(commentId) => void} Called when owner soft-deletes
 *   postLocked {boolean}  Disables reply if true
 */

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useForumCommentUpvote } from "../../hooks/useForumCommentUpvote";
import { useForumAdmin } from "../../hooks/useForumAdmin";
import { ForumAvatar } from "./ForumAvatar";
import { ReportModal } from "./ReportModal";

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

export function CommentCard({
  comment,
  depth = 0,
  onReply,
  onDelete,
  postLocked = false,
}) {
  const { user, openAuthModal, isAdmin } = useAuth();
  const {
    upvotes,
    upvoted,
    toggle: toggleUpvote,
  } = useForumCommentUpvote(comment.id, comment.upvote_count ?? 0);
  const {
    pinComment,
    unpinComment,
    deleteComment,
    loading: adminLoading,
  } = useForumAdmin();
  const [showReport, setShowReport] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localPinned, setLocalPinned] = useState(comment.is_pinned ?? false);
  const [localDeleted, setLocalDeleted] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const relTime = comment.created_at ? timeAgo(comment.created_at) : "";
  const fullDate = comment.created_at ? formatFullDate(comment.created_at) : "";

  async function handleDelete() {
    if (!isOwner) return;
    if (!window.confirm("Hapus komentar ini?")) return;
    setDeleting(true);
    try {
      await onDelete?.(comment.id);
    } finally {
      setDeleting(false);
    }
  }

  async function handleAdminPin() {
    const wasPinned = localPinned;
    setLocalPinned(!wasPinned);
    const { error } = wasPinned
      ? await unpinComment(comment.id)
      : await pinComment(comment.id);
    if (error) setLocalPinned(wasPinned);
  }

  async function handleAdminDelete() {
    if (!window.confirm("Hapus komentar ini? (Admin)")) return;
    setLocalDeleted(true);
    const { error } = await deleteComment(comment.id);
    if (error) setLocalDeleted(false);
  }

  // Soft-deleted placeholder — keep structure intact for nested replies
  if (localDeleted || comment.is_deleted) {
    return (
      <div
        style={{
          marginLeft: depth === 1 ? 28 : 0,
          padding: "10px 0",
          borderTop: depth === 0 ? "1px solid #f0ede8" : "none",
          color: "#b0a898",
          fontSize: 13,
          fontStyle: "italic",
        }}
      >
        [Komentar ini telah dihapus]
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          marginLeft: depth === 1 ? 28 : 0,
          paddingTop: 14,
          paddingBottom: 2,
          borderTop: depth === 0 ? "1px solid #f0ede8" : "none",
          borderLeft: depth === 1 ? "2px solid #e5ddd0" : "none",
          paddingLeft: depth === 1 ? 14 : 0,
        }}
      >
        {/* Author row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 7,
          }}
        >
          <ForumAvatar
            username={comment.author ?? "Pengguna"}
            avatarUrl={comment.avatar_url}
            size={26}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0d1d38" }}>
            {comment.author ?? "Pengguna"}
          </span>
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
              📌 Best answer
            </span>
          )}
          <span
            title={fullDate}
            style={{
              fontSize: 11,
              color: "#7b8594",
              cursor: "default",
              marginLeft: "auto",
            }}
          >
            {relTime}
          </span>
        </div>

        {/* Body */}
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 14,
            color: "#2a3340",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {comment.body}
        </p>

        {/* Action bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 6,
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
            aria-label={`Upvote komentar, ${upvotes} upvotes`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: upvoted ? "#c7820e" : "#7b8594",
              padding: 0,
              transition: "color 120ms",
            }}
          >
            <svg
              viewBox="0 0 12 12"
              fill={upvoted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 11, height: 11 }}
            >
              <path d="M6 1L1 6h3v5h4V6h3L6 1z" />
            </svg>
            {upvotes > 0 && upvotes}
          </button>

          {/* Reply — only depth=0 and not locked */}
          {depth === 0 && !postLocked && (
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  openAuthModal();
                  return;
                }
                onReply?.(comment);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
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
              Balas
            </button>
          )}

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
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
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

          {/* Delete — owner only */}
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: "none",
                border: "none",
                cursor: deleting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: "#7b8594",
                padding: 0,
                transition: "color 120ms",
                opacity: deleting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a03030")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#7b8594")}
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <>
              <span style={{ color: "#e5ddd0", fontSize: 11 }}>|</span>
              <button
                type="button"
                onClick={handleAdminPin}
                disabled={adminLoading}
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
                title={
                  localPinned ? "Unpin komentar" : "Pin sebagai best answer"
                }
              >
                {localPinned ? "📌 Unpin" : "📌 Pin"}
              </button>
              <button
                type="button"
                onClick={handleAdminDelete}
                disabled={adminLoading}
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
                title="Hapus komentar (Admin)"
              >
                🗑 Hapus
              </button>
            </>
          )}
        </div>
      </div>

      {showReport && (
        <ReportModal
          targetType="comment"
          targetId={comment.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
