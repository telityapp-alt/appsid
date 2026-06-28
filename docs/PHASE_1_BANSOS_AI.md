# PHASE 1 — BANSOS AI (formerly Perks)

> **Status:** Ready to implement  
> **Prioritas:** Pertama — ini yang paling straightforward karena data-nya read-only publik  
> **Estimasi:** 1–2 jam termasuk setup Supabase project

---

## Tujuan

Migrasikan page `/perks` (sekarang `/bansos`) dari data hardcoded di JSX ke Supabase.  
**Zero UI change** — tidak ada satu pun className, style, atau layout yang berubah.

---

## Perubahan yang Dilakukan

### Rename: "Perks" → "Bansos AI"
| Lokasi | Sebelum | Sesudah |
|--------|---------|---------|
| Desktop topnav (`App.jsx` L1805) | `to="/perks"` label "Gratisan" | `to="/bansos"` label "Bansos AI" |
| Mobile nav (`App.jsx` L2022) | `to="/perks"` label "Gratisan" | `to="/bansos"` label "Bansos AI" |
| Route definition (`App.jsx` L2128) | `path="/perks"` | `path="/bansos"` |
| Page title (`PerksPage.jsx`) | "Apphunt for Startups" | "Bansos AI" |
| File name | `PerksPage.jsx` | **Tidak diubah** (cukup route-nya saja) |

### Data Flow: Hardcoded → Supabase
```
Sebelum:  const benefitCards = [...] // 346 baris hardcoded di JSX
Sesudah:  const { programs } = useBansosPrograms() // fetch dari Supabase
```

**Fallback strategy:** Jika Supabase belum dikonfigurasi (env vars kosong), page tetap render dengan data hardcoded lama. Tidak ada crash.

---

## File yang Dibuat / Diubah

```
src/
  hooks/
    useBansosPrograms.js   ← BARU — fetch bansos_programs dari Supabase
    useBansoseFaqs.js      ← BARU — fetch bansos_faqs dari Supabase
  PerksPage.jsx            ← DIUBAH — pakai hooks, tambah loading state, rename title
  main.jsx                 ← DIUBAH — wrap dengan AuthProvider

supabase/migrations/
  000_profiles.sql         ← BARU — profiles table + triggers (jalankan PERTAMA)
  001_bansos.sql           ← BARU — bansos_programs + bansos_faqs tables + RLS
  001_bansos_seed.sql      ← BARU — seed 6 programs + 4 FAQs dari data lama
```

---

## Cara Setup Supabase

