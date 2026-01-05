import APP_CONFIG from "../config/app.config";
import { formatPrice, formatTime } from "./format";

export type NearbyStationVM = {
  id: number;
  name: string;
  address?: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE" | string;
  reportCount: number;
  currentPriceText: string;
  lastUpdatedText: string;

  // Added for map markers
  lat?: number;
  lng?: number;
};

export type StationHeaderVM = {
  name: string;
  address?: string | null;
  badge: "HIGH" | "MEDIUM" | "LOW" | "NONE" | string;
  currentPriceText: string;
  reportCount: number;
  lastUpdatedText: string;
};

export type RecentReportVM = {
  id: number;
  priceText: string;
  timeText: string;
  deviceId: string;
  photoUrl: string | null;
};

export function toNearbyStations(rawList: any): NearbyStationVM[] {
  const list = Array.isArray(rawList) ? rawList : (rawList && rawList.data) || [];
  return list.slice(0, APP_CONFIG.nearby.maxItems).map((s: any) => ({
    id: s.id,
    name: s.name || "",
    address: typeof s.address === "string" && s.address.trim() ? s.address : null,
    confidence: s.confidence || "NONE",
    reportCount: s.reportCount || 0,
    currentPriceText: formatPrice(s.currentPrice),
    lastUpdatedText: formatTime(s.lastUpdatedAt),

    // Preserve coordinates for map usage
    lat: typeof s.lat === "number" ? s.lat : undefined,
    lng: typeof s.lng === "number" ? s.lng : undefined,
  }));
}

export function toStationHeader(detail: any): StationHeaderVM {
  return {
    name: detail?.name || "",
    address: typeof detail?.address === "string" && detail.address.trim() ? detail.address : null,
    badge: detail?.confidence || "NONE",
    currentPriceText: formatPrice(detail?.currentPrice),
    reportCount: detail?.reportCount || 0,
    lastUpdatedText: formatTime(detail?.lastUpdatedAt),
  };
}

export function toRecentReports(detail: any): RecentReportVM[] {
  const recent = Array.isArray(detail?.recentReports) ? detail.recentReports : [];
  return recent.slice(0, APP_CONFIG.station.recentReportsLimit).map((r: any) => ({
    id: r.id,
    priceText: formatPrice(r.price),
    timeText: formatTime(r.createdAt),
    deviceId: r.deviceId || "",
    photoUrl: r.photoUrl || null,
  }));
}