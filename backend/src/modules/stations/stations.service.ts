import { Injectable } from '@nestjs/common';
import { GetStationsDto } from './dto/get-stations.dto';
import { isWithinRadius } from '../shared/utils/geo';
import { ReportsService } from '../reports/reports.service';
import { PrismaService } from '../../database/prisma.service';
import { PRICING_CONFIG } from '../prices/pricing.config';
import { filterOutliersByMedian } from '../shared/utils/outlier';
import { toStationListItemDto } from '../shared/utils/mappers';
import { toStationDetailDto } from '../shared/utils/mappers';


@Injectable()
export class StationsService {
  // http://localhost:3000/stations?lat=49.17&lng=-123.13
  // http://localhost:3000/reports?stationId=1
  constructor(
    private readonly reportsService: ReportsService,
    // private readonly pricesService: PricesService,
    private readonly prisma: PrismaService,
  ) {}

  async getStations(query: GetStationsDto) {
    const { lat, lng, radius = PRICING_CONFIG.NEARBY.RADIUS } = query;

    // Find nearby stations by lattitude & longitude
    const stations = await this.prisma.station.findMany({
      orderBy: { id: 'asc' },
    });

    const filtered = stations.filter(s =>
      isWithinRadius(lat, lng, s.lat, s.lng, radius),
    );

    const stationIds = filtered.map(s => s.id);
    const stats = await this.reportsService.getWindowStatsForStations(stationIds);

    return filtered.map(s => {
      const countHigh = stats.countHighByStationId.get(s.id) ?? 0;
      const countLow = stats.countLowByStationId.get(s.id) ?? 0;
      const latestHigh = stats.latestHighByStationId.get(s.id) ?? null;
      const latestLow = stats.latestLowByStationId.get(s.id) ?? null;

      let confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
      let currentPrice: number | null = null;
      let lastUpdatedAt: Date | null = null;
      let reportCount = countHigh;

      if (countHigh >= PRICING_CONFIG.THRESHOLDS.HIGH) {
        confidence = 'HIGH';
        currentPrice = latestHigh?.price ?? null;
        lastUpdatedAt = latestHigh?.createdAt ?? null;
      } else if (countHigh >= PRICING_CONFIG.THRESHOLDS.MEDIUM) {
        confidence = 'MEDIUM';
        currentPrice = latestHigh?.price ?? null;
        lastUpdatedAt = latestHigh?.createdAt ?? null;
      } else if (countHigh >= PRICING_CONFIG.THRESHOLDS.LOW) {
        confidence = 'LOW';
        currentPrice = latestHigh?.price ?? null;
        lastUpdatedAt = latestHigh?.createdAt ?? null;
      } else if (countLow > 0) {
        confidence = 'LOW';
        currentPrice = latestLow?.price ?? null;
        lastUpdatedAt = latestLow?.createdAt ?? null;
        reportCount = countLow;
      } else {
        confidence = 'NONE';
        currentPrice = null;
        lastUpdatedAt = null;
        reportCount = 0;
      }

      return toStationListItemDto({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        currentPrice,
        confidence,
        reportCount,
        lastUpdatedAt,
      });
    });
  }

