-- ============================================================
-- 001_bansos.sql
-- Bansos AI: programs + FAQs tables
-- Requires: 000_profiles.sql (handle_updated_at function)
-- ============================================================

-- ── Bansos Programs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bansos_programs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text        UNIQUE NOT NULL,
  eyebrow        text,
  title          text        NOT NULL,
  description   text,
  chips          text[]      NOT NULL DEFAULT '{}',
  image_url      text,
  author         text,
  author_role    text,
  published_date date,
  read_time      text,
  category       text,
  tags           text[]      NOT NULL DEFAULT '{}',
  content        jsonb       NOT NULL DEFAULT '[]',
  is_active      boolean     NOT NULL DEFAULT true,
  created_by     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER bansos_programs_updated_at
  BEFORE UPDATE ON public.bansos_programs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE INDEX IF NOT EXISTS bansos_programs_slug_idx      ON public.bansos_programs(slug);
CREATE INDEX IF NOT EXISTS bansos_programs_category_idx  ON public.bansos_programs(category);
CREATE INDEX IF NOT EXISTS bansos_programs_is_active_idx ON public.bansos_programs(is_active);

-- ── Bansos FAQs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bansos_faqs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text        NOT NULL,
  body       text,
  bullets    text[]      NOT NULL DEFAULT '{}',
  sort_order integer     NOT NULL DEFAULT 0,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bansos_faqs_sort_order_idx ON public.bansos_faqs(sort_order);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.bansos_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bansos_faqs     ENABLE ROW LEVEL SECURITY;

-- bansos_programs: anyone can read active programs
CREATE POLICY "Anyone can view active bansos programs"
  ON public.bansos_programs FOR SELECT
  USING (is_active = true);

-- bansos_programs: only admins can write
CREATE POLICY "Admins can insert bansos programs"
  ON public.bansos_programs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update bansos programs"
  ON public.bansos_programs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete bansos programs"
  ON public.bansos_programs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- bansos_faqs: anyone can read active FAQs
CREATE POLICY "Anyone can view active bansos faqs"
  ON public.bansos_faqs FOR SELECT
  USING (is_active = true);

-- bansos_faqs: only admins can write
CREATE POLICY "Admins can manage bansos faqs"
  ON public.bansos_faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── Storage: bansos-images bucket ───────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('bansos-images', 'bansos-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Bansos images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bansos-images');

CREATE POLICY "Admins can upload bansos images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bansos-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
