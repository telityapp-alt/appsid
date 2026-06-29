# Forum Implementation Plan — Appverse ID
> Production-ready, Reddit/ProductHunt-style forum
> Zero breaking changes to existing code

---

## Konteks & Prinsip

- **Stack:** React 19 + Vite, Supabase v2, inline styles (no Tailwind/MUI), React Router v6
- **Golden rule:** Tidak ada satu baris pun di file yang sudah ada yang boleh diubah kecuali disebutkan eksplisit di fase masing-masing
- **Auth:** Sudah ada via `AuthContext` — tinggal pakai `useAuth()`
- **Route `/forum`:** Sudah registered di `App.jsx` — tidak perlu disentuh
- **Existing `ForumPage.jsx`:** Akan di-replace kontennya secara total, tapi file-nya tetap di path yang sama
- **Pattern:** Ikuti pola `useUpvote.js`, `useApps.js`, `005_reports.sql`, `006_fix_rls_and_policies.sql`

---

## Arsitektur Target

```
Forum
├── /forum                        ← Feed utama (ForumPage.jsx — diganti total)
├── /forum/:postId                ← Detail post + thread reply (ForumPostPage.jsx — BARU)
└── Modal: CreatePostModal.jsx    ← Buat post baru (BARU)

Database (Supabase)
├── forum_posts                   ← Post utama
├── forum_comments                ← Reply/komentar (nested 1 level)
├── forum_upvotes                 ← Upvote post
├── forum_comment_upvotes         ← Upvote komentar
├── forum_reports                 ← Report post/komentar
└── forum_bookmarks               ← Simpan post

Hooks (src/hooks/)
├── useForumPosts.js              ← Fetch + filter + sort feed
├── useForumPost.js               ← Fetch 1 post + comments
├── useForumUpvote.js             ← Upvote post
├── useForumCommentUpvote.js      ← Upvote komentar
├── useCreatePost.js              ← Submit post baru
├── useCreateComment.js           ← Submit reply
├── useForumReport.js             ← Report post/komentar
└── useForumBookmark.js           ← Bookmark post

Components (src/components/forum/)
├── PostCard.jsx
├── PostDetail.jsx
├── CommentThread.jsx
├── CommentCard.jsx
├── CreatePostModal.jsx
├── ReportModal.jsx
├── ShareButton.jsx
└── ForumAvatar.jsx
```

---

## Phase 1 — Database Schema

**File baru:** `supabase/migrations/007_forum.sql`

**Tidak ada file yang disentuh.**

### Tabel & Kolom

#### `forum_posts`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
title           text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 300)
body            text NOT NULL CHECK (char_length(body) >= 10)
category        text NOT NULL
flair           text NOT NULL
tags            text[] DEFAULT '{}'
is_pinned       boolean NOT NULL DEFAULT false
is_locked       boolean NOT NULL DEFAULT false  -- admin bisa lock thread
is_deleted      boolean NOT NULL DEFAULT false  -- soft delete
upvote_count    integer NOT NULL DEFAULT 0      -- denormalized counter
comment_count   integer NOT NULL DEFAULT 0      -- denormalized counter
view_count      integer NOT NULL DEFAULT 0
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()
```

#### `forum_comments`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
post_id         uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE
user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
parent_id       uuid REFERENCES forum_comments(id) ON DELETE CASCADE  -- 1-level nesting
body            text NOT NULL CHECK (char_length(body) >= 1)
is_pinned       boolean NOT NULL DEFAULT false  -- author/admin bisa pin best answer
is_deleted      boolean NOT NULL DEFAULT false  -- soft delete
upvote_count    integer NOT NULL DEFAULT 0
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()
```

#### `forum_upvotes`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
post_id         uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE
user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
created_at      timestamptz NOT NULL DEFAULT now()
UNIQUE (post_id, user_id)
```

#### `forum_comment_upvotes`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
comment_id      uuid NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE
user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
created_at      timestamptz NOT NULL DEFAULT now()
UNIQUE (comment_id, user_id)
```

#### `forum_reports`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
reporter_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
target_type     text NOT NULL CHECK (target_type IN ('post', 'comment'))
target_id       uuid NOT NULL
reason          text NOT NULL CHECK (reason IN (
                  'spam', 'harassment', 'misinformation',
                  'off_topic', 'self_promo', 'other'
                ))