### Step 1 — Buat Project
1. Buka [supabase.com](https://supabase.com) → New project
2. Catat: **Project URL** dan **anon public key** dari Settings → API

### Step 2 — Buat `.env`
```bash
# Copy dari .env.example
cp .env.example .env
```
Isi dengan nilai dari dashboard Supabase:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3 — Jalankan Migrations (urutan penting!)
Di Supabase dashboard → **SQL Editor**, jalankan satu per satu:

1. **`supabase/migrations/000_profiles.sql`** — foundation, harus pertama
2. **`supabase/migrations/001_bansos.sql`** — tables + RLS
3. **`supabase/migrations/001_bansos_seed.sql`** — isi data awal

### Step 4 — Verifikasi
```bash
npm run dev
```
Buka `/bansos` → data harus muncul dari Supabase (cek Network tab).

---

## Database Schema

### `bansos_programs`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | `uuid` | PK, auto-generated |
| `slug` | `text` | Unique identifier (ex: "cash", "dev") |
| `eyebrow` | `text` | Label kecil di atas judul |
| `title` | `text` | Judul program |
| `desc` | `text` | Deskripsi singkat |
| `chips` | `text[]` | Badge tags (ex: ["Credits", "12 months"]) |
| `image_url` | `text` | Path ke gambar |
| `author` | `text` | Nama penulis |
| `author_role` | `text` | Role penulis |
| `published_date` | `date` | Tanggal publikasi |
| `read_time` | `text` | Estimasi baca (ex: "4 min read") |
| `category` | `text` | Kategori program |
| `tags` | `text[]` | Tags untuk filter |
| `content` | `jsonb` | Konten artikel (array of typed blocks) |
| `is_active` | `boolean` | Soft delete / toggle |
| `created_by` | `uuid` | FK ke profiles.id |
| `created_at` | `timestamptz` | Auto |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

### `bansos_faqs`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | `uuid` | PK |
| `title` | `text` | Pertanyaan |
| `body` | `text` | Jawaban |
| `bullets` | `text[]` | Poin-poin tambahan |
| `sort_order` | `integer` | Urutan tampil |
| `is_active` | `boolean` | Toggle |

### Content Blocks (JSONB)
Format `content` field mengikuti typed block system yang sama dengan hardcoded data:
```json
[
  { "type": "lead", "text": "..." },
  { "type": "h2", "text": "..." },
  { "type": "p", "text": "..." },
  { "type": "quote", "text": "...", "attribution": "..." },
  { "type": "list", "heading": "...", "items": ["..."] },
  { "type": "callout", "text": "..." },
  { "type": "kv", "rows": [{ "label": "...", "value": "..." }] }
]
```

---

## RLS Policies

### `bansos_programs`
| Policy | Operation | Rule |
|--------|-----------|------|
| "Anyone can view active bansos programs" | SELECT | `is_active = true` |
| "Admins can insert bansos programs" | INSERT | `role = 'admin'` |
| "Admins can update bansos programs" | UPDATE | `role = 'admin'` |
| "Admins can delete bansos programs" | DELETE | `role = 'admin'` |

### `bansos_faqs`
| Policy | Operation | Rule |
|--------|-----------|------|
| "Anyone can view active bansos faqs" | SELECT | `is_active = true` |
| "Admins can manage bansos faqs" | ALL | `role = 'admin'` |

---

## Hook: `useBansosPrograms`

```js
// src/hooks/useBansosPrograms.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useBansosPrograms() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetch() { /* ... */ }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { programs, loading, error }
}
```

**Remap:** Kolom Supabase (`image_url`, `author_role`, dll) di-remap ke shape lama (`image`, `authorRole`) di dalam hook — sehingga `PerksPage.jsx` dan `PerksDetailPopover.jsx` tidak perlu diubah sama sekali.

---

## Loading State

Saat data sedang di-fetch, `PerksPage` menampilkan skeleton cards menggunakan `SkeletonCard` component dari `src/components/ui/Skeleton.jsx`.

Skeleton menggunakan warna `#e8dfc8` (tone parchment) dengan shimmer animation — konsisten dengan design system yang ada.

---

## Checklist

- [x] `@supabase/supabase-js@2.50.0` terinstall
- [x] `src/lib/supabase.js` dibuat
- [x] `src/lib/constants.js` dibuat
- [x] `src/context/AuthContext.jsx` dibuat
- [x] `src/hooks/useAuth.js` dibuat
- [x] `src/components/ui/Skeleton.jsx` dibuat
- [x] `src/main.jsx` di-update dengan AuthProvider
- [x] `supabase/migrations/000_profiles.sql` dibuat
- [x] `supabase/migrations/001_bansos.sql` dibuat
- [x] `supabase/migrations/001_bansos_seed.sql` dibuat
- [x] `src/hooks/useBansosPrograms.js` dibuat
- [x] `src/hooks/useBansoseFaqs.js` dibuat
- [x] `PerksPage.jsx` di-update (hooks + loading + rename title)
- [x] `App.jsx` di-update (route `/bansos`, nav label "Bansos AI")
- [ ] `.env` dibuat dari `.env.example` ← **kamu yang buat, isi dengan key Supabase kamu**
- [ ] Migration SQL dijalankan di Supabase dashboard
- [ ] Buka `/bansos` → tampilan identik
- [ ] Network tab → request ke Supabase berhasil (200)
- [ ] Matikan koneksi → tidak crash (fallback ke hardcoded)

---

## Next: Phase 2

Setelah Bansos AI verified di production → lanjut ke **PHASE_2_BURSA.md**:  
Bursa listings punya lebih banyak complexity (filter, price range, contact seller) tapi pattern-nya sama.
