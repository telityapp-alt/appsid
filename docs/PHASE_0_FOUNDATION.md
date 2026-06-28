# PHASE 0 — FOUNDATION

Setup foundational infrastructure sebelum menyentuh satu pun page.
Setelah phase ini selesai, seluruh app berjalan persis seperti sebelumnya — zero UI change — tapi sudah siap untuk migrasi data ke Supabase di phase berikutnya.

---

## Tujuan

- Install Supabase client
- Buat struktur folder yang akan dipakai semua phase berikutnya
- Setup environment variables
- Buat `supabase.js` singleton client
- Buat `AuthContext` + `useAuth` hook
- Buat `Skeleton` component untuk loading state
- Jalankan migration SQL untuk tabel `profiles`
- Wrap `App` dengan `AuthProvider` di `main.jsx`

---

## 1. Install Dependencies

```bash
npm install @supabase/supabase-js@2.50.0
```

**Kenapa versi exact (`2.50.0`) bukan `^2.50.0`?**

Dengan `^`, npm bebas upgrade ke `2.x.x` berikutnya yang bisa membawa breaking changes di behavior auth atau realtime. Pin ke versi exact memastikan semua developer di tim dan CI/CD pipeline menggunakan binary yang identik, sehingga bug tidak muncul hanya di mesin tertentu. Upgrade versi dilakukan secara sadar dan eksplisit, bukan otomatis.

---

## 2. Struktur Folder Baru

Buat folder-folder berikut di bawah `src/`. File yang sudah ada tidak diubah.

```
src/
├── lib/
│   ├── supabase.js          ← Supabase client singleton (satu instance untuk seluruh app)
│   └── constants.js         ← Enums dan shared constants (roles, routes)
├── context/
│   └── AuthContext.jsx      ← React context untuk auth state global
├── hooks/
│   └── useAuth.js           ← Shortcut hook: useContext(AuthContext)
├── components/
│   └── ui/
│       └── Skeleton.jsx     ← Reusable loading skeleton
└── pages/                   ← (kosong dulu) tempat page components dipindah di phase mendatang
```

Buat folder dengan perintah berikut (jalankan dari root project):

```bash
mkdir -p src/lib src/context src/hooks src/components/ui src/pages
```

---

## 3. File `.env.example`

Buat file `.env.example` di root project. File ini di-commit ke git sebagai template — berisi nama variabel tapi bukan value aslinya.

```
# Salin file ini ke .env dan isi dengan nilai dari Supabase dashboard
# Project Settings → API

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Kemudian buat `.env` lokal kamu sendiri (tidak di-commit):

```bash
cp .env.example .env
# lalu buka .env dan isi dengan URL + anon key dari Supabase dashboard
```

---

## 4. Update `.gitignore`

Pastikan `.env` dan variannya tidak ikut ke-commit. Tambahkan baris berikut ke `.gitignore` jika belum ada:

```gitignore
# Environment variables — jangan pernah commit secrets
.env
.env.local
.env.*.local
.env.production
```

---

## 5. `src/lib/supabase.js` — Full File

Satu instance client untuk seluruh aplikasi. Import `supabase` dari file ini di mana saja kamu butuh query ke database atau auth.

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fail fast saat startup jika env vars belum diisi.
// Lebih baik crash dengan pesan jelas daripada silent error di runtime.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Copy .env.example to .env and fill in your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Simpan session di localStorage agar user tidak logout saat refresh
    persistSession: true,
    // Otomatis refresh JWT sebelum expired (default expiry Supabase: 1 jam)
    autoRefreshToken: true,
    // Parse token dari URL hash setelah OAuth redirect atau magic link
    detectSessionInUrl: true,
  },
})
```

---

## 6. `src/lib/constants.js` — Full File

Satu sumber kebenaran untuk nilai-nilai yang dipakai di banyak tempat. Dengan ini, perubahan nama route atau role cukup di satu file.

```js
/**
 * Role pengguna di Appverse.ID.
 * Nilai ini harus cocok persis dengan CHECK constraint di tabel profiles.
 */
export const USER_ROLES = {
  VISITOR: 'visitor',
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
}

/**
 * Daftar routes aplikasi.
 * Gunakan konstanta ini di <Link to={ROUTES.BURSA}> atau navigate(ROUTES.BURSA)
 * agar tidak ada typo di string route.
 */
export const ROUTES = {
  HOME: '/',
  BANSOS: '/bansos',
  BURSA: '/bursa',
  FORUM: '/forum',
  MARKETPLACE: '/marketplace',
  NEWS: '/news',
  EVENTS: '/events',
  JOBS: '/jobs',
  TOOLS: '/tools',
  PATUNGAN: '/patungan',
  APPS: '/apps',
  ODOO: '/odoo',
  SOLUTIONS: '/solutions',
  FRANCHISE: '/franchise',
  PREPPY: '/preppy',
  HPP: '/hpp',
  DOCS: '/docs',
  PROFILE: '/profile',
  ADMIN: '/admin',
}
```