notes           text
resolved        boolean NOT NULL DEFAULT false
created_at      timestamptz NOT NULL DEFAULT now()
UNIQUE (reporter_id, target_type, target_id)  -- 1 report per user per target
```

#### `forum_bookmarks`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
post_id         uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE
user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
created_at      timestamptz NOT NULL DEFAULT now()
UNIQUE (post_id, user_id)
```

### RLS Policies (ikut pola `006_fix_rls_and_policies.sql`)

```sql
-- forum_posts
-- SELECT: public (soft-deleted posts tidak muncul — di-filter via view/query)
-- INSERT: auth user, user_id = auth.uid()
-- UPDATE: owner saja (title/body/tags), admin bisa update is_pinned/is_locked
-- DELETE: owner saja (set is_deleted = true via UPDATE, bukan DELETE)

-- forum_comments
-- SELECT: public
-- INSERT: auth user, is_locked post = false
-- UPDATE: owner saja
-- DELETE: owner saja (soft delete)

-- forum_upvotes, forum_comment_upvotes
-- SELECT: public
-- INSERT: auth user, tidak bisa upvote konten sendiri
-- DELETE: owner saja (un-upvote)

-- forum_reports
-- SELECT: admin saja
-- INSERT: auth user
-- UPDATE: admin saja (resolved)

-- forum_bookmarks
-- SELECT: owner saja
-- INSERT: auth user
-- DELETE: owner saja
```

### Database Functions (Postgres)

```sql
-- Auto increment/decrement upvote_count di forum_posts via trigger
-- Auto increment/decrement upvote_count di forum_comments via trigger
-- Auto increment/decrement comment_count di forum_posts via trigger
-- Auto update updated_at via trigger (sudah ada pattern di migration lain)
```

### Indexes

```sql
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_upvote_count ON forum_posts(upvote_count DESC);
CREATE INDEX idx_forum_posts_tags ON forum_posts USING GIN(tags);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_parent_id ON forum_comments(parent_id);
```

### Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_comments;
```

**Output Phase 1:** 1 file SQL baru. Zero sentuhan file lain.

---

## Phase 2 — Data Hooks

**File baru:** 8 hooks di `src/hooks/`

**Tidak ada file yang disentuh.**

### 2.1 `useForumPosts.js`

```
- Fetch forum_posts dengan join ke profiles (username, avatar_url)
- Filter: category, tags (array overlap), search (ilike title)
- Sort: terbaru (created_at DESC), trending (comment_count DESC 24h), top (upvote_count DESC)
- Pagination: cursor-based (last created_at), load 20 per page
- Returns: { posts, loading, error, hasMore, loadMore, refresh }
- Null-check supabase (ikut pola useApps.js)
```

### 2.2 `useForumPost.js`

```
- Fetch 1 post by ID dengan join profiles
- Fetch forum_comments untuk post tersebut, nested: parent comments + child replies
- Increment view_count via RPC saat mount
- Returns: { post, comments, loading, error, refresh }
```

### 2.3 `useForumUpvote.js`

```
- Ikut pola useUpvote.js persis
- Check apakah user sudah upvote (dari forum_upvotes)
- Toggle: INSERT atau DELETE dari forum_upvotes
- Optimistic update: update count lokal dulu, rollback kalau error
- Returns: { upvoted, upvoteCount, toggle, loading }
```

### 2.4 `useForumCommentUpvote.js`

```
- Sama seperti useForumUpvote.js tapi untuk forum_comment_upvotes
- Returns: { upvoted, upvoteCount, toggle, loading }
```

### 2.5 `useCreatePost.js`

```
- Validate: title (5-300 char), body (min 10 char), category required, flair required
- Submit ke forum_posts
- On success: return postId untuk navigasi ke /forum/:postId
- Returns: { submit, loading, error }
```

### 2.6 `useCreateComment.js`

```
- Submit ke forum_comments (dengan optional parent_id untuk reply)
- Optimistic insert: tambah comment ke list lokal sebelum konfirmasi DB
- On error: rollback optimistic update
- Returns: { submit, loading, error }
```

### 2.7 `useForumReport.js`

```
- Submit ke forum_reports
- target_type: 'post' | 'comment'
- target_id: UUID
- Cek duplikat (unique constraint) dan handle gracefully
- Returns: { report, loading, error, alreadyReported }
```

### 2.8 `useForumBookmark.js`

```
- Toggle bookmark di forum_bookmarks
- Check existing bookmark saat mount
- Returns: { bookmarked, toggle, loading }
```

**Output Phase 2:** 8 file JS baru. Zero sentuhan file lain.

---

## Phase 3 — Komponen UI

**File baru:** `src/components/forum/` (direktori baru)

**Tidak ada file yang disentuh.**

Semua komponen: inline styles, tidak ada CSS framework. Ikut design token dari ForumPage.jsx yang sudah ada (`#0d1d38`, `#f6a61e`, `#55606d`, dll).

