# Phase 0 — Backup & Audit

> **Status:** `[x] Done`
>
> **Prinsip Besi:**
> - Tidak ada satu baris kode pun yang diubah di phase ini
> - Semua yang dilakukan bersifat read-only + copy
> - Phase ini adalah safety net sebelum seluruh build dimulai

---

## 0.1 Tujuan

Snapshot seluruh state saat ini yang berhubungan dengan fitur Apps:
1. Backup file-file yang akan dirombak
2. Audit routing dan dependencies
3. Inventarisasi CSS classes yang FROZEN (tidak boleh diubah)
4. Dokumentasi data model lama vs baru
5. Konfirmasi environment & toolchain siap

---

## 0.2 File Backup

### Files yang AKAN dirombak total (perlu di-backup):

| File Asli | File Backup | Status |
|---|---|---|
| `src/RetroPopover.jsx` | `src/RetroPopover.backup.jsx` | ✅ Done |
| `src/AppsList.jsx` | `src/AppsList.backup.jsx` | ✅ Done |

### Files yang FROZEN (TIDAK BOLEH diubah sedikitpun):

| File | Section yang Frozen | Alasan |
|---|---|---|
| `src/App.css` | Semua class `.apps-page-layout`, `.apps-left-sidebar`, `.apps-sidebar`, `.app-list-item`, `.library-card`, `.library-card-hero`, `.library-card-ribbon`, `.library-card-meta`, `.sidebar-widget`, `.sidebar-eyebrow` | Outer shell AppsList |
| `src/AppsList.jsx` | Layout structure: `<section.apps-page-layout>`, `<aside.apps-left-sidebar>`, `<div.apps-main>`, `<aside.apps-sidebar>` — skeleton-nya tidak berubah, hanya data source & popover |
| `src/App.jsx` | Semua function selain `AppsPageWithPopover()` dan `mockApps` data |

---

## 0.3 Audit Routing

### Current routing di `src/App.jsx`:

```
/apps              → <AppsPage />            → renders AppsList.jsx
/apps/:slug        → <AppsPageWithPopover /> → renders AppsList + RetroPopover
```

### `toSlug()` helper — CONFIRMED:
```js
// Lokasi: App.jsx L618–623
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
// Dipakai di AppsPageWithPopover (L2328): mockApps.find(a => toSlug(a.name) === slug)
// Duplikat juga ada di OdooPage.jsx L518 (exported) — tidak konflik
// Post-Phase 3: akan dipakai untuk lookup dari Supabase by slug/id
```

### Routing dependencies:
- `react-router-dom@6.30.0` — `useParams`, `useNavigate` sudah terinstall ✅
- Slug-based navigation: `/apps/signal-board` → buka popover app tersebut
- **Post-Phase 3:** slug akan diganti dengan `id` (UUID) atau `slug` field dari Supabase

### mockApps di `AppsPageWithPopover` (App.jsx L2286–2327):

| id | name | category | upvotes |
|---|---|---|---|
| 1 | Signal board | Analytics | 428 |
| 2 | Flow pilot | Analytics | 315 |
| 3 | Warehouse one | Productivity | 289 |
| 4 | Issue radar | Developer Tools | 194 |
| 5 | Launch deck | Developer Tools | 156 |

> ⚠️ Data ini duplikat — ada juga di AppsList.jsx via `libraryCards` mapping. Phase 1 akan konsolidasi ke Supabase.

---

## 0.4 Audit Data Model Lama

### Data model saat ini (dari `libraryCards` di `App.jsx` L250–368):
```js
{
  name: string,          // nama project
  role: string,          // → di-map ke tagline di AppsList
  place: string,         // lokasi client
  team: string,          // → di-map ke category
  status: string,        // "Live" | "On Development"
  image: string,         // single image URL
  overview: string,
  stats: [{ label, value }],
  highlights: string[],
  strategy: [{ phase, desc, image }],
  userJourney: [{ step, tag, desc, callout }],
  richContent: {
    title: string,
    blocks: [
      { type: "text", content: string },
      { type: "list", items: string[] },
      { type: "kv", rows: [{ label, value }] }
    ]
  }
}
```

### AppsList.jsx mapping saat ini (L31–40):
```js
appsData = libraryCards.map((card, i) => ({
  id: i + 1,
  ...card,
  tagline: card.role,           // role → tagline
  category: card.team,          // team → category
  upvotes: 150 + i * 23,        // static mock
  status: card.status || "On Development",
}))
```

### Problem dengan model lama:
- Data hardcoded di `App.jsx` — tidak bisa di-submit user
- Tidak ada `gallery[]` (hanya single `image`)
- Tidak ada `upvotes`, `reviews`, `tags`, `website`, `makers`, dll
- `role`/`team`/`place` adalah field portofolio, bukan product info
- Tidak ada timestamps, auth ownership, atau status approval

---

## 0.5 Audit CSS Classes yang Digunakan AppsList

### Classes FROZEN — jangan dimodif atau dihapus:

```css
/* Layout */
.apps-page-layout        /* outer 3-column grid */
.apps-left-sidebar       /* filter sidebar kiri */
.apps-main               /* area list tengah */
.apps-sidebar            /* sidebar kanan (featured, tech stack, dll) */

/* App List Item */
.app-list-item           /* satu row app di list */
.app-list-item:hover
.app-info                /* wrapper name + tagline */
.app-name                /* nama app */
.app-tagline             /* tagline pendek */
.app-category-badge      /* badge kategori */
.upvote-button           /* tombol upvote di list */
.upvote-count

/* Sidebar widgets */
.sidebar-widget
.sidebar-eyebrow
.panel-chip
.panel-chips

/* Library card (dipakai di sidebar featured) */
.library-card
.library-card-hero
.library-card-screenshot-wrap
.library-card-screenshot
.library-card-ribbon
.library-card-meta
```

