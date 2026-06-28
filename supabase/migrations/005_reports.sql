-- ============================================================
-- Migration: 005_reports.sql
-- Description: app_reports table with RLS policies
-- ============================================================

-- ------------------------------------------------------------
-- Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_reports (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type  text        NOT NULL CHECK (target_type IN ('comment', 'review', 'app')),
    target_id    uuid        NOT NULL,
    reason       text        NOT NULL CHECK (reason IN ('spam', 'hate', 'misinformation', 'harassment', 'inappropriate', 'other')),
    detail       text        CHECK (char_length(detail) <= 500),
    status       text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
    created_at   timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT app_reports_unique_per_user_per_target
        UNIQUE (reporter_id, target_type, target_id)
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_app_reports_target
    ON public.app_reports (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_app_reports_reporter
    ON public.app_reports (reporter_id);

CREATE INDEX IF NOT EXISTS idx_app_reports_status
    ON public.app_reports (status);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
ALTER TABLE public.app_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies so this migration is idempotent
DROP POLICY IF EXISTS "reports_insert_own"        ON public.app_reports;
DROP POLICY IF EXISTS "reports_select_own"        ON public.app_reports;
DROP POLICY IF EXISTS "reports_admin_select_all"  ON public.app_reports;
DROP POLICY IF EXISTS "reports_admin_update"      ON public.app_reports;
DROP POLICY IF EXISTS "reports_admin_delete"      ON public.app_reports;

-- Authenticated users can file a report for themselves
CREATE POLICY "reports_insert_own"
    ON public.app_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "reports_select_own"
    ON public.app_reports
    FOR SELECT
    TO authenticated
    USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "reports_admin_select_all"
    ON public.app_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Admins can update the status of any report
CREATE POLICY "reports_admin_update"
    ON public.app_reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Admins can delete reports
CREATE POLICY "reports_admin_delete"
    ON public.app_reports
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );
