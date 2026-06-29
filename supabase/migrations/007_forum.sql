-- ============================================================
-- 007_forum.sql
-- Forum feature: Reddit/ProductHunt-style discussion board
-- Requires: 000_profiles.sql (profiles, handle_updated_at())
-- Tables: forum_posts, forum_comments, forum_upvotes,
--         forum_comment_upvotes, forum_reports, forum_bookmarks
-- Idempotent: safe to re-run
-- ============================================================

-- ── forum_posts ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id            uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text        NOT NULL CHECK (char_length(title) BETWEEN 5 AND 300),
  body          text        NOT NULL CHECK (char_length(body) >= 10),
  category      text        NOT NULL CHECK (char_length(category) >= 1),
  flair         text        NOT NULL CHECK (char_length(flair) >= 1),
  tags          text[]      NOT NULL DEFAULT '{}',
  is_pinned     boolean     NOT NULL DEFAULT false,
  is_locked     boolean     NOT NULL DEFAULT false,
  is_deleted    boolean     NOT NULL DEFAULT false,
  upvote_count  integer     NOT NULL DEFAULT 0 CHECK (upvote_count >= 0),
  comment_count integer     NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  view_count    integer     NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS forum_posts_updated_at ON public.forum_posts;
CREATE TRIGGER forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ── forum_comments ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forum_comments (
  id            uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       uuid        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id     uuid        REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  body          text        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  is_pinned     boolean     NOT NULL DEFAULT false,
  is_deleted    boolean     NOT NULL DEFAULT false,
  upvote_count  integer     NOT NULL DEFAULT 0 CHECK (upvote_count >= 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS forum_comments_updated_at ON public.forum_comments;
CREATE TRIGGER forum_comments_updated_at
  BEFORE UPDATE ON public.forum_comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ── forum_upvotes ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forum_upvotes (
  id         uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forum_upvotes_unique UNIQUE (post_id, user_id)
);

-- ── forum_comment_upvotes ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forum_comment_upvotes (
  id         uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid        NOT NULL REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forum_comment_upvotes_unique UNIQUE (comment_id, user_id)
);

-- ── forum_reports ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forum_reports (
  id          uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text        NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id   uuid        NOT NULL,
  reason      text        NOT NULL CHECK (reason IN (
                'spam', 'harassment', 'misinformation',
                'off_topic', 'self_promo', 'other'
              )),
  notes       text        CHECK (char_length(notes) <= 500),
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forum_reports_unique_per_user UNIQUE (reporter_id, target_type, target_id)
);

-- ── forum_bookmarks ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forum_bookmarks (
  id         uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forum_bookmarks_unique UNIQUE (post_id, user_id)
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id
  ON public.forum_posts(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_posts_category
  ON public.forum_posts(category);

CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at
  ON public.forum_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_upvote_count
  ON public.forum_posts(upvote_count DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_tags
  ON public.forum_posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_forum_posts_is_deleted
  ON public.forum_posts(is_deleted);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id
  ON public.forum_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_id
  ON public.forum_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id
  ON public.forum_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_reports_target
  ON public.forum_reports(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_forum_reports_status
  ON public.forum_reports(status);

CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user_id
  ON public.forum_bookmarks(user_id);

-- ── Counter triggers ──────────────────────────────────────────

-- 1. forum_upvotes → forum_posts.upvote_count
CREATE OR REPLACE FUNCTION public.handle_forum_post_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.forum_posts
      SET upvote_count = upvote_count + 1
      WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.forum_posts
      SET upvote_count = GREATEST(upvote_count - 1, 0)
      WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS forum_post_upvote_count_trigger ON public.forum_upvotes;
CREATE TRIGGER forum_post_upvote_count_trigger
  AFTER INSERT OR DELETE ON public.forum_upvotes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_forum_post_upvote_count();

-- 2. forum_comment_upvotes → forum_comments.upvote_count
CREATE OR REPLACE FUNCTION public.handle_forum_comment_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.forum_comments
      SET upvote_count = upvote_count + 1
      WHERE id = NEW.comment_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.forum_comments
      SET upvote_count = GREATEST(upvote_count - 1, 0)
      WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS forum_comment_upvote_count_trigger ON public.forum_comment_upvotes;
CREATE TRIGGER forum_comment_upvote_count_trigger
  AFTER INSERT OR DELETE ON public.forum_comment_upvotes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_forum_comment_upvote_count();

-- 3. forum_comments → forum_posts.comment_count
CREATE OR REPLACE FUNCTION public.handle_forum_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Only count non-deleted inserts
    IF NOT NEW.is_deleted THEN
      UPDATE public.forum_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    END IF;

  ELSIF (TG_OP = 'UPDATE') THEN
    -- is_deleted flipped true  → decrement
    IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
      UPDATE public.forum_posts
        SET comment_count = GREATEST(comment_count - 1, 0)
        WHERE id = NEW.post_id;
    -- is_deleted flipped false → increment (un-delete edge case)
    ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
      UPDATE public.forum_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    END IF;

  ELSIF (TG_OP = 'DELETE') THEN
    -- Hard delete: only adjust if comment was not already soft-deleted
    IF NOT OLD.is_deleted THEN
      UPDATE public.forum_posts
        SET comment_count = GREATEST(comment_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS forum_comment_count_trigger ON public.forum_comments;
CREATE TRIGGER forum_comment_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.forum_comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_forum_comment_count();

-- ── RPC: increment_forum_view_count ───────────────────────────

CREATE OR REPLACE FUNCTION public.increment_forum_view_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_posts
    SET view_count = view_count + 1
    WHERE id = post_id
      AND is_deleted = false;
END;
$$;

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE public.forum_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_upvotes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comment_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_bookmarks      ENABLE ROW LEVEL SECURITY;

-- ── forum_posts policies ──────────────────────────────────────

DROP POLICY IF EXISTS "forum_posts_select_public"   ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_insert_own"      ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_update_own"      ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_update_admin"    ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_delete_admin"    ON public.forum_posts;

-- Anyone (incl. anon) can read posts — soft-delete filtering done in app layer
CREATE POLICY "forum_posts_select_public"
  ON public.forum_posts FOR SELECT
  USING (true);

-- Authenticated users can create their own posts
CREATE POLICY "forum_posts_insert_own"
  ON public.forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authors can edit their own posts (title, body, tags, flair)
CREATE POLICY "forum_posts_update_own"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update anything (pin, lock, soft-delete)
CREATE POLICY "forum_posts_update_admin"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can hard-delete posts
CREATE POLICY "forum_posts_delete_admin"
  ON public.forum_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ── forum_comments policies ───────────────────────────────────

DROP POLICY IF EXISTS "forum_comments_select_public"  ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments_insert_own"     ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments_update_own"     ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments_update_admin"   ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments_delete_admin"   ON public.forum_comments;

CREATE POLICY "forum_comments_select_public"
  ON public.forum_comments FOR SELECT
  USING (true);

CREATE POLICY "forum_comments_insert_own"
  ON public.forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_comments_update_own"
  ON public.forum_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_comments_update_admin"
  ON public.forum_comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "forum_comments_delete_admin"
  ON public.forum_comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ── forum_upvotes policies ────────────────────────────────────

DROP POLICY IF EXISTS "forum_upvotes_select_public" ON public.forum_upvotes;
DROP POLICY IF EXISTS "forum_upvotes_insert_own"    ON public.forum_upvotes;
DROP POLICY IF EXISTS "forum_upvotes_delete_own"    ON public.forum_upvotes;

CREATE POLICY "forum_upvotes_select_public"
  ON public.forum_upvotes FOR SELECT
  USING (true);

CREATE POLICY "forum_upvotes_insert_own"
  ON public.forum_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_upvotes_delete_own"
  ON public.forum_upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── forum_comment_upvotes policies ───────────────────────────

DROP POLICY IF EXISTS "forum_comment_upvotes_select_public" ON public.forum_comment_upvotes;
DROP POLICY IF EXISTS "forum_comment_upvotes_insert_own"    ON public.forum_comment_upvotes;
DROP POLICY IF EXISTS "forum_comment_upvotes_delete_own"    ON public.forum_comment_upvotes;

CREATE POLICY "forum_comment_upvotes_select_public"
  ON public.forum_comment_upvotes FOR SELECT
  USING (true);

CREATE POLICY "forum_comment_upvotes_insert_own"
  ON public.forum_comment_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_comment_upvotes_delete_own"
  ON public.forum_comment_upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── forum_reports policies ────────────────────────────────────

DROP POLICY IF EXISTS "forum_reports_insert_own"     ON public.forum_reports;
DROP POLICY IF EXISTS "forum_reports_select_own"     ON public.forum_reports;
DROP POLICY IF EXISTS "forum_reports_select_admin"   ON public.forum_reports;
DROP POLICY IF EXISTS "forum_reports_update_admin"   ON public.forum_reports;
DROP POLICY IF EXISTS "forum_reports_delete_admin"   ON public.forum_reports;

CREATE POLICY "forum_reports_insert_own"
  ON public.forum_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Reporters can see their own reports
CREATE POLICY "forum_reports_select_own"
  ON public.forum_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Admins can see all reports
CREATE POLICY "forum_reports_select_admin"
  ON public.forum_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "forum_reports_update_admin"
  ON public.forum_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "forum_reports_delete_admin"
  ON public.forum_reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ── forum_bookmarks policies ──────────────────────────────────

DROP POLICY IF EXISTS "forum_bookmarks_select_own" ON public.forum_bookmarks;
DROP POLICY IF EXISTS "forum_bookmarks_insert_own" ON public.forum_bookmarks;
DROP POLICY IF EXISTS "forum_bookmarks_delete_own" ON public.forum_bookmarks;

CREATE POLICY "forum_bookmarks_select_own"
  ON public.forum_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "forum_bookmarks_insert_own"
  ON public.forum_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_bookmarks_delete_own"
  ON public.forum_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── Realtime ──────────────────────────────────────────────────

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
