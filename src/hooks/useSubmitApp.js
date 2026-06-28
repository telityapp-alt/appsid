import { useState } from "react";
import { supabase } from "../lib/supabase";
import { uploadAppAsset } from "../lib/uploadAppAsset";

export function useSubmitApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Submit a new app to Apphunt.
   *
   * @param {Object}   formData
   * @param {string}   formData.website_url
   * @param {string}   formData.name
   * @param {string}   formData.tagline
   * @param {string}   formData.description
   * @param {Array<{label: string, url: string}>} formData.links
   * @param {boolean}  formData.is_open_source
   * @param {string}   formData.twitter_handle
   * @param {File|null} formData.logo_file
   * @param {File[]}   formData.gallery_files
   * @param {string[]} formData.launch_tags
   * @param {string}   formData.first_comment
   * @param {string[]} formData.built_with
   * @param {Array<{name: string, role: string, url: string}>} formData.team_members
   * @param {'free'|'paid'|'freemium'|'free_options'} formData.pricing_type
   * @param {string}   userId
   * @returns {Promise<{slug: string}>}
   */
  async function submit(formData, userId) {
    setLoading(true);
    setError(null);
    setProgress(0);

    // Tracks uploaded storage paths so we can clean up on failure.
    const uploadedPaths = [];

    try {
      // --- Demo mode: no Supabase env vars configured ---
      if (!supabase) {
        await new Promise((r) => setTimeout(r, 800));
        setProgress(100);
        return { slug: "demo-app" };
      }

      // --- Auth check ---
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error("Kamu harus login untuk submit app.");
      }

      // --- Slug generation (client-side, with uniqueness suffix) ---
      const base = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 60);
      const suffix = Date.now().toString(36).slice(-4);
      const slug = `${base}-${suffix}`;

      // We need an app ID before uploading assets, so generate a temporary
      // UUID client-side to use as the storage path prefix. The real app row
      // insert will use the DB-generated UUID; we update paths afterwards.
      // Instead, we insert the app row first with placeholder URLs, then
      // update after uploads — matching the spec's progress milestone order.

      setProgress(10); // milestone: before uploads

      // --- Logo upload ---
      let logoUrl = null;
      if (formData.logo_file) {
        // Use userId as a temporary path scope; we'll have appId after insert.
        // Per spec, uploadAppAsset(file, userId, appId, 'logo') — we do a
        // two-phase approach: upload under a temp key, then re-key isn't
        // supported by most Supabase setups. So we insert the app row first
        // (with null logo_url) to get the real appId, then upload.
        // We defer logo + gallery until after the insert below.
      }

      // --- Insert app row to obtain the real UUID ---
      const { data: appRow, error: insertErr } = await supabase
        .from("apps")
        .insert({
          name: formData.name,
          tagline: formData.tagline,
          description: formData.description,
          website_url: formData.website_url || null,
          twitter_handle: formData.twitter_handle || null,
          is_open_source: formData.is_open_source ?? false,
          logo_url: null, // filled after upload
          gallery_urls: [], // filled after upload
          launch_tags: formData.launch_tags ?? [],
          built_with: formData.built_with ?? [],
          pricing_type: formData.pricing_type,
          links: formData.links ?? [],
          status: "pending",
          submitted_by: userId,
          slug,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      const appId = appRow.id;

      // --- Logo upload (now we have appId) ---
      if (formData.logo_file) {
        const { url, path } = await uploadAppAsset(
          formData.logo_file,
          userId,
          appId,
          "logo",
        );
        uploadedPaths.push(path);
        logoUrl = url;
      }

      setProgress(30); // milestone: after logo upload

      // --- Gallery uploads ---
      const galleryUrls = [];
      for (let i = 0; i < (formData.gallery_files ?? []).length; i++) {
        const { url, path } = await uploadAppAsset(
          formData.gallery_files[i],
          userId,
          appId,
          "gallery",
          i,
        );
        uploadedPaths.push(path);
        galleryUrls.push(url);
      }

      setProgress(60); // milestone: after gallery uploads

      // --- Patch app row with final asset URLs ---
      const { error: patchErr } = await supabase
        .from("apps")
        .update({ logo_url: logoUrl, gallery_urls: galleryUrls })
        .eq("id", appId);

      if (patchErr) throw patchErr;

      setProgress(80); // milestone: after app row insert/update

      // --- Insert app_makers ---
      const validMembers = (formData.team_members ?? []).filter((m) =>
        m.name?.trim(),
      );
      if (validMembers.length > 0) {
        const makers = validMembers.map((m, index) => ({
          app_id: appId,
          user_id: index === 0 ? userId : null,
          name: m.name.trim(),
          role: m.role || null,
          url: m.url || null,
          sort_order: index,
        }));

        const { error: makersErr } = await supabase
          .from("app_makers")
          .insert(makers);

        if (makersErr) throw makersErr;
      }

      // --- Insert first comment (pinned) if provided ---
      const commentBody = formData.first_comment?.trim();
      if (commentBody) {
        const { error: commentErr } = await supabase
          .from("app_comments")
          .insert({
            app_id: appId,
            user_id: userId,
            body: commentBody,
            is_pinned: true,
          });

        if (commentErr) throw commentErr;
      }

      setProgress(95); // milestone: after makers/comment insert

      setProgress(100);
      return { slug };
    } catch (err) {
      // Clean up any assets that were successfully uploaded before the failure.
      if (supabase && uploadedPaths.length > 0) {
        await supabase.storage.from("app-assets").remove(uploadedPaths);
      }

      const msg = err?.message ?? "Gagal submit app";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, progress, submit };
}
