/**
 * CommentThread
 *
 * Renders all comments for a post, organized as top-level + 1-level replies.
 * Handles inline reply form, optimistic insert, and soft-delete.
 *
 * Props:
 *   postId    {string}    UUID of the post
 *   comments  {object[]}  Normalized comment array from useForumPost
 *   locked    {boolean}   If true, reply form is hidden
 *   onRefresh {() => void} Called after delete to re-sync from DB
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCreateComment } from "../../hooks/useCreateComment";
import { CommentCard } from "./CommentCard";
import { supabase } from "../../lib/supabase";

export function CommentThread({ postId, comments = [], locked = false, onRefresh }) {
  const { user, openAuthModal } = useAuth();
  const { submit, loading: submitting, error: submitError } = useCreateComment(postId);

  // Which comment is being replied to (null = top-level reply)
  const [replyingTo, setReplyingTo] = useState(null);
  const [topBody, setTopBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  // Optimistic comments list
  const [localComments, setLocalComments] = useState(comments);

  const topTextareaRef = useRef(null);
  const replyTextareaRef = useRef(null);

  // Sync when parent re-fetches
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  // Top-level comments (parent_id = null)
  const topLevel = localComments.filter((c) => !c.parent_id);

  // Replies for a given comment
  function repliesFor(commentId) {
    return localComments.filter((c) => c.parent_id === commentId);
  }

  async function handleSubmitTop(e) {
    e.preventDefault();
    if (!user) { openAuthModal(); return; }
    if (!topBody.trim()) return;

    const { data, error } = await submit({ body: topBody, parentId: null });
    if (data && !error) {
      setLocalComments((prev) => [...prev, data]);
      setTopBody("");
    }
  }

  async function handleSubmitReply(e) {
    e.preventDefault();
    if (!user) { openAuthModal(); return; }
    if (!replyBody.trim() || !replyingTo) return;

    const { data, error } = await submit({ body: replyBody, parentId: replyingTo.id });
    if (data && !error) {
      setLocalComments((prev) => [...prev, data]);
      setReplyBody("");
      setReplyingTo(null);
    }
  }

  async function handleDelete(commentId) {
    if (!supabase) return;
    const { error } = await supabase
      .from("forum_comments")
      .update({ is_deleted: true })
      .eq("id", commentId)
      .eq("user_id", user?.id);
    if (!error) {
      setLocalComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, is_deleted: true } : c)
      );
    }
  }

  function handleReply(comment) {
    setReplyingTo(comment);
    setReplyBody("");
    setTimeout(() => replyTextareaRef.current?.focus(), 80);
  }

  const TEXTAREA_STYLE = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d9d1c2",
    background: "#faf8f4",
    fontSize: 13,
    color: "#0d1d38",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.55,
    outline: "none",
    transition: "border-color 120ms",
    minHeight: 80,
  };

  const SUBMIT_BTN = (disabled) => ({
    background: disabled ? "#c8c2b8" : "#0d1d38",
    color: "#fffdf8",
    border: "none",
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 120ms",
  });

  return (
    <div>
      {/* ── Locked banner ── */}
      {locked && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "#fef2f2",
          border: "1px solid #f5b8b8",
          fontSize: 13,
          fontWeight: 600,
          color: "#a03030",
          marginBottom: 16,
        }}>
          🔒 Thread ini ditutup — komentar baru tidak dapat ditambahkan.
        </div>
      )}

      {/* ── Thread list ── */}
      {topLevel.length === 0 && !locked && (
        <p style={{ fontSize: 13, color: "#7b8594", marginBottom: 16, textAlign: "center", padding: "16px 0" }}>
          Belum ada komentar. Jadilah yang pertama berkomentar!
        </p>
      )}

      {topLevel.map((comment) => (
        <div key={comment.id}>
          {/* Top-level comment */}
          <CommentCard
            comment={comment}
            depth={0}
            onReply={handleReply}
            onDelete={handleDelete}
            postLocked={locked}
          />

          {/* Inline reply form — appears right below the comment being replied to */}
          {replyingTo?.id === comment.id && (
            <form
              onSubmit={handleSubmitReply}
              style={{
                marginLeft: 28,
                marginTop: 8,
                marginBottom: 4,
                borderLeft: "2px solid #f6a61e",
                paddingLeft: 14,
              }}
            >
              <div style={{ fontSize: 12, color: "#7b8594", marginBottom: 6 }}>
                Membalas <strong style={{ color: "#0d1d38" }}>@{replyingTo.author}</strong>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  style={{
                    marginLeft: 8, background: "none", border: "none",
                    cursor: "pointer", color: "#7b8594", fontSize: 11,
                    padding: 0,
                  }}
                >
                  Batal
                </button>
              </div>
              <textarea
                ref={replyTextareaRef}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Tulis balasan..."
                rows={3}
                maxLength={5000}
                style={TEXTAREA_STYLE}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#c7820e")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d9d1c2")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmitReply(e);
                }}
              />
              {submitError && (
                <p style={{ fontSize: 12, color: "#a03030", margin: "4px 0 0" }}>{submitError}</p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={!replyBody.trim() || submitting}
                  style={SUBMIT_BTN(!replyBody.trim() || submitting)}
                >
                  {submitting ? "Mengirim..." : "Kirim balasan"}
                </button>
              </div>
            </form>
          )}

          {/* Replies */}
          {repliesFor(comment.id).map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={1}
              onDelete={handleDelete}
              postLocked={locked}
            />
          ))}
        </div>
      ))}

      {/* ── Top-level comment form ── */}
      {!locked && (
        <form
          onSubmit={handleSubmitTop}
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid #e5ddd0",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1d38", marginBottom: 8 }}>
            Tambahkan komentar
          </div>
          {user ? (
            <>
              <textarea
                ref={topTextareaRef}
                value={topBody}
                onChange={(e) => setTopBody(e.target.value)}
                placeholder="Tulis komentar... (Ctrl+Enter untuk kirim)"
                rows={4}
                maxLength={5000}
                style={TEXTAREA_STYLE}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#c7820e")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d9d1c2")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmitTop(e);
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "#7b8594" }}>
                  {topBody.length}/5000
                </span>
                <button
                  type="submit"
                  disabled={!topBody.trim() || submitting}
                  style={SUBMIT_BTN(!topBody.trim() || submitting)}
                >
                  {submitting ? "Mengirim..." : "Kirim komentar"}
                </button>
              </div>
              {submitError && (
                <p style={{ fontSize: 12, color: "#a03030", margin: "6px 0 0" }}>{submitError}</p>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px dashed #d9d1c2",
                background: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "#7b8594",
                transition: "border-color 120ms, color 120ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c7820e";
                e.currentTarget.style.color = "#c7820e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d9d1c2";
                e.currentTarget.style.color = "#7b8594";
              }}
            >
              Login untuk berkomentar →
            </button>
          )}
        </form>
      )}
    </div>
  );
}
