/**
 * normalizeAppRow(row)
 *
 * Maps a raw Supabase `apps` row (with optional `app_makers` join) into
 * the NormalizedApp shape consumed by AppsList and RetroPopover.
 *
 * Keeping this in its own module lets useApps, useSubmitApp, and any
 * future server-side helpers share a single source of truth.
 *
 * @param {object} row  - Raw row from `apps` table (with app_makers joined)
 * @returns {NormalizedApp}
 */
export function normalizeAppRow(row) {
  if (!row) return null;

  return {
    // --- Identity ---
    id: row.id,
    slug: row.slug ?? slugify(row.name ?? ""),
    name: row.name ?? "",
    tagline: row.tagline ?? "",

    // --- Media ---
    // AppsList uses `app.image`; RetroPopover uses `app.image` for the hero
    logo_url: row.logo_url ?? null,
    image: row.logo_url ?? null,
    gallery: Array.isArray(row.gallery_images) ? row.gallery_images : [],

    // --- Taxonomy ---
    launch_tags: Array.isArray(row.launch_tags) ? row.launch_tags : [],
    // First tag is the primary display category (matches .app-category-badge)
    category: row.launch_tags?.[0] ?? "General",
    tags: Array.isArray(row.launch_tags) ? row.launch_tags : [],

    // --- Counters (upvotes field kept for backward compat with useUpvote) ---
    upvotes_count: row.upvotes_count ?? 0,
    upvotes: row.upvotes_count ?? 0,
    reviews_count: row.reviews_count ?? 0,

    // --- Dates & status ---
    launch_date: row.launch_date ?? null,
    status: row.status ?? "live",
    pricing_type: row.pricing_type ?? "free",
    pricingType: row.pricing_type ?? "free",
    created_at: row.created_at ?? null,

    // --- Makers (sorted by order_index if present) ---
    app_makers: Array.isArray(row.app_makers)
      ? row.app_makers
          .slice()
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map((m) => ({
            id: m.id,
            name: m.name ?? "",
            avatar_url: m.avatar_url ?? null,
            role: m.role ?? null,
            twitter_handle: m.twitter_handle ?? null,
          }))
      : [],
    // Flat names list — RetroPopover uses `app.makers`
    makers: Array.isArray(row.app_makers)
      ? row.app_makers
          .slice()
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map((m) => m.name ?? "")
      : [],

    // --- Extended content (not in base schema; kept for RetroPopover compat) ---
    overview: row.description ?? "",
    website: row.website_url ?? null,
    builtWith: Array.isArray(row.built_with) ? row.built_with : [],
    isOpenSource: row.is_open_source ?? false,
    stats: [],
    highlights: [],
    strategy: [],
    userJourney: [],
    richContent: null,

    // --- Raw row attached for debugging / future use ---
    _raw: row,
  };
}

/**
 * Minimal slugify — only used as a fallback when `slug` is missing from DB.
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}
