import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Fallback data when Supabase env vars are not set
const FALLBACK_APPS = [
  {
    id: "preppy",
    slug: "preppy",
    name: "Preppy",
    tagline: "Belajar beasiswa & IELTS dengan gamifikasi ala Duolingo",
    category: "EdTech Product",
    status: "live",
    image: "/preppy/hero-web.png",
    upvotes: 42,
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
            "Endowed Progress Effect — Nunes & Dreze Research",
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
            { label: "Status", value: "Live on Google Play Store" },
          ],
        },
      ],
    },
    gallery: [
      "/preppy/hero-web.png",
      "/preppy/screen-1.webp",
      "/preppy/screen-2.webp",
    ],
    website: null,
    makers: [],
    tags: ["EdTech", "Gamification", "PWA", "Mobile"],
    builtWith: ["React", "Vite", "Capacitor", "Tailwind", "Framer Motion"],
    pricingType: "freemium",
    launchDate: "2026-06-28",
  },
];

export function useApps({ category = null, search = "" } = {}) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchApps() {
      if (!supabase) {
        // No Supabase client — use fallback data with client-side filtering
        let filtered = FALLBACK_APPS;
        if (category && category !== "All") {
          filtered = filtered.filter(
            (a) => a.category === category || a.status === category,
          );
        }
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.tagline.toLowerCase().includes(q),
          );
        }
        setApps(filtered);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Schema: status = 'live' (enum), sort by upvotes_count DESC
        let query = supabase
          .from("apps")
          .select(
            `
            id, slug, name, tagline, description,
            website_url, logo_url, gallery_images,
            launch_tags, built_with, is_open_source,
            pricing_type, status, upvotes_count, reviews_count,
            launch_date, created_at,
            app_makers ( name, avatar_url, role, is_verified, order_index )
          `,
          )
          .eq("status", "live")
          .order("upvotes_count", { ascending: false });

        if (category && category !== "All") {
          // launch_tags is a text array — use overlap operator
          query = query.contains("launch_tags", [category]);
        }

        const { data, error: sbError } = await query;
        if (sbError) throw sbError;

        let results = (data ?? []).map(remapApp);

        if (search) {
          const q = search.toLowerCase();
          results = results.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.tagline.toLowerCase().includes(q),
          );
        }

        if (!cancelled) setApps(results);
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Gagal memuat apps");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchApps();
    return () => {
      cancelled = true;
    };
  }, [category, search]);

  return { apps, loading, error };
}

// Map Supabase DB columns → shape expected by AppsList & RetroPopover
// New schema uses: logo_url, gallery_images, website_url, upvotes_count,
//                  launch_tags, built_with, pricing_type, description
function remapApp(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    // Map new schema fields to UI fields
    category: row.launch_tags?.[0] ?? "General",
    status: row.status,
    image: row.logo_url,
    gallery: row.gallery_images ?? [],
    overview: row.description ?? "",
    website: row.website_url ?? null,
    upvotes: row.upvotes_count ?? 0,
    tags: row.launch_tags ?? [],
    builtWith: row.built_with ?? [],
    pricingType: row.pricing_type ?? "free",
    isOpenSource: row.is_open_source ?? false,
    launchDate: row.launch_date,
    reviewsCount: row.reviews_count ?? 0,
    makers: (row.app_makers ?? [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => m.name),
    // These fields are not in the new schema — kept as empty for compatibility
    // with RetroPopover which renders them only if populated
    stats: [],
    highlights: [],
    strategy: [],
    userJourney: [],
    richContent: null,
  };
}
