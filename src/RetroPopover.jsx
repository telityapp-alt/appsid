import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { useUpvote } from "./hooks/useUpvote";
import { useFollow } from "./hooks/useFollow";
import { useAuthGuard } from "./hooks/useAuthGuard";
import { useToast } from "./context/ToastContext";
import { supabase } from "./lib/supabase";
import { isLaunchingToday } from "./lib/dateUtils";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────

function IcoChevLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

function IcoChevRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

function IcoTriangle({ filled = false }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M6 1l5 9H1z"
        fill={filled ? "#f6a61e" : "none"}
        stroke={filled ? "#c7820e" : "currentColor"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcoExternal() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8" />
      <path d="M8 1h4v4" />
      <path d="M12 1L6 7" />
    </svg>
  );
}

function IcoShare() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11.5" cy="2.5" r="1.5" />
      <circle cx="11.5" cy="12.5" r="1.5" />
      <circle cx="3.5" cy="7.5" r="1.5" />
      <path d="M5 7.5h4.5M9.5 3.5L5.5 6.5M9.5 11.5L5.5 8.5" />
    </svg>
  );
}

function IcoBookmark() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M2 1h9v11l-4.5-3L2 12V1z" />
    </svg>
  );
}

function IcoX() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M7.65 5.52L12.1 0h-1.06L7.17 4.82 4.08 0H.5l4.67 6.79L.5 13h1.06l4.08-4.97L8.92 13H12.5L7.65 5.52zm-1.44 1.76l-.47-.68L1.94.88h1.62l3.03 4.33.47.68 3.94 5.63h-1.62L6.21 7.28z" />
    </svg>
  );
}

function IcoInstagram() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <rect x="1" y="1" width="11" height="11" rx="3" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="9.8" cy="3.2" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffMon = Math.floor(diffDay / 30);
  const diffYr = Math.floor(diffDay / 365);
  if (diffSec < 60) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  if (diffDay < 30) return `${diffDay} hari lalu`;
  if (diffMon < 12) return `${diffMon} bulan lalu`;
  return `${diffYr} tahun lalu`;
}