### 3.1 `ForumAvatar.jsx`

```
- Props: userId, username, avatarUrl, size (default 32)
- Kalau ada avatarUrl: tampilkan <img>
- Kalau tidak ada: initial letter dengan gradient (sama seperti Avatar() di ForumPage.jsx)
- Link ke profil user (opsional via prop)
```

### 3.2 `PostCard.jsx`

```
- Props: post (object dari DB), onTagClick, onCategoryClick
- Gunakan useForumUpvote(post.id, post.upvote_count)
- Upvote: kalau belum login → openAuthModal()
- Klik judul/body → navigate ke /forum/:postId
- Actions: Komentar (link ke detail), Bagikan (ShareButton), Bookmark (useForumBookmark), Report (buka ReportModal)
- Soft-delete: kalau post.is_deleted tampilkan placeholder "[Post dihapus]"
- Pin badge kalau post.is_pinned
- Lock badge kalau post.is_locked
```

### 3.3 `ShareButton.jsx`

```
- Props: postId, title
- Build URL: window.location.origin + /forum/:postId
- Klik: navigator.clipboard.writeText(url) + tampilkan toast "Link disalin!"
- Fallback kalau clipboard API tidak available: prompt dengan URL
```

### 3.4 `ReportModal.jsx`

```
- Props: targetType ('post'|'comment'), targetId, onClose
- Pilihan reason: Spam, Harrasment, Misinformation, Off-topic, Self-promo berlebihan, Lainnya
- Optional: textarea notes (max 300 char) kalau pilih "Lainnya"
- Submit via useForumReport
- Kalau sudah pernah report: tampilkan pesan "Kamu sudah melaporkan ini"
- Style: modal overlay + card, inline styles
```

### 3.5 `CreatePostModal.jsx`

```
Props: onClose, onSuccess(postId)

Form fields:
- Judul (text input, max 300 char, counter)
- Kategori (dropdown/pill select dari CATEGORIES)
- Flair (pill select dari FLAIR_STYLE)
- Tags (multi-select dari TAGS, max 5)
- Isi post (textarea, min 10 char, markdown-friendly tapi render plain text dulu)

Behavior:
- Kalau belum login → openAuthModal() bukan tampilkan form
- Client-side validation sebelum submit
- Submit via useCreatePost
- On success: close modal, navigate ke /forum/:postId (post baru)
- Keyboard: Escape untuk close, Ctrl+Enter untuk submit
- Trap focus di dalam modal (accessibility)
```

### 3.6 `CommentCard.jsx`

```
Props: comment, depth (0 atau 1), onReply, onReport

- ForumAvatar + username + timeAgo
- Body text
- Actions: Upvote (useForumCommentUpvote), Reply (kalau depth=0), Report
- Kalau is_deleted: "[Komentar dihapus]" — tetap tampil sebagai placeholder (supaya thread tidak rusak kalau ada reply)
- Pin badge (is_pinned)
- Delete button kalau comment.user_id === currentUser.id
- Soft delete: UPDATE is_deleted=true via Supabase, bukan DELETE
```

### 3.7 `CommentThread.jsx`

```
Props: postId, comments (array dari useForumPost), locked

- Render top-level comments dulu
- Di bawah tiap comment: render replies (parent_id = comment.id)
- Inline reply form: muncul di bawah comment kalau klik "Reply" di CommentCard
- Kalau post locked: tampilkan banner "Thread ini ditutup" — form reply hidden
- Empty state: "Belum ada komentar. Jadilah yang pertama."
- Sort komentar: oldest first (created_at ASC) — standar forum/reddit
```

### 3.8 `PostDetail.jsx`

```
Props: post, comments

Full view of post:
- Header: ForumAvatar, username, timeAgo, category, flair, tags
- Pin/Lock badge
- Title (besar, h1)
- Body (full text, tidak di-clamp)
- Upvote + Bookmark + Share + Report actions
- Separator
- CommentThread
- Breadcrumb: Forum > [Category] > [Title truncated]
```

**Output Phase 3:** 8 file JSX baru di `src/components/forum/`. Zero sentuhan file lain.

---

## Phase 4 — Pages & Routing

**File yang DIMODIFIKASI:**
- `src/ForumPage.jsx` — konten diganti total (wiring ke hooks + komponen baru)
- `src/App.jsx` — tambah 1 route `/forum/:postId`

**File baru:**
- `src/ForumPostPage.jsx`

### 4.1 Update `ForumPage.jsx`

Ganti semua mock data + local state dengan:

```
- Import useForumPosts, PostCard, CreatePostModal, useAuth
- State: activeCategory, activeTag, activeSort, searchQuery, showCreateModal
- Gunakan useForumPosts({ category, tags, sort, search })
- "Buat postingan" button → kalau login: buka CreatePostModal, kalau tidak: openAuthModal()
- PostCard menggantikan PostCard lokal lama
- Infinite scroll / "Load more" button di bottom feed
- Loading state: skeleton cards (3 placeholder cards)
- Empty state: ilustrasi + CTA "Jadilah yang pertama posting"
- Search input (debounced 300ms) di atas feed
```

Semua visual/layout yang sudah ada **tidak berubah** — hanya sumber data yang diganti dari mock ke live.

### 4.2 Buat `ForumPostPage.jsx`

```
Route: /forum/:postId

- useForumPost(postId) untuk fetch post + comments
- Render PostDetail
- Kalau post tidak ditemukan (404): pesan "Post tidak ditemukan" + back button
- Kalau post is_deleted: "Post ini sudah dihapus"
- document.title = post.title (SEO sederhana)
- Back button: navigate(-1) atau /forum
```

### 4.3 Update `App.jsx`

Tambah hanya **1 baris** route baru:

```jsx
// Di dalam router, setelah route /forum
<Route path="/forum/:postId" element={<ForumPostPage />} />
```

Dan 1 import:
```jsx
import ForumPostPage from "./ForumPostPage";
```

**Output Phase 4:** 1 file baru, 2 file dimodifikasi (minimal changes).

---

## Phase 5 — Admin & Moderation

**File baru:** `src/hooks/useForumAdmin.js`

**File yang DIMODIFIKASI:** Hanya internal logic di komponen forum (bukan App.jsx atau file lain yang ada).

### Fitur Admin

Semua fitur admin hanya muncul kalau `profile.role === 'admin'`.

#### Di PostCard & PostDetail:
- Pin/Unpin post (toggle `is_pinned`)
- Lock/Unlock thread (toggle `is_locked`)
- Delete post (soft delete: set `is_deleted = true`)

#### Di CommentCard:
- Pin/Unpin comment (toggle `is_pinned`)
- Delete comment (soft delete)

#### Di `useForumAdmin.js`:
```
- pinPost(postId)
- unpinPost(postId)
- lockPost(postId)
- unlockPost(postId)
- deletePost(postId)      -- soft delete
- deleteComment(commentId) -- soft delete
- pinComment(commentId)
- resolveReport(reportId)
```

### Report Dashboard (minimal)

Tidak perlu halaman terpisah di Phase 5. Admin bisa lihat reports via Supabase dashboard langsung. Di Phase berikutnya bisa dibuatkan `/admin/forum-reports` kalau dibutuhkan.

**Output Phase 5:** 1 hook baru, modifikasi internal komponen forum.

---

## Phase 6 — Production Hardening

**File baru & modifikasi minor di komponen forum.**

### 6.1 Error Handling

Semua hooks harus:
- Return `error` state yang deskriptif
- Supabase error code mapping ke pesan bahasa Indonesia yang user-friendly
- `PGRST116` (not found) → "Post tidak ditemukan"
- `23505` (unique violation) → "Kamu sudah melakukan ini"
- `42501` (RLS violation) → "Kamu tidak punya akses"

### 6.2 Optimistic Updates

- Upvote post: update count lokal sebelum DB konfirmasi, rollback kalau error
- Upvote comment: sama
- Bookmark: toggle lokal, rollback kalau error
- Create comment: tambah ke list sebelum DB konfirmasi (dengan temporary ID)

### 6.3 Rate Limiting (Client-side)

Di `useCreatePost.js` dan `useCreateComment.js`:
- Simpan timestamp post/comment terakhir di localStorage
- Cegah submit kalau < 30 detik dari post terakhir (anti-spam sederhana)
- Tampilkan countdown timer

### 6.4 Search Debounce

Di `ForumPage.jsx`:
- Search input debounced 300ms sebelum trigger query ke Supabase
- Gunakan `ilike` dengan `%query%` di kolom title

### 6.5 Infinite Scroll

