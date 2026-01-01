import APP_CONFIG from "../config/app.config";

export function formatPrice(v: any) {
  if (v === null || v === undefined) return APP_CONFIG.price.placeholder;
  if (typeof v === "number") return v.toFixed(APP_CONFIG.price.decimals);
  return String(v);
}

export function formatTime(iso?: string | null) {
  if (!iso) return APP_CONFIG.price.placeholder;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return String(iso);

  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export function toErrorMessage(err: any) {
  const status = err && err.statusCode;
  if (status === 404) return "Not found.";
  if (status === 400) return "Bad request.";
  if (status === 429) return "Too many requests.";
  if (status === 500) return "Server error.";
  if (status) return `Request failed (${status}).`;
  return "Network error.";
}