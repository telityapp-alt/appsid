-- ============================================================
-- 003_apps.sql
-- Apphunt: App discovery platform (Product Hunt clone)
-- Requires: 000_profiles.sql (profiles table, handle_updated_at())
-- Tables: apps, app_makers, app_upvotes, app_reviews, app_comments
-- Idempotent: safe to re-run
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.pricing_type AS ENUM (
    'free',
    'paid',
    'freemium',
    'free_options'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.app_status AS ENUM (
    'pending',
    'live',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── apps ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.apps (
  id               uuid                NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text                UNIQUE NOT NULL,
  name             text                NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  tagline          text                NOT NULL CHECK (char_length(tagline) BETWEEN 10 AND 120),
  description      text                CHECK (char_length(description) <= 5000),
  website_url      text                CHECK (website_url ~* '^https?://'),
  logo_url         text,
  gallery_images   text[]              NOT NULL DEFAULT '{}',
  launch_tags      text[]              NOT NULL DEFAULT '{}'
                                       CHECK (
                                         array_length(launch_tags, 1) IS NULL
                                         OR array_length(launch_tags, 1) <= 3
                                       ),
  built_with       text[]              NOT NULL DEFAULT '{}',
  is_open_source   boolean             NOT NULL DEFAULT false,
  twitter_handle   text                CHECK (twitter_handle ~* '^@?[A-Za-z0-9_]{1,15}$'),
  first_comment    text                CHECK (char_length(first_comment) <= 1000),
  pricing_type     public.pricing_type NOT NULL DEFAULT 'free',
  status           public.app_status   NOT NULL DEFAULT 'pending',
  upvotes_count    integer             NOT NULL DEFAULT 0 CHECK (upvotes_count >= 0),
  reviews_count    integer             NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  launch_date      date                NOT NULL DEFAULT CURRENT_DATE,
  created_by       uuid                NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at       timestamptz         NOT NULL DEFAULT now(),
  updated_at       timestamptz         NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS apps_updated_at ON public.apps;
CREATE TRIGGER apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ── app_makers ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.app_makers (
  id              uuid          NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id          uuid          NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id         uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  name            text          NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  avatar_url      text,
  role            text          NOT NULL DEFAULT 'Maker'
                                CHECK (char_length(role) BETWEEN 1 AND 60),
  website_url     text          CHECK (website_url ~* '^https?://'),
  twitter_handle  text          CHECK (twitter_handle ~* '^@?[A-Za-z0-9_]{1,15}$'),
  is_verified     boolean       NOT NULL DEFAULT false,
  order_index     integer       NOT NULL DEFAULT 0
);

-- ── app_upvotes ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.app_upvotes (
  id          uuid          NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id      uuid          NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT app_upvotes_unique UNIQUE (app_id, user_id)
);

-- ── app_reviews ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.app_reviews (
  id          uuid          NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id      uuid          NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      integer       NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        text          CHECK (char_length(body) <= 2000),
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT app_reviews_unique UNIQUE (app_id, user_id)
);

DROP TRIGGER IF EXISTS app_reviews_updated_at ON public.app_reviews;
CREATE TRIGGER app_reviews_updated_at
  BEFORE UPDATE ON public.app_reviews
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ── app_comments ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.app_comments (
  id             uuid          NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id         uuid          NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id        uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body           text          NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  parent_id      uuid          REFERENCES public.app_comments(id) ON DELETE CASCADE,
  upvotes_count  integer       NOT NULL DEFAULT 0 CHECK (upvotes_count >= 0),
  is_pinned      boolean       NOT NULL DEFAULT false,
  created_at     timestamptz   NOT NULL DEFAULT now(),
  updated_at     timestamptz   NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS app_comments_updated_at ON public.app_comments;
CREATE TRIGGER app_comments_updated_at
  BEFORE UPDATE ON public.app_comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ── Indexes ──────────────────────────────────────────────────

-- apps: primary lookup patterns
CREATE INDEX IF NOT EXISTS apps_slug_idx          ON public.apps(slug);
CREATE INDEX IF NOT EXISTS apps_created_by_idx    ON public.apps(created_by);
CREATE INDEX IF NOT EXISTS apps_status_idx        ON public.apps(status);
CREATE INDEX IF NOT EXISTS apps_launch_date_idx   ON public.apps(launch_date DESC);
CREATE INDEX IF NOT EXISTS apps_upvotes_count_idx ON public.apps(upvotes_count DESC);

-- Composite: live apps sorted by upvotes (most common list query)
CREATE INDEX IF NOT EXISTS apps_status_upvotes_idx
  ON public.apps(status, upvotes_count DESC)
  WHERE status = 'live';

-- Composite: live apps by date (Today's launches feed)
CREATE INDEX IF NOT EXISTS apps_status_date_idx
  ON public.apps(status, launch_date DESC)
  WHERE status = 'live';

-- app_makers
CREATE INDEX IF NOT EXISTS app_makers_app_id_idx   ON public.app_makers(app_id);
CREATE INDEX IF NOT EXISTS app_makers_user_id_idx  ON public.app_makers(user_id);
CREATE INDEX IF NOT EXISTS app_makers_order_idx    ON public.app_makers(app_id, order_index);

-- app_upvotes
CREATE INDEX IF NOT EXISTS app_upvotes_app_id_idx  ON public.app_upvotes(app_id);
CREATE INDEX IF NOT EXISTS app_upvotes_user_id_idx ON public.app_upvotes(user_id);

-- app_reviews
CREATE INDEX IF NOT EXISTS app_reviews_app_id_idx  ON public.app_reviews(app_id);
CREATE INDEX IF NOT EXISTS app_reviews_user_id_idx ON public.app_reviews(user_id);
CREATE INDEX IF NOT EXISTS app_reviews_rating_idx  ON public.app_reviews(rating);

-- app_comments
CREATE INDEX IF NOT EXISTS app_comments_app_id_idx    ON public.app_comments(app_id);
CREATE INDEX IF NOT EXISTS app_comments_user_id_idx   ON public.app_comments(user_id);
CREATE INDEX IF NOT EXISTS app_comments_parent_id_idx ON public.app_comments(parent_id);

-- Pinned comment fast lookup (only one per app expected)
CREATE INDEX IF NOT EXISTS app_comments_pinned_idx
  ON public.app_comments(app_id, is_pinned)
  WHERE is_pinned = true;

-- ── Slug generation ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_app_slug(p_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_slug  text;
  v_slug       text;
  v_counter    integer := 2;
BEGIN
  v_base_slug := lower(p_name);

  -- Replace Indonesian/accented characters
  v_base_slug := translate(v_base_slug,
    'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
    'aaaaaaaceeeeiiiidnoooooouuuuyby'
  );

  -- Replace non-alphanumeric with hyphens
  v_base_slug := regexp_replace(v_base_slug, '[^a-z0-9]+', '-', 'g');

  -- Trim leading/trailing hyphens
  v_base_slug := trim(both '-' from v_base_slug);

  -- Truncate to 60 chars max
  v_base_slug := left(v_base_slug, 60);

  -- Resolve collisions with -2, -3, ...
  v_slug := v_base_slug;
  WHILE EXISTS (SELECT 1 FROM public.apps WHERE slug = v_slug) LOOP
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  END LOOP;

  RETURN v_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_app_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    NEW.slug := public.generate_app_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS apps_auto_slug ON public.apps;
CREATE TRIGGER apps_auto_slug
  BEFORE INSERT ON public.apps
  FOR EACH ROW EXECUTE PROCEDURE public.handle_app_slug();

-- ── Cached counter: upvotes_count ────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.apps
    SET upvotes_count = upvotes_count + 1
    WHERE id = NEW.app_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.apps
    SET upvotes_count = GREATEST(upvotes_count - 1, 0)
    WHERE id = OLD.app_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS app_upvotes_count_trigger ON public.app_upvotes;
CREATE TRIGGER app_upvotes_count_trigger
  AFTER INSERT OR DELETE ON public.app_upvotes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_upvote_count();

-- ── Cached counter: reviews_count ────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_review_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.apps
    SET reviews_count = reviews_count + 1
    WHERE id = NEW.app_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.apps
    SET reviews_count = GREATEST(reviews_count - 1, 0)
    WHERE id = OLD.app_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS app_reviews_count_trigger ON public.app_reviews;
CREATE TRIGGER app_reviews_count_trigger
  AFTER INSERT OR DELETE ON public.app_reviews
  FOR EACH ROW EXECUTE PROCEDURE public.handle_review_count();

-- ============================================================
-- Row Level Security
-- ============================================================

-- ── apps ─────────────────────────────────────────────────────
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Anyone can view live apps
DROP POLICY IF EXISTS "Live apps are publicly viewable" ON public.apps;
CREATE POLICY "Live apps are publicly viewable"
  ON public.apps FOR SELECT
  USING (status = 'live');

-- Owners can view their own apps regardless of status
DROP POLICY IF EXISTS "Owners can view their own apps" ON public.apps;
CREATE POLICY "Owners can view their own apps"
  ON public.apps FOR SELECT
  USING (auth.uid() = created_by);

-- Admins can view all apps
DROP POLICY IF EXISTS "Admins can view all apps" ON public.apps;
CREATE POLICY "Admins can view all apps"
  ON public.apps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can submit new apps (land in pending)
DROP POLICY IF EXISTS "Authenticated users can submit apps" ON public.apps;
CREATE POLICY "Authenticated users can submit apps"
  ON public.apps FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = created_by
    AND status = 'pending'
  );

-- Owners can update their own pending apps (cannot self-approve)
DROP POLICY IF EXISTS "Owners can update their own apps" ON public.apps;
CREATE POLICY "Owners can update their own apps"
  ON public.apps FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (
    auth.uid() = created_by
    AND status = 'pending'
  );

-- Admins can update any app (approve/reject)
DROP POLICY IF EXISTS "Admins can update any app" ON public.apps;
CREATE POLICY "Admins can update any app"
  ON public.apps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Owners can delete their own pending apps
DROP POLICY IF EXISTS "Owners can delete their own pending apps" ON public.apps;
CREATE POLICY "Owners can delete their own pending apps"
  ON public.apps FOR DELETE
  USING (
    auth.uid() = created_by
    AND status = 'pending'
  );

-- Admins can delete any app
DROP POLICY IF EXISTS "Admins can delete any app" ON public.apps;
CREATE POLICY "Admins can delete any app"
  ON public.apps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── app_makers ───────────────────────────────────────────────
ALTER TABLE public.app_makers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "App makers are publicly viewable for live apps" ON public.app_makers;
CREATE POLICY "App makers are publicly viewable for live apps"
  ON public.app_makers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_makers.app_id AND status = 'live'
    )
  );

DROP POLICY IF EXISTS "Owners can view makers of their own apps" ON public.app_makers;
CREATE POLICY "Owners can view makers of their own apps"
  ON public.app_makers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_makers.app_id AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "App owner can insert makers" ON public.app_makers;
CREATE POLICY "App owner can insert makers"
  ON public.app_makers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_makers.app_id AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "App owner can update makers" ON public.app_makers;
CREATE POLICY "App owner can update makers"
  ON public.app_makers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_makers.app_id AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "App owner can delete makers" ON public.app_makers;
CREATE POLICY "App owner can delete makers"
  ON public.app_makers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_makers.app_id AND created_by = auth.uid()
    )
  );

-- ── app_upvotes ──────────────────────────────────────────────
ALTER TABLE public.app_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Upvotes are publicly viewable" ON public.app_upvotes;
CREATE POLICY "Upvotes are publicly viewable"
  ON public.app_upvotes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can upvote live apps" ON public.app_upvotes;
CREATE POLICY "Authenticated users can upvote live apps"
  ON public.app_upvotes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_upvotes.app_id AND status = 'live'
    )
  );

