import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ImageUploader from './ImageUploader'
import { useSubmitApp } from '../hooks/useSubmitApp'
import { useAuth } from '../hooks/useAuth'
import './SubmitAppModal.css'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_FORM_DATA = {
  website_url: '',
  name: '',
  tagline: '',
  description: '',
  links: [{ label: '', url: '' }],
  is_open_source: false,
  twitter_handle: '',
  logo_file: null,
  logo_preview: null,
  gallery_files: [],
  gallery_previews: [],
  launch_tags: [],
  first_comment: '',
  built_with: [],
  team_members: [{ name: '', role: '', url: '' }],
  pricing_type: 'free',
}

const LAUNCH_TAGS = [
  'AI / Machine Learning', 'Analytics', 'API', 'Automation', 'B2B',
  'Chrome Extension', 'Cloud', 'Collaboration', 'CRM', 'Customer Support',
  'Data', 'Design Tools', 'Developer Tools', 'DevOps', 'E-Commerce',
  'EdTech', 'Email', 'Finance', 'Fintech', 'Gaming',
  'Government', 'Health & Fitness', 'HR Tech', 'IoT', 'Legal',
  'Low-Code / No-Code', 'Marketing', 'Media', 'Mobile', 'Music',
  'News', 'Open Source', 'Payments', 'Productivity', 'Real Estate',
  'Saas', 'Security', 'Social Media', 'Startup Tools', 'Travel',
  'Video', 'Web3', 'Writing',
]

const BUILT_WITH_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Svelte', 'Node.js',
  'Python', 'Go', 'Rust', 'TypeScript', 'PostgreSQL',
  'Supabase', 'Firebase', 'AWS', 'Vercel', 'Docker',
]

const PRICING_OPTIONS = [
  { value: 'free',         label: 'Free',        desc: 'Selalu gratis untuk semua fitur' },
  { value: 'freemium',     label: 'Freemium',     desc: 'Gratis dengan fitur premium berbayar' },
  { value: 'paid',         label: 'Berbayar',     desc: 'Memerlukan pembayaran untuk digunakan' },
  { value: 'free_options', label: 'Free Options', desc: 'Ada pilihan gratis tersedia' },
]

const STEP_LABELS = ['Info Utama', 'Gambar', 'Kategori', 'Detail']
const TOTAL_STEPS = 4

const STEP_SUBTITLES = {
  1: 'Informasi dasar tentang produkmu',
  2: 'Logo dan galeri gambar',
  3: 'Pilih kategori yang sesuai',
  4: 'Detail tambahan produk',
  5: 'Periksa sebelum submit',
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateStep(step, formData) {
  const errors = {}
  if (step === 1) {
    if (!formData.name.trim()) errors.name = 'Nama app wajib diisi.'
    else if (formData.name.trim().length < 2) errors.name = 'Minimal 2 karakter.'
    else if (formData.name.trim().length > 60) errors.name = 'Maks. 60 karakter.'
    if (!formData.tagline.trim()) errors.tagline = 'Tagline wajib diisi.'
    else if (formData.tagline.trim().length < 10) errors.tagline = 'Minimal 10 karakter.'
    else if (formData.tagline.trim().length > 120) errors.tagline = 'Maks. 120 karakter.'
    if (!formData.website_url.trim()) errors.website_url = 'Website URL wajib diisi.'
    else if (!/^https?:\/\/.+\..+/.test(formData.website_url.trim())) errors.website_url = 'URL tidak valid. Contoh: https://yourapp.com'
  }
  if (step === 2) {
    if (!formData.logo_file) errors.logo_file = 'Logo wajib diupload.'
  }
  if (step === 3) {
    if (formData.launch_tags.length === 0) errors.launch_tags = 'Pilih minimal 1 kategori.'
  }
  if (step === 4) {
    if (!formData.pricing_type) errors.pricing_type = 'Pilih model harga.'
  }
  return errors
}

// ---------------------------------------------------------------------------
// Micro-components
// ---------------------------------------------------------------------------

function FieldError({ msg }) {
  if (!msg) return null
  return <span className="sam-field-error" role="alert">{msg}</span>
}

function CharCounter({ value, max }) {
  const len = (value || '').length
  const pct = len / max
  const cls = ['sam-char-counter', pct >= 1 ? 'over' : pct >= 0.85 ? 'near' : ''].filter(Boolean).join(' ')
  return <span className={cls}>{len}/{max}</span>
}

function StepIndicator({ step }) {
  return (
    <div className="sam-step-indicator">
      {STEP_LABELS.map((label, idx) => {
        const num = idx + 1
        const isDone = step > num
        const isActive = step === num
        const itemCls = ['sam-step-item', isActive ? 'active' : '', isDone ? 'done' : ''].filter(Boolean).join(' ')
        return (
          <React.Fragment key={num}>
            <div className={itemCls}>
              <div className="sam-step-dot">
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{num}</span>
                )}
              </div>
              <span className="sam-step-label">{label}</span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div className={'sam-step-connector' + (isDone ? ' done' : '')} aria-hidden="true" />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Info Utama
// ---------------------------------------------------------------------------

function Step1_MainInfo({ formData, setField, errors }) {
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [fetchError, setFetchError] = useState('')

  async function handleFetchMeta() {
    const url = formData.website_url.trim()
    if (!url) return
    setFetchingMeta(true)
    setFetchError('')
    try {
      const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url))
      if (!res.ok) throw new Error('Gagal mengambil data')
      const json = await res.json()
      const parser = new DOMParser()
      const doc = parser.parseFromString(json.contents, 'text/html')
      const getMeta = (name) => {
        const el =
          doc.querySelector('meta[property="' + name + '"]') ||
          doc.querySelector('meta[name="' + name + '"]')
        return el ? el.getAttribute('content') || '' : ''
      }
      const ogTitle = getMeta('og:title')
      const ogDesc = getMeta('og:description')
      const twitterSite = getMeta('twitter:site')
      if (!formData.name.trim() && ogTitle) setField('name', ogTitle.slice(0, 60))
      if (!formData.tagline.trim() && ogDesc) setField('tagline', ogDesc.slice(0, 120))
      if (!formData.twitter_handle.trim() && twitterSite)
        setField('twitter_handle', twitterSite.replace(/^@/, ''))
    } catch (_err) {
      setFetchError('Gagal mengambil info dari URL. Coba isi manual.')
    } finally {
      setFetchingMeta(false)
    }
  }

  function addLink() {
    if (formData.links.length >= 5) return
    setField('links', [...formData.links, { label: '', url: '' }])
  }
  function removeLink(idx) {
    setField('links', formData.links.filter((_, i) => i !== idx))
  }
  function updateLink(idx, key, value) {
    setField('links', formData.links.map((l, i) => i === idx ? { ...l, [key]: value } : l))
  }

  return (
    <div className="sam-step-content">
      <p className="sam-step-intro">
        Ceritakan produkmu secara singkat. Info ini akan ditampilkan di halaman utama.
      </p>

      {/* Website URL */}
      <div className="sam-field">
        <div className="sam-label-row">
          <label className="sam-label" htmlFor="s1-url">
            Website URL <span className="sam-required" aria-hidden="true">*</span>
          </label>
        </div>
        <div className="sam-url-row">
          <input
            id="s1-url"
            type="url"
            className={'sam-input' + (errors.website_url ? ' is-error' : '')}
            placeholder="https://yourapp.com"
            value={formData.website_url}
            onChange={(e) => setField('website_url', e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            className="sam-fetch-btn"
            onClick={handleFetchMeta}
            disabled={fetchingMeta || !formData.website_url.trim()}
          >
            {fetchingMeta ? 'Mengambil…' : 'Ambil Info'}
          </button>
        </div>
        {fetchError && <p className="sam-fetch-error">{fetchError}</p>}
        <FieldError msg={errors.website_url} />
      </div>

      {/* App Name */}
      <div className="sam-field">
        <div className="sam-label-row">
          <label className="sam-label" htmlFor="s1-name">
            Nama App <span className="sam-required" aria-hidden="true">*</span>
          </label>
          <CharCounter value={formData.name} max={60} />
        </div>
        <input
          id="s1-name"
          type="text"
          className={'sam-input' + (errors.name ? ' is-error' : '')}
          placeholder="Nama produkmu"
          value={formData.name}
          onChange={(e) => setField('name', e.target.value)}
          maxLength={60}
        />
        <FieldError msg={errors.name} />
      </div>

      {/* Tagline */}
      <div className="sam-field">
        <div className="sam-label-row">
          <label className="sam-label" htmlFor="s1-tagline">
            Tagline <span className="sam-required" aria-hidden="true">*</span>
          </label>
          <CharCounter value={formData.tagline} max={120} />
        </div>
        <input
          id="s1-tagline"
          type="text"
          className={'sam-input' + (errors.tagline ? ' is-error' : '')}
          placeholder="Satu kalimat yang menjelaskan produkmu"
          value={formData.tagline}
          onChange={(e) => setField('tagline', e.target.value)}
          maxLength={120}
        />
        <FieldError msg={errors.tagline} />
      </div>

      {/* Description */}
      <div className="sam-field">
        <div className="sam-label-row">
          <label className="sam-label" htmlFor="s1-desc">Deskripsi</label>
          <CharCounter value={formData.description} max={500} />
        </div>
        <textarea
          id="s1-desc"
          className="sam-textarea sam-textarea--tall"
          placeholder="Jelaskan lebih detail tentang produkmu (opsional)"
          value={formData.description}
          onChange={(e) => setField('description', e.target.value)}
          maxLength={500}
          rows={5}
        />
      </div>

      {/* Open Source toggle */}
      <div className="sam-field">
        <label className="sam-toggle-row">
          <input
            type="checkbox"
            className="sam-toggle-input"
            checked={formData.is_open_source}
            onChange={(e) => setField('is_open_source', e.target.checked)}
          />
          <span className="sam-toggle-track" aria-hidden="true" />
          <span className="sam-toggle-label">Produk ini open source</span>
        </label>
      </div>

      {/* Twitter handle */}
      <div className="sam-field">
        <div className="sam-label-row">
          <label className="sam-label" htmlFor="s1-twitter">Twitter / X</label>
        </div>
        <div className="sam-input-prefix-wrap">
          <span className="sam-input-prefix" aria-hidden="true">@</span>
          <input
            id="s1-twitter"
            type="text"
            className="sam-input sam-input--prefixed"
            placeholder="username"
            value={formData.twitter_handle}
            onChange={(e) => setField('twitter_handle', e.target.value.replace(/^@/, ''))}
          />
        </div>
      </div>

      {/* Additional links */}
      <div className="sam-field">
        <div className="sam-label-row">
          <span className="sam-label">Links Tambahan</span>
          <span className="sam-field-hint">{formData.links.length}/5</span>
        </div>
        {formData.links.map((link, idx) => (
          <div className="sam-link-row" key={idx}>
            <input
              type="text"
              className="sam-input sam-input--small"
              placeholder="Label"
              value={link.label}
              onChange={(e) => updateLink(idx, 'label', e.target.value)}
              aria-label={'Label link ' + (idx + 1)}
            />
            <input
              type="url"
              className="sam-input"
              placeholder="https://..."
              value={link.url}
              onChange={(e) => updateLink(idx, 'url', e.target.value)}
              aria-label={'URL link ' + (idx + 1)}
            />
            {formData.links.length > 1 && (
              <button
                type="button"
                className="sam-remove-btn"
                onClick={() => removeLink(idx)}
                aria-label={'Hapus link ' + (idx + 1)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {formData.links.length < 5 && (
          <button type="button" className="sam-add-btn" onClick={addLink}>
            + Tambah link
          </button>
        )}
      </div>
    </div>
  )
}
// ---------------------------------------------------------------------------
// Step 2 — Gambar & Media
// ---------------------------------------------------------------------------

function Step2_ImagesMedia({ formData, setField, errors }) {
  const galleryInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function processGalleryFiles(fileList) {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    const remaining = 6 - formData.gallery_files.length
    if (remaining <= 0) return
    const toAdd = incoming.slice(0, remaining)
    const newFiles = [...formData.gallery_files, ...toAdd]
    const newPreviews = [
      ...formData.gallery_previews,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]
    setField('gallery_files', newFiles)
    setField('gallery_previews', newPreviews)
  }

  function removeGalleryItem(idx) {
    URL.revokeObjectURL(formData.gallery_previews[idx])
    setField('gallery_files', formData.gallery_files.filter((_, i) => i !== idx))
    setField('gallery_previews', formData.gallery_previews.filter((_, i) => i !== idx))
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }
  function handleDragLeave() { setDragOver(false) }
  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) processGalleryFiles(e.dataTransfer.files)
  }

  const hasGallery = formData.gallery_files.length > 0

  return (
    <div className="sam-step-content">
      <p className="sam-step-intro">
        Upload logo dan screenshot produkmu. Logo wajib, galeri opsional (maks. 6 gambar).
      </p>

      {/* Logo */}
      <div className="sam-field">
        <div className="sam-label-row">
          <span className="sam-label">
            Logo <span className="sam-required" aria-hidden="true">*</span>
          </span>
          <span className="sam-field-hint">JPG, PNG, WebP — maks. 2 MB</span>
        </div>
        <div className="sam-logo-uploader-wrap">
          <ImageUploader
            aspectRatio="1/1"
            maxSizeMB={2}
            placeholder="Logo"
            required
            value={formData.logo_file}
            preview={formData.logo_preview}
            error={errors.logo_file}
            onChange={(file, preview) => {
              setField('logo_file', file)
              setField('logo_preview', preview)
            }}
            onRemove={() => {
              setField('logo_file', null)
              setField('logo_preview', null)
            }}
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="sam-field">
        <div className="sam-label-row">
          <span className="sam-label">Galeri</span>
          <span className="sam-field-hint">{formData.gallery_files.length}/6 gambar</span>
        </div>

        {!hasGallery ? (
          <div
            className={'sam-gallery-dropzone' + (dragOver ? ' drag-over' : '')}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload gambar galeri"
            onKeyDown={(e) => e.key === 'Enter' && galleryInputRef.current && galleryInputRef.current.click()}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p>Drag & drop atau klik untuk upload screenshot</p>
            <p className="sam-field-hint">Maks. 6 gambar, JPG/PNG/WebP</p>
          </div>
        ) : (
          <div className="sam-gallery-grid">
            {formData.gallery_previews.map((src, idx) => (
              <div className="sam-gallery-thumb" key={idx}>
                <img src={src} alt={'Screenshot ' + (idx + 1)} />
                {idx === 0 && <span className="sam-gallery-badge">1st</span>}
                <button
                  type="button"
                  className="sam-gallery-remove"
                  onClick={() => removeGalleryItem(idx)}
                  aria-label={'Hapus gambar ' + (idx + 1)}
                >
                  &times;
                </button>
              </div>
            ))}
            {formData.gallery_files.length < 6 && (
              <div
                className={'sam-gallery-add-slot' + (dragOver ? ' drag-over' : '')}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
                role="button"
                tabIndex={0}
                aria-label="Tambah gambar galeri"
                onKeyDown={(e) => e.key === 'Enter' && galleryInputRef.current && galleryInputRef.current.click()}
              >
                <span>+</span>
              </div>
            )}
          </div>
        )}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          aria-hidden="true"
          onChange={(e) => {
            if (e.target.files) processGalleryFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
// ---------------------------------------------------------------------------
// Step 3 — Kategori
// ---------------------------------------------------------------------------

function Step3_LaunchTags({ formData, setField, errors }) {
  const [search, setSearch] = useState('')
  const MAX_TAGS = 3

  const filtered = LAUNCH_TAGS.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  function toggleTag(tag) {
    if (formData.launch_tags.includes(tag)) {
      setField('launch_tags', formData.launch_tags.filter((t) => t !== tag))
    } else if (formData.launch_tags.length < MAX_TAGS) {
      setField('launch_tags', [...formData.launch_tags, tag])
    }
  }

  return (
    <div className="sam-step-content">
      <p className="sam-step-intro">
        Pilih kategori yang paling sesuai dengan produkmu. Maksimal 3 kategori.
      </p>

      <div className="sam-label-row">
        <span className="sam-label">Kategori</span>
        <span className="sam-field-hint">{formData.launch_tags.length}/{MAX_TAGS} dipilih</span>
      </div>

      {formData.launch_tags.length > 0 && (
        <div className="sam-tags-selected">
          {formData.launch_tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="sam-tag-chip sam-tag-chip--selected"
              onClick={() => toggleTag(tag)}
              aria-label={'Hapus kategori ' + tag}
            >
              {tag} <span aria-hidden="true">&times;</span>
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        className="sam-input sam-tag-search"
        placeholder="Cari kategori..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Cari kategori"
      />

      <div className="sam-tags-grid" role="list">
        {filtered.map((tag) => {
          const isSelected = formData.launch_tags.includes(tag)
          const isDisabled = !isSelected && formData.launch_tags.length >= MAX_TAGS
          const cls = [
            'sam-tag-chip',
            isSelected ? 'sam-tag-chip--selected' : '',
            isDisabled ? 'sam-tag-chip--disabled' : '',
          ].filter(Boolean).join(' ')
          return (
            <button
              key={tag}
              type="button"
              className={cls}
              onClick={() => toggleTag(tag)}
              disabled={isDisabled}
              role="listitem"
              aria-pressed={isSelected}
            >
              {tag}
            </button>
          )
        })}
      </div>

      <FieldError msg={errors.launch_tags} />
    </div>
  )
}
// ---------------------------------------------------------------------------
// Step 4 — Detail
// ---------------------------------------------------------------------------

function Step4_Extras({ formData, setField, errors }) {
  function addMember() {
    if (formData.team_members.length >= 5) return
    setField('team_members', [...formData.team_members, { name: '', role: '', url: '' }])
  }
  function removeMember(idx) {
    setField('team_members', formData.team_members.filter((_, i) => i !== idx))
  }
  function updateMember(idx, key, value) {
    setField('team_members', formData.team_members.map((m, i) => i === idx ? { ...m, [key]: value } : m))
  }
  function toggleBuiltWith(tech) {
    if (formData.built_with.includes(tech)) {
      setField('built_with', formData.built_with.filter((t) => t !== tech))
    } else {
      setField('built_with', [...formData.built_with, tech])
    }
  }

  return (
    <div className="sam-step-content">
      <p className="sam-step-intro">
        Lengkapi detail tambahan untuk membantu pengguna mengenal produkmu lebih baik.
      </p>

      {/* First comment */}
      <div className="sam-field">
        <div className="sam-label-row">
          <label className="sam-label" htmlFor="s4-comment">Komentar Pertama</label>
          <CharCounter value={formData.first_comment} max={500} />
        </div>
        <p className="sam-field-hint">Ceritakan lebih banyak tentang produkmu, motivasi, atau cara penggunaannya.</p>
        <textarea
          id="s4-comment"
          className="sam-textarea sam-textarea--tall"
          placeholder="Ceritakan lebih banyak..."
          value={formData.first_comment}
          onChange={(e) => setField('first_comment', e.target.value)}
          maxLength={500}
          rows={4}
        />
      </div>

      {/* Built with */}
      <div className="sam-field">
        <div className="sam-label-row">
          <span className="sam-label">Dibuat dengan</span>
        </div>
        <div className="sam-builtwith-grid">
          {BUILT_WITH_OPTIONS.map((tech) => {
            const isSelected = formData.built_with.includes(tech)
            return (
              <button
                key={tech}
                type="button"
                className={'sam-tag-chip' + (isSelected ? ' sam-tag-chip--selected' : '')}
                onClick={() => toggleBuiltWith(tech)}
                aria-pressed={isSelected}
              >
                {tech}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="sam-field">
        <div className="sam-label-row">
          <span className="sam-label">
            Model Harga <span className="sam-required" aria-hidden="true">*</span>
          </span>
        </div>
        <div className="sam-pricing-grid" role="radiogroup" aria-label="Model harga">
          {PRICING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={'sam-pricing-card' + (formData.pricing_type === opt.value ? ' is-selected' : '')}
              onClick={() => setField('pricing_type', opt.value)}
              role="radio"
              aria-checked={formData.pricing_type === opt.value}
            >
              <strong className="sam-pricing-label">{opt.label}</strong>
              <span className="sam-pricing-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
        <FieldError msg={errors.pricing_type} />
      </div>

      {/* Team members */}
      <div className="sam-field">
        <div className="sam-label-row">
          <span className="sam-label">Anggota Tim</span>
          <span className="sam-field-hint">{formData.team_members.length}/5</span>
        </div>
        {formData.team_members.map((member, idx) => (
          <div className="sam-member-row" key={idx}>
            <input
              type="text"
              className="sam-input"
              placeholder="Nama"
              value={member.name}
              onChange={(e) => updateMember(idx, 'name', e.target.value)}
              aria-label={'Nama anggota ' + (idx + 1)}
            />
            <input
              type="text"
              className="sam-input"
              placeholder="Peran"
              value={member.role}
              onChange={(e) => updateMember(idx, 'role', e.target.value)}
              aria-label={'Peran anggota ' + (idx + 1)}
            />
            <input
              type="url"
              className="sam-input"
              placeholder="https://..."
              value={member.url}
              onChange={(e) => updateMember(idx, 'url', e.target.value)}
              aria-label={'URL anggota ' + (idx + 1)}
            />
            {formData.team_members.length > 1 && (
              <button
                type="button"
                className="sam-remove-btn"
                onClick={() => removeMember(idx)}
                aria-label={'Hapus anggota ' + (idx + 1)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {formData.team_members.length < 5 && (
          <button type="button" className="sam-add-btn" onClick={addMember}>
            + Tambah anggota
          </button>
        )}
      </div>
    </div>
  )
}
// ---------------------------------------------------------------------------
// Review Summary (step 5)
// ---------------------------------------------------------------------------

function ReviewSummary({ formData }) {
  const pricing = PRICING_OPTIONS.find((p) => p.value === formData.pricing_type)
  return (
    <div className="sam-step-content sam-review">
      <p className="sam-step-intro">Periksa informasi produkmu sebelum disubmit.</p>

      <div className="sam-review-hero">
        {formData.logo_preview && (
          <img
            className="sam-review-logo"
            src={formData.logo_preview}
            alt={'Logo ' + formData.name}
          />
        )}
        <div className="sam-review-hero-info">
          <h3 className="sam-review-name">{formData.name}</h3>
          <p className="sam-review-tagline">{formData.tagline}</p>
          <a
            className="sam-review-url"
            href={formData.website_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {formData.website_url}
          </a>
        </div>
      </div>

      {formData.description && (
        <div className="sam-review-section">
          <span className="sam-review-section-label">Deskripsi</span>
          <p className="sam-review-text">{formData.description}</p>
        </div>
      )}

      <div className="sam-review-section">
        <span className="sam-review-section-label">Kategori</span>
        <div className="sam-review-chips">
          {formData.launch_tags.map((tag) => (
            <span key={tag} className="sam-tag-chip sam-tag-chip--selected">{tag}</span>
          ))}
        </div>
      </div>

      <div className="sam-review-section">
        <span className="sam-review-section-label">Model Harga</span>
        <span className="sam-review-text">{pricing ? pricing.label : formData.pricing_type}</span>
      </div>

      {formData.twitter_handle && (
        <div className="sam-review-section">
          <span className="sam-review-section-label">Twitter / X</span>
          <span className="sam-review-text">@{formData.twitter_handle}</span>
        </div>
      )}

      {formData.built_with.length > 0 && (
        <div className="sam-review-section">
          <span className="sam-review-section-label">Dibuat dengan</span>
          <div className="sam-review-chips">
            {formData.built_with.map((tech) => (
              <span key={tech} className="sam-tag-chip">{tech}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Success State
// ---------------------------------------------------------------------------

function SuccessState({ slug, onClose }) {
  return (
    <div className="sam-success">
      <div className="sam-success-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="32" fill="#dcfce7" />
          <path
            d="M20 33l9 9 16-16"
            stroke="#16a34a"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="sam-success-title">Produk berhasil disubmit!</h3>
      <p className="sam-success-body">
        Produkmu sedang dalam review. Slug:{' '}
        <span className="sam-success-slug"><code>{slug}</code></span>
      </p>
      <button type="button" className="sam-btn-ghost" onClick={onClose}>
        Tutup
      </button>
    </div>
  )
}
// ---------------------------------------------------------------------------
// Main SubmitAppModal
// ---------------------------------------------------------------------------

export default function SubmitAppModal({ isOpen, onClose }) {
  const { user } = useAuth()
  const { loading, error, progress, submit } = useSubmitApp()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [appSlug, setAppSlug] = useState('')
  const [confirmClose, setConfirmClose] = useState(false)
  const bodyRef = useRef(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setFormData(INITIAL_FORM_DATA)
      setErrors({})
      setSubmitted(false)
      setAppSlug('')
      setConfirmClose(false)
    }
  }, [isOpen])

  // Scroll body to top on step change
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [step])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return
      if (confirmClose) {
        setConfirmClose(false)
        return
      }
      if (hasData()) {
        setConfirmClose(true)
      } else {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, confirmClose, formData, onClose])

  function hasData() {
    return (
      formData.name.trim() !== '' ||
      formData.tagline.trim() !== '' ||
      formData.website_url.trim() !== ''
    )
  }

  function setField(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function handleNext() {
    const stepErrors = validateStep(step, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((s) => s + 1)
  }

  function handleBack() {
    setErrors({})
    setStep((s) => s - 1)
  }

  async function handleSubmit() {
    const stepErrors = validateStep(4, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    try {
      const result = await submit(formData, user?.id)
      setAppSlug(result.slug)
      setSubmitted(true)
    } catch (_err) {
      // error is set internally by useSubmitApp
    }
  }

  function handleBackdropClick(e) {
    if (e.target !== e.currentTarget) return
    if (hasData()) {
      setConfirmClose(true)
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  const modal = (
    <div className="sam-backdrop" onClick={handleBackdropClick} aria-modal="true">
      <div
        className="sam-window"
        role="dialog"
        aria-modal="true"
        aria-label="Submit produk baru"
      >
        {confirmClose && (
          <div className="sam-confirm-close">
            <p>Ada data yang belum disimpan. Yakin mau tutup?</p>
            <div className="sam-confirm-close-actions">
              <button
                type="button"
                className="sam-btn-ghost"
                onClick={() => setConfirmClose(false)}
              >
                Lanjut edit
              </button>
              <button
                type="button"
                className="sam-btn-ghost"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={onClose}
              >
                Tutup tanpa simpan
              </button>
            </div>
          </div>
        )}

        {!submitted ? (
          <>
            <div className="sam-header">
              <div className="sam-header-left">
                <h2 className="sam-title">Submit Produk</h2>
                <p className="sam-subtitle">{STEP_SUBTITLES[step]}</p>
              </div>
              <button
                type="button"
                className="sam-close-btn"
                onClick={() => hasData() ? setConfirmClose(true) : onClose()}
                aria-label="Tutup modal"
              >
                &times;
              </button>
            </div>

            <div className="sam-step-indicator-wrap">
              <StepIndicator step={step} />
            </div>

            {loading && progress > 0 && (
              <div className="sam-progress-bar-wrap">
                <div className="sam-progress-bar" style={{ width: progress + '%' }} />
                <p className="sam-progress-label">Menyimpan... {progress}%</p>
              </div>
            )}

            {error && (
              <div className="sam-global-error">
                &#9888; {error}
              </div>
            )}

            <div className="sam-body" ref={bodyRef}>
              {step === 1 && (
                <Step1_MainInfo
                  formData={formData}
                  setField={setField}
                  errors={errors}
                />
              )}
              {step === 2 && (
                <Step2_ImagesMedia
                  formData={formData}
                  setField={setField}
                  errors={errors}
                />
              )}
              {step === 3 && (
                <Step3_LaunchTags
                  formData={formData}
                  setField={setField}
                  errors={errors}
                />
              )}
              {step === 4 && (
                <Step4_Extras
                  formData={formData}
                  setField={setField}
                  errors={errors}
                />
              )}
              {step === 5 && <ReviewSummary formData={formData} />}
            </div>

            <div className="sam-footer">
              {step > 1 ? (
                <button type="button" className="sam-btn-ghost" onClick={handleBack}>
                  Kembali
                </button>
              ) : (
                <button type="button" className="sam-btn-ghost" onClick={() => hasData() ? setConfirmClose(true) : onClose()}>
                  Batal
                </button>
              )}
              <div className="sam-footer-right">
                {step < TOTAL_STEPS && (
                  <button type="button" className="sam-btn-primary" onClick={handleNext}>
                    Lanjut
                  </button>
                )}
                {step === TOTAL_STEPS && (
                  <button type="button" className="sam-btn-primary" onClick={handleNext}>
                    Review
                  </button>
                )}
                {step === TOTAL_STEPS + 1 && (
                  <button
                    type="button"
                    className="sam-btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Menyimpan…' : 'Submit Produk'}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <SuccessState slug={appSlug} onClose={onClose} />
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
