// Client Supabase condiviso da index.html e management/index.html.
// Richiede window.supabase (vendored in assets/vendor/supabase.min.js) caricato prima di questo modulo.

const SUPABASE_URL = "https://tnxkxgaczwkkkrdiusdz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zWkm_KntqYVSMOHoS73KHA_n7_283Vm";

// Diventa true solo dopo aver sostituito le due costanti sopra con i valori reali del progetto Supabase.
export const isConfigured = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR-ANON-KEY");

export const supabase = isConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function fmtDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const parts = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short" }).formatToParts(d);
  const day = parts.find(p => p.type === "day").value;
  const month = parts.find(p => p.type === "month").value.replace(".", "");
  return { day, month };
}

export function fmtTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

// Restituisce la galleria foto di un evento come array normalizzato [{ url, path }].
// Gestisce sia il nuovo campo `photos` sia i vecchi eventi con solo `photo_url`.
export function getPhotos(ev) {
  if (!ev) return [];
  if (Array.isArray(ev.photos) && ev.photos.length) {
    return ev.photos.filter(function (p) { return p && p.url; });
  }
  if (ev.photo_url) {
    return [{ url: ev.photo_url, path: ev.photo_path || null }];
  }
  return [];
}

export function todayISO() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