DROP POLICY IF EXISTS "Users can remove their own upvote" ON public.app_upvotes;
CREATE POLICY "Users can remove their own upvote"
  ON public.app_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- ── app_reviews ──────────────────────────────────────────────
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews on live apps are publicly viewable" ON public.app_reviews;
CREATE POLICY "Reviews on live apps are publicly viewable"
  ON public.app_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_reviews.app_id AND status = 'live'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can review live apps" ON public.app_reviews;
CREATE POLICY "Authenticated users can review live apps"
  ON public.app_reviews FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_reviews.app_id AND status = 'live'
    )
  );

DROP POLICY IF EXISTS "Users can update their own review" ON public.app_reviews;
CREATE POLICY "Users can update their own review"
  ON public.app_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own review" ON public.app_reviews;
CREATE POLICY "Users can delete their own review"
  ON public.app_reviews FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete any review" ON public.app_reviews;
CREATE POLICY "Admins can delete any review"
  ON public.app_reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── app_comments ─────────────────────────────────────────────
ALTER TABLE public.app_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments on live apps are publicly viewable" ON public.app_comments;
CREATE POLICY "Comments on live apps are publicly viewable"
  ON public.app_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_comments.app_id AND status = 'live'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can comment on live apps" ON public.app_comments;
