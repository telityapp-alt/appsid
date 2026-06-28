-- ============================================================
-- 002_bansos_seed_real.sql
-- Seed data 100% identik dengan hardcoded data di PerksPage.jsx
-- Hapus seed lama dulu, lalu insert yang benar
-- ============================================================

-- Hapus seed lama yang tidak akurat
DELETE FROM public.bansos_programs;
DELETE FROM public.bansos_faqs;

-- ── FAQs ─────────────────────────────────────────────────────
INSERT INTO public.bansos_faqs (title, body, bullets, sort_order) VALUES
(
  'What is this?',
  'Apphunt for Startups membantu founder dan tim kecil merancang produk yang lebih matang sejak hari pertama, lengkap dengan kredit software, partner perks, dan support implementasi.',
  ARRAY['Untuk startup tahap awal', 'Fokus product-led teams', 'Benefit bisa dipakai lintas stack'],
  1
),
(
  'How to apply',
  'Daftar akun, ceritakan produk yang sedang dibangun, lalu pilih area bantuan yang paling dibutuhkan supaya tim kami bisa menilai kecocokan program dengan cepat.',
  ARRAY['Buat akun Apphunt', 'Isi startup profile', 'Tunggu review via email'],
  2
),
(
  'Who is eligible?',
  'Program ini cocok untuk startup muda yang masih dalam fase membangun fondasi produk dan butuh leverage lebih cepat untuk shipping.',
  ARRAY['Usia startup di bawah 2 tahun', 'Pendanaan di bawah $5 juta', 'Tim masih lean dan builder-heavy'],
  3
),
(
  'Fine print',
  'Beberapa benefit punya masa aktif dan ketentuan partner masing-masing. Semua detail tetap transparan dari awal sebelum Anda claim benefit.',
  ARRAY['Kredit berlaku 12 bulan', 'Tidak bisa digabung semua promo', 'Subject to partner approval'],
  4
);

-- ── Programs ─────────────────────────────────────────────────

-- 1. cash
INSERT INTO public.bansos_programs
  (slug, eyebrow, title, description, chips, image_url, author, author_role, published_date, read_time, category, tags, content)
VALUES (
  'cash',
  'Funding Fuel',
  '$50,000 product credits',
  'Dipakai untuk event volume besar, insight board, support tooling, dan observability tanpa bikin burn rate ngaco.',
  ARRAY['Credits', '12 months'],
  '/news-card-cash-art.png',
  'Nabil Hasan',
  'Product Lead',
  '2025-06-20',
  '4 min read',
  'Startup Program',
  ARRAY['Credits', 'Startup', 'Product'],
  '[
    {"type":"lead","text":"Kami memberikan $50,000 kredit produk langsung ke tangan founder — bukan janji, bukan syarat tersembunyi. Kredit ini dirancang untuk menutup gap antara ide dan ship."},
    {"type":"h2","text":"Kenapa $50k, bukan lebih kecil?"},
    {"type":"p","text":"Startup tahap awal sering stuck di observability dan tooling bukan karena malas, tapi karena budget habis sebelum MVP selesai. Angka $50k dipilih supaya cukup untuk satu siklus launch penuh tanpa harus kompromi di tools penting."},
    {"type":"quote","text":"Kredit ini bukan subsidi — ini akselerator. Tim yang pakai dengan benar bisa ship 3x lebih cepat di bulan pertama.","attribution":"Tim Apphunt"},
    {"type":"h2","text":"Apa saja yang bisa dicover?"},
    {"type":"list","heading":"Kredit berlaku untuk:","items":["Event pipeline dan volume analytics besar","Insight board dan dashboard real-time","Support tooling dan observability stack","Testing infrastructure dan load simulation","Data ingestion dan transformation layer"]},
    {"type":"callout","text":"Kredit otomatis aktif setelah approval — tidak perlu konfigurasi billing manual."},
    {"type":"kv","rows":[{"label":"Nilai kredit","value":"$50,000 USD"},{"label":"Masa aktif","value":"12 bulan"},{"label":"Dapat digabung","value":"Dengan partner perks lain"},{"label":"Syarat utama","value":"Startup < 2 tahun, funding < $5M"}]}
  ]'::jsonb
);
