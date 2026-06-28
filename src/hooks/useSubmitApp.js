import { useState } from "react";
import { supabase } from "../lib/supabase";
import { uploadAppAsset } from "../lib/uploadAppAsset";

export function useSubmitApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Submit a new app.
   * @param {Object} formData
   * @param {string}   formData.name          - App name (2–60 chars)
   * @param {string}   formData.tagline        - Tagline (10–120 chars)
   * @param {string}   formData.category       - Primary launch tag
   * @param {string}   [formData.website]      - Website URL (optional)
   * @param {File}     [formData.heroImage]    - Logo/hero image File
   * @param {File[]}   [formData.galleryFiles] - Gallery images (max 4)
   * @param {string[]} [formData.tags]         - Additional tags (max 5)
   * @param {string}   formData.overview       - Description (100–1000 chars)
   * @param {string}   [formData.different]    - First comment body
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function submitApp(formData) {
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        // No backend — simulate success in demo mode
        await new Promise((r) => setTimeout(r, 800));
        return { success: true };
      }

      // Must be authenticated to submit
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error("Kamu harus login untuk submit app.");
      }
      const userId = authData.user.id;

      // Generate slug client-side as a preview; DB trigger will resolve collisions
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 60);

      // 1. Insert app row first to get the UUID for asset paths
      //    status = 'pending', requires admin approval before going 'live'
      const allTags = [formData.category, ...(formData.tags ?? [])]
        .filter(Boolean)
        .slice(0, 3); // launch_tags max 3

      const { data: appRow, error: insertErr } = await supabase
        .from("apps")
        .insert({
          slug,
          name: formData.name,
          tagline: formData.tagline,
          description: formData.overview,
          website_url: formData.website || null,
          launch_tags: allTags,
          status: "pending",
          created_by: userId,
          first_comment: formData.different || null,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      const appId = appRow.id;

      // 2. Upload logo/hero image
      let logoUrl = null;
      if (formData.heroImage) {
        logoUrl = await uploadAppAsset(
          formData.heroImage,
          userId,
          appId,
          "logo",
        );
        await supabase
          .from("apps")
          .update({ logo_url: logoUrl })
          .eq("id", appId);
      }

      // 3. Upload gallery images
      const galleryUrls = [];
      for (let i = 0; i < (formData.galleryFiles ?? []).length; i++) {
        const url = await uploadAppAsset(
          formData.galleryFiles[i],
          userId,
          appId,
          "gallery",
          i,
        );
        galleryUrls.push(url);
      }
      if (galleryUrls.length > 0) {
        await supabase
          .from("apps")
          .update({ gallery_images: galleryUrls })
          .eq("id", appId);
      }

      // 4. Insert submitter as first maker
      await supabase.from("app_makers").insert({
        app_id: appId,
        user_id: userId,
        name:
          authData.user.user_metadata?.full_name ??
          authData.user.email ??
          "Maker",
        role: "Maker",
        order_index: 0,
      });

      return { success: true };
    } catch (err) {
      const msg = err.message ?? "Gagal submit app";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  return { submitApp, loading, error };
}
