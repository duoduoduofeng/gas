import APP_CONFIG from "../config/app.config";

export function parsePrice(priceText: string) {
  const n = Number(priceText);
  if (!Number.isFinite(n)) return { ok: false as const, value: null, error: "Invalid price." };
  return { ok: true as const, value: n, error: "" };
}

export function validateReport(args: { stationId: number | null; price: number }) {
  const { stationId, price } = args;

  if (!stationId || !Number.isFinite(stationId)) {
    return { ok: false as const, error: "Missing stationId." };
  }

  if (!Number.isFinite(price)) {
    return { ok: false as const, error: "Invalid price." };
  }

  if (price < APP_CONFIG.report.minPrice || price > APP_CONFIG.report.maxPrice) {
    return { ok: false as const, error: "Price out of range." };
  }

  return { ok: true as const, error: "" };
}