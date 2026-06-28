# APPVERSE.ID — MASTER PLAN PRODUCTION

Ringkasan vision, tech stack saat ini vs target, dan daftar semua phases.

---

## Vision

Platform ProductHunt versi Indonesia: discovery apps, marketplace digital (Bursa), forum, news, events, jobs, patungan, dan program bantuan (Bansos AI).

---

## Tech Stack Saat Ini

| Layer | Detail |
|-------|--------|
| Framework | React 19 + Vite 5 |
| Routing | React Router DOM 6.30 |
| Styling | Vanilla CSS (~4900 baris, design system parchment: bg `#f6eddc`, font Source Sans 3) |
| Data | Semua hardcoded di JSX (array/const di tiap page) |
| Backend | Zero backend |

---

## Target Stack (Production)

| Layer | Detail |
|-------|--------|
| Frontend | Sama persis — React 19, Vite 5, CSS tidak disentuh |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime) |
| Client | `@supabase/supabase-js` v2 |
| Auth | Supabase Auth (email+password, OAuth opsional) |
| Storage | Supabase Storage (avatars, images) |
| CI/CD | GitHub Actions → Vercel / Netlify |

---

## Prinsip Migrasi

1. **ZERO UI regression** — tidak ada satu class CSS pun yang berubah.
2. **Data flow satu arah:** hardcoded → hook → Supabase. UI component tidak tahu bedanya.
3. **Setiap phase bisa di-deploy secara independen** — tidak ada phase yang memblokir phase lain.
4. **Seed data** dari hardcoded arrays ke Supabase, bukan menghapus data lama.

---

## Daftar Pages Saat Ini

| File | Route | Deskripsi |
|------|-------|-----------|
| `App.jsx` | `/` | Home + routing shell |
| `PerksPage.jsx` | `/bansos` | Program bantuan (→ Bansos AI) |
| `BursaPage.jsx` | `/bursa` | Marketplace digital assets |
| `ForumPage.jsx` | `/forum` | Forum diskusi |
| `MarketplacePage.jsx` | `/marketplace` | Marketplace produk |
| `NewsPage.jsx` | `/news` | Berita |
| `EventsPage.jsx` | `/events` | Events |
| `JobsPage.jsx` | `/jobs` | Lowongan kerja |
| `ToolsPage.jsx` | `/tools` | Tools |
| `PatunganPage.jsx` | `/patungan` | Crowdfunding |
| `AppsList.jsx` | `/apps` | Discovery apps |
| `OdooPage.jsx` | `/odoo` | Odoo |
| `SolutionsPage.jsx` | `/solutions` | Solutions |
| `FranchisePage.jsx` | `/franchise` | Franchise |
| `PreppyPage.jsx` | `/preppy` | Preppy |
| `HppCalculatorPage.jsx` | `/hpp` | HPP Calculator |
| `DocsPage.jsx` | `/docs` | Dokumentasi |

---

## User Roles

| Role | Akses |
|------|-------|
| **visitor** | Browsing tanpa login |
| **buyer** | Bisa inquire listing, daftar event, kontribusi patungan |
| **seller** | Bisa submit listing Bursa, produk marketplace |
| **admin** | Full access + moderasi konten |

---

## Roadmap Phases

| Phase | File | Scope |
|-------|------|-------|
| 0 | `PHASE_0_FOUNDATION.md` | Supabase setup, struktur folder, AuthContext |
| 1 | `PHASE_1_BANSOS_AI.md` | Perks → Bansos AI + Supabase (prioritas pertama) |
| 2 | `PHASE_2_BURSA.md` | Bursa listings → Supabase |
| 3 | `PHASE_3_AUTH.md` | Auth modal, protected routes, user profile |
| 4 | `PHASE_4_APPS.md` | Apps discovery + upvote → Supabase |
| 5 | `PHASE_5_FORUM.md` | Forum posts + comments → Supabase |
| 6 | `PHASE_6_MARKETPLACE.md` | Marketplace + seller dashboard |
| 7 | `PHASE_7_SUPPORTING.md` | News, Events, Jobs, Patungan |
| 8 | `PHASE_8_ADMIN.md` | Super admin dashboard |
| 9 | `PHASE_9_HARDENING.md` | Edge functions, CI/CD, SEO, performance |

---

## Arsitektur Migrasi (Gambaran Umum)

```
Hardcoded JSX arrays
        │
        ▼
  Custom React Hook   ◄──── interface yang sama untuk semua consumers
  (useXxx.js)
        │
        ├── [sebelum migrasi]  return hardcoded data langsung
        │
        └── [sesudah migrasi]  fetch dari Supabase, return shape yang sama
                │
                ▼
          Supabase (PostgreSQL + Auth + Storage)
```

Karena UI component hanya berbicara dengan hook, tidak ada satu pun JSX yang perlu diubah saat data source berpindah dari hardcoded ke database.
