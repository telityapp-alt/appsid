-- ============================================================
-- 003_apps_rollback.sql
-- Rollback untuk 003_apps.sql
-- WARNING: Drops semua tables, types, functions, triggers, dan
--          storage policies yang dibuat di 003_apps.sql.
--          DATA AKAN HILANG PERMANEN.
-- Jalankan hanya jika benar-benar perlu rollback.
-- ============================================================

-- ── Storage policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can delete any app asset"         ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own app assets"   ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own app assets"   ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own app assets"   ON storage.objects;
DROP POLICY IF EXISTS "App assets are publicly accessible"      ON storage.objects;

-- Storage bucket (hapus bucket + semua files di dalamnya)
DELETE FROM storage.objects WHERE bucket_id = 'app-assets';
DELETE FROM storage.buckets WHERE id = 'app-assets';

-- ── RLS policies: app_comments ────────────────────────────────
DROP POLICY IF EXISTS "Admins can delete any comment"            ON public.app_comments;
DROP POLICY IF EXISTS "App owner can pin comments on their app"  ON public.app_comments;
DROP POLICY IF EXISTS "Users can delete their own comment"       ON public.app_comments;
DROP POLICY IF EXISTS "Users can update their own comment"       ON public.app_comments;
DROP POLICY IF EXISTS "Authenticated users can comment on live apps" ON public.app_comments;
DROP POLICY IF EXISTS "Comments on live apps are publicly viewable" ON public.app_comments;

-- ── RLS policies: app_reviews ─────────────────────────────────
DROP POLICY IF EXISTS "Admins can delete any review"             ON public.app_reviews;
DROP POLICY IF EXISTS "Users can delete their own review"        ON public.app_reviews;
DROP POLICY IF EXISTS "Users can update their own review"        ON public.app_reviews;
DROP POLICY IF EXISTS "Authenticated users can review live apps" ON public.app_reviews;
DROP POLICY IF EXISTS "Reviews on live apps are publicly viewable" ON public.app_reviews;

-- ── RLS policies: app_upvotes ─────────────────────────────────
DROP POLICY IF EXISTS "Users can remove their own upvote"        ON public.app_upvotes;
DROP POLICY IF EXISTS "Authenticated users can upvote live apps" ON public.app_upvotes;
DROP POLICY IF EXISTS "Upvotes are publicly viewable"            ON public.app_upvotes;

-- ── RLS policies: app_makers ──────────────────────────────────
DROP POLICY IF EXISTS "App owner can delete makers"              ON public.app_makers;
DROP POLICY IF EXISTS "App owner can update makers"              ON public.app_makers;
DROP POLICY IF EXISTS "App owner can insert makers"              ON public.app_makers;
DROP POLICY IF EXISTS "Owners can view makers of their own apps" ON public.app_makers;
DROP POLICY IF EXISTS "App makers are publicly viewable for live apps" ON public.app_makers;

-- ── RLS policies: apps ───────────────────────────────────────
DROP POLICY IF EXISTS "Admins can delete any app"                ON public.apps;
DROP POLICY IF EXISTS "Owners can delete their own pending apps" ON public.apps;
DROP POLICY IF EXISTS "Admins can update any app"                ON public.apps;
DROP POLICY IF EXISTS "Owners can update their own apps"         ON public.apps;
DROP POLICY IF EXISTS "Authenticated users can submit apps"      ON public.apps;
DROP POLICY IF EXISTS "Admins can view all apps"                 ON public.apps;
DROP POLICY IF EXISTS "Owners can view their own apps"           ON public.apps;
DROP POLICY IF EXISTS "Live apps are publicly viewable"          ON public.apps;

-- ── Triggers ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS app_reviews_count_trigger  ON public.app_reviews;
DROP TRIGGER IF EXISTS app_upvotes_count_trigger  ON public.app_upvotes;
DROP TRIGGER IF EXISTS apps_auto_slug             ON public.apps;
DROP TRIGGER IF EXISTS apps_updated_at            ON public.apps;
DROP TRIGGER IF EXISTS app_reviews_updated_at     ON public.app_reviews;
DROP TRIGGER IF EXISTS app_comments_updated_at    ON public.app_comments;

-- ── Functions ─────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.handle_review_count()  CASCADE;
DROP FUNCTION IF EXISTS public.handle_upvote_count()  CASCADE;
DROP FUNCTION IF EXISTS public.handle_app_slug()      CASCADE;
DROP FUNCTION IF EXISTS public.generate_app_slug(text) CASCADE;

-- ── Tables (CASCADE untuk hapus constraints dan indexes) ──────
DROP TABLE IF EXISTS public.app_comments  CASCADE;
DROP TABLE IF EXISTS public.app_reviews   CASCADE;
DROP TABLE IF EXISTS public.app_upvotes   CASCADE;
DROP TABLE IF EXISTS public.app_makers    CASCADE;
DROP TABLE IF EXISTS public.apps          CASCADE;

-- ── Enums ─────────────────────────────────────────────────────
DROP TYPE IF EXISTS public.app_status   CASCADE;
DROP TYPE IF EXISTS public.pricing_type CASCADE;