function StarRating({ rating = 0, count = 0 }) {
  const stars = [1, 2, 3, 4, 5];
  const gradId = `star-grad-${Math.round(rating * 10)}`;
  const fraction = rating % 1;
  return (
    <div
      className="ph-star-row"
      style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset={`${fraction * 100}%`} stopColor="#f6a61e" />
            <stop offset={`${fraction * 100}%`} stopColor="#d9d1c2" />
          </linearGradient>
        </defs>
      </svg>
      {stars.map((s) => {
        const filled = s <= Math.floor(rating);
        const half = !filled && s === Math.ceil(rating) && fraction > 0;
        return (
          <svg
            key={s}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={`ph-star${filled ? " filled" : half ? " half" : ""}`}
          >
            <polygon
              points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.5 2.7,10.5 3.5,7 1,4.8 4.5,4.5"
              fill={filled ? "#f6a61e" : half ? `url(#${gradId})` : "#d9d1c2"}
              stroke="none"
            />
          </svg>
        );
      })}
      {count > 0 && (
        <span
          className="ph-star-count"
          style={{ fontSize: 12, color: "#7b8594", marginLeft: 2 }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function Avatar({ src, name, size = 32 }) {
  const [err, setErr] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        className="ph-pop-avatar"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      className="ph-pop-avatar-fallback"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: "#e8e3d9",
        color: "#7b6f5a",
        fontSize: size * 0.38,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {initials}
    </div>
  );
}

// ── normalizeApp ──────────────────────────────────────────────────────────────

function normalizeApp(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? null,
    slug: raw.slug ?? raw.id ?? "",
    name: raw.name ?? "App",
    tagline: raw.tagline ?? raw.short_description ?? "",
    description: raw.description ?? raw.tagline ?? "",
    website_url: raw.website_url ?? raw.website ?? null,
    logo_url: raw.logo_url ?? raw.image ?? null,
    gallery_images: Array.isArray(raw.gallery_images)
      ? raw.gallery_images
      : Array.isArray(raw.gallery)
        ? raw.gallery
        : [],
    launch_tags: Array.isArray(raw.launch_tags)
      ? raw.launch_tags
      : raw.role
        ? [raw.role]
        : raw.category
          ? [raw.category]
          : [],
    is_open_source: raw.is_open_source ?? false,
    pricing_type: raw.pricing_type ?? null,
    twitter_handle: raw.twitter_handle ?? null,
    instagram_handle: raw.instagram_handle ?? null,
    upvotes_count: raw.upvotes_count ?? raw.upvotes ?? 0,
    reviews_count: raw.reviews_count ?? 0,
    launch_date: raw.launch_date ?? raw.created_at ?? null,
    created_at: raw.created_at ?? null,
    app_makers: (() => {
      const raw_makers = Array.isArray(raw.app_makers)
        ? raw.app_makers
        : Array.isArray(raw.team)
          ? raw.team.map((m) => ({
              name: m.name ?? "Anggota Tim",
              avatar_url: m.avatar ?? m.avatar_url ?? null,
              role: m.role ?? "",
              website_url: m.website_url ?? null,
              twitter_handle: m.twitter_handle ?? null,
            }))
          : [];
      // Deduplicate by id, then by name — prevents double-render when
      // both FALLBACK data and normalizeAppRow already processed makers
      const seen = new Set();
      return raw_makers.filter((m) => {
        const key = m.id ?? m.name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    })(),
    app_comments: Array.isArray(raw.app_comments) ? raw.app_comments : [],
    built_with: Array.isArray(raw.built_with) ? raw.built_with : [],
    first_comment: raw.first_comment ?? null,
    status: raw.status ?? "live",
  };
}

// ── pricingBadge ──────────────────────────────────────────────────────────────

function pricingBadge(pricing_type) {
  const map = {
    free: {
      label: "Gratis",
      bg: "#e8f5e9",
      color: "#2e7d32",
      border: "#a5d6a7",
    },
    paid: {
      label: "Berbayar",
      bg: "#e3f2fd",
      color: "#1565c0",
      border: "#90caf9",
    },
    freemium: {
      label: "Freemium",
      bg: "#f3e5f5",
      color: "#6a1b9a",
      border: "#ce93d8",
    },
    free_options: {
      label: "Ada versi gratis",
      bg: "#e0f2f1",
      color: "#00695c",
      border: "#80cbc4",
    },
  };
  return map[pricing_type] ?? null;
}

// ── Style constants ───────────────────────────────────────────────────────────

const S = {
  tbUpvote: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    height: 26,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid #d9d1c2",
    background: "linear-gradient(180deg,#fff 0%,#f5f2ec 100%)",
    boxShadow: "inset 0 -1px 0 rgba(196,138,40,0.14)",
    color: "#374352",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 150ms ease, box-shadow 150ms ease",
    flexShrink: 0,
  },
  tbUpvoteActive: {
    background: "#f6a61e",
    borderColor: "#c7820e",
    boxShadow: "inset 0 -2px 0 #cf860d",
    color: "#111",
  },
};

// ── Main Component ────────────────────────────────────────────────────────

export default function RetroPopover({
  app: rawApp,
  onClose,
  onUpvote = null,
}) {
  const app = normalizeApp(rawApp);
  if (!app) return null;

  const {
    upvotes,
    upvoted,
    loading: upvoteLoading,
    toggle: toggleUpvote,
  } = useUpvote(app?.id, app?.upvotes_count);
  const {
    following,
    followCount,
    loading: followLoading,
    toggle: toggleFollow,
  } = useFollow(app?.id, app?.followers_count ?? 0);
  const { requireAuth } = useAuthGuard();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [gallerySlide, setGallerySlide] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myReviewText, setMyReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Forum / comments state
  const [liveComments, setLiveComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const autoRef = useRef(null);
  const hoverRef = useRef(false);

  // Reset state when app changes
  useEffect(() => {
    setGallerySlide(0);
    setActiveTab("overview");
    setShowFullDesc(false);
  }, [app.id]);

  // Scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // onUpvote callback
  useEffect(() => {
    if (upvoted && onUpvote) onUpvote(rawApp);
  }, [upvoted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth-gated upvote handler
  function handleUpvote() {
    requireAuth(async () => {
      try {
        await toggleUpvote();
        showToast(
          upvoted ? "Upvote dihapus" : `Upvote untuk ${app.name} berhasil!`,
          "success",
        );
      } catch {
        showToast("Gagal melakukan upvote. Coba lagi.", "error");
      }
    });
  }

  // Auth-gated follow handler
  function handleFollow() {
    requireAuth(async () => {
      try {
        await toggleFollow();
        showToast(
          following
            ? `Berhenti mengikuti ${app.name}`
            : `Mengikuti ${app.name}!`,
          "success",
        );
      } catch {
        showToast("Gagal mengikuti. Coba lagi.", "error");
      }
    });
  }

  // Helper: fetch profiles map { [user_id]: { full_name, avatar_url } }
  async function fetchProfilesMap(userIds) {
    if (!userIds.length || !supabase) return {};
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);
    const map = {};
    (data ?? []).forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }

  // Load reviews when ulasan tab opens
  useEffect(() => {
    if (activeTab !== "ulasan" || !app.id || !supabase) return;
    let cancelled = false;
    setReviewsLoading(true);
    supabase
      .from("app_reviews")
      .select("id, rating, body, created_at, user_id")
      .eq("app_id", app.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(async ({ data }) => {
        if (cancelled) return;
        const rows = data ?? [];
        const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
        const profilesMap = await fetchProfilesMap(ids);
        if (!cancelled) {
          setReviews(
            rows.map((r) => ({
              ...r,
              profiles: profilesMap[r.user_id] ?? null,
            })),
          );
          setReviewsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, app.id]);

  // Load live comments when forum tab opens
  useEffect(() => {
    if (activeTab !== "forum" || !app.id || !supabase) return;
    let cancelled = false;
    setCommentsLoading(true);
    supabase
      .from("app_comments")
      .select("id, body, created_at, user_id, is_pinned")
      .eq("app_id", app.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(50)
      .then(async ({ data }) => {
        if (cancelled) return;
        const rows = data ?? [];
        const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
        const profilesMap = await fetchProfilesMap(ids);
        if (!cancelled) {
          setLiveComments(
            rows.map((r) => ({
              ...r,
              profiles: profilesMap[r.user_id] ?? null,
            })),
          );
          setCommentsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, app.id]);

  // Submit review
  async function handleSubmitReview() {
    requireAuth(async () => {
      if (!myRating) {
        showToast("Pilih rating dulu.", "error");
        return;
      }
      if (!myReviewText.trim()) {
        showToast("Tulis ulasan dulu.", "error");
        return;
      }
      setSubmittingReview(true);
      try {
        const { error } = await supabase.from("app_reviews").upsert(
          {
            app_id: app.id,
            user_id: user.id,
            rating: myRating,
            body: myReviewText.trim(),
          },
          { onConflict: "app_id,user_id" },
        );
        if (error) throw error;
        showToast("Ulasan berhasil disimpan!", "success");
        setMyRating(0);
        setMyReviewText("");
        const { data: rRows } = await supabase
          .from("app_reviews")
          .select("id, rating, body, created_at, user_id")
          .eq("app_id", app.id)
          .order("created_at", { ascending: false })
          .limit(20);
        const rIds = [
          ...new Set((rRows ?? []).map((r) => r.user_id).filter(Boolean)),
        ];
        const rProfiles = await fetchProfilesMap(rIds);
        setReviews(
          (rRows ?? []).map((r) => ({
            ...r,
            profiles: rProfiles[r.user_id] ?? null,
          })),
        );
      } catch (err) {
        showToast(err.message ?? "Gagal mengirim ulasan.", "error");
      } finally {
        setSubmittingReview(false);
      }
    });
  }

  // Submit comment
  async function handleSubmitComment() {
    requireAuth(async () => {
      if (!commentText.trim()) return;
      setSubmittingComment(true);
      try {
        const { error } = await supabase.from("app_comments").insert({
          app_id: app.id,
          user_id: user.id,
          body: commentText.trim(),
          is_pinned: false,
        });
        if (error) throw error;
        showToast("Komentar berhasil dikirim!", "success");
        setCommentText("");
        const { data: cRows } = await supabase
          .from("app_comments")
          .select("id, body, created_at, user_id, is_pinned")
          .eq("app_id", app.id)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(50);
        const cIds = [
          ...new Set((cRows ?? []).map((r) => r.user_id).filter(Boolean)),
        ];
        const cProfiles = await fetchProfilesMap(cIds);
        setLiveComments(
          (cRows ?? []).map((r) => ({
            ...r,
            profiles: cProfiles[r.user_id] ?? null,
          })),
        );
      } catch (err) {
        showToast(err.message ?? "Gagal mengirim komentar.", "error");
      } finally {
        setSubmittingComment(false);
      }
    });
  }

  // Gallery data
  const gallery = (
    app.gallery_images?.length
      ? app.gallery_images
      : app.logo_url
        ? [app.logo_url]
        : []
  ).filter(Boolean);

  // Gallery auto-advance
  useEffect(() => {
    if (gallery.length <= 1) return;
    autoRef.current = setInterval(() => {
      setGallerySlide((s) => (s + 1) % gallery.length);
    }, 3500);
    return () => clearInterval(autoRef.current);
  }, [gallery.length]);

  const prevG = useCallback(() => {
    clearInterval(autoRef.current);
    setGallerySlide((s) => (s - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const nextG = useCallback(() => {
    clearInterval(autoRef.current);
    setGallerySlide((s) => (s + 1) % gallery.length);
  }, [gallery.length]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  return (
    <div className="retro-backdrop" onClick={handleClose}>
      <div
        className="retro-window pop-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TITLE BAR ──────────────────────────────────────────── */}
        <div className="retro-titlebar">
          <div className="retro-titlebar-left">
            <div className="pop-dots">
              <button
                type="button"
                className="pop-dot pop-dot-close"
                onClick={handleClose}
                aria-label="Tutup"
              />
              <button
                type="button"
                className="pop-dot pop-dot-min"
                aria-label="Minimise"
              />
              <button
                type="button"
                className="pop-dot pop-dot-max"
                aria-label="Maximise"
              />
            </div>
          </div>
          <div className="retro-titlebar-center pop-tb-center">
            <span className="pop-tb-brand">AppVerse</span>
            <span className="pop-tb-sep">—</span>
            <span className="pop-tb-name">{app.name}</span>
          </div>
          <div
            className="retro-titlebar-right"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {/* upvote button in titlebar — wired to useUpvote hook */}
            <button
              type="button"
              style={{ ...S.tbUpvote, ...(upvoted ? S.tbUpvoteActive : {}) }}
              onClick={handleUpvote}
              aria-label={`Upvote ${app.name}, total ${upvotes}`}
              aria-pressed={upvoted}
              disabled={upvoteLoading}
            >
              <IcoTriangle filled={upvoted} />
              {upvotes}
            </button>
            <button
              type="button"
              className="pop-close-x"
              onClick={handleClose}
              aria-label="Tutup"
            >
              <svg
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ width: 13, height: 13 }}
              >
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>
        {/* ── SCROLLABLE BODY ───────────────────────────────────────────── */}
        <div className="pop-scroll">
          <div className="ph-pop-layout">
            {/* LEFT COLUMN */}
            <div className="ph-pop-main">
              {/* SECTION A — Hero Header */}
              <div className="ph-pop-hero">
                <div className="ph-pop-logo-wrap">
                  {app.logo_url ? (
                    <img
                      src={app.logo_url}
                      alt={app.name}
                      className="ph-pop-logo"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="ph-pop-logo-fallback"
                    style={{ display: app.logo_url ? "none" : "flex" }}
                  >
                    {app.name?.charAt(0)}
                  </div>
                </div>
                <div className="ph-pop-hero-body">
                  <div className="ph-pop-hero-top">
                    <h1 className="ph-pop-app-name">{app.name}</h1>
                    {isLaunchingToday(app.launch_date) && (
                      <span className="ph-pop-today-badge">
                        🚀 Launching Today
                      </span>
                    )}
                    {app.website_url && (
                      <a
                        href={app.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ph-pop-website-link"
                        aria-label="Buka website"
                      >
                        <IcoExternal />
                      </a>
                    )}
                  </div>
                  <p className="ph-pop-tagline">{app.tagline}</p>
                  <div className="ph-pop-meta-row">
                    <StarRating
                      rating={app.rating ?? 0}
                      count={app.reviews_count}
                    />
                    {app.upvotes_count > 0 && (
                      <span className="ph-pop-meta-item">
                        <IcoTriangle filled /> {app.upvotes_count} upvote
                      </span>
                    )}
                    {app.status && (
                      <span className="ph-pop-status-chip">{app.status}</span>
                    )}
                  </div>
                  <div className="ph-pop-hero-actions">
                    {app.website_url && (
                      <a
                        href={app.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ph-pop-cta-btn"
                      >
                        Kunjungi Website <IcoExternal />
                      </a>
                    )}
                    <button
                      type="button"
                      className={`ph-pop-follow-btn${following ? " active" : ""}`}
                      onClick={handleFollow}
                      aria-pressed={following}
                      aria-label={
                        following
                          ? `Berhenti mengikuti ${app.name}`
                          : `Ikuti ${app.name}`
                      }
                      disabled={followLoading}
                    >
                      {following ? "Mengikuti ✓" : "Ikuti"}
                      {followCount > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "inherit",
                            opacity: 0.75,
                            marginLeft: 5,
                          }}
                        >
                          {followCount}
                        </span>
                      )}
                    </button>
                  </div>
                  {app.launch_tags.length > 0 && (
                    <div className="ph-pop-tags-row">
                      {app.launch_tags.map((t) => (
                        <span key={t} className="ph-pop-tag-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION B — Description */}
              <div className="ph-pop-desc">
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: showFullDesc ? "2000px" : "4.5em",
                    transition: "max-height 300ms ease",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#374352",
                      lineHeight: 1.65,
                      ...(showFullDesc
                        ? {}
                        : {
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }),
                    }}
                  >
                    {app.description || app.tagline}
                  </p>
                </div>
                {(app.description || app.tagline || "").length > 200 && (
                  <button
                    onClick={() => setShowFullDesc((v) => !v)}
                    style={{
                      fontSize: 13,
                      color: "#f6a61e",
                      fontWeight: 700,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 0",
                    }}
                  >
                    {showFullDesc ? "tutup ↑" : "lihat selengkapnya ↓"}
                  </button>
                )}
              </div>

              {/* SECTION C — Nav Tabs */}
              <nav className="ph-pop-tabs" role="tablist">
                {[
                  { label: "Overview", value: "overview" },
                  { label: `Ulasan (${app.reviews_count})`, value: "ulasan" },
                  { label: "Forum", value: "forum" },
                  { label: "Tim", value: "tim" },
                  { label: "Lainnya", value: "lainnya" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    role="tab"
                    aria-selected={activeTab === tab.value}
                    tabIndex={activeTab === tab.value ? 0 : -1}
                    className={
                      "ph-pop-tab" + (activeTab === tab.value ? " active" : "")
                    }
                    onClick={() => {
                      setTabVisible(false);
                      setTimeout(() => {
                        setActiveTab(tab.value);
                        setTabVisible(true);
                      }, 100);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* TAB PANELS */}
              <div
                className="ph-pop-tab-panel"
                style={{
                  opacity: tabVisible ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
              >
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div>
                    {gallery.length > 0 && (
                      <div
                        className="ph-pop-gallery"
                        onMouseEnter={() => {
                          hoverRef.current = true;
                          clearInterval(autoRef.current);
                        }}
                        onMouseLeave={() => {
                          hoverRef.current = false;
                          if (gallery.length > 1) {
                            autoRef.current = setInterval(
                              () =>
                                setGallerySlide(
                                  (s) => (s + 1) % gallery.length,
                                ),
                              3500,
                            );
                          }
                        }}
                      >
                        <div className="ph-pop-gallery-main">
                          <img
                            key={gallerySlide}
                            src={gallery[gallerySlide]}
                            alt={`Tampilan ${gallerySlide + 1}`}
                            className="ph-pop-gallery-img"
                          />
                          {gallery.length > 1 && (
                            <>
                              <button
                                className="ph-pop-gallery-arrow left"
                                onClick={prevG}
                                aria-label="Sebelumnya"
                              >
                                <IcoChevLeft />
                              </button>
                              <button
                                className="ph-pop-gallery-arrow right"
                                onClick={nextG}
                                aria-label="Selanjutnya"
                              >
                                <IcoChevRight />
                              </button>
                              <span className="ph-pop-gallery-counter">
                                {gallerySlide + 1} / {gallery.length}
                              </span>
                            </>
                          )}
                        </div>
                        {gallery.length > 1 && (
                          <div className="ph-pop-gallery-dots">
                            {gallery.map((_, i) => (
                              <button
                                key={i}
                                className={
                                  "ph-pop-gallery-dot" +
                                  (i === gallerySlide ? " active" : "")
                                }
                                onClick={() => {
                                  clearInterval(autoRef.current);
                                  setGallerySlide(i);
                                }}
                                aria-label={`Gambar ${i + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="ph-pop-pricing-row">
                      {(() => {
                        const b = pricingBadge(app.pricing_type);
                        return b ? (
                          <span
                            className="ph-pop-pricing-badge"
                            style={{
                              background: b.bg,
                              color: b.color,
                              border: `1px solid ${b.border}`,
                            }}
                          >
                            {b.label}
                          </span>
                        ) : null;
                      })()}
                      {app.launch_tags.map((t) => (
                        <span key={t} className="ph-pop-tag-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ULASAN TAB */}
                {activeTab === "ulasan" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    {/* Write review form */}
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: 10,
                        border: "1px solid #d9d1c2",
                        background: "#fffdf8",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0d1d38",
                          margin: "0 0 10px",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Tulis ulasan
                      </p>
                      {/* Star picker */}
                      <div
                        style={{ display: "flex", gap: 4, marginBottom: 10 }}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setMyRating(n)}
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 2,
                              fontSize: 22,
                              color:
                                n <= (hoverRating || myRating)
                                  ? "#f6a61e"
                                  : "#d9d1c2",
                              transition: "color 120ms ease",
                            }}
                            aria-label={`${n} bintang`}
                          >
                            ★
                          </button>
                        ))}
                        {myRating > 0 && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#7b8594",
                              alignSelf: "center",
                              marginLeft: 4,
                            }}
                          >
                            {
                              [
                                "",
                                "Buruk",
                                "Kurang",
                                "Cukup",
                                "Bagus",
                                "Luar biasa",
                              ][myRating]
                            }
                          </span>
                        )}
                      </div>
                      <textarea
                        value={myReviewText}
                        onChange={(e) => setMyReviewText(e.target.value)}
                        placeholder="Ceritakan pengalamanmu dengan app ini..."
                        maxLength={500}
                        rows={3}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid #d9d1c2",
                          fontSize: 13,
                          color: "#29405f",
                          resize: "vertical",
                          fontFamily: "inherit",
                          background: "#fff",
                          outline: "none",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 8,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#7b8594" }}>
                          {myReviewText.length}/500
                        </span>
                        <button
                          type="button"
                          className="cta-button"
                          style={{
                            height: 30,
                            fontSize: 12,
                            padding: "0 14px",
                          }}
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                        >
                          {submittingReview ? "Mengirim..." : "Kirim ulasan"}
                        </button>
                      </div>
                    </div>

                    {/* Reviews list */}
                    {reviewsLoading ? (
                      <p
                        style={{
                          color: "#7b8594",
                          fontSize: 13,
                          textAlign: "center",
                          padding: "16px 0",
                        }}
                      >
                        Memuat ulasan...
                      </p>
                    ) : reviews.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <p
                          style={{ fontSize: 14, color: "#7b8594", margin: 0 }}
                        >
                          Belum ada ulasan. Jadilah yang pertama!
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {reviews.map((r, i) => (
                          <div
                            key={r.id ?? i}
                            style={{
                              padding: "12px 14px",
                              borderRadius: 10,
                              border: "1px solid #d9d1c2",
                              background: "#fffdf8",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 6,
                              }}
                            >
                              <Avatar
                                src={r.profiles?.avatar_url}
                                name={r.profiles?.full_name ?? "Pengguna"}
                                size={28}
                              />
                              <strong
                                style={{ fontSize: 13, color: "#0d1d38" }}
                              >
                                {r.profiles?.full_name ?? "Pengguna"}
                              </strong>
                              <div
                                style={{
                                  marginLeft: "auto",
                                  display: "flex",
                                  gap: 2,
                                }}
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <span
                                    key={n}
                                    style={{
                                      fontSize: 13,
                                      color:
                                        n <= r.rating ? "#f6a61e" : "#d9d1c2",
                                    }}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            {r.body && (
                              <p
                                style={{
                                  fontSize: 13,
                                  color: "#29405f",
                                  margin: 0,
                                  lineHeight: 1.5,
                                }}
                              >
                                {r.body}
                              </p>
                            )}
                            <p
                              style={{
                                fontSize: 11,
                                color: "#7b8594",
                                margin: "6px 0 0",
                              }}
                            >
                              {timeAgo(r.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* FORUM TAB */}
                {activeTab === "forum" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* First comment (maker's intro) */}
                    {app.first_comment && (
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1px solid #d9d1c2",
                          background: "#fffdf8",
                          borderLeft: "3px solid #f6a61e",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <Avatar
                            src={app.app_makers?.[0]?.avatar_url}
                            name={app.app_makers?.[0]?.name ?? "Maker"}
                            size={32}
                          />
                          <div>
                            <strong
                              style={{
                                fontSize: 13,
                                color: "#0d1d38",
                                display: "block",
                              }}
                            >
                              {app.app_makers?.[0]?.name ?? "Maker"}
                            </strong>
                            <span style={{ fontSize: 11, color: "#7b8594" }}>
                              {app.app_makers?.[0]?.role ?? "Pembuat"}
                            </span>
                          </div>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 11,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: "#fef3c7",
                              color: "#92400e",
                              border: "1px solid #fcd34d",
                              fontWeight: 600,
                            }}
                          >
                            Maker
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#29405f",
                            margin: 0,
                            lineHeight: 1.55,
                          }}
                        >
                          {app.first_comment}
                        </p>
                      </div>
                    )}

                    {/* Live comments */}
                    {commentsLoading ? (
                      <p
                        style={{
                          color: "#7b8594",
                          fontSize: 13,
                          textAlign: "center",
                          padding: "8px 0",
                        }}
                      >
                        Memuat komentar...
                      </p>
                    ) : liveComments.length === 0 && !app.first_comment ? (
                      <p
                        style={{
                          color: "#7b8594",
                          fontSize: 13,
                          textAlign: "center",
                          padding: "16px 0",
                        }}
                      >
                        Belum ada diskusi. Mulai percakapan!
                      </p>
                    ) : (
                      liveComments.map((c, i) => (
                        <div key={c.id ?? i} className="ph-pop-comment">
                          <Avatar
                            src={c.profiles?.avatar_url}
                            name={c.profiles?.full_name ?? "Pengguna"}
                            size={36}
                          />
                          <div className="ph-pop-comment-body">
                            <div className="ph-pop-comment-meta">
                              <strong>
                                {c.profiles?.full_name ?? "Pengguna"}
                              </strong>
                              {c.is_pinned && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: "1px 6px",
                                    borderRadius: 4,
                                    background: "#e0f2f1",
                                    color: "#00695c",
                                    border: "1px solid #80cbc4",
                                    fontWeight: 600,
                                  }}
                                >
                                  Disematkan
                                </span>
                              )}
                              <span className="ph-pop-comment-time">
                                {timeAgo(c.created_at)}
                              </span>
                            </div>
                            <p className="ph-pop-comment-text">{c.body}</p>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Comment input */}
                    <div
                      style={{
                        borderTop: "1px solid #e8e0d4",
                        paddingTop: 14,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Tulis komentar atau pertanyaan..."
                            maxLength={500}
                            rows={2}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                                handleSubmitComment();
                            }}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: "1px solid #d9d1c2",
                              fontSize: 13,
                              color: "#29405f",
                              resize: "none",
                              fontFamily: "inherit",
                              background: "#fff",
                              outline: "none",
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="cta-button"
                          style={{
                            height: 34,
                            fontSize: 12,
                            padding: "0 14px",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                          onClick={handleSubmitComment}
                          disabled={submittingComment || !commentText.trim()}
                        >
                          {submittingComment ? "..." : "Kirim"}
                        </button>
                      </div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#7b8594",
                          margin: "4px 0 0",
                        }}
                      >
                        Ctrl+Enter untuk kirim cepat
                      </p>
                    </div>
                  </div>
                )}

                {/* TIM TAB */}
                {activeTab === "tim" && (
                  <div>
                    {app.app_makers.length > 0 && (
                      <div className="ph-pop-team-grid">
                        {app.app_makers.map((m, i) => (
                          <div key={m.name ?? i} className="ph-pop-maker-card">
                            <Avatar
                              src={m.avatar_url}
                              name={m.name}
                              size={48}
                            />
                            <div className="ph-pop-maker-info">
                              <strong className="ph-pop-maker-name">
                                {m.name}
                              </strong>
                              {m.role && (
                                <span className="ph-pop-maker-role">
                                  {m.role}
                                </span>
                              )}
                              <div className="ph-pop-maker-links">
                                {m.website_url && (
                                  <a
                                    href={m.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ph-pop-maker-link"
                                  >
                                    <IcoExternal />
                                  </a>
                                )}
                                {m.twitter_handle && (
                                  <a
                                    href={`https://twitter.com/${m.twitter_handle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ph-pop-maker-link"
                                  >
                                    <IcoX />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {app.built_with.length > 0 && (
                      <div className="ph-pop-built-with">
                        <span className="ph-pop-sidebar-eyebrow">
                          Dibangun dengan
                        </span>
                        <div className="ph-pop-built-chips">
                          {app.built_with.map((t) => (
                            <span key={t} className="ph-pop-built-chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {app.app_makers.length === 0 &&
                      app.built_with.length === 0 && (
                        <p
                          style={{
                            color: "#7b8594",
                            fontSize: 14,
                            textAlign: "center",
                            padding: "32px 0",
                          }}
                        >
                          Informasi tim belum tersedia.
                        </p>
                      )}
                  </div>
                )}

                {/* LAINNYA TAB */}
                {activeTab === "lainnya" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    {/* Tech stack */}
                    {app.built_with?.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#7b8594",
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            margin: "0 0 8px",
                          }}
                        >
                          Dibangun dengan
                        </p>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                        >
                          {app.built_with.map((t) => (
                            <span
                              key={t}
                              style={{
                                padding: "4px 10px",
                                borderRadius: 6,
                                border: "1px solid #d9d1c2",
                                background: "#f5f2ec",
                                color: "#374352",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    {(() => {
                      const b = pricingBadge(app.pricing_type);
                      return b ? (
                        <div>
                          <p
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#7b8594",
                              letterSpacing: "0.07em",
                              textTransform: "uppercase",
                              margin: "0 0 8px",
                            }}
                          >
                            Model harga
                          </p>
                          <span
                            className="ph-pop-pricing-badge"
                            style={{
                              background: b.bg,
                              color: b.color,
                              border: `1px solid ${b.border}`,
                            }}
                          >
                            {b.label}
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {/* Open source */}
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#7b8594",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          margin: "0 0 8px",
                        }}
                      >
                        Open source
                      </p>
                      {app.is_open_source ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "#e8f5e9",
                            color: "#2e7d32",
                            border: "1px solid #a5d6a7",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          ✓ Ya, open source
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: "#7b8594" }}>
                          Tidak / belum diketahui
                        </span>
                      )}
                    </div>

                    {/* Launch info */}
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#7b8594",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          margin: "0 0 8px",
                        }}
                      >
                        Tanggal launch
                      </p>
                      <span style={{ fontSize: 13, color: "#29405f" }}>
                        {app.launch_date
                          ? new Date(app.launch_date).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "Belum diketahui"}
                      </span>
                    </div>

                    {/* Website */}
                    {app.website_url && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#7b8594",
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            margin: "0 0 8px",
                          }}
                        >
                          Website
                        </p>
                        <a
                          href={app.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 13,
                            color: "#29405f",
                            textDecoration: "none",
                          }}
                        >
                          <IcoExternal />
                          {app.website_url
                            .replace(/^https?:\/\//, "")
                            .replace(/\/$/, "")}
                        </a>
                      </div>
                    )}

                    {/* Tags */}
                    {app.launch_tags?.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#7b8594",
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            margin: "0 0 8px",
                          }}
                        >
                          Kategori
                        </p>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                        >
                          {app.launch_tags.map((t) => (
                            <span key={t} className="ph-pop-tag-chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* /tab-panel */}
            </div>
            {/* /ph-pop-main */}

            {/* RIGHT COLUMN — SIDEBAR */}
            <aside className="ph-pop-sidebar">
              {/* Upvote block */}
              <div className="ph-pop-upvote-block">
                <button
                  type="button"
                  className={"ph-pop-upvote-btn" + (upvoted ? " active" : "")}
                  onClick={handleUpvote}
                  aria-pressed={upvoted}
                  disabled={upvoteLoading}
                >
                  <IcoTriangle filled={upvoted} />
                  <span className="ph-pop-upvote-count">{upvotes}</span>
                  <span className="ph-pop-upvote-label">Upvote</span>
                </button>
              </div>

              {/* Follow block */}
              <button
                type="button"
                className={"ph-pop-follow-block" + (following ? " active" : "")}
                onClick={handleFollow}
                aria-pressed={following}
                disabled={followLoading}
              >
                {following ? "Mengikuti ✓" : "Ikuti"}
              </button>

              <div className="ph-pop-sidebar-divider" />

              {/* Save to collection */}
              <button
                type="button"
                className={"ph-pop-sidebar-action" + (saved ? " active" : "")}
                onClick={() => setSaved((s) => !s)}
              >
                <IcoBookmark /> {saved ? "Tersimpan" : "Tambah ke Koleksi"}
              </button>

              {/* Share */}
              <button
                type="button"
                className="ph-pop-sidebar-action"
                onClick={() =>
                  navigator.share?.({
                    title: app.name,
                    url: app.website_url || window.location.href,
                  })
                }
              >
                <IcoShare /> Bagikan
              </button>

              <div className="ph-pop-sidebar-divider" />

              {/* Info Perusahaan */}
              <div className="ph-pop-sidebar-section">
                <span className="ph-pop-sidebar-eyebrow">Info perusahaan</span>
                {app.website_url && (
                  <a
                    href={app.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ph-pop-sidebar-row"
                  >
                    <IcoExternal />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {app.website_url
                        .replace(/^https?:\/\//, "")
                        .replace(/\/$/, "")}
                    </span>
                  </a>
                )}
                {app.is_open_source && (
                  <span
                    style={{
                      display: "inline-flex",
                      marginTop: 4,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      border: "1px solid #a5d6a7",
                      fontSize: 12,
                    }}
                  >
                    Open Source
                  </span>
                )}
                {app.twitter_handle && (
                  <div className="ph-pop-sidebar-row">
                    <IcoX /> <span>@{app.twitter_handle}</span>
                  </div>
                )}
              </div>

              {/* Info Peluncuran */}
              <div className="ph-pop-sidebar-section">
                <span className="ph-pop-sidebar-eyebrow">Info peluncuran</span>
                {(app.launch_date || app.created_at) && (
                  <div className="ph-pop-sidebar-row">
                    Diluncurkan tahun{" "}
                    {new Date(app.launch_date || app.created_at).getFullYear()}
                  </div>
                )}
                <a
                  href={`/forum?app=${app.slug}`}
                  className="ph-pop-sidebar-row ph-pop-forum-link"
                >
                  Lihat di forum →
                </a>
              </div>

              {/* Sosial */}
              {(app.twitter_handle || app.instagram_handle) && (
                <div className="ph-pop-sidebar-section">
                  <span className="ph-pop-sidebar-eyebrow">Sosial</span>
                  {app.twitter_handle && (
                    <a
                      href={`https://twitter.com/${app.twitter_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ph-pop-sidebar-row"
                    >
                      <IcoX /> @{app.twitter_handle}
                    </a>
                  )}
                  {app.instagram_handle && (
                    <a
                      href={`https://instagram.com/${app.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ph-pop-sidebar-row"
                    >
                      <IcoInstagram /> {app.instagram_handle}
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
