import React, { useRef, useState } from "react";

export default function ImageUploader({
  label,
  value,
  preview,
  onChange,
  onRemove,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  hint = null,
  required = false,
  error = null,
  aspectRatio = null,
  placeholder = null,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState(null);

  const displayError = error || localError;

  function processFile(file) {
    if (!file) return;

    const acceptedTypes = accept.split(",").map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setLocalError(
        `Format tidak didukung. Gunakan ${acceptedTypes
          .map((t) => t.replace("image/", "").toUpperCase())
          .join(", ")}.`,
      );
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(
        `Ukuran file melebihi ${maxSizeMB}MB. File ini ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      );
      return;
    }

    setLocalError(null);
    const reader = new FileReader();
    reader.onload = (e) => onChange(file, e.target.result);
    reader.onerror = () => setLocalError("Gagal membaca file. Coba lagi.");
    reader.readAsDataURL(file);
  }

  function handleRemove(e) {
    e.stopPropagation();
    setLocalError(null);
    onRemove();
  }

  const zoneClass = [
    "image-uploader-zone",
    dragOver ? "drag-over" : "",
    displayError ? "has-error" : "",
    value ? "is-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const zoneStyle = aspectRatio ? { aspectRatio } : undefined;

  return (
    <div className="image-uploader-root">
      {label && (
        <label className="submit-label">
          {label}
          {required && (
            <span className="required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={zoneClass}
        style={zoneStyle}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFile(e.dataTransfer.files[0]);
        }}
        role="button"
        tabIndex={0}
        aria-label={label ? `Upload ${label}` : "Upload gambar"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            processFile(e.target.files[0]);
            e.target.value = "";
          }}
        />

        {preview ? (
          <div className="image-uploader-preview">
            <img src={preview} alt={value?.name ?? "Preview"} />
            <button
              type="button"
              className="image-uploader-remove"
              onClick={handleRemove}
              aria-label="Hapus gambar"
              title="Hapus gambar"
            >
              &times;
            </button>
          </div>
        ) : (
          <div className="image-uploader-empty">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{placeholder ?? "Drag & drop atau klik"}</span>
            {hint && <p className="image-uploader-hint">{hint}</p>}
          </div>
        )}
      </div>

      {displayError && (
        <span className="image-uploader-error" role="alert">
          {displayError}
        </span>
      )}
    </div>
  );
}