  // Return all the reports and the latest uploading info.
  async getStationById(stationId: number) {
    const station = await this.prisma.station.findUnique({
      where: { id: stationId },
    });
    if (!station) return null;

    const reportsLow = await this.reportsService.listInLowWindowByStation(stationId);
    const { kept } = filterOutliersByMedian(
      reportsLow,
      r => r.price,
      PRICING_CONFIG.OUTLIER.MAX_DEVIATION_RATIO,
      PRICING_CONFIG.OUTLIER.MIN_REPORTS,
    );

    // Now split kept into HIGH window and LOW window behaviors
    const now = Date.now();
    const highMs = PRICING_CONFIG.WINDOWS.HIGH * 60 * 1000;

    const keptHigh = kept.filter(r => now - r.createdAt.getTime() <= highMs);

    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
    let currentPrice: number | null = null;
    let lastUpdatedAt: Date | null = null;
    let reportCount = keptHigh.length;

    // Choose latest within HIGH window if available; otherwise use latest within LOW window
    const latestHigh = keptHigh.length ? keptHigh[keptHigh.length - 1] : null;
    const latestLow = kept.length ? kept[kept.length - 1] : null;

    if (keptHigh.length >= PRICING_CONFIG.THRESHOLDS.HIGH) {
      confidence = 'HIGH';
      currentPrice = latestHigh?.price ?? null;
      lastUpdatedAt = latestHigh?.createdAt ?? null;
    } else if (keptHigh.length >= PRICING_CONFIG.THRESHOLDS.MEDIUM) {
      confidence = 'MEDIUM';
      currentPrice = latestHigh?.price ?? null;
      lastUpdatedAt = latestHigh?.createdAt ?? null;
    } else if (keptHigh.length >= PRICING_CONFIG.THRESHOLDS.LOW) {
      // still within HIGH window but only 1 report
      confidence = 'LOW';
      currentPrice = latestHigh?.price ?? null;
      lastUpdatedAt = latestHigh?.createdAt ?? null;
    } else if (kept.length > 0) {
      // No reports in HIGH window, but have reports within LOW window
      confidence = 'LOW';
      currentPrice = latestLow?.price ?? null;
      lastUpdatedAt = latestLow?.createdAt ?? null;
      reportCount = kept.length;
    } else {
      confidence = 'NONE';
      currentPrice = null;
      lastUpdatedAt = null;
      reportCount = 0;
    }

    // List the original last 10 reports.
    const recentReports = await this.reportsService.listLimitLatestByStation(stationId, 10);
    return toStationDetailDto({
      id: station.id,
      name: station.name,
      lat: station.lat,
      lng: station.lng,
      currentPrice,
      confidence,
      reportCount,
      lastUpdatedAt,
      recentReports,
    });
  }

  // Return all the reports and the latest uploading info.
  // @Deprecated
  async getStationByIdV00(stationId: number) {
    const station = await this.prisma.station.findUnique({
      where: { id: stationId },
    });

    if (!station) return null;

    // const { reportCount, latest } = await this.reportsService.getWindowStatsByStation(stationId, 30);
    const stats = await this.reportsService.getWindowStatsByStationV2(stationId);
    const recentReports = await this.reportsService.listLatestByStation(stationId);

    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
    let currentPrice: number | null = null;
    let lastUpdatedAt: Date | null = null;
    let reportCount = 0;

    if (stats.countHigh >= PRICING_CONFIG.THRESHOLDS.HIGH) {
      confidence = 'HIGH';
      currentPrice = stats.latestHigh?.price ?? null;
      lastUpdatedAt = stats.latestHigh?.createdAt ?? null;
      reportCount = stats.countHigh;
    } else if (stats.countHigh >= PRICING_CONFIG.THRESHOLDS.MEDIUM) {
      confidence = 'MEDIUM';
      currentPrice = stats.latestHigh?.price ?? null;
      lastUpdatedAt = stats.latestHigh?.createdAt ?? null;
      reportCount = stats.countHigh;
    } else if (stats.countLow > PRICING_CONFIG.THRESHOLDS.LOW) {
      confidence = 'LOW';
      currentPrice = stats.latestLow?.price ?? null;
      lastUpdatedAt = stats.latestLow?.createdAt ?? null;
      reportCount = stats.countLow;
    } else {
      confidence = 'NONE';
      currentPrice = null;
      lastUpdatedAt = null;
      reportCount = 0;
    }

    return {
      id: stationId,
      name: station.name,
      lat: station.lat,
      lng: station.lng,
      currentPrice,
      confidence,
      reportCount,
      lastUpdatedAt,
      recentReports,
    };
  }
}