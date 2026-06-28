-- ============================================================
-- 001_bansos_seed.sql
-- Seed data — migrated 1:1 from hardcoded PerksPage.jsx arrays
-- Run AFTER 001_bansos.sql
-- ============================================================

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
)
ON CONFLICT DO NOTHING;

-- ── Programs ─────────────────────────────────────────────────

-- 1. $50,000 product credits (id: "cash")
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
    {"type":"lead","text":"$50,000 kredit produk untuk startup yang sedang membangun stack analytics, observability, dan data pipeline tanpa harus pusing soal billing di tahap awal."},
    {"type":"p","text":"Program ini dirancang agar tim kecil bisa fokus build tanpa hambatan biaya infrastruktur yang biasanya baru terasa di saat traction mulai datang."},
    {"type":"quote","text":"Kami ingin setiap startup punya akses ke tooling kelas enterprise sejak day one.","attribution":"Tim Apphunt"},
    {"type":"h2","text":"Apa saja yang bisa dicover?"},
    {"type":"list","heading":"Kredit berlaku untuk:","items":["Event pipeline dan volume analytics besar","Insight board dan dashboard real-time","Support tooling dan observability stack","Testing infrastructure dan load simulation","Data ingestion dan transformation layer"]},
    {"type":"callout","text":"Kredit otomatis aktif setelah approval — tidak perlu konfigurasi billing manual."},
    {"type":"kv","rows":[{"label":"Nilai kredit","value":"$50,000 USD"},{"label":"Masa aktif","value":"12 bulan"},{"label":"Dapat digabung","value":"Dengan partner perks lain"},{"label":"Syarat utama","value":"Startup < 2 tahun, funding < $5M"}]}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 2. Dev infrastructure (id: "dev")
INSERT INTO public.bansos_programs
  (slug, eyebrow, title, description, chips, image_url, author, author_role, published_date, read_time, category, tags, content)
VALUES (
  'dev',
  'Build Faster',
  'Dev infrastructure gratis 1 tahun',
  'Hosting, CI/CD, monitoring, dan database — semua covered selama satu tahun penuh supaya tim bisa fokus ke produk.',
  ARRAY['Infrastructure', 'Free tier'],
  '/news-card-dev-art.png',
  'Nabil Hasan',
  'Product Lead',
  '2025-06-20',
  '3 min read',
  'Developer Tools',
  ARRAY['Infrastructure', 'DevOps', 'Startup'],
  '[
    {"type":"lead","text":"Infrastruktur developer lengkap — hosting, CI/CD pipeline, monitoring, dan managed database — gratis selama 12 bulan untuk startup early-stage."},
    {"type":"p","text":"Tidak ada lock-in. Setup dalam hitungan menit, dan semua resource bisa di-scale sesuai kebutuhan setelah masa program selesai."},
    {"type":"list","items":["Managed hosting dengan uptime SLA 99.9%","CI/CD pipeline terintegrasi","Monitoring dan alerting real-time","Managed PostgreSQL atau MySQL"]},
    {"type":"p","text":"Partner infrastruktur kami mencakup cloud provider tier-1 yang sudah dipercaya ribuan startup global."},
    {"type":"kv","rows":[{"label":"Durasi","value":"12 bulan"},{"label":"Nilai estimasi","value":"~$3,600/tahun"},{"label":"Support","value":"Email + community"},{"label":"Syarat","value":"Startup aktif, tim < 10 orang"}]}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 3. AI & LLM credits (id: "ai")
INSERT INTO public.bansos_programs
  (slug, eyebrow, title, description, chips, image_url, author, author_role, published_date, read_time, category, tags, content)
VALUES (
  'ai',
  'AI Access',
  'AI & LLM API credits',
  'Akses ke model AI terdepan dengan kredit API yang cukup untuk prototyping hingga production-grade feature.',
  ARRAY['AI', 'API Credits'],
  '/news-card-ai-art.png',
  'Nabil Hasan',
  'Product Lead',
  '2025-06-20',
  '5 min read',
  'AI Program',
  ARRAY['AI', 'LLM', 'API'],
  '[
    {"type":"lead","text":"Kredit AI API untuk mengintegrasikan kecerdasan buatan ke dalam produk kamu — dari GPT-level language model hingga vision dan embedding model."},
    {"type":"p","text":"Program ini cocok untuk tim yang ingin build fitur AI-native tanpa harus langsung commit ke billing API yang besar di awal."},
    {"type":"quote","text":"AI bukan lagi privilege startup yang didanai besar — sekarang semua bisa eksperimen.","attribution":"Tim Apphunt"},
    {"type":"list","heading":"Model yang bisa diakses:","items":["Large language models (chat & completion)","Embedding models untuk semantic search","Vision models untuk image understanding","Speech-to-text dan text-to-speech"]},
    {"type":"kv","rows":[{"label":"Nilai kredit","value":"$1,000 API credits"},{"label":"Provider","value":"Multiple partners"},{"label":"Masa aktif","value":"6 bulan"},{"label":"Syarat","value":"Startup dengan use case AI yang jelas"}]}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 4. Legal & compliance (id: "legal")
INSERT INTO public.bansos_programs
  (slug, eyebrow, title, description, chips, image_url, author, author_role, published_date, read_time, category, tags, content)
VALUES (
  'legal',
  'Stay Protected',
  'Legal & compliance starter pack',
  'Template dokumen legal, konsultasi singkat, dan akses ke tools compliance yang biasanya jadi blind spot startup awal.',
  ARRAY['Legal', 'Templates'],
  '/news-card-legal-art.png',
  'Nabil Hasan',
  'Product Lead',
  '2025-06-20',
  '4 min read',
  'Legal',
  ARRAY['Legal', 'Compliance', 'Startup'],
  '[
    {"type":"lead","text":"Starter pack legal untuk startup Indonesia: template perjanjian, privacy policy, terms of service, dan panduan kepatuhan dasar yang sering diabaikan di awal."},
    {"type":"p","text":"Banyak startup baru sadar pentingnya legal setelah ada masalah. Program ini membantu kamu setup fondasi hukum yang benar sejak awal."},
    {"type":"list","heading":"Yang kamu dapat:","items":["Template SHA, SAFE, dan term sheet","Privacy Policy & ToS siap pakai","Panduan PDPA/UU PDP Indonesia","1x sesi konsultasi dengan legal partner kami"]},
    {"type":"callout","text":"Semua template sudah disesuaikan dengan hukum Indonesia, bukan terjemahan template asing."},
    {"type":"kv","rows":[{"label":"Jumlah dokumen","value":"15+ template"},{"label":"Konsultasi","value":"1 sesi (60 menit)"},{"label":"Bahasa","value":"Indonesia & Inggris"},{"label":"Update","value":"Setiap perubahan regulasi"}]}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 5. Marketing & growth (id: "growth")
INSERT INTO public.bansos_programs
  (slug, eyebrow, title, description, chips, image_url, author, author_role, published_date, read_time, category, tags, content)
VALUES (
  'growth',
  'Grow Faster',
  'Marketing & growth toolkit',
  'Kredit ads, akses tools marketing automation, dan panduan go-to-market yang sudah terbukti untuk pasar Indonesia.',
  ARRAY['Marketing', 'Growth'],
  '/news-card-growth-art.png',
  'Nabil Hasan',
  'Product Lead',
  '2025-06-20',
  '4 min read',
  'Growth',
  ARRAY['Marketing', 'Growth', 'GTM'],
  '[
    {"type":"lead","text":"Toolkit pertumbuhan untuk startup Indonesia: dari kredit iklan digital hingga akses platform marketing automation yang biasanya terlalu mahal untuk tim kecil."},
    {"type":"p","text":"Go-to-market di Indonesia punya nuansa berbeda. Program ini memberikan tools dan playbook yang sudah disesuaikan dengan perilaku pengguna lokal."},
    {"type":"list","heading":"Termasuk dalam toolkit:","items":["Kredit Google Ads & Meta Ads","Akses HubSpot atau Mailchimp premium","SEO audit tools","GTM playbook untuk pasar Indonesia"]},
    {"type":"quote","text":"Distribution beats product — pastikan orang tahu produkmu ada.","attribution":"Tim Apphunt"},
    {"type":"kv","rows":[{"label":"Kredit iklan","value":"Rp 5 juta"},{"label":"Marketing tools","value":"3 bulan gratis"},{"label":"Playbook","value":"Termasuk case study lokal"},{"label":"Syarat","value":"Sudah ada produk yang bisa dicoba"}]}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 6. Community & network (id: "network")
INSERT INTO public.bansos_programs
  (slug, eyebrow, title, description, chips, image_url, author, author_role, published_date, read_time, category, tags, content)
VALUES (
  'network',
  'Connect',
  'Community & founder network',
  'Akses ke komunitas founder Indonesia, mentor office hours, dan koneksi ke investor yang aktif di ekosistem lokal.',
  ARRAY['Community', 'Network'],
  '/news-card-network-art.png',
  'Nabil Hasan',
  'Product Lead',
  '2025-06-20',
  '3 min read',
  'Community',
  ARRAY['Community', 'Network', 'Mentor'],
  '[
    {"type":"lead","text":"Bergabung dengan komunitas founder Indonesia yang aktif — tempat berbagi pelajaran, tantangan, dan peluang secara jujur tanpa filter."},
    {"type":"p","text":"Network yang tepat bisa mempercepat perjalanan startup lebih dari modal sekalipun. Di sini kamu terhubung dengan sesama builder yang paham konteks lokal."},
    {"type":"list","heading":"Akses yang kamu dapat:","items":["Slack community 500+ founder aktif","Monthly office hours dengan mentor","Warm intro ke investor lokal","Akses ke demo day internal"]},
    {"type":"callout","text":"Komunitas ini bukan untuk networking transaksional — ini untuk builder yang serius."},
    {"type":"kv","rows":[{"label":"Anggota aktif","value":"500+ founder"},{"label":"Mentor","value":"50+ praktisi"},{"label":"Office hours","value":"2x per bulan"},{"label":"Investor","value":"20+ VC & angel aktif"}]}
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;