Di `useForumPosts.js`:
- Cursor-based pagination (bukan offset) untuk konsistensi
- Load 20 posts per page
- "Load more" button di bawah feed (bukan auto-scroll untuk UX yang lebih terkontrol)

### 6.6 Timestamps

- Gunakan `dateUtils.js` yang sudah ada untuk format `timeAgo`
- Tooltip saat hover timestamp: tampilkan tanggal lengkap (DD MMM YYYY, HH:mm WIB)

### 6.7 Accessibility

- Semua interactive elements punya `aria-label` yang deskriptif
- Modal punya `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus trap di CreatePostModal dan ReportModal
- Upvote button: `aria-pressed={upvoted}`, `aria-label="Upvote, X upvotes"`
- Keyboard navigasi di form: Tab order yang logis

### 6.8 Loading States

- Feed loading: 3 skeleton PostCard dengan animasi pulse
- Post detail loading: skeleton untuk title, body, dan comments
- Submit loading: button disabled + spinner inline

**Output Phase 6:** Modifikasi di komponen forum. Zero sentuhan file lain.

---

## Ringkasan File per Phase

| Phase | File Baru | File Dimodifikasi |
|-------|-----------|-------------------|
| 1 — DB Schema | `supabase/migrations/007_forum.sql` | — |
| 2 — Hooks | `src/hooks/useForumPosts.js` | — |
| | `src/hooks/useForumPost.js` | — |
| | `src/hooks/useForumUpvote.js` | — |
| | `src/hooks/useForumCommentUpvote.js` | — |
| | `src/hooks/useCreatePost.js` | — |
| | `src/hooks/useCreateComment.js` | — |
| | `src/hooks/useForumReport.js` | — |
| | `src/hooks/useForumBookmark.js` | — |
| 3 — Components | `src/components/forum/ForumAvatar.jsx` | — |
| | `src/components/forum/PostCard.jsx` | — |
| | `src/components/forum/ShareButton.jsx` | — |
| | `src/components/forum/ReportModal.jsx` | — |
| | `src/components/forum/CreatePostModal.jsx` | — |
| | `src/components/forum/CommentCard.jsx` | — |
| | `src/components/forum/CommentThread.jsx` | — |
| | `src/components/forum/PostDetail.jsx` | — |
| 4 — Pages | `src/ForumPostPage.jsx` | `src/ForumPage.jsx` (rewire) |
| | — | `src/App.jsx` (+1 route, +1 import) |
| 5 — Admin | `src/hooks/useForumAdmin.js` | Internal forum components |
| 6 — Hardening | — | Internal forum components |

**Total file baru: 18**
**Total file lama yang disentuh: 2** (`ForumPage.jsx` konten diganti total, `App.jsx` +2 baris)

---

## Urutan Implementasi yang Disarankan

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

Setiap phase bisa di-test secara independen sebelum lanjut ke phase berikutnya. Phase 1-3 bisa dikerjakan paralel oleh berbeda orang karena tidak ada dependency antar file.

---

## Catatan Teknis Penting

1. **`view_count`** — increment via Supabase RPC (`rpc('increment_view_count', { post_id })`) bukan via RLS-controlled UPDATE langsung, supaya anonymous user pun bisa trigger view count tanpa perlu auth.

2. **Nested comments** — hanya 1 level (comment → reply), bukan infinite nesting seperti Reddit. Ini sesuai dengan UX ProductHunt. `parent_id` yang null = top-level comment.

3. **Soft delete** — post dan comment yang dihapus di-set `is_deleted = true`, tidak benar-benar di-DELETE. Ini penting untuk menjaga integritas thread (reply ke comment yang dihapus tetap muncul).

4. **Denormalized counters** (`upvote_count`, `comment_count`) — lebih performant daripada `COUNT(*)` di setiap query feed. Di-maintain via Postgres triggers.

5. **`forum_posts.tags`** — disimpan sebagai `text[]` (Postgres array), bukan tabel terpisah. Filter via `tags && ARRAY['tagname']::text[]` (overlap operator). Ini cukup untuk skala awal, bisa migrasi ke tabel terpisah kalau diperlukan.

6. **Auth guard** — `CreatePostModal`, upvote, bookmark, report semua memanggil `openAuthModal()` dari `AuthContext` kalau user belum login. Tidak ada redirect. Konsisten dengan pattern yang sudah ada di apps page.

7. **Realtime** — subscribe ke `forum_comments` channel untuk post detail page supaya komentar baru muncul tanpa refresh. Subscribe ke `forum_posts` untuk feed supaya `upvote_count` dan `comment_count` live-update.
