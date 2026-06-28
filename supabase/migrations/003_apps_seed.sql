-- ============================================================
-- 003_apps_seed.sql
-- Seed data untuk Apphunt — 8 contoh app Indonesia
-- Catatan: seed ini pakai service_role karena bypass RLS
-- Run SETELAH 003_apps.sql berhasil diapply
-- ============================================================

DO $$
DECLARE
  v_seed_user_id  uuid;
  v_app_id        uuid;
BEGIN

  -- ── Seed user ────────────────────────────────────────────────
  SELECT id INTO v_seed_user_id
  FROM auth.users
  WHERE email = 'seed@apphunt.id'
  LIMIT 1;

  IF v_seed_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, email, email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, role
    ) VALUES (
      gen_random_uuid(),
      'seed@apphunt.id',
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Apphunt Seed"}',
      false,
      'authenticated'
    )
    RETURNING id INTO v_seed_user_id;

    INSERT INTO public.profiles (id, full_name, updated_at)
    VALUES (v_seed_user_id, 'Apphunt Seed', now())
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ── 1. Preppy ────────────────────────────────────────────────
  INSERT INTO public.apps (
    slug, name, tagline, description, website_url,
    logo_url, gallery_images, launch_tags, built_with,
    is_open_source, pricing_type, status,
    upvotes_count, reviews_count, launch_date, created_by, first_comment
  ) VALUES (
    'preppy',
    'Preppy',
    'Belajar beasiswa & IELTS dengan gamifikasi ala Duolingo',
    'Preppy adalah platform belajar bergaya Duolingo untuk persiapan beasiswa, IELTS, dan CPNS. Kami mengubah materi berat dan membosankan menjadi pengalaman belajar yang engaging melalui gamification psychology, AI personalization, dan guerrilla marketing strategy. Dengan 5000+ database beasiswa gratis, AI college prediction, dan daily streak system, Preppy membuktikan bahwa belajar yang serius tidak harus membosankan.',
    NULL,
    '/preppy/hero-web.png',
    ARRAY['/preppy/hero-web.png', '/preppy/screen-1.webp', '/preppy/screen-2.webp'],
    ARRAY['EdTech', 'Gamification', 'Mobile'],
    ARRAY['React', 'Vite', 'Capacitor', 'Tailwind', 'Framer Motion'],
    false, 'freemium', 'live',
    42, 3,
    CURRENT_DATE,
    v_seed_user_id,
    'Halo! Gua Nabil, builder di balik Preppy. Senang banget bisa sharing project ini. Preppy lahir dari frustrasi gua sendiri waktu prep IELTS — semua resource ada tapi boring banget. Kalau ada pertanyaan atau feedback, drop di sini ya!'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline        = EXCLUDED.tagline,
    description    = EXCLUDED.description,
    gallery_images = EXCLUDED.gallery_images,
    launch_tags    = EXCLUDED.launch_tags,
    built_with     = EXCLUDED.built_with,
    status         = EXCLUDED.status,
    upvotes_count  = EXCLUDED.upvotes_count,
    reviews_count  = EXCLUDED.reviews_count,
    updated_at     = now()
  RETURNING id INTO v_app_id;

  INSERT INTO public.app_makers (app_id, user_id, name, role, is_verified, order_index)
  VALUES (v_app_id, v_seed_user_id, 'Nabil', 'Founder & Builder', true, 0)
  ON CONFLICT DO NOTHING;

  -- ── 2. Kasir Pintar ──────────────────────────────────────────
  INSERT INTO public.apps (
    slug, name, tagline, description, website_url,
    logo_url, gallery_images, launch_tags, built_with,
    is_open_source, pricing_type, status,
    upvotes_count, reviews_count, launch_date, created_by, first_comment
  ) VALUES (
    'kasir-pintar',
    'Kasir Pintar',
    'POS & manajemen stok untuk UMKM — offline-first, gratis selamanya',
    'Kasir Pintar hadir untuk jutaan UMKM Indonesia yang masih catat penjualan secara manual. Dengan antarmuka yang simpel, dukungan offline penuh, dan laporan harian otomatis, pemilik warung bisa fokus jualan tanpa pusing soal software. Sinkronisasi cloud otomatis ketika ada koneksi. Tersedia di Android dan iOS.',
    'https://kasirpintar.co.id',
    NULL,
    ARRAY[]::text[],
    ARRAY['Fintech', 'Productivity', 'Mobile'],
    ARRAY['Flutter', 'Supabase', 'PostgreSQL'],
    false, 'freemium', 'live',
    38, 5,
    CURRENT_DATE - 2,
    v_seed_user_id,
    'Kami bangun Kasir Pintar karena liat sendiri ibu gua masih tulis penjualan di buku. Semoga bisa bantu lebih banyak UMKM naik kelas!'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline        = EXCLUDED.tagline,
    description    = EXCLUDED.description,
    status         = EXCLUDED.status,
    upvotes_count  = EXCLUDED.upvotes_count,
    updated_at     = now()
  RETURNING id INTO v_app_id;

  INSERT INTO public.app_makers (app_id, user_id, name, role, is_verified, order_index)
  VALUES (v_app_id, v_seed_user_id, 'Rizky Pratama', 'Co-founder', true, 0)
  ON CONFLICT DO NOTHING;

  -- ── 3. Jajan.ai ──────────────────────────────────────────────
  INSERT INTO public.apps (
    slug, name, tagline, description, website_url,
    logo_url, gallery_images, launch_tags, built_with,
    is_open_source, pricing_type, status,
    upvotes_count, reviews_count, launch_date, created_by, first_comment
  ) VALUES (
    'jajan-ai',
    'Jajan.ai',
    'Temukan jajanan terbaik di sekitarmu dengan rekomendasi AI',
    'Jajan.ai adalah mesin rekomendasi kuliner hyperlocal berbasis AI untuk pasar Indonesia. Tidak seperti Google Maps yang general, Jajan.ai memahami preferensi lokal: "yang pedesnya level 3 tapi ada kuah", "yang buka setelah jam 10 malam", "yang anak-anak suka". Ditenagai data dari 50.000+ review kuliner Indonesia.',
    'https://jajan.ai',
    NULL,
    ARRAY[]::text[],
    ARRAY['AI', 'Food Tech', 'Mobile'],
    ARRAY['Next.js', 'Python', 'PostgreSQL', 'OpenAI', 'Vercel'],
    false, 'free', 'live',
    31, 2,
    CURRENT_DATE - 5,
    v_seed_user_id,
    'Ide Jajan.ai muncul waktu gua laper tengah malam dan bingung mau makan apa. AI harusnya bisa solve masalah sepele tapi penting ini!'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline       = EXCLUDED.tagline,
    description   = EXCLUDED.description,
    status        = EXCLUDED.status,
    upvotes_count = EXCLUDED.upvotes_count,
    updated_at    = now()
  RETURNING id INTO v_app_id;

  INSERT INTO public.app_makers (app_id, user_id, name, role, is_verified, order_index)
  VALUES (v_app_id, v_seed_user_id, 'Dian Safitri', 'Builder', false, 0)
  ON CONFLICT DO NOTHING;

  -- ── 4. Rekap.id ──────────────────────────────────────────────
  INSERT INTO public.apps (
    slug, name, tagline, description, website_url,
    logo_url, gallery_images, launch_tags, built_with,
    is_open_source, pricing_type, status,
    upvotes_count, reviews_count, launch_date, created_by, first_comment
  ) VALUES (
    'rekap-id',
    'Rekap.id',
    'Laporan keuangan otomatis dari WhatsApp — kirim chat, dapat rekap',
    'Rekap.id mengubah chat WhatsApp keuangan kamu menjadi laporan akuntansi yang rapi. Cukup kirim pesan seperti "beli bensin 50rb" ke nomor bot, dan Rekap.id akan mencatat, mengkategorikan, dan membuat laporan bulanan otomatis. Tidak perlu install app, tidak perlu belajar akuntansi.',
    'https://rekap.id',
    NULL,
    ARRAY[]::text[],
    ARRAY['Fintech', 'Productivity', 'AI'],
    ARRAY['Node.js', 'WhatsApp Business API', 'Supabase', 'OpenAI'],
    false, 'freemium', 'live',
    27, 4,
    CURRENT_DATE - 7,
    v_seed_user_id,
    'Rekap.id lahir dari kebutuhan nyata — banyak banget freelancer dan UMKM yang nggak punya waktu buat input ke Excel. WhatsApp adalah interface terbaik untuk mereka.'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline       = EXCLUDED.tagline,
    description   = EXCLUDED.description,
    status        = EXCLUDED.status,
    upvotes_count = EXCLUDED.upvotes_count,
    updated_at    = now()
  RETURNING id INTO v_app_id;

  INSERT INTO public.app_makers (app_id, user_id, name, role, is_verified, order_index)
  VALUES (v_app_id, v_seed_user_id, 'Hendra Wijaya', 'Founder', false, 0)
  ON CONFLICT DO NOTHING;

  -- ── 5. Kerjain ───────────────────────────────────────────────
  INSERT INTO public.apps (
    slug, name, tagline, description, website_url,
    logo_url, gallery_images, launch_tags, built_with,
    is_open_source, pricing_type, status,
    upvotes_count, reviews_count, launch_date, created_by, first_comment
  ) VALUES (
    'kerjain',
    'Kerjain',
    'Platform freelance khusus developer Indonesia — bayar dalam rupiah',
    'Kerjain adalah marketplace kerja untuk developer, designer, dan content creator Indonesia. Semua transaksi dalam rupiah, tidak ada biaya konversi, dan pembayaran dijamin escrow lokal. Verifikasi skill lewat coding challenge & portfolio review oleh komunitas.',
    'https://kerjain.id',
    NULL,
    ARRAY[]::text[],
    ARRAY['Startup Tools', 'HR Tech', 'Marketplace'],
    ARRAY['Next.js', 'TypeScript', 'Supabase', 'Stripe', 'Vercel'],
    false, 'free_options', 'live',
    24, 1,
    CURRENT_DATE - 10,
    v_seed_user_id,
    'Fiverr dan Upwork bagus tapi rumit untuk developer Indonesia — biaya konversi, pajak, dan proses verifikasi yang panjang. Kerjain hadir untuk solve itu semua.'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline       = EXCLUDED.tagline,
    description   = EXCLUDED.description,
    status        = EXCLUDED.status,
    upvotes_count = EXCLUDED.upvotes_count,
    updated_at    = now()
  RETURNING id INTO v_app_id;

  INSERT INTO public.app_makers (app_id, user_id, name, role, is_verified, order_index)
  VALUES (v_app_id, v_seed_user_id, 'Yusuf Amin', 'CEO', false, 0)
  ON CONFLICT DO NOTHING;

  -- ── 6. Cerita.io ─────────────────────────────────────────────
  INSERT INTO public.apps (
    slug, name, tagline, description, website_url,
    logo_url, gallery_images, launch_tags, built_with,
    is_open_source, pricing_type, status,
    upvotes_count, reviews_count, launch_date, created_by, first_comment
  ) VALUES (
    'cerita-io',
    'Cerita.io',
    'Buat newsletter dalam bahasa Indonesia — simpel, tanpa coding',
    'Cerita.io adalah platform newsletter untuk penulis Indonesia yang ingin membangun audiens lewat email. Desain email drag-and-drop, analitik pembaca, dan monetisasi langsung lewat subscription berbayar. Terintegrasi dengan QRIS untuk pembayaran lokal.',
    'https://cerita.io',
    NULL,
    ARRAY[]::text[],
    ARRAY['Writing', 'Marketing', 'Saas'],
    ARRAY['React', 'Go', 'PostgreSQL', 'AWS SES'],
    false, 'freemium', 'live',
    19, 2,
    CURRENT_DATE - 14,
    v_seed_user_id,
    'Substack keren, tapi tidak ada dukungan pembayaran rupiah dan audiensnya kebanyakan luar negeri. Cerita.io hadir untuk penulis Indonesia yang mau monetise tulisan mereka di sini.'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline       = EXCLUDED.tagline,
    description   = EXCLUDED.description,
    status        = EXCLUDED.status,
    upvotes_count = EXCLUDED.upvotes_count,
    updated_at    = now()
  RETURNING id INTO v_app_id;

  INSERT INTO public.app_makers (app_id, user_id, name, role, is_verified, order_index)
  VALUES (v_app_id, v_seed_user_id, 'Ayu Lestari', 'Builder', false, 0)
  ON CONFLICT DO NOTHING;

  -- ── 7. Pantau.dev ────────────────────────────────────────────
  INSERT INTO public.apps (
    slug, name, tagline, description, website_url,
    logo_url, gallery_images, launch_tags, built_with,
    is_open_source, pricing_type, status,
    upvotes_count, reviews_count, launch_date, created_by, first_comment
  ) VALUES (
    'pantau-dev',
    'Pantau.dev',
    'Uptime monitoring gratis untuk startup Indonesia — alert via Telegram',
    'Pantau.dev memantau website dan API kamu 24/7 dan mengirim alert ke Telegram atau WhatsApp ketika ada downtime. Gratis untuk 10 monitor, response time tracking, dan status page publik yang bisa di-share ke pelanggan. Tidak perlu kartu kredit.',
    'https://pantau.dev',
    NULL,
    ARRAY[]::text[],
    ARRAY['DevTools', 'Saas', 'Open Source'],
    ARRAY['Go', 'PostgreSQL', 'Telegram Bot API', 'Docker'],
    true, 'freemium', 'live',
    35, 6,
    CURRENT_DATE - 3,
    v_seed_user_id,
    'Gua buat Pantau.dev karena bosen bayar mahal untuk uptime monitoring yang sebenernya simpel. Open source juga, jadi kalau mau self-host bisa!'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline        = EXCLUDED.tagline,
    description    = EXCLUDED.description,
    is_open_source = EXCLUDED.is_open_source,
    status         = EXCLUDED.status,
    upvotes_count  = EXCLUDED.upvotes_count,
    updated_at     = now()
  RETURNING id INTO v_app_id;

  INSERT INTO public.app_makers (app_id, user_id, name, role, is_verified, order_index)
  VALUES (v_app_id, v_seed_user_id, 'Fajar Nugroho', 'Indie Hacker', false, 0)
  ON CONFLICT DO NOTHING;

  -- ── 8. Dompet Sehat ──────────────────────────────────────────
  INSERT INTO public.apps (
    slug, name, tagline, description, website_url,
    logo_url, gallery_images, launch_tags, built_with,
    is_open_source, pricing_type, status,
    upvotes_count, reviews_count, launch_date, created_by, first_comment
  ) VALUES (
    'dompet-sehat',
    'Dompet Sehat',
    'Catat pengeluaran & tabungan dengan metode budgeting ala Gen Z',
    'Dompet Sehat menggunakan pendekatan envelope budgeting yang divisualisasikan secara menarik untuk membantu Gen Z Indonesia mengelola keuangan. Koneksi ke rekening BCA, Mandiri, dan BRI via API resmi untuk import transaksi otomatis. Insight AI menjelaskan pola pengeluaran dalam bahasa yang mudah dipahami.',
    NULL,
    NULL,
    ARRAY[]::text[],
    ARRAY['Fintech', 'Health & Fitness', 'Mobile'],
    ARRAY['React Native', 'Expo', 'Supabase', 'Python'],
    false, 'freemium', 'live',
    22, 3,
    CURRENT_DATE - 6,
    v_seed_user_id,
    'Aplikasi budgeting yang ada terlalu serius dan ribet buat anak muda. Dompet Sehat dirancang agar ngatur duit terasa fun, bukan stres.'
  )
  ON CONFLICT (slug) DO UPDATE SET
    tagline       = EXCLUDED.tagline,
    description   = EXCLUDED.description,
    status        = EXCLUDED.status,
    upvotes_count = EXCLUDED.upvotes_count,
    updated_at    = now()
  RETURNING id INTO v_app_id;

  INSERT INTO public.app_makers (app_id, user_id, name, role, is_verified, order_index)
  VALUES (v_app_id, v_seed_user_id, 'Siti Rahma', 'Designer & Builder', false, 0)
  ON CONFLICT DO NOTHING;

END $$;