---

## 7. `src/context/AuthContext.jsx` — Full File

Context ini menjadi satu-satunya sumber auth state di seluruh aplikasi. Semua komponen yang butuh tahu siapa user yang login cukup panggil `useAuth()`.

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * AuthContext menyediakan:
 *   user     — object user Supabase (null jika belum login)
 *   session  — object session Supabase (null jika belum login)
 *   loading  — true selama initial session check berlangsung
 *   signIn   — fungsi login dengan email + password
 *   signUp   — fungsi registrasi dengan email + password + metadata opsional
 *   signOut  — fungsi logout
 */
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  // loading = true sampai kita tahu apakah ada session yang tersimpan atau tidak.
  // Ini mencegah flash konten "belum login" sebelum session di-restore dari localStorage.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ambil session yang sudah ada (tersimpan di localStorage dari visit sebelumnya)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Dengarkan perubahan auth state: login, logout, token refresh, OAuth callback
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      // Setelah event pertama, loading sudah false — tidak perlu set lagi
    })

    // Cleanup: unsubscribe saat AuthProvider unmount (misalnya saat testing)
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Login dengan email dan password.
   * Melempar error jika credentials salah — tangkap di UI.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, session: object }>}
   */
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  /**
   * Registrasi user baru.
   * metadata opsional: { full_name, avatar_url, ... }
   * Setelah signup, Supabase trigger akan otomatis membuat baris di tabel profiles.
   *
   * @param {string} email
   * @param {string} password
   * @param {object} [metadata={}]
   * @returns {Promise<{ user: object, session: object }>}
   */
  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    if (error) throw error
    return data
  }

  /**
   * Logout user saat ini.
   * onAuthStateChange akan otomatis reset user dan session ke null.
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook shortcut — bisa diimport langsung dari AuthContext
 * tapi lebih disarankan import dari hooks/useAuth.js untuk konsistensi.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

---

## 8. `src/hooks/useAuth.js` — Full File

Hook ini adalah entry point yang direkomendasikan untuk semua komponen. Dengan memisahkan hook dari context file, import path lebih bersih dan mudah di-mock saat testing.

```js
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Hook untuk mengakses auth state dan methods dari mana saja di dalam AuthProvider.
 *
 * Contoh penggunaan:
 *   const { user, loading, signIn, signOut } = useAuth()
 *
 * @returns {{ user, session, loading, signIn, signUp, signOut }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

---

## 9. Update `src/main.jsx`

Wrap `<App>` dengan `<AuthProvider>`. `<BrowserRouter>` tetap di posisinya — tidak berubah.

Sebelum:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

Sesudah:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

`AuthProvider` di dalam `BrowserRouter` karena di phase mendatang kita mungkin perlu `useNavigate` di dalam AuthProvider (misalnya redirect setelah login). Urutan ini menghindarkan kita dari refactor di kemudian hari.

---

## 10. `src/components/ui/Skeleton.jsx` — Full File

Komponen loading placeholder yang cocok dengan design system parchment. Dipakai oleh semua page selama data sedang di-fetch dari Supabase.

```jsx
/**
 * Skeleton — loading placeholder yang mengikuti warna design system parchment.
 *
 * Props:
 *   width   {string}  — CSS width, default '100%'
 *   height  {string}  — CSS height, default '1rem'
 *   borderRadius {string} — CSS border-radius, default '4px'
 *   style   {object}  — override style tambahan
 *
 * Contoh penggunaan:
 *   <Skeleton height="1.5rem" width="60%" />
 *   <Skeleton height="120px" borderRadius="8px" />
 */
export function Skeleton({ width = '100%', height = '1rem', borderRadius = '4px', style = {} }) {
  return (
    <>
      <style>{skeletonKeyframes}</style>
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          width,
          height,
          borderRadius,
          background: 'linear-gradient(90deg, #e8dfc8 25%, #f0e8d5 50%, #e8dfc8 75%)',
          backgroundSize: '200% 100%',
          animation: 'appverse-skeleton-shimmer 1.4s ease-in-out infinite',
          ...style,
        }}
      />
    </>
  )
}

const skeletonKeyframes = `
  @keyframes appverse-skeleton-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`

/**
 * SkeletonText — shortcut untuk beberapa baris teks skeleton.
 *
 * Props:
 *   lines  {number}  — jumlah baris, default 3
 *   gap    {string}  — jarak antar baris, default '0.5rem'
 *
 * Contoh penggunaan:
 *   <SkeletonText lines={4} />
 */
