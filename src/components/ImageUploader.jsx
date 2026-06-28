import React, { useRef, useState, useCallback } from "react";

/**
 * Reusable drag-and-drop image uploader.
 *
 * Props:
 *   label      — field label string
 *   value      — current File object (or null)
 *   preview    — data URL string for the current image (or null)
 *   onChange   — (file: File, preview: string) => void
 *   onRemove   — () => void
 *   accept     — MIME types string (default "image/jpeg,image/png,image/webp")
 *   maxSizeMB  — max file size in MB (default 5)
 *   hint       — optional helper text shown below the drop zone
 *   required   — marks the label with a red asterisk
 *   error      — validation error string (from parent)
 */
export default function ImageUploader({
  label,
  value,
  preview,
  onChange,
  onRemove,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  hint,
  required = false,
  error,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);

  const displayError = error || localError;

  function validateFile(file) {
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return `Format tidak didukung. Gunakan ${acceptedTypes
        .map((t) => t.replace("image/", "").toUpperCase())
        .join(", ")}.`;
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Ukuran file melebihi ${maxSizeMB}MB. File ini ${(
        file.size /
        1024 /
        1024
      ).toFixed(1)}MB.`;
    }
    return null;
  }

  function processFile(file) {
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLoading(false);
      onChange(file, e.target.result);
    };
    reader.onerror = () => {
      setLoading(false);
      setLocalError("Gagal membaca file. Coba lagi.");
    };
    reader.readAsDataURL(file);
  }

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so same file can be re-selected after remove
    e.target.value = "";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      setLocalError(null);
      onRemove();
    },
    [onRemove]
  );

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="submit-field">
      {label && (
        <label className="submit-label">
          {label}
          {required && <span className="required" aria-hidden="true">*</span>}
        </label>
      )}

      {loading ? (
        <div className="image-uploader-loading">
          <span className="image-uploader-spinner" aria-hidden="true" />
          Memproses gambar…
        </div>
      ) : preview ? (
        /* ── Preview state ── */
        <div className="image-uploader-preview">
          <img src={preview} alt={value?.name ?? "Preview"} />
          <div className="image-uploader-preview-actions">
            <button
              type="button"
              className="image-uploader-remove"
              onClick={handleRemove}
              aria-label="Hapus gambar"
              title="Hapus gambar"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop-zone state ── */
        <div
          className={[
            "image-uploader",
            dragOver ? "drag-over" : "",
            displayError ? "has-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={openPicker}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label={label ? `Upload ${label}` : "Upload gambar"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="image-uploader-input"
            onChange={handleInputChange}
            tabIndex={-1}
            aria-hidden="true"
          />

          <div className="image-uploader-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>

          <p className="image-uploader-text">
            Drag & drop atau{" "}
            <span>pilih file</span>
          </p>

          <p className="image-uploader-hint">
            {hint ??
              `${accept
                .split(",")
                .map((t) => t.replace("image/", "").toUpperCase())
                .join(", ")} — maks. ${maxSizeMB}MB`}
          </p>
        </div>
      )}

      {displayError && (
        <span className="submit-error" role="alert">
          {displayError}
        </span>
      )}
    </div>
  );
}
