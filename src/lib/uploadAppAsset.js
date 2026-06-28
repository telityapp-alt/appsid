/**
 * uploadAppAsset.js
 * Client-side upload helper for app logos and gallery images.
 * Validates type + size before calling storage.upload().
 * Path convention: {auth.uid()}/{appId}/{logo|gallery-N}.{ext}
 */

import { supabase } from "./supabase";

const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB (server enforces 5 MB hard limit)
const GALLERY_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET = "app-assets";

/**
 * Upload a logo or gallery image to the app-assets bucket.
 *
 * @param {File}   file          - File object from <input type="file"> or drag-drop
 * @param {string} userId        - auth.uid() of the current user
 * @param {string} appId         - UUID of the app being submitted/edited
 * @param {"logo"|"gallery"}type - Determines size limit and filename
 * @param {number} [galleryIndex=0] - 0-based index for gallery images
 * @returns {Promise<string>}    - Public URL of the uploaded file
 * @throws {Error}               - Descriptive error if validation or upload fails
 */
export async function uploadAppAsset(
  file,
  userId,
  appId,
  type,
  galleryIndex = 0,
) {
  if (!supabase) {
    throw new Error(
      "Supabase client tidak tersedia. Pastikan environment variables sudah di-set.",
    );
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Tipe file tidak didukung: ${file.type}. Gunakan JPEG, PNG, WebP, atau GIF.`,
    );
  }

  // Validate size
  const maxBytes = type === "logo" ? LOGO_MAX_BYTES : GALLERY_MAX_BYTES;
  const limitMB = maxBytes / (1024 * 1024);
  if (file.size > maxBytes) {
    throw new Error(
      `File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal ${limitMB} MB untuk ${type}.`,
    );
  }

  // Build storage path
  const ext = file.name.split(".").pop().toLowerCase() || "jpg";
  const filename =
    type === "logo" ? `logo.${ext}` : `gallery-${galleryIndex}.${ext}`;
  const path = `${userId}/${appId}/${filename}`;

  // Upload (upsert: replace if already exists)
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Upload gagal: ${uploadError.message}`);
  }

  // Return public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a specific file from the app-assets bucket.
 * Used when a user removes an image before saving.
 *
 * @param {string} path - Storage path relative to bucket root
 *                        e.g. "{userId}/{appId}/logo.png"
 */
export async function deleteAppAsset(path) {
  if (!supabase) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

/**
 * Delete all assets for a given app (full folder wipe).
 * Used when an app is deleted by its owner or an admin.
 *
 * @param {string} userId - auth.uid() of the app owner
 * @param {string} appId  - UUID of the app
 */
export async function deleteAllAppAssets(userId, appId) {
  if (!supabase) return;

  const prefix = `${userId}/${appId}/`;
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(`${userId}/${appId}`);

  if (error || !files?.length) return;

  const paths = files.map((f) => `${prefix}${f.name}`);
  await supabase.storage.from(BUCKET).remove(paths);
}
