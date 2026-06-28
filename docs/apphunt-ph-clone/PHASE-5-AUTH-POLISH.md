# Phase 5 — Auth Gates, Polish & Notifications (Apphunt)

> **Status:** Ready to execute
> **Prioritas:** Kelima — auth gates + UX polish sebelum launch
> **Estimasi:** 2 jam implementasi penuh
> **Depends on:** Phase 1 (schema), Phase 2 (submit form), Phase 3 (popover), Phase 4 (data layer)

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [Auth Guard Pattern](#2-auth-guard-pattern)
3. [Launching Today Logic](#3-launching-today-logic)
4. [Toast Notification System](#4-toast-notification-system)
5. [Hari Ini Filter](#5-hari-ini-filter)
6. [App Status Badges](#6-app-status-badges)
7. [Follow System](#7-follow-system)
8. [Accessibility Final Pass](#8-accessibility-final-pass)
9. [Performance Checklist](#9-performance-checklist)
10. [Mobile Responsive Additions](#10-mobile-responsive-additions)
11. [Definition of Done](#11-definition-of-done)

---

## 1. Overview & Goals

Phase ini menutup semua write action yang belum di-gate oleh auth, menambahkan polish UX (toast, badges, sort filter), dan memastikan semua fitur siap production sebelum go-live.

### Goals

| # | Goal |
|---|------|
| 1 | Semua write action (upvote, follow, comment, submit) hanya bisa dilakukan user yang login |
| 2 | Badge "Baru hari ini" muncul otomatis berdasarkan `launch_date` di WIB (UTC+7) |
| 3 | Toast notification system tanpa library eksternal — pure React Context |
| 4 | Filter "Hari ini" menampilkan apps yang launch hari ini (WIB-adjusted) |
| 5 | Chip pricing (Gratis / Freemium / Berbayar) tampil di setiap list item |
| 6 | Follow system dengan `app_follows` table + `useFollow()` hook |
| 7 | Semua interactive elements punya aria-label, focus visible, contrast WCAG AA |
| 8 | Tidak ada N+1 queries, semua images lazy-loaded |

### Prinsip yang Dipertahankan

- **ZERO UI regression** — class CSS yang sudah ada di `App.css` tidak disentuh
- **No new libraries** — semua fitur diimplementasi dengan React + Supabase yang sudah ada
- **Auth modal yang sudah ada dipakai** — tidak membuat auth UI baru
- **WIB (UTC+7) konsisten** untuk semua kalkulasi tanggal

### Files yang Dibuat / Dimodifikasi di Phase Ini

| File | Action | Keterangan |
|------|--------|------------|
| `src/hooks/useAuthGuard.js` | Create | Hook untuk gate semua write action |
| `src/hooks/useFollow.js` | Create | Toggle follow/unfollow + follow count |
| `src/hooks/useHariIniFilter.js` | Create | Filter apps berdasarkan tanggal WIB |
| `src/lib/dateUtils.js` | Create | `isLaunchingToday()` + WIB helpers |
| `src/components/Toast.jsx` | Create | Toast UI component |
| `src/context/ToastContext.jsx` | Create | ToastProvider + useToast hook |
| `src/components/AppStatusBadge.jsx` | Create | Chip badges (Gratis, Freemium, Berbayar, Baru hari ini) |
| `src/AppsList.jsx` | Modify | Integrasi filter Hari Ini + badges |
| `src/RetroPopover.jsx` | Modify | Auth guard pada upvote, follow, comment |
| `src/main.jsx` | Modify | Tambah `<ToastProvider>` wrapping |
| `supabase/migrations/004_app_follows.sql` | Create | Tabel `app_follows` + RLS |

---

## 2. Auth Guard Pattern

Satu hook terpusat yang membungkus semua write action. Tidak ada auth check yang tersebar di mana-mana — semua lewat `useAuthGuard`.

### 2.1 Hook — `src/hooks/useAuthGuard.js`

```js
// src/hooks/useAuthGuard.js
import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Returns { requireAuth(callback) }.
 * If the user is logged in, runs callback() immediately.
 * If not, opens the existing AuthModal and queues the callback
 * to run after successful login.
 *
 * Usage:
 *   const { requireAuth } = useAuthGuard();
 *   <button onClick={() => requireAuth(() => handleUpvote())}>Upvote</button>
 */
export function useAuthGuard() {
  // AuthContext must expose: user, openAuthModal(onSuccessCallback)
  // openAuthModal already exists from Phase 2 — no new UI needed.
  const { user, openAuthModal } = useContext(AuthContext);

  const requireAuth = useCallback(
    (callback) => {
      if (user) {
        // Already logged in — run the action immediately.
        callback();
      } else {
        // Not logged in — open the existing auth modal.
        // Pass the callback so AuthContext can call it after login succeeds.
        openAuthModal(callback);
      }
    },
    [user, openAuthModal]
  );

  return { requireAuth, user };
}
```

### 2.2 AuthContext Requirements

`AuthContext` harus mengekspos `openAuthModal(onSuccessCallback)`. Jika belum ada, tambahkan ke `src/context/AuthContext.jsx`:

```js
// src/context/AuthContext.jsx — tambahkan state & handler berikut
// (jangan ubah bagian lain)

const [pendingCallback, setPendingCallback] = React.useState(null);
const [authModalOpen, setAuthModalOpen] = React.useState(false);

function openAuthModal(onSuccessCallback) {
  // Store the callback so we can run it after login
  setPendingCallback(() => onSuccessCallback);
  setAuthModalOpen(true);
}

// Panggil ini dari handler onAuthSuccess di AuthModal:
function handleAuthSuccess() {
  setAuthModalOpen(false);
  if (pendingCallback) {
    pendingCallback();
    setPendingCallback(null);
  }
}

// Expose via context value:
// value={{ user, session, openAuthModal, authModalOpen, handleAuthSuccess }}
```

### 2.3 Penerapan ke Setiap Write Action

#### Upvote Button (di `RetroPopover.jsx`)

```jsx
// src/RetroPopover.jsx
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useToast } from '../context/ToastContext';

function UpvoteButton({ appId, initialCount, initialVoted }) {
  const { requireAuth } = useAuthGuard();
  const { showToast } = useToast();
  const [count, setCount] = React.useState(initialCount);
  const [voted, setVoted] = React.useState(initialVoted);
  const [loading, setLoading] = React.useState(false);

  async function handleUpvote() {
    if (loading) return;
    setLoading(true);
    try {
      if (voted) {
        await supabase.from('app_upvotes').delete().match({ app_id: appId, user_id: supabase.auth.getUser()?.id });
        setCount((c) => c - 1);
        setVoted(false);
      } else {
        await supabase.from('app_upvotes').insert({ app_id: appId });
        setCount((c) => c + 1);
        setVoted(true);
        showToast('Upvote diberikan!', 'success');
      }
    } catch (err) {
      showToast('Gagal memberikan upvote. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={voted ? `Hapus upvote, saat ini ${count} upvote` : `Upvote app ini, saat ini ${count} upvote`}
      aria-pressed={voted}
      className={`upvote-btn${voted ? ' upvote-btn--active' : ''}`}
      disabled={loading}
      onClick={() => requireAuth(handleUpvote)}
    >
      <CaretUpIcon />
      <span>{count}</span>
    </button>
  );
}
```

#### Follow Button (di `RetroPopover.jsx`)

```jsx
import { useFollow } from '../hooks/useFollow';

function FollowButton({ appId }) {
  const { requireAuth } = useAuthGuard();
  const { following, followCount, toggle, loading } = useFollow(appId);
  const { showToast } = useToast();

  async function handleFollow() {
    const nowFollowing = await toggle();
    showToast(nowFollowing ? 'Kamu mengikuti app ini.' : 'Berhenti mengikuti.', 'info');
  }

  return (
    <button
      type="button"
      aria-label={following ? `Berhenti mengikuti app ini, ${followCount} pengikut` : `Ikuti app ini, ${followCount} pengikut`}
      aria-pressed={following}
      className={`ghost-button${following ? ' ghost-button--active' : ''}`}
      disabled={loading}
      onClick={() => requireAuth(handleFollow)}
    >
      {following ? 'Mengikuti' : 'Ikuti'}
      <span className="follow-count">{followCount}</span>
    </button>
  );
}
```

#### Comment Input (di `RetroPopover.jsx`)

```jsx
function CommentInput({ appId }) {
  const { requireAuth, user } = useAuthGuard();
  const { showToast } = useToast();
  const [text, setText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmitComment() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('app_comments')
        .insert({ app_id: appId, body: text.trim(), is_pinned: false });
      if (error) throw error;
      setText('');
      showToast('Komentar berhasil dikirim!', 'success');
    } catch (err) {
      showToast('Gagal mengirim komentar.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <button
        type="button"
        className="ghost-button"
        aria-label="Login untuk berkomentar"
        onClick={() => requireAuth(() => {})}
      >
        Login untuk berkomentar
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); requireAuth(handleSubmitComment); }}
      className="comment-form"
    >
      <textarea
        aria-label="Tulis komentar"
        placeholder="Tulis komentar..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={1000}
        className="comment-textarea"
      />
      <button
        type="submit"
        className="cta-button"
        disabled={submitting || !text.trim()}
        aria-label="Kirim komentar"
      >
        {submitting ? 'Mengirim...' : 'Kirim'}
      </button>
    </form>
  );
}
```

#### Submit App Button (di `AppsList.jsx`)

```jsx
// Ganti onClick handler tombol "Submit App" di AppsList.jsx
import { useAuthGuard } from '../hooks/useAuthGuard';

function SubmitAppButton({ onOpenModal }) {
  const { requireAuth } = useAuthGuard();

  return (
    <button
      type="button"
      className="cta-button"
      aria-label="Submit aplikasi baru ke Apphunt"
      onClick={() => requireAuth(onOpenModal)}
    >
      Submit App
    </button>
  );
}
```

---

## 3. Launching Today Logic

Semua kalkulasi tanggal menggunakan WIB (UTC+7). Jangan gunakan `new Date()` langsung karena server/browser bisa beda timezone.

### 3.1 File — `src/lib/dateUtils.js`

```js
// src/lib/dateUtils.js

/**
 * Returns the current date string in WIB (UTC+7) as "YYYY-MM-DD".
 * Works correctly regardless of the user's local timezone.
 */
export function getTodayWIB() {
  const now = new Date();
  // Offset to WIB: UTC+7 = +420 minutes
  const wibOffset = 7 * 60; // minutes
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const wibMs = utcMs + wibOffset * 60 * 1000;
  const wibDate = new Date(wibMs);

  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns true if the given launch_date string ("YYYY-MM-DD") equals
 * today's date in WIB.
 *
 * @param {string} launch_date - ISO date string from Supabase, e.g. "2025-07-15"
 * @returns {boolean}
 *
 * @example
 * isLaunchingToday('2025-07-15') // true if today is 2025-07-15 in WIB
 */
export function isLaunchingToday(launch_date) {
  if (!launch_date) return false;
  // launch_date from Supabase is always "YYYY-MM-DD" (DATE type, no time component)
  // getTodayWIB() returns the same format — direct string comparison is safe.
  return launch_date === getTodayWIB();
}

/**
 * Formats a date string to Indonesian locale short format.
 * e.g. "2025-07-15" → "15 Jul 2025"
 *
 * @param {string} dateStr - ISO date string "YYYY-MM-DD"
 * @returns {string}
 */
export function formatDateID(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${day} ${months[month - 1]} ${year}`;
}

/**
 * Returns the start and end of today in WIB as ISO strings,
 * for use in Supabase range queries.
 *
 * @returns {{ start: string, end: string }}
 */
export function getTodayWIBRange() {
  const today = getTodayWIB();
  return {
    start: `${today}T00:00:00+07:00`,
    end: `${today}T23:59:59+07:00`,
  };
}
```

### 3.2 Usage di Komponen

```jsx
// Di AppsList.jsx atau AppCard component
import { isLaunchingToday } from '../lib/dateUtils';

// Dalam render:
{isLaunchingToday(app.launch_date) && (
  <span
    className="badge badge--amber"
    aria-label="Baru diluncurkan hari ini"
  >
    Baru hari ini
  </span>
)}
```

---

## 4. Toast Notification System

Lightweight toast tanpa library. Pure React Context + CSS animation.

### 4.1 Context -- `src/context/ToastContext.jsx`

```jsx
// src/context/ToastContext.jsx
import React, { createContext, useCallback, useContext, useReducer } from 'react';

const ToastContext = createContext(null);
let nextId = 0;

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast];
    case 'REMOVE': return state.filter((t) => t.id !== action.id);
    default:       return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++nextId;
    dispatch({ type: 'ADD', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast() -- call from any component inside <ToastProvider>.
 *
 * showToast(message, type, duration?)
 *   type: 'success' | 'error' | 'info'
 *   duration: ms before auto-dismiss (default 3000)
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
```

### 4.2 Component -- `src/components/Toast.jsx`

```jsx
// src/components/Toast.jsx
import React, { useEffect, useRef, useState } from 'react';

// Each type maps to bg/border/text from the design system.
// success: green  |  error: red  |  info: amber (#f6a61e border)
const TYPE_STYLES = {
  success: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#166534',
    icon: '\u2713',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    icon: '\u2715',
  },
  info: {
    background: '#fffdf8',
    border: '1px solid #f6a61e',
    color: '#0d1d38',
    icon: 'i',
  },
};

export default function Toast({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const styles = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  useEffect(() => {
    // Defer one frame so the CSS transition fires on mount
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleClose() {
    setVisible(false);
    // Wait for slide-out transition (250ms) then remove from DOM
    timerRef.current = setTimeout(() => onRemove(toast.id), 250);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-label={toast.message}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        minWidth: 240,
        maxWidth: 360,
        pointerEvents: 'auto',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.4,
        fontFamily: 'inherit',
        // Slide in from right on mount, slide out on dismiss
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease',
        ...styles,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 16, flexShrink: 0 }}>
        {styles.icon}
      </span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0 2px',
          color: 'inherit',
          opacity: 0.6,
          fontSize: 16,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        x
      </button>
    </div>
  );
}
```

### 4.3 Integration ke `src/main.jsx`

```jsx
// src/main.jsx -- tambahkan ToastProvider sebagai outer wrapper
import { ToastProvider } from './context/ToastContext';

root.render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </React.StrictMode>
);
```

### 4.4 Trigger Points Lengkap

| Aksi | Pesan Toast | Type |
|------|-------------|------|
| Upvote berhasil | "Upvote diberikan!" | `success` |
| Upvote dihapus | "Upvote dihapus." | `info` |
| Submit app berhasil | "App berhasil disubmit! Sedang direview." | `success` |
| Submit app gagal | "Gagal submit app. Coba lagi." | `error` |
| Salin link (Share) | "Link disalin ke clipboard." | `info` |
| Follow berhasil | "Kamu mengikuti app ini." | `info` |
| Unfollow | "Berhenti mengikuti." | `info` |
| Komentar terkirim | "Komentar berhasil dikirim!" | `success` |
| Komentar gagal | "Gagal mengirim komentar." | `error` |

---

## 5. "Hari Ini" Filter

### 5.1 SQL untuk Verifikasi (Supabase Dashboard)

```sql
-- Verifikasi di Supabase SQL Editor:
-- Filter apps yang launch hari ini dalam WIB (Asia/Jakarta = UTC+7)
SELECT
  id, name, slug, launch_date, upvote_count, status
FROM apps
WHERE launch_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date
  AND status = 'live'
ORDER BY upvote_count DESC;
```

Catatan: Supabase PostgREST `.eq()` filter menerima date string langsung.
Kita pass tanggal dari client yang sudah dihitung dalam WIB menggunakan
`getTodayWIB()` dari `src/lib/dateUtils.js`.

### 5.2 Hook -- `src/hooks/useHariIniFilter.js`

```js
// src/hooks/useHariIniFilter.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getTodayWIB } from '../lib/dateUtils';

/**
 * Fetches all live apps that have launch_date === today in WIB.
 * Returns { apps, loading, error, isEmpty }.
 *
 * isEmpty === true means query succeeded but 0 results -- render empty state.
 */
export function useHariIniFilter() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      const todayWIB = getTodayWIB(); // "YYYY-MM-DD"

      const { data, error: supaError } = await supabase
        .from('apps')
        .select(
          'id, name, slug, tagline, logo_url, upvote_count, launch_date, pricing, status'
        )
        .eq('launch_date', todayWIB)
        .eq('status', 'live')
        .order('upvote_count', { ascending: false });

      if (cancelled) return;

      if (supaError) {
        setError(supaError.message);
        setLoading(false);
        return;
      }

      setApps(data ?? []);
      setLoading(false);
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { apps, loading, error, isEmpty: !loading && !error && apps.length === 0 };
}
```

### 5.3 Empty State Component

```jsx
// Dirender di AppsList.jsx ketika activeFilter === 'hari-ini' && hariIni.isEmpty
function EmptyHariIni() {
  return (
    <div
      role="status"
      aria-label="Belum ada apps yang diluncurkan hari ini"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pad

## 6. App Status Badges

Dua jenis badge ditampilkan inline di setiap list item, di sebelah kanan tagline.

### 6.1 Component -- `src/components/AppStatusBadge.jsx`

```jsx
// src/components/AppStatusBadge.jsx
import React from 'react';
import { isLaunchingToday } from '../lib/dateUtils';

// Pricing chip colors -- all use border + bg from design system
const PRICING_STYLES = {
  gratis: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#166534',
    label: 'Gratis',
  },
  freemium: {
    background: '#fffdf8',
    border: '1px solid #f6a61e',
    color: '#92400e',
    label: 'Freemium',
  },
  berbayar: {
    background: '#faf5ff',
    border: '1px solid #c4b5fd',
    color: '#5b21b6',
    label: 'Berbayar',
  },
};

const CHIP_BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 20,
  padding: '0 7px',
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.01em',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

/**
 * "Baru hari ini" amber chip -- shown only on launch_date === today (WIB).
 */
export function LaunchTodayBadge({ launchDate }) {
  if (!isLaunchingToday(launchDate)) return null;
  return (
    <span
      aria-label="Baru diluncurkan hari ini"
      title="Baru diluncurkan hari ini"
      style={{
        ...CHIP_BASE,
        background: '#fff7e6',
        border: '1px solid #f6a61e',
        color: '#92400e',
      }}
    >
      Baru hari ini
    </span>
  );
}

/**
 * Pricing chip -- one of: 'gratis' | 'freemium' | 'berbayar'
 * Renders nothing if pricing value is unrecognized.
 */
export function PricingBadge({ pricing }) {
  const key = pricing?.toLowerCase();
  const styles = PRICING_STYLES[key];
  if (!styles) return null;
  return (
    <span
      aria-label={`Model harga: ${styles.label}`}
      title={`Model harga: ${styles.label}`}
      style={{ ...CHIP_BASE, ...styles }}
    >
      {styles.label}
    </span>
  );
}
```

### 6.2 Usage di List Item

```jsx
// Di dalam AppsList.jsx, pada setiap app list item render:
import { LaunchTodayBadge, PricingBadge } from '../components/AppStatusBadge';

// Inline setelah tagline text, dalam satu flex row:
<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
  <span className="app-tagline">{app.tagline}</span>
  <LaunchTodayBadge launchDate={app.launch_date} />
  <PricingBadge pricing={app.pricing} />
</div>
```

### 6.3 CSS untuk Chips (tambahkan ke `App.css`)

```css
/* App status chips -- append to App.css, do NOT modify existing rules */
.badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge--amber {
  background: #fff7e6;
  border: 1px solid #f6a61e;
  color: #92400e;
}

.badge--green {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
}

.badge--purple {
  background: #faf5ff;
  border: 1px solid #c4b5fd;
  color: #5b21b6;
}
```

---

## 7. Follow System

### 7.1 Migration -- `supabase/migrations/004_app_follows.sql`

```sql
-- supabase/migrations/004_app_follows.sql
-- Depends on: 003_apps.sql (apps table, profiles table)

CREATE TABLE IF NOT EXISTS app_follows (
  user_id   uuid    NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  app_id    uuid    NOT NULL REFERENCES apps(id)         ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, app_id)
);

-- Index for fast "how many followers does this app have?" queries
CREATE INDEX IF NOT EXISTS idx_app_follows_app_id ON app_follows(app_id);

-- Index for fast "which apps does this user follow?" queries
CREATE INDEX IF NOT EXISTS idx_app_follows_user_id ON app_follows(user_id);

-- Cached follow_count column on apps table (mirrors upvote_count pattern)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS follow_count integer NOT NULL DEFAULT 0;

-- Trigger: increment follow_count on INSERT
CREATE OR REPLACE FUNCTION increment_follow_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE apps SET follow_count = follow_count + 1 WHERE id = NEW.app_id;
  RETURN NEW;
END;
$$;

-- Trigger: decrement follow_count on DELETE
CREATE OR REPLACE FUNCTION decrement_follow_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE apps SET follow_count = GREATEST(follow_count - 1, 0) WHERE id = OLD.app_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_follow_count_inc ON app_follows;
CREATE TRIGGER trg_follow_count_inc
  AFTER INSERT ON app_follows
  FOR EACH ROW EXECUTE FUNCTION increment_follow_count();

DROP TRIGGER IF EXISTS trg_follow_count_dec ON app_follows;
CREATE TRIGGER trg_follow_count_dec
  AFTER DELETE ON app_follows
  FOR EACH ROW EXECUTE FUNCTION decrement_follow_count();

-- RLS: anyone can read follow counts; only owner can insert/delete their own rows
ALTER TABLE app_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_follows_select_all"
  ON app_follows FOR SELECT USING (true);

CREATE POLICY "app_follows_insert_own"
  ON app_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_follows_delete_own"
  ON app_follows FOR DELETE
  USING (auth.uid() = user_id);
```

### 7.2 Hook -- `src/hooks/useFollow.js`

```js
// src/hooks/useFollow.js
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages follow/unfollow state for a single app.
 *
 * @param {string} appId - UUID of the app
 * @returns {{ following: boolean, followCount: number, toggle: () => Promise<boolean>, loading: boolean }}
 *
 * toggle() returns true if the user is now following, false if unfollowed.
 */
export function useFollow(appId) {
  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load initial state: is the current user following? what is the count?
  useEffect(() => {
    if (!appId) return;
    let cancelled = false;

    async function loadInitialState() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Always fetch the cached follow_count from apps table
      const { data: appData } = await supabase
        .from('apps')
        .select('follow_count')
        .eq('id', appId)
        .single();

      if (cancelled) return;
      if (appData) setFollowCount(appData.follow_count ?? 0);

      // Only check if user is following when logged in
      if (user) {
        const { data: followRow } = await supabase
          .from('app_follows')
          .select('user_id')
          .eq('app_id', appId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!cancelled) setFollowing(!!followRow);
      }

      if (!cancelled) setLoading(false);
    }

    loadInitialState();
    return () => { cancelled = true; };
  }, [appId]);

  const toggle = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return following; // caller should gate with requireAuth

    setLoading(true);

    if (following) {
      // Unfollow: DELETE the row
      const { error } = await supabase
        .from('app_follows')
        .delete()
        .match({ app_id: appId, user_id: user.id });

      if (!error) {
        setFollowing(false);
        setFollowCount((c) => Math.max(c - 1, 0));
        setLoading(false);
        return false;
      }
    } else {
      // Follow: INSERT the row
      const { error } = await supabase
        .from('app_follows')
        .insert({ app_id: appId, user_id: user.id });

      if (!error) {
        setFollowing(true);
        setFollowCount((c) => c + 1);
        setLoading(false);
        return true;
      }
    }

    setLoading(false);
    return following; // return unchanged state on error
  }, [appId, following]);

  return { following, followCount, toggle, loading };
}
```

### 7.3 Follow Count di Popover Sidebar

Follow count ditampilkan di sidebar popover di bawah section "Ikuti":

```jsx
// Di RetroPopover.jsx sidebar, tambahkan di bawah FollowButton:
const { followCount } = useFollow(app.id);

<div className="sidebar-widget">
  <span className="sidebar-eyebrow">Pengikut</span>
  <span style={{ fontSize: 20, fontWeight: 700, color: '#0d1d38' }}>
    {followCount.toLocaleString('id-ID')}
  </span>
</div>
```

---

## 8. Accessibility Final Pass

### 8.1 Checklist per Komponen

| Komponen | Requirement | Implementasi |
|----------|------------|--------------|
| Upvote button | `aria-label` + `aria-pressed` | Lihat section 2.3 |
| Follow button | `aria-label` + `aria-pressed` | Lihat section 2.3 |
| Comment textarea | `aria-label` | `aria-label="Tulis komentar"` |
| Submit App button | `aria-label` | `aria-label="Submit aplikasi baru ke Apphunt"` |
| Toast container | `aria-live="polite"` | Lihat section 4.1 |
| Error toast | `role="alert"` | Lihat section 4.2 |
| LaunchTodayBadge | `aria-label` + `title` | Lihat section 6.1 |
| PricingBadge | `aria-label` + `title` | Lihat section 6.1 |
| EmptyHariIni | `role="status"` + `aria-label` | Lihat section 5.3 |
| Modal (popover) | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` | Existing di RetroPopover |
| Close button (X) | `aria-label="Tutup"` | Existing di RetroPopover |

### 8.2 Warna Kontras -- Verifikasi WCAG AA

| Foreground | Background | Ratio | Status |
|-----------|------------|-------|--------|
| `#0d1d38` (text-heading) | `#fffdf8` (bg-surface) | ~15.8:1 | PASS AAA |
| `#29405f` (text-body) | `#fffdf8` (bg-surface) | ~7.2:1 | PASS AAA |
| `#55606d` (text-muted) | `#fffdf8` (bg-surface) | ~4.6:1 | PASS AA |
| `#0d1d38` (text on amber) | `#f6a61e` (amber) | ~4.8:1 | PASS AA |
| `#92400e` (amber chip text) | `#fff7e6` (amber chip bg) | ~6.1:1 | PASS AA |
| `#166534` (green chip text) | `#f0fdf4` (green chip bg) | ~7.4:1 | PASS AAA |
| `#991b1b` (error text) | `#fef2f2` (error bg) | ~8.9:1 | PASS AAA |

Catatan: Verifikasi diatas adalah estimasi. Full validation harus dilakukan dengan
tool seperti https://webaim.org/resources/contrastchecker/ atau axe DevTools.
Manual testing dengan screen reader (NVDA/JAWS) tetap diperlukan untuk coverage penuh.

### 8.3 Focus Visible

Tambahkan ke `App.css` -- berlaku global untuk semua focusable elements:

```css
/* Global focus-visible ring -- append to App.css */
/* Uses :focus-visible so mouse users don't see the ring */
:focus-visible {
  outline: 2px solid #f6a61e;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Reset default outline only when our custom ring is active */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 8.4 Skip Link (Nice to Have)

```jsx
// Tambahkan di awal <body> / layout utama untuk keyboard users:
<a
  href="#main-content"
  style={{
    position: 'absolute',
    left: -9999,
    top: 'auto',
    width: 1,
    height: 1,
    overflow: 'hidden',
  }}
  onFocus={(e) => {
    e.target.style.left = '16px';
    e.target.style.top = '16px';
    e.target.style.width = 'auto';
    e.target.style.height = 'auto';
  }}
  onBlur={(e) => {
    e.target.style.left = '-9999px';
  }}
>
  Langsung ke konten utama
</a>
```

---

## 9. Performance Checklist

### 9.1 Image Lazy Loading

Semua `<img>` harus punya `loading="lazy"` kecuali above-the-fold (logo di hero/topbar).

```jsx
// Contoh: logo di app list item -- always lazy
<img
  src={app.logo_url}
  alt={`Logo ${app.name}`}
  loading="lazy"
  width={40}
  height={40}
  style={{ borderRadius: 8, objectFit: 'cover' }}
/>

// Gallery images di popover -- selalu lazy
<img
  src={galleryUrl}
  alt={`Screenshot ${app.name} ${index + 1}`}
  loading="lazy"
  style={{ width: '100%', borderRadius: 8 }}
/>
```

### 9.2 Supabase Query Hygiene

Selalu gunakan `.select()` dengan kolom yang dibutuhkan saja. Jangan pernah `.select('*')` di production code.

```js
// BENAR -- hanya kolom yang dirender
const { data } = await supabase
  .from('apps')
  .select('id, name, slug, tagline, logo_url, upvote_count, launch_date, pricing, status')
  .eq('status', 'live')
  .order('upvote_count', { ascending: false });

// SALAH -- over-fetching
const { data } = await supabase.from('apps').select('*');
```

### 9.3 Menghindari N+1 Queries

Jangan fetch data per-app dalam loop. Gunakan single query dengan join atau batch.

```js
// BENAR -- single query untuk semua upvote status user
const { data: userUpvotes } = await supabase
  .from('app_upvotes')
  .select('app_id')
  .eq('user_id', currentUserId);
// Kemudian Set untuk O(1) lookup:
const upvotedSet = new Set(userUpvotes?.map((r) => r.app_id) ?? []);
const isVoted = (appId) => upvotedSet.has(appId);

// SALAH -- N queries untuk N apps
apps.forEach(async (app) => {
  const { data } = await supabase
    .from('app_upvotes')
    .select('id')
    .eq('app_id', app.id)
    .eq('user_id', currentUserId);
});
```

### 9.4 useMemo untuk Derived State

Semua data transformasi yang mahal di AppsList harus di-wrap dengan `useMemo`:

```js
// Di AppsList.jsx -- semua ini sudah ada, pastikan tidak di-remove:
const appsData = React.useMemo(() => { /* ... */ }, [rawApps]);
const filteredApps = React.useMemo(() => { /* filter logic */ }, [appsData, searchQuery, activeCategory]);
const displayApps = React.useMemo(() => {
  return activeFilter === 'hari-ini' ? hariIni.apps : filteredApps;
}, [activeFilter, hariIni.apps, filteredApps]);
```

### 9.5 Checklist

- [ ] Semua `<img>` di list items punya `loading="lazy"` dan explicit `width`/`height`
- [ ] Semua `<img>` di gallery popover punya `loading="lazy"`
- [ ] Tidak ada `.select('*')` di production queries
- [ ] Tidak ada N+1 queries -- user upvote/follow status di-fetch dalam satu batch
- [ ] `filteredApps` dan `displayApps` di-wrap dalam `useMemo`
- [ ] `useHariIniFilter` hanya dipanggil sekali, tidak di re-mount setiap render
- [ ] Supabase client di `src/lib/supabase.js` adalah singleton (sudah ada dari Phase 0)
- [ ] Tidak ada `console.log` atau debug statements di production code

---

## 10. Mobile Responsive Additions

Semua perubahan ini hanya menambah CSS ke `App.css` -- tidak mengubah struktur HTML atau class yang sudah ada.

### 10.1 Popover Full-Screen di Mobile

```css
/* Append to App.css -- mobile popover full screen */
@media (max-width: 640px) {
  .retro-popover-overlay {
    padding: 0;
  }

  .retro-popover-window {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
    border: none;
    margin: 0;
  }

  .retro-popover-titlebar {
    border-radius: 0;
  }
}
```

### 10.2 Submit Modal Full-Screen di Mobile

```css
/* Submit App modal -- full screen on mobile */
@media (max-width: 640px) {
  .submit-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .submit-modal-window {
    width: 100vw;
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
    overflow-y: auto;
  }
}
```

### 10.3 AppsList Single Column di Mobile

```css
/* AppsList -- single column, hide sidebars on mobile */
@media (max-width: 768px) {
  .apps-page-layout {
    flex-direction: column;
  }

  .apps-left-sidebar {
    display: none;
  }

  .apps-sidebar {
    display: none;
  }

  .apps-main {
    width: 100%;
    padding: 0;
  }

  .app-list-item {
    padding: 12px 16px;
  }
}
```

### 10.4 Toast di Mobile -- Full Width

```css
/* Toast -- full width on narrow screens */
@media (max-width: 480px) {
  /* Toast container rendered via inline styles in ToastContext.jsx */
  /* Override via CSS custom property or adjust inline styles: */
  /* In ToastContext.jsx ToastContainer, add to style object: */
  /* left: 8px, right: 8px, top: 8px */
  /* And in Toast.jsx remove maxWidth, set width: '100%' */
}
```

Untuk toast di mobile, update `ToastContainer` inline styles di `ToastContext.jsx`:

```jsx
// Di ToastContext.jsx -- update ToastContainer style untuk responsive
<div
  aria-live="polite"
  aria-atomic="false"
  style={{
    position: 'fixed',
    top: 16,
    right: 16,
    left: window.innerWidth <= 480 ? 16 : 'auto',  // full width on mobile
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    pointerEvents: 'none',
    // On mobile, take full width minus margins:
    width: window.innerWidth <= 480 ? 'calc(100vw - 32px)' : 'auto',
  }}
>
```

Atau lebih baik, gunakan CSS media query dengan class:

```css
/* App.css */
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

@media (max-width: 480px) {
  .toast-container {
    left: 8px;
    right: 8px;
    top: 8px;
  }

  .toast-container > * {
    max-width: 100%;
  }
}
```

---

## 11. Definition of Done

Semua item di bawah harus tercentang sebelum Phase 5 dianggap selesai.

### Auth

- [ ] `useAuthGuard()` hook ada di `src/hooks/useAuthGuard.js` dan di-export dengan benar
- [ ] Upvote button memanggil `requireAuth()` sebelum action
- [ ] Follow button memanggil `requireAuth()` sebelum action
- [ ] Comment input menampilkan "Login untuk berkomentar" jika user tidak login
- [ ] Comment form submit memanggil `requireAuth()` sebelum action
- [ ] Submit App button memanggil `requireAuth()` sebelum membuka modal
- [ ] Setelah auth modal berhasil login, action asli dijalankan otomatis (callback pattern)
- [ ] Tidak ada auth check yang tersebar di luar `useAuthGuard()` untuk write actions baru

### Toast System

- [ ] `ToastProvider` ada di `src/context/ToastContext.jsx` dan di-export
- [ ] `useToast()` hook ada dan digunakan di komponen yang relevan
- [ ] `Toast.jsx` ada di `src/components/Toast.jsx`
- [ ] `<ToastProvider>` sudah di-wrap di `src/main.jsx`
- [ ] Toast success muncul setelah upvote berhasil
- [ ] Toast success muncul setelah submit app berhasil
- [ ] Toast info muncul setelah salin link
- [ ] Toast info muncul setelah follow/unfollow
- [ ] Toast auto-dismiss dalam 3 detik
- [ ] Toast bisa ditutup manual (klik X)
- [ ] Toast slide-in dari kanan, slide-out ke kanan
- [ ] Toast error menggunakan `role="alert"`, yang lain `role="status"`

### Launching Today

- [ ] `getTodayWIB()` di `src/lib/dateUtils.js` mengembalikan "YYYY-MM-DD" dalam WIB
- [ ] `isLaunchingToday(launch_date)` mengembalikan `true` hanya jika `launch_date === getTodayWIB()`
- [ ] Badge "Baru hari ini" muncul di list item dan popover pada hari launch

### Hari Ini Filter

- [ ] Tab "Hari ini" ada di filter bar AppsList
- [ ] `useHariIniFilter()` hook fetches apps dengan `launch_date === getTodayWIB()`
- [ ] Empty state "Belum ada apps yang diluncurkan hari ini" muncul ketika isEmpty === true
- [ ] Query hanya mengambil kolom yang dibutuhkan (bukan `select('*')`)
- [ ] Filter tidak menyebabkan UI regression pada tab filter lain

### App Status Badges

- [ ] `LaunchTodayBadge` hanya muncul pada hari launch (isLaunchingToday === true)
- [ ] `PricingBadge` menampilkan "Gratis" / "Freemium" / "Berbayar" sesuai data
- [ ] Badge tidak muncul jika pricing null/undefined/tidak dikenal
- [ ] Semua badge punya `aria-label` dan `title`

### Follow System

- [ ] Migration `004_app_follows.sql` sudah dijalankan di Supabase
- [ ] Tabel `app_follows` ada dengan RLS yang benar
- [ ] Kolom `follow_count` ada di tabel `apps`
- [ ] Trigger increment/decrement `follow_count` berfungsi
- [ ] `useFollow(appId)` hook ada di `src/hooks/useFollow.js`
- [ ] Follow count ditampilkan di popover sidebar
- [ ] Toggle follow/unfollow berfungsi dan update count optimistically

### Accessibility

- [ ] Semua interactive elements punya `aria-label` yang deskriptif
- [ ] Upvote dan follow buttons punya `aria-pressed`
- [ ] `:focus-visible` ring amber ditambahkan ke `App.css`
- [ ] Toast container punya `aria-live="polite"`
- [ ] Error toast punya `role="alert"`

### Performance

- [ ] Semua `<img>` di list items punya `loading="lazy"`
- [ ] Tidak ada `.select('*')` di query manapun
- [ ] Tidak ada N+1 queries untuk user upvote/follow status

### Mobile

- [ ] Popover full-screen (100vw 100vh, tanpa border-radius) di layar <= 640px
- [ ] Submit modal full-screen atau bottom-sheet di layar <= 640px
- [ ] AppsList single column, sidebar tersembunyi di layar <= 768px

### Regression

- [ ] Outer layout AppsList tidak berubah (class CSS frozen tetap intact)
- [ ] Backup files masih ada (`AppsList.backup.jsx`, `RetroPopover.backup.jsx`)
- [ ] Halaman lain (Marketplace, Bursa, News, dll.) tidak terpengaruh
- [ ] Build berhasil tanpa error: `npm run build`