CREATE POLICY "Authenticated users can comment on live apps"
  ON public.app_comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_comments.app_id AND status = 'live'
    )
  );

DROP POLICY IF EXISTS "Users can update their own comment" ON public.app_comments;
CREATE POLICY "Users can update their own comment"
  ON public.app_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND is_pinned = false
  );

DROP POLICY IF EXISTS "Users can delete their own comment" ON public.app_comments;
CREATE POLICY "Users can delete their own comment"
  ON public.app_comments FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "App owner can pin comments on their app" ON public.app_comments;
CREATE POLICY "App owner can pin comments on their app"
  ON public.app_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_comments.app_id AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can delete any comment" ON public.app_comments;
CREATE POLICY "Admins can delete any comment"
  ON public.app_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- Storage: app-assets bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-assets',
  'app-assets',
  true,
  5242880,  -- 5 MB hard ceiling
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public            = excluded.public,
  file_size_limit   = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can read files in the public bucket
DROP POLICY IF EXISTS "App assets are publicly accessible" ON storage.objects;
CREATE POLICY "App assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'app-assets');

-- Authenticated users can upload to their own user_id folder
DROP POLICY IF EXISTS "Users can upload their own app assets" ON storage.objects;
CREATE POLICY "Users can upload their own app assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'app-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can replace files in their own folder
DROP POLICY IF EXISTS "Users can update their own app assets" ON storage.objects;
CREATE POLICY "Users can update their own app assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'app-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'app-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete files in their own folder
DROP POLICY IF EXISTS "Users can delete their own app assets" ON storage.objects;
CREATE POLICY "Users can delete their own app assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'app-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can delete any app asset (moderation)
DROP POLICY IF EXISTS "Admins can delete any app asset" ON storage.objects;
CREATE POLICY "Admins can delete any app asset"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'app-assets'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
