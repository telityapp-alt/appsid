-- Migration: 003_apps_realtime.sql
-- Enable Postgres logical replication for the `apps` table so that
-- Supabase Realtime can broadcast UPDATE events to subscribed clients.
--
-- This migration is idempotent: re-running it does not fail.
-- Run with: supabase db push  OR  psql -f 003_apps_realtime.sql

-- 1. Enable replica identity FULL so the Realtime diff contains both
--    old and new column values. Without this, only the PK is broadcast.
ALTER TABLE apps REPLICA IDENTITY FULL;

-- 2. Add the `apps` table to the Supabase Realtime publication.
--    The publication already exists on every Supabase project; we just
--    add our table to it.
ALTER PUBLICATION supabase_realtime ADD TABLE apps;

-- 3. (Optional, recommended) Add the `app_upvotes` table too, so future
--    hooks can subscribe to insert/delete events on upvotes directly.
ALTER TABLE app_upvotes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE app_upvotes;