export function SkeletonText({ lines = 3, gap = '0.5rem' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          // Baris terakhir lebih pendek untuk tampilan natural
          width={i === lines - 1 ? '70%' : '100%'}
          height="0.875rem"
        />
      ))}
    </div>
  )
}

/**
 * SkeletonCard — placeholder untuk card component.
 *
 * Props:
 *   style  {object}  — override style container
 */
export function SkeletonCard({ style = {} }) {
  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid #d4c9a8',
        borderRadius: '8px',
        background: '#faf6ee',
        ...style,
      }}
    >
      {/* Gambar / thumbnail */}
      <Skeleton height="160px" borderRadius="6px" style={{ marginBottom: '0.75rem' }} />
      {/* Judul */}
      <Skeleton height="1.125rem" width="80%" style={{ marginBottom: '0.5rem' }} />
      {/* Deskripsi */}
      <SkeletonText lines={2} />
    </div>
  )
}
```

---

## 11. SQL: `supabase/migrations/000_profiles.sql` — Full File

Buat folder `supabase/migrations/` di root project, lalu buat file ini. Jalankan isinya di **Supabase Dashboard → SQL Editor**.

```sql
-- =============================================================================
-- Migration: 000_profiles
-- Deskripsi: Tabel profiles yang meng-extend auth.users, RLS policies,
--            auto-create trigger, dan storage bucket untuk avatars.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabel: public.profiles
-- Setiap user yang signup otomatis punya satu baris di sini (via trigger).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username     text        UNIQUE,
  full_name    text,
  avatar_url   text,
  role         text        NOT NULL DEFAULT 'visitor'
                           CHECK (role IN ('visitor', 'buyer', 'seller', 'admin')),
  bio          text,
  website      text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Fungsi + Trigger: Auto-create profile saat user baru signup
-- Berjalan sebagai SECURITY DEFINER agar bisa INSERT meski RLS aktif.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Hapus trigger lama dulu jika sudah ada (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Fungsi + Trigger: Auto-update kolom updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_role_idx     ON public.profiles(role);

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Aktifkan RLS — tanpa ini semua policy di bawah tidak berlaku.
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Siapa saja (termasuk anonymous) bisa membaca semua profile
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- User hanya bisa INSERT profile miliknya sendiri
-- (Normalnya dilakukan oleh trigger, bukan client langsung)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User hanya bisa UPDATE profile miliknya sendiri
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Storage: Bucket untuk avatar gambar profil
-- -----------------------------------------------------------------------------

-- Buat bucket 'avatars' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- Semua orang bisa melihat avatar (bucket public)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- User hanya bisa upload ke folder dengan nama = user ID mereka sendiri
-- Konvensi path: avatars/{user_id}/avatar.jpg
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- User hanya bisa update/replace avatar miliknya sendiri
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- User hanya bisa delete avatar miliknya sendiri
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 12. Checklist Phase 0

Verifikasi semua item ini sebelum lanjut ke Phase 1.

```
[ ] npm install @supabase/supabase-js@2.50.0 berhasil (cek di package.json)
[ ] .env dibuat dari .env.example, diisi dengan URL + anon key dari Supabase dashboard
[ ] .env dan .env.local ada di .gitignore
[ ] Supabase project dibuat di https://supabase.com/dashboard
[ ] Migration 000_profiles.sql berhasil dijalankan di Supabase → SQL Editor
    (cek: tabel profiles muncul di Table Editor)
[ ] src/lib/supabase.js bisa diimport tanpa error di browser console
[ ] AuthContext ter-wrap di main.jsx (cek: tidak ada error "useAuth outside AuthProvider")
[ ] Skeleton.jsx bisa dirender tanpa error
[ ] npm run dev masih jalan normal — semua halaman tampil persis sama seperti sebelumnya
[ ] npm run build berhasil tanpa error
```

---

## Catatan Penting

**Urutan wrap di main.jsx:** `BrowserRouter` > `AuthProvider` > `App`. Jangan dibalik. Jika `AuthProvider` di luar `BrowserRouter`, maka komponen di dalam AuthProvider tidak bisa pakai `useNavigate` dari React Router.

**Anon key vs Service role key:** Yang dipakai di frontend adalah `anon key` (aman diekspos ke browser). Jangan pernah taruh `service_role` key di kode frontend — key ini punya akses penuh ke database dan mem-bypass semua RLS.

**`loading` state di AuthContext:** Selalu cek `loading` sebelum render konten yang bergantung pada auth state. Jika tidak, user akan melihat flash konten "guest" sebelum session di-restore dari localStorage.

```jsx
// Contoh penggunaan loading state di page component
function ProfilePage() {
  const { user, loading } = useAuth()

  if (loading) return <SkeletonCard />
  if (!user) return <p>Silakan login terlebih dahulu.</p>

  return <div>Halo, {user.email}</div>
}
```
