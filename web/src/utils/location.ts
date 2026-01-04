import APP_CONFIG from "../config/app.config";

export type LocationResult = {
  lat: number;
  lng: number;
  source: "gps" | "picked" | "";
  name?: string;
};

const STORAGE_KEY = "gas_nearby_selected_location_v1";

export async function getPreferredLocation(): Promise<LocationResult> {
  const picked = loadSelectedLocation();
  if (picked) return picked;

  try {
    return await getCurrentLocation();
  } catch {
    // Fallback to app defaults for development convenience
    return {
      lat: APP_CONFIG.api.defaults.lat,
      lng: APP_CONFIG.api.defaults.lng,
      source: "",
    };
  }
}

export function loadSelectedLocation(): LocationResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const obj = JSON.parse(raw);
    if (typeof obj?.lat === "number" && typeof obj?.lng === "number") {
      return obj as LocationResult;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSelectedLocation(loc: LocationResult): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
}

export function clearSelectedLocation(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function getCurrentLocation(): Promise<LocationResult> {
  if (!window.isSecureContext) {
    const err: any = new Error("GEO_INSECURE_CONTEXT");
    err.statusCode = 400;
    throw err;
  }

  if (!navigator.geolocation) {
    const err: any = new Error("GEO_UNSUPPORTED");
    err.statusCode = 400;
    throw err;
  }

  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 30_000,
    });
  });

  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    source: "gps",
  };
}

// use prompt-based coordinate input
export async function chooseLocation(): Promise<LocationResult> {
  const latStr = window.prompt(
    "Enter latitude (e.g. 49.17):",
    String(APP_CONFIG.api.defaults.lat)
  );
  const lngStr = window.prompt(
    "Enter longitude (e.g. -123.13):",
    String(APP_CONFIG.api.defaults.lng)
  );

  const lat = Number(latStr);
  const lng = Number(lngStr);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const err: any = new Error("INVALID_LOCATION");
    err.statusCode = 400;
    throw err;
  }

  return {
    lat,
    lng,
    source: "picked",
    name: "",
  };
}