---

## 0.6 Audit Environment & Toolchain

### Hasil audit aktual:

| Check | Status | Catatan |
|---|---|---|
| `VITE_SUPABASE_URL` di `.env.local` | ⚠️ Tidak ditemukan | File `.env.local` tidak ada di root project — perlu dibuat sebelum Phase 1 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_ANON_KEY` | ⚠️ Tidak ditemukan | Sama — file `.env.local` belum ada |
| `@supabase/supabase-js` di `package.json` | ✅ Ada | `^2.50.0` |
| `react-router-dom` di `package.json` | ✅ Ada | `6.30.0` (pinned, bagus) |
| `src/lib/supabase.js` | ✅ Ada | Sudah ada graceful fallback — jika env vars null, `supabase = null`, app tidak crash |
| Storage bucket | ❌ Belum ada | Perlu dibuat di Phase 1 |
| Auth provider di Supabase dashboard | ⚠️ Belum dikonfirmasi | Perlu dicek manual di dashboard |
| Supabase CLI | ⚠️ Belum dikonfirmasi | Perlu dicek: `supabase --version` |
| Migration terakhir | ✅ `002_bansos_seed_real.sql` | File baru akan `003_apps.sql` |

### `src/lib/supabase.js` — sudah production-grade:
```js
// Graceful null fallback — app tetap jalan tanpa env vars
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, { auth: { ... } })
    : null;
```

### Langkah sebelum Phase 1:
```bash
# 1. Buat file .env.local di root project
# 2. Isi dengan:
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# 3. Verifikasi CLI:
supabase --version
```

---

## 0.7 Inventarisasi File Baru yang Akan Dibuat

| File | Dibuat di Phase | Fungsi |
|---|---|---|
| `supabase/migrations/003_apps.sql` | Phase 1 | Schema tabel apps, upvotes, storage policy |
| `src/hooks/useApps.js` | Phase 1 | Supabase data fetching hook |
| `src/hooks/useUpvote.js` | Phase 1 | Upvote logic dengan optimistic update |
| `src/hooks/useSubmitApp.js` | Phase 2 | Submit app + upload logic |
| `src/components/SubmitAppModal.jsx` | Phase 2 | Multi-step submit form |
| `src/components/SubmitAppModal.css` | Phase 2 | CSS khusus modal submit |
| `src/components/ImageUploader.jsx` | Phase 2 | Drag & drop image upload component |
| `src/RetroPopover.jsx` | Phase 3 | ROMBAK TOTAL — PH-style popover |
| `src/AppsList.jsx` | Phase 4 | Update data source ke Supabase |

### Existing hooks dir — sudah ada:
- `src/hooks/` — direktori sudah ada, siap diisi Phase 1
- `src/components/` — direktori sudah ada, siap diisi Phase 2

---

## 0.8 Definition of Done — Phase 0

- [x] `src/RetroPopover.backup.jsx` exists dan identik dengan original
- [x] `src/AppsList.backup.jsx` exists dan identik dengan original
- [x] Dokumen audit ini lengkap terisi
- [x] Semua frozen CSS classes terdokumentasi
- [x] `toSlug()` helper dikonfirmasi — Ada di `App.jsx` L618–623
- [x] Data model lama didokumentasikan lengkap
- [x] mockApps di `AppsPageWithPopover` diinventarisasi
- [ ] Environment variables dikonfirmasi (`.env.local` belum ada — action item sebelum Phase 1)
- [x] Tidak ada satu baris kode pun yang berubah dari state original

---

## 0.9 Risiko & Mitigasi

| Risiko | Probabilitas | Status | Mitigasi |
|---|---|---|---|
| Backup file terlupakan sebelum edit | Medium | ✅ Resolved | Backup sudah di-commit sebelum phase lain dimulai |
| Supabase env vars tidak ada | **High** | ⚠️ Active | `.env.local` belum ada — app tetap jalan karena `supabase.js` sudah null-safe. Buat file sebelum Phase 1 |
| CSS class frozen ter-overwrite | Low | ✅ Documented | Semua class frozen terdokumentasi di 0.5, reviewer cek sebelum merge |
| `toSlug()` helper tidak ditemukan | Low | ✅ Resolved | Dikonfirmasi di `App.jsx` L618–623, dipakai di L2328 |
| Data duplikat mockApps vs libraryCards | Medium | 📋 Noted | Konsolidasi di Phase 1 saat migrasi ke Supabase |

---

## 0.10 Catatan Tambahan (Temuan Audit)

1. **`src/hooks/` sudah ada** — ada existing hooks di sana, cek isinya sebelum Phase 1 agar tidak konflik
2. **`src/components/` sudah ada** — sama, cek existing components
3. **`toSlug()` duplikat** — ada di `App.jsx` (private) dan `OdooPage.jsx` (exported). Pertimbangkan extract ke `src/lib/utils.js` di Phase 3 agar DRY, tapi bukan blocking issue sekarang
4. **`react-router-dom` pinned ke `6.30.0`** — bagus, tidak akan ada surprise upgrade
5. **Migration naming** — sudah ada `000_`, `001_`, `002_` — next file harus `003_apps.sql` agar urutan konsisten
