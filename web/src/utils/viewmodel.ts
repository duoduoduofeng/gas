import APP_CONFIG from "../config/app.config";
import { formatPrice, formatTime } from "./format";

export type NearbyStationVM = {
  id: number;
  name: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE" | string;
  reportCount: number;
  currentPriceText: string;
  lastUpdatedText: string;
};

export type StationHeaderVM = {
  name: string;
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
    confidence: s.confidence || "NONE",
    reportCount: s.reportCount || 0,
    currentPriceText: formatPrice(s.currentPrice),
    lastUpdatedText: formatTime(s.lastUpdatedAt),
  }));
}

export function toStationHeader(detail: any): StationHeaderVM {
  return {
    name: detail?.name || "",
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