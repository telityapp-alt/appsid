-- ============================================================
-- 003_apps_seed.sql
-- Seed data untuk Apphunt — data Preppy sebagai contoh pertama
-- Catatan: seed ini pakai service_role karena bypass RLS
-- Run SETELAH 003_apps.sql berhasil diapply
-- ============================================================

-- Buat user dummy untuk seed (agar foreign key created_by tidak null)
-- Di production, ganti dengan UUID admin user yang sebenarnya
DO $$
DECLARE
  v_seed_user_id  uuid;
  v_app_id        uuid;
BEGIN

  -- Cek apakah sudah ada seed user
  SELECT id INTO v_seed_user_id
  FROM auth.users
  WHERE email = 'seed@apphunt.id'
  LIMIT 1;

  -- Jika belum ada, buat seed user via auth.users
  IF v_seed_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      email,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      'seed@apphunt.id',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Apphunt Seed"}',
      false,
      'authenticated'
    )
    RETURNING id INTO v_seed_user_id;

    -- Buat profile untuk seed user
    INSERT INTO public.profiles (id, full_name, updated_at)
    VALUES (v_seed_user_id, 'Apphunt Seed', now())
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ── Preppy ──────────────────────────────────────────────────
  INSERT INTO public.apps (
    slug,
    name,
    tagline,
    description,
    website_url,
    logo_url,
    gallery_images,
    launch_tags,
    built_with,
    is_open_source,
    pricing_type,
    status,
    upvotes_count,
    reviews_count,
    launch_date,
    created_by,
    first_comment
  ) VALUES (
    'preppy',
    'Preppy',
    'Belajar beasiswa & IELTS dengan gamifikasi ala Duolingo',
    'Preppy adalah platform belajar bergaya Duolingo untuk persiapan beasiswa, IELTS, dan CPNS. Kami mengubah materi berat dan membosankan menjadi pengalaman belajar yang engaging melalui gamification psychology, AI personalization, dan guerrilla marketing strategy. Dengan 5000+ database beasiswa gratis, AI college prediction, dan daily streak system, Preppy membuktikan bahwa belajar yang serius tidak harus membosankan.',
    NULL,
    '/preppy/hero-web.png',
    ARRAY[
      '/preppy/hero-web.png',
      '/preppy/screen-1.webp',
      '/preppy/screen-2.webp'
    ],
    ARRAY['EdTech', 'Gamification', 'Mobile'],
    ARRAY['React', 'Vite', 'Capacitor', 'Tailwind', 'Framer Motion'],
    false,
    'freemium',
    'live',
    42,
    0,
    CURRENT_DATE,
    v_seed_user_id,
    'Halo! Gua Nabil, builder di balik Preppy. Senang banget bisa sharing project ini. Preppy lahir dari frustrasi gua sendiri waktu prep IELTS — semua resource ada tapi boring banget. Kalau ada pertanyaan atau feedback, drop di sini ya!'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline       = EXCLUDED.tagline,
    description   = EXCLUDED.description,
    gallery_images = EXCLUDED.gallery_images,
    launch_tags   = EXCLUDED.launch_tags,
    built_with    = EXCLUDED.built_with,
    status        = EXCLUDED.status,
    updated_at    = now()
  RETURNING id INTO v_app_id;

  -- Maker entry untuk Preppy
  INSERT INTO public.app_makers (
    app_id,
    user_id,
    name,
    role,
    is_verified,
    order_index
  ) VALUES (
    v_app_id,
    v_seed_user_id,
    'Nabil',
    'Founder & Builder',
    true,
    0
  )
  ON CONFLICT DO NOTHING;

END $$;
