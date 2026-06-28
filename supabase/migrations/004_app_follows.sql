-- Migration: app_follows table + followers_count on apps
-- Phase 5 — Follow System

-- 1. Add followers_count to apps if not exists
ALTER TABLE apps
  ADD COLUMN IF NOT EXISTS followers_count integer NOT NULL DEFAULT 0;

-- 2. Create app_follows table
CREATE TABLE IF NOT EXISTS app_follows (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id     uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (app_id, user_id)
);

-- 3. RLS
ALTER TABLE app_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows"
  ON app_follows FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow"
  ON app_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow their own follows"
  ON app_follows FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Trigger: increment followers_count on INSERT
CREATE OR REPLACE FUNCTION increment_followers_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE apps SET followers_count = followers_count + 1 WHERE id = NEW.app_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_followers ON app_follows;
CREATE TRIGGER trg_increment_followers
  AFTER INSERT ON app_follows
  FOR EACH ROW EXECUTE FUNCTION increment_followers_count();

-- 5. Trigger: decrement followers_count on DELETE
CREATE OR REPLACE FUNCTION decrement_followers_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE apps
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.app_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_followers ON app_follows;
CREATE TRIGGER trg_decrement_followers
  AFTER DELETE ON app_follows
  FOR EACH ROW EXECUTE FUNCTION decrement_followers_count();

-- 6. Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_app_follows_app_id ON app_follows(app_id);
CREATE INDEX IF NOT EXISTS idx_app_follows_user_id ON app_follows(user_id);
