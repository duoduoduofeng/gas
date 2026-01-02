import APP_CONFIG from "../config/app.config";

type RequestArgs = {
  path: string;
  method?: "GET" | "POST";
  data?: Record<string, any>;
};

function buildQuery(data?: Record<string, any>) {
  if (!data) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function request<T>({ path, method = "GET", data }: RequestArgs): Promise<T> {
  // console.log("in request, API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
  // console.log("in request, log_level = ", import.meta.env.VITE_LOG_LEVEL);
  // console.log("MODE =", import.meta.env.MODE);
  
  const baseUrl = APP_CONFIG.api.baseUrl;
  // console.log("in request, baseUrl =", baseUrl);
  const url = method === "GET"
    ? `${baseUrl}${path}${buildQuery(data)}`
    : `${baseUrl}${path}`;
  // console.log("in request, url =", url);

  const res = await fetch(url, {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
    body: method === "POST" ? JSON.stringify(data ?? {}) : undefined,
  });

  if (res.ok) {
    return (await res.json()) as T;
  }

  const err: any = new Error(`HTTP_${res.status}`);
  err.statusCode = res.status;
  try {
    err.payload = await res.json();
  } catch {
    err.payload = null;
  }
  throw err;
}

export function getStations(args: { lat: number; lng: number; radius: number }) {
  return request<any[]>({
    path: "/stations",
    method: "GET",
    data: { lat: args.lat, lng: args.lng, radius: args.radius },
  });
}

export function getStationDetail(id: string | number) {
  return request<any>({
    path: `/stations/${encodeURIComponent(String(id))}`,
    method: "GET",
  });
}

export function postReport(args: { stationId: number; price: number; deviceId: string; photoUrl?: string }) {
  return request<any>({
    path: "/reports",
    method: "POST",
    data: args,
  });
}