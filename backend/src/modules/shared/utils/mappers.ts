import { StationListItemDto } from '../../stations/dto/station-list-item.dto';
import { StationDetailDto } from '../../stations/dto/station-detail.dto';
import { ReportDto } from '../../reports/dto/report.dto';

export function toReportDto(r: {
  id: number;
  stationId: number;
  price: number;
  deviceId: string;
  photoUrl: string | null;
  createdAt: Date;
}): ReportDto {
  return {
    id: r.id,
    stationId: r.stationId,
    price: r.price,
    deviceId: r.deviceId,
    photoUrl: r.photoUrl ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export function toStationListItemDto(input: {
  id: number;
  name: string;
  lat: number;
  lng: number;
  currentPrice: number | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reportCount: number;
  lastUpdatedAt: Date | null;
}): StationListItemDto {
  return {
    id: input.id,
    name: input.name,
    lat: input.lat,
    lng: input.lng,
    currentPrice: input.currentPrice,
    confidence: input.confidence,
    reportCount: input.reportCount,
    lastUpdatedAt: input.lastUpdatedAt ? input.lastUpdatedAt.toISOString() : null,
  };
}

export function toStationDetailDto(input: {
  id: number;
  name: string;
  lat: number;
  lng: number;
  currentPrice: number | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reportCount: number;
  lastUpdatedAt: Date | null;
  recentReports: Array<{
    id: number;
    stationId: number;
    price: number;
    deviceId: string;
    photoUrl: string | null;
    createdAt: Date;
  }>;
}): StationDetailDto {
  return {
    id: input.id,
    name: input.name,
    lat: input.lat,
    lng: input.lng,
    currentPrice: input.currentPrice,
    confidence: input.confidence,
    reportCount: input.reportCount,
    lastUpdatedAt: input.lastUpdatedAt ? input.lastUpdatedAt.toISOString() : null,
    recentReports: input.recentReports.map(toReportDto),
  };
}