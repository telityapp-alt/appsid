-- ============================================================
-- 008_forum_compliance.sql
-- Forum compliance & moderation layer
-- Requires: 007_forum.sql
-- Adds: terms_accepted_at, forum_user_bans, forum_strikes,
--       forum_post_edit_history, forum_comment_edit_history,
--       forum_banned_keywords, auto-flag trigger, keyword
--       check triggers, extended report reasons
-- Idempotent: safe to re-run
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- §1  profiles — terms_accepted_at
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz DEFAULT NULL;


-- ════════════════════════════════════════════════════════════
-- §2  forum_posts / forum_comments — auto_flagged column
--     (needed by §7 trigger; added here so later sections
--      that reference the column are always in order)
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.forum_posts
  ADD COLUMN IF NOT EXISTS auto_flagged boolean NOT NULL DEFAULT false;

ALTER TABLE public.forum_comments
  ADD COLUMN IF NOT EXISTS auto_flagged boolean NOT NULL DEFAULT false;


-- ════════════════════════════════════════════════════════════
-- §3  forum_user_bans
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.forum_user_bans (
  id         uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  reason     text        NOT NULL
                         CHECK (char_length(reason) >= 3 AND char_length(reason) <= 1000),
  ban_type   text        NOT NULL DEFAULT 'temporary'
                         CHECK (ban_type IN ('temporary', 'permanent')),
  expires_at timestamptz,          -- NULL means permanent
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Partial unique index: only one active ban per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS uq_forum_user_bans_active_user
  ON public.forum_user_bans(user_id)
  WHERE is_active = true;

ALTER TABLE public.forum_user_bans ENABLE ROW LEVEL SECURITY;

-- ── RLS policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Bans: admins can select all"          ON public.forum_user_bans;
DROP POLICY IF EXISTS "Bans: user can select own ban"        ON public.forum_user_bans;
DROP POLICY IF EXISTS "Bans: admins can insert"              ON public.forum_user_bans;
DROP POLICY IF EXISTS "Bans: admins can update"              ON public.forum_user_bans;
DROP POLICY IF EXISTS "Bans: admins can delete"              ON public.forum_user_bans;

CREATE POLICY "Bans: admins can select all"
  ON public.forum_user_bans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Bans: user can select own ban"
  ON public.forum_user_bans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Bans: admins can insert"
  ON public.forum_user_bans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Bans: admins can update"
  ON public.forum_user_bans FOR UPDATE
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

CREATE POLICY "Bans: admins can delete"
  ON public.forum_user_bans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ════════════════════════════════════════════════════════════
-- §4  forum_strikes
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.forum_strikes (
  id                   uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issued_by            uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  reason               text        NOT NULL,
  related_content_type text        CHECK (related_content_type IN ('post', 'comment')),
  related_content_id   uuid,
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_strikes ENABLE ROW LEVEL SECURITY;

-- ── RLS policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Strikes: admins can do all"          ON public.forum_strikes;
DROP POLICY IF EXISTS "Strikes: user can select own"        ON public.forum_strikes;

-- Single permissive admin policy covers all operations
CREATE POLICY "Strikes: admins can do all"
  ON public.forum_strikes FOR ALL
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

CREATE POLICY "Strikes: user can select own"
  ON public.forum_strikes FOR SELECT
  USING (user_id = auth.uid());


-- ════════════════════════════════════════════════════════════
-- §5  forum_post_edit_history
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.forum_post_edit_history (
  id          uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  edited_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  old_title   text,
  old_body    text,
  edit_reason text        CHECK (char_length(edit_reason) <= 300),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_post_edit_history ENABLE ROW LEVEL SECURITY;

-- ── RLS policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "PostEditHistory: admins can select all"   ON public.forum_post_edit_history;
DROP POLICY IF EXISTS "PostEditHistory: post owner can select"   ON public.forum_post_edit_history;

CREATE POLICY "PostEditHistory: admins can select all"
  ON public.forum_post_edit_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "PostEditHistory: post owner can select"
  ON public.forum_post_edit_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forum_posts
      WHERE forum_posts.id = post_id
        AND forum_posts.user_id = auth.uid()
    )
  );


-- ════════════════════════════════════════════════════════════
-- §6  forum_comment_edit_history
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.forum_comment_edit_history (
  id          uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  uuid        NOT NULL REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  edited_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  old_body    text,
  edit_reason text        CHECK (char_length(edit_reason) <= 300),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_comment_edit_history ENABLE ROW LEVEL SECURITY;

-- ── RLS policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "CommentEditHistory: admins can select all"   ON public.forum_comment_edit_history;
DROP POLICY IF EXISTS "CommentEditHistory: comment owner can select" ON public.forum_comment_edit_history;

CREATE POLICY "CommentEditHistory: admins can select all"
  ON public.forum_comment_edit_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "CommentEditHistory: comment owner can select"
  ON public.forum_comment_edit_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forum_comments
      WHERE forum_comments.id = comment_id
        AND forum_comments.user_id = auth.uid()
    )
  );


-- ════════════════════════════════════════════════════════════
-- §7  forum_reports — extended reason CHECK constraint
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.forum_reports
  DROP CONSTRAINT IF EXISTS forum_reports_reason_check;

ALTER TABLE public.forum_reports
  ADD CONSTRAINT forum_reports_reason_check
  CHECK (reason IN (
    'spam', 'harassment', 'misinformation', 'off_topic', 'self_promo',
    'sara', 'pornografi', 'kekerasan', 'penipuan',
    'other'
  ));


-- ════════════════════════════════════════════════════════════
-- §8  forum_banned_keywords
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.forum_banned_keywords (
  id         uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword    text        NOT NULL UNIQUE,  -- stored lowercase, trimmed
  category   text        NOT NULL
             CHECK (category IN ('sara', 'pornografi', 'kekerasan', 'penipuan', 'spam')),
  added_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Normalise keyword on insert via trigger (see §10)
  CONSTRAINT forum_banned_keywords_keyword_nonempty CHECK (char_length(trim(keyword)) > 0)
);

ALTER TABLE public.forum_banned_keywords ENABLE ROW LEVEL SECURITY;

-- ── RLS policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "BannedKeywords: authenticated can select active"  ON public.forum_banned_keywords;
DROP POLICY IF EXISTS "BannedKeywords: admins can insert"                ON public.forum_banned_keywords;
DROP POLICY IF EXISTS "BannedKeywords: admins can update"                ON public.forum_banned_keywords;
DROP POLICY IF EXISTS "BannedKeywords: admins can delete"                ON public.forum_banned_keywords;

CREATE POLICY "BannedKeywords: authenticated can select active"
  ON public.forum_banned_keywords FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "BannedKeywords: admins can insert"
  ON public.forum_banned_keywords FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "BannedKeywords: admins can update"
  ON public.forum_banned_keywords FOR UPDATE
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

CREATE POLICY "BannedKeywords: admins can delete"
  ON public.forum_banned_keywords FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ════════════════════════════════════════════════════════════
-- §9  Keyword normalisation trigger on forum_banned_keywords
--     Ensures keywords are always stored lowercase + trimmed
-- ════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.normalise_banned_keyword() CASCADE;

CREATE FUNCTION public.normalise_banned_keyword()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.keyword = lower(trim(NEW.keyword));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_banned_keywords_normalise ON public.forum_banned_keywords;
CREATE TRIGGER forum_banned_keywords_normalise
  BEFORE INSERT OR UPDATE ON public.forum_banned_keywords
  FOR EACH ROW EXECUTE FUNCTION public.normalise_banned_keyword();


-- ════════════════════════════════════════════════════════════
-- §10  check_content_for_banned_keywords(content text) → bool
--      Returns TRUE when content matches at least one active
--      banned keyword (case-insensitive substring match).
-- ════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.check_content_for_banned_keywords(text) CASCADE;

CREATE FUNCTION public.check_content_for_banned_keywords(content text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  kw text;
BEGIN
  -- Short-circuit on NULL/empty input
  IF content IS NULL OR trim(content) = '' THEN
    RETURN false;
  END IF;

  FOR kw IN
    SELECT keyword
    FROM public.forum_banned_keywords
    WHERE is_active = true
  LOOP
    -- ILIKE provides case-insensitive substring matching
    IF content ILIKE '%' || kw || '%' THEN
      RETURN true;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;


-- ════════════════════════════════════════════════════════════
-- §11  Keyword-check trigger — forum_posts
-- ════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.check_forum_post_keywords() CASCADE;

CREATE FUNCTION public.check_forum_post_keywords()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.check_content_for_banned_keywords(NEW.title || ' ' || NEW.body) THEN
    RAISE EXCEPTION 'CONTENT_POLICY_VIOLATION'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_posts_keyword_check ON public.forum_posts;
CREATE TRIGGER forum_posts_keyword_check
  BEFORE INSERT OR UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.check_forum_post_keywords();


-- ════════════════════════════════════════════════════════════
-- §12  Keyword-check trigger — forum_comments
-- ════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.check_forum_comment_keywords() CASCADE;

CREATE FUNCTION public.check_forum_comment_keywords()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.check_content_for_banned_keywords(NEW.body) THEN
    RAISE EXCEPTION 'CONTENT_POLICY_VIOLATION'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_comments_keyword_check ON public.forum_comments;
CREATE TRIGGER forum_comments_keyword_check
  BEFORE INSERT OR UPDATE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.check_forum_comment_keywords();


-- ════════════════════════════════════════════════════════════
-- §13  Auto-flag trigger — fires AFTER INSERT on forum_reports
--      When a post/comment reaches >= 5 pending reports:
--        • sets is_deleted = true  (soft-delete, pending review)
--        • sets auto_flagged = true (so admins know why)
-- ════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.auto_flag_post_on_reports() CASCADE;

CREATE FUNCTION public.auto_flag_post_on_reports()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_count integer;
BEGIN
  -- Count pending reports for the exact target
  SELECT count(*)
  INTO   pending_count
  FROM   public.forum_reports
  WHERE  target_type = NEW.target_type
    AND  target_id   = NEW.target_id
    AND  status      = 'pending';

  IF pending_count >= 5 THEN
    IF NEW.target_type = 'post' THEN
      UPDATE public.forum_posts
      SET    is_deleted  = true,
             auto_flagged = true
      WHERE  id = NEW.target_id
        AND  (is_deleted = false OR auto_flagged = false);  -- skip if already done

    ELSIF NEW.target_type = 'comment' THEN
      UPDATE public.forum_comments
      SET    is_deleted  = true,
             auto_flagged = true
      WHERE  id = NEW.target_id
        AND  (is_deleted = false OR auto_flagged = false);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_reports_auto_flag ON public.forum_reports;
CREATE TRIGGER forum_reports_auto_flag
  AFTER INSERT ON public.forum_reports
  FOR EACH ROW EXECUTE FUNCTION public.auto_flag_post_on_reports();


-- ════════════════════════════════════════════════════════════
-- §14  Indexes
-- ════════════════════════════════════════════════════════════

-- forum_user_bans
CREATE INDEX IF NOT EXISTS idx_forum_user_bans_user_id
  ON public.forum_user_bans(user_id)
  WHERE is_active = true;

-- forum_strikes
CREATE INDEX IF NOT EXISTS idx_forum_strikes_user_id
  ON public.forum_strikes(user_id);

-- forum_banned_keywords
CREATE INDEX IF NOT EXISTS idx_forum_banned_keywords_keyword
  ON public.forum_banned_keywords(keyword)
  WHERE is_active = true;

-- forum_post_edit_history
CREATE INDEX IF NOT EXISTS idx_forum_post_edit_history_post_id
  ON public.forum_post_edit_history(post_id);

-- forum_comment_edit_history
CREATE INDEX IF NOT EXISTS idx_forum_comment_edit_history_comment_id
  ON public.forum_comment_edit_history(comment_id);
