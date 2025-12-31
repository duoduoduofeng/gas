import { Injectable } from '@nestjs/common';
import { Report } from '../reports/report.type';
import { StationPrice, ConfidenceLevel } from './station-price.type';

@Injectable()
export class PricesService {
  aggregate(stationId: number, reports: Report[]): StationPrice | null {
    const now = Date.now();
    const windowMs = 30 * 60 * 1000;

    const recent = reports.filter(r => now - r.createdAt.getTime() <= windowMs);

    if (recent.length === 0) return null;

    const latest = recent[recent.length - 1];

    // Doesn't care about the difference between the prices reported by different user now...
    const confidence: ConfidenceLevel =
      recent.length >= 2 ? 'HIGH' : recent.length === 1 ? 'MEDIUM' : 'LOW';

    return {
      stationId,
      price: latest.price,
      confidence,
      reportCount: recent.length,
      lastUpdatedAt: latest.createdAt,
    };
  }
}