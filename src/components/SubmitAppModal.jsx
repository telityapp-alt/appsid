import React, { useState, useRef, useCallback, useEffect } from "react";
import "./SubmitAppModal.css";
import ImageUploader from "./ImageUploader";
import { useSubmitApp } from "../hooks/useSubmitApp";

const CATEGORIES = [
  "EdTech Product",
  "Analytics",
  "Developer Tools",
  "Productivity",
  "SaaS",
  "Other",
];

const STEPS = ["Basic Info", "Media", "Story"];

const EMPTY_FORM = {
  name: "",
  tagline: "",
  category: "",
  website: "",
  heroImage: null,
  heroPreview: null,
  galleryFiles: [],
  galleryPreviews: [],
  tags: [],
  tagInput: "",
  overview: "",
  different: "",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function validateStep(step, form) {
  const errors = {};

  if (step === 0) {
    if (!form.name.trim()) errors.name = "Nama app wajib diisi.";
    else if (form.name.trim().length > 60) errors.name = "Maks. 60 karakter.";

    if (!form.tagline.trim()) errors.tagline = "Tagline wajib diisi.";
    else if (form.tagline.trim().length > 120)
      errors.tagline = "Maks. 120 karakter.";

    if (!form.category) errors.category = "Pilih kategori.";

    if (
      form.website &&
      !/^https?:\/\/.+\..+/.test(form.website.trim())
    ) {
      errors.website = "URL tidak valid. Contoh: https://yourapp.com";
    }
  }

  if (step === 1) {
    if (!form.heroImage) errors.heroImage = "Hero image wajib diupload.";
  }

  if (step === 2) {
    if (!form.overview.trim())
      errors.overview = "Overview wajib diisi.";
    else if (form.overview.trim().length < 100)
      errors.overview = `Minimal 100 karakter. Sekarang: ${form.overview.trim().length}.`;
    else if (form.overview.trim().length > 1000)
      errors.overview = "Maks. 1000 karakter.";
  }

  return errors;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="submit-steps" role="list" aria-label="Langkah pengisian">
      {STEPS.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div
            key={label}
            className={[
              "submit-step",
              isActive ? "active" : "",
              isDone ? "done" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
          >
            <div
              className={[
                "submit-step-dot",
                isActive ? "active" : "",
                isDone ? "done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            >
              {!isDone && <span>{i + 1}</span>}
            </div>
            <span className="submit-step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <span className="submit-error" role="alert">
      {message}
    </span>
  );
}

function CharCount({ value, max }) {
  const len = value.length;
  const nearLimit = len >= max * 0.85;
  const atLimit = len >= max;
  return (
    <span
      className={[
        "submit-char-count",
        atLimit ? "at-limit" : nearLimit ? "near-limit" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      {len}/{max}
    </span>
  );
}

// ─── Step 1 — Basic Info ─────────────────────────────────────────────────────

function StepBasicInfo({ form, errors, onChange }) {
  return (
    <>
      {/* App Name */}
      <div className="submit-field">
        <div className="submit-label-row">
          <label className="submit-label" htmlFor="app-name">
            Nama App <span className="required" aria-hidden="true">*</span>
          </label>
          <CharCount value={form.name} max={60} />
        </div>
        <input
          id="app-name"
          type="text"
          className={["submit-input", errors.name ? "has-error" : ""]
            .filter(Boolean)
            .join(" ")}
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Contoh: Preppy"
          maxLength={60}
          autoComplete="off"
          aria-required="true"
          aria-describedby={errors.name ? "err-name" : undefined}
        />
        <FieldError message={errors.name} />
      </div>

      {/* Tagline */}
      <div className="submit-field">
        <div className="submit-label-row">
          <label className="submit-label" htmlFor="app-tagline">
            Tagline <span className="required" aria-hidden="true">*</span>
          </label>
          <CharCount value={form.tagline} max={120} />
        </div>
        <input
          id="app-tagline"
          type="text"
          className={["submit-input", errors.tagline ? "has-error" : ""]
            .filter(Boolean)
            .join(" ")}
          value={form.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
          placeholder="Satu kalimat yang menjelaskan value app-mu"
          maxLength={120}
          autoComplete="off"
          aria-required="true"
        />
        <FieldError message={errors.tagline} />
      </div>

      {/* Category */}
      <div className="submit-field">
        <label className="submit-label" htmlFor="app-category">
          Kategori <span className="required" aria-hidden="true">*</span>
        </label>
        <select
          id="app-category"
          className={["submit-select", errors.category ? "has-error" : ""]
            .filter(Boolean)
            .join(" ")}
          value={form.category}
          onChange={(e) => onChange("category", e.target.value)}
          aria-required="true"
        >
          <option value="">Pilih kategori…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <FieldError message={errors.category} />
      </div>

      {/* Website */}
      <div className="submit-field">
        <label className="submit-label" htmlFor="app-website">
          Website URL{" "}
          <span
            style={{ fontWeight: 500, color: "var(--submit-text-faint)", fontSize: 12 }}
          >
            (opsional)
          </span>
        </label>
        <input
          id="app-website"
          type="url"
          className={["submit-input", errors.website ? "has-error" : ""]
            .filter(Boolean)
            .join(" ")}
          value={form.website}
          onChange={(e) => onChange("website", e.target.value)}
          placeholder="https://yourapp.com"
          autoComplete="off"
        />
        <FieldError message={errors.website} />
      </div>
    </>
  );
}

// ─── Step 2 — Media ───────────────────────────────────────────────────────────

function StepMedia({ form, errors, onChange }) {
  const galleryInputRef = useRef(null);

  const handleHeroChange = useCallback(
    (file, preview) => {
      onChange("heroImage", file);
      onChange("heroPreview", preview);
    },
    [onChange]
  );

  const handleHeroRemove = useCallback(() => {
    onChange("heroImage", null);
    onChange("heroPreview", null);
  }, [onChange]);

  const handleGalleryAdd = useCallback(
    (e) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      const remaining = 4 - form.galleryFiles.length;
      const toProcess = files.slice(0, remaining);

      toProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          onChange("galleryFiles", (prev) => [...prev, file]);
          onChange("galleryPreviews", (prev) => [...prev, ev.target.result]);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = "";
    },
    [form.galleryFiles.length, onChange]
  );

  const handleGalleryRemove = useCallback(
    (index) => {
      onChange("galleryFiles", (prev) => prev.filter((_, i) => i !== index));
      onChange("galleryPreviews", (prev) => prev.filter((_, i) => i !== index));
    },
    [onChange]
  );

  const handleTagKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const tag = form.tagInput.trim();
        if (tag && form.tags.length < 5 && !form.tags.includes(tag)) {
          onChange("tags", [...form.tags, tag]);
        }
        onChange("tagInput", "");
      } else if (
        e.key === "Backspace" &&
        form.tagInput === "" &&
        form.tags.length > 0
      ) {
        onChange("tags", form.tags.slice(0, -1));
      }
    },
    [form.tagInput, form.tags, onChange]
  );

  const removeTag = useCallback(
    (tag) => {
      onChange("tags", form.tags.filter((t) => t !== tag));
    },
    [form.tags, onChange]
  );

  const canAddGallery = form.galleryFiles.length < 4;

  return (
    <>
      {/* Hero image */}
      <ImageUploader
        label="Hero Image"
        required
        value={form.heroImage}
        preview={form.heroPreview}
        onChange={handleHeroChange}
        onRemove={handleHeroRemove}
        maxSizeMB={5}
        hint="JPG, PNG, atau WebP — maks. 5MB. Rasio 16:9 direkomendasikan."
        error={errors.heroImage}
      />

      {/* Gallery */}
      <div className="submit-field">
        <label className="submit-label">
          Gallery Images{" "}
          <span
            style={{ fontWeight: 500, color: "var(--submit-text-faint)", fontSize: 12 }}
          >
            (opsional, maks. 4)
          </span>
        </label>

        {form.galleryPreviews.length > 0 ? (
          <div className="image-preview-grid">
            {form.galleryPreviews.map((src, i) => (
              <div key={i} className="image-preview-item">
                <img
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  className="image-preview-img"
                />
                <button
                  type="button"
                  className="image-preview-remove"
                  onClick={() => handleGalleryRemove(i)}
                  aria-label={`Hapus gallery ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
            {canAddGallery && (
              <div className="image-preview-add">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Tambah</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleGalleryAdd}
                  aria-label="Tambah gallery image"
                  tabIndex={0}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className="image-uploader"
            style={{ padding: "20px" }}
            onClick={() => galleryInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                galleryInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload gallery images"
          >
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="image-uploader-input"
              onChange={handleGalleryAdd}
              aria-hidden="true"
              tabIndex={-1}
            />
            <p className="image-uploader-text" style={{ margin: 0 }}>
              <span>Pilih gambar</span> untuk gallery
            </p>
            <p className="image-uploader-hint" style={{ marginTop: 4 }}>
              Maks. 4 gambar — JPG, PNG, atau WebP
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="submit-field">
        <label className="submit-label" htmlFor="tag-input">
          Tags{" "}
          <span
            style={{ fontWeight: 500, color: "var(--submit-text-faint)", fontSize: 12 }}
          >
            (opsional, maks. 5)
          </span>
        </label>
        <div
          className="tags-input-wrap"
          onClick={() => document.getElementById("tag-input")?.focus()}
          role="group"
          aria-label="Tags input"
        >
          {form.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
              <button
                type="button"
                className="tag-chip-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Hapus tag ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
          {form.tags.length < 5 && (
            <input
              id="tag-input"
              type="text"
              className="tags-input-field"
              value={form.tagInput}
              onChange={(e) => onChange("tagInput", e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={form.tags.length === 0 ? "Ketik lalu tekan Enter…" : ""}
              aria-label="Tambah tag"
            />
          )}
        </div>
        <span className="submit-hint">
          Tekan Enter untuk menambah tag. Backspace menghapus tag terakhir.
        </span>
      </div>
    </>
  );
}

// ─── Step 3 — Story ───────────────────────────────────────────────────────────

function StepStory({ form, errors, onChange }) {
  return (
    <>
      {/* Overview */}
      <div className="submit-field">
        <div className="submit-label-row">
          <label className="submit-label" htmlFor="app-overview">
            Overview <span className="required" aria-hidden="true">*</span>
          </label>
          <CharCount value={form.overview} max={1000} />
        </div>
        <textarea
          id="app-overview"
          className={["submit-textarea", errors.overview ? "has-error" : ""]
            .filter(Boolean)
            .join(" ")}
          value={form.overview}
          onChange={(e) => onChange("overview", e.target.value)}
          placeholder="Jelaskan apa yang dilakukan app-mu, siapa target penggunanya, dan masalah apa yang dipecahkan. Minimal 100 karakter."
          maxLength={1000}
          rows={5}
          aria-required="true"
        />
        <FieldError message={errors.overview} />
      </div>

      {/* What makes it different */}
      <div className="submit-field">
        <label className="submit-label" htmlFor="app-different">
          Apa yang membuat app-mu berbeda?{" "}
          <span
            style={{ fontWeight: 500, color: "var(--submit-text-faint)", fontSize: 12 }}
          >
            (opsional)
          </span>
        </label>
        <textarea
          id="app-different"
          className="submit-textarea"
          value={form.different}
          onChange={(e) => onChange("different", e.target.value)}
          placeholder="Ceritakan keunggulan kompetitif, fitur unik, atau pendekatan yang berbeda dari solusi yang sudah ada."
          rows={4}
        />
      </div>
    </>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ onClose }) {
  return (
    <div className="submit-success">
      <div className="submit-success-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="submit-success-title">App berhasil disubmit!</h2>
      <p className="submit-success-desc">
        Kami akan review dalam 1–2 hari kerja. Kamu akan dihubungi via email
        jika ada update.
      </p>
      <button
        type="button"
        className="submit-btn-primary"
        style={{ marginTop: 28 }}
        onClick={onClose}
      >
        Tutup
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SubmitAppModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { submitApp } = useSubmitApp();

  // Reset everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setSubmitted(false);
      setSubmitting(false);
      setErrors({});
      setGlobalError(null);
      setForm(EMPTY_FORM);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Stable field updater — supports both direct value and updater function
  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: typeof value === "function" ? value(prev[field]) : value,
    }));
    // Clear the field error on change
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  function handleNext() {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setGlobalError(null);
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    const stepErrors = validateStep(2, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setGlobalError(null);
    setSubmitting(true);

    const result = await submitApp({
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      category: form.category,
      website: form.website.trim(),
      heroImage: form.heroImage,
      galleryFiles: form.galleryFiles,
      tags: form.tags,
      overview: form.overview.trim(),
      different: form.different.trim(),
    });

    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setGlobalError(result.error ?? "Terjadi kesalahan. Coba lagi.");
    }
  }

  if (!isOpen) return null;

  const isLastStep = step === STEPS.length - 1;

  return (
    <div
      className="submit-backdrop"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="submit-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Submit App"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="submit-modal-header">
          <h2 className="submit-modal-title">
            {submitted ? "Selesai" : "Submit App"}
          </h2>
          <button
            type="button"
            className="submit-modal-close"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </header>

        {submitted ? (
          <SuccessScreen onClose={onClose} />
        ) : (
          <>
            {/* Step indicator */}
            <StepIndicator current={step} />

            {/* Body */}
            <div className="submit-modal-body" id="submit-modal-body">
              {globalError && (
                <div className="submit-global-error" role="alert">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {globalError}
                </div>
              )}

              {step === 0 && (
                <StepBasicInfo
                  form={form}
                  errors={errors}
                  onChange={handleChange}
                />
              )}
              {step === 1 && (
                <StepMedia
                  form={form}
                  errors={errors}
                  onChange={handleChange}
                />
              )}
              {step === 2 && (
                <StepStory
                  form={form}
                  errors={errors}
                  onChange={handleChange}
                />
              )}
            </div>

            {/* Footer */}
            <footer className="submit-modal-footer">
              {step > 0 ? (
                <button
                  type="button"
                  className="submit-btn-ghost"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  ← Kembali
                </button>
              ) : (
                <div />
              )}

              {isLastStep ? (
                <button
                  type="button"
                  className={[
                    "submit-btn-primary",
                    submitting ? "loading" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={handleSubmit}
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="btn-spinner" aria-hidden="true" />
                      Mengirim…
                    </>
                  ) : (
                    "Submit App →"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="submit-btn-primary"
                  onClick={handleNext}
                >
                  Lanjut →
                </button>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
