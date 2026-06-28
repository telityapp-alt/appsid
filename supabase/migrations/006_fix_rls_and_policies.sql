-- ============================================================
-- 006_fix_rls_and_policies.sql
-- Idempotent fix for missing / broken RLS policies on:
--   app_reviews, app_comments, app_upvotes, app_reports
--
-- Root causes fixed:
--  1. app_reviews INSERT policy blocked upsert (Supabase upsert
--     needs INSERT + UPDATE to both pass). Replaced with a
--     permissive INSERT that lets the DB constraint deduplicate.
--  2. app_comments INSERT policy may have been missing in some
--     environments — re-applied here.
--  3. app_upvotes INSERT policy re-applied for safety.
--  4. app_reports INSERT policy re-applied for safety.
-- ============================================================

-- ── app_reviews ──────────────────────────────────────────────

ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

-- SELECT: anyone can read reviews on live apps
DROP POLICY IF EXISTS "Reviews on live apps are publicly viewable" ON public.app_reviews;
CREATE POLICY "Reviews on live apps are publicly viewable"
  ON public.app_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_reviews.app_id AND status = 'live'
    )
  );

-- INSERT: authenticated user inserting their own review on a live app
-- Note: unique constraint (app_id, user_id) handles dedup;
--       upsert (onConflict) also needs UPDATE policy below to work.
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

-- UPDATE: user can update their own review (upsert path)
DROP POLICY IF EXISTS "Users can update their own review" ON public.app_reviews;
CREATE POLICY "Users can update their own review"
  ON public.app_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: user can delete their own review
DROP POLICY IF EXISTS "Users can delete their own review" ON public.app_reviews;
CREATE POLICY "Users can delete their own review"
  ON public.app_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- DELETE: admins can delete any review
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

-- SELECT: anyone can read comments on live apps
DROP POLICY IF EXISTS "Comments on live apps are publicly viewable" ON public.app_comments;
CREATE POLICY "Comments on live apps are publicly viewable"
  ON public.app_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_comments.app_id AND status = 'live'
    )
  );

-- INSERT: authenticated user posting their own comment on a live app
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

-- UPDATE: user can edit their own non-pinned comment
DROP POLICY IF EXISTS "Users can update their own comment" ON public.app_comments;
CREATE POLICY "Users can update their own comment"
  ON public.app_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND is_pinned = false
  );

-- DELETE: user can delete their own comment
DROP POLICY IF EXISTS "Users can delete their own comment" ON public.app_comments;
CREATE POLICY "Users can delete their own comment"
  ON public.app_comments FOR DELETE
  USING (auth.uid() = user_id);

-- UPDATE: app owner can pin/unpin comments on their own app
DROP POLICY IF EXISTS "App owner can pin comments on their app" ON public.app_comments;
CREATE POLICY "App owner can pin comments on their app"
  ON public.app_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.apps
      WHERE id = app_comments.app_id AND created_by = auth.uid()
    )
  );

-- DELETE: admins can delete any comment
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.app_comments;
CREATE POLICY "Admins can delete any comment"
  ON public.app_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
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

-- ── app_reports ──────────────────────────────────────────────

ALTER TABLE public.app_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert_own" ON public.app_reports;
CREATE POLICY "reports_insert_own"
  ON public.app_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_select_own" ON public.app_reports;
CREATE POLICY "reports_select_own"
  ON public.app_reports FOR SELECT
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_admin_select_all" ON public.app_reports;
CREATE POLICY "reports_admin_select_all"
  ON public.app_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "reports_admin_update" ON public.app_reports;
CREATE POLICY "reports_admin_update"
  ON public.app_reports FOR UPDATE
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

DROP POLICY IF EXISTS "reports_admin_delete" ON public.app_reports;
CREATE POLICY "reports_admin_delete"
  ON public.app_reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ── app_follows ──────────────────────────────────────────────

ALTER TABLE public.app_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read follows" ON public.app_follows;
CREATE POLICY "Anyone can read follows"
  ON public.app_follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.app_follows;
CREATE POLICY "Authenticated users can follow"
  ON public.app_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unfollow their own follows" ON public.app_follows;
CREATE POLICY "Users can unfollow their own follows"
  ON public.app_follows FOR DELETE
  USING (auth.uid() = user_id);
