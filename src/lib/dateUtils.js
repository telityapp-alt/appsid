/**
 * Date utilities for WIB (UTC+7) aware date operations.
 * Used for "Launching Today" badge and "Hari ini" filter.
 */

/**
 * Returns today's date string in "YYYY-MM-DD" format, using WIB (UTC+7).
 */
export function getTodayWIB() {
  const now = new Date();
  // Shift to WIB by adding 7 hours to UTC
  const wibOffset = 7 * 60 * 60 * 1000;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const wibMs = utcMs + wibOffset;
  const wibDate = new Date(wibMs);

  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, "0");
  const day = String(wibDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns true if the given launch_date string is today in WIB.
 * Accepts "YYYY-MM-DD" or any date string parseable by Date().
 */
export function isLaunchingToday(launch_date) {
  if (!launch_date) return false;
  const todayWIB = getTodayWIB();
  // Normalize: take only the date portion if it contains time
  const launchDay = String(launch_date).slice(0, 10);
  return launchDay === todayWIB;
}

/**
 * Formats a "YYYY-MM-DD" string into Indonesian long date format.
 * e.g. "2026-06-28" → "28 Juni 2026"
 */
export function formatDateID(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = String(dateStr).slice(0, 10).split("-");
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember",
  ];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

/**
 * Returns { start, end } ISO strings for the full WIB day (as UTC range).
 * Useful for Supabase range queries on created_at / launch_date.
 */
export function getTodayWIBRange() {
  const today = getTodayWIB(); // "YYYY-MM-DD"
  // WIB start of day = UTC previous day at 17:00
  const start = `${today}T00:00:00+07:00`;
  const end = `${today}T23:59:59+07:00`;
  return { start, end };
}
