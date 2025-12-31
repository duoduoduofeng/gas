import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from '../../database/prisma.service';
import { PRICING_CONFIG } from '../prices/pricing.config';


type WindowStats = {
  // stationId, reportCount
  countHighByStationId: Map<number, number>;
  countLowByStationId: Map<number, number>;
  // stationId, latestReport
  latestHighByStationId: Map<number, { price: number; createdAt: Date }>;
  latestLowByStationId: Map<number, { price: number; createdAt: Date }>;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        stationId: dto.stationId,
        price: dto.price,
        photoUrl: dto.photoUrl,
        deviceId: dto.deviceId,
      },
    });
  }

  listByStation(stationId: number) {
    return this.prisma.report.findMany({
      where: { stationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  listRecentByStation(stationId: number, since: Date) {
    return this.prisma.report.findMany({
      where: { stationId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getWindowStatsByStation(stationId: number) {
    const since = new Date(Date.now() - PRICING_CONFIG.WINDOWS.HIGH * 60 * 1000);

    // Latest maybe null since nobody report for this station within time window.
    const [reportCount, latest] = await Promise.all([
      this.prisma.report.count({
        where: { stationId, createdAt: { gte: since } },
      }),
      this.prisma.report.findFirst({
        where: { stationId, createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { reportCount, latest };
  }

  async listLatestByStation(stationId: number) {
    return this.prisma.report.findMany({
      where: { stationId },
      orderBy: { createdAt: 'desc' },
      take: PRICING_CONFIG.DEFENSE.WINDOW_MINUTES,
    });
  }

  async listLimitLatestByStation(stationId: number, limit = 10) {
  return this.prisma.report.findMany({
    where: { stationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

  async findLatestByDeviceAndStation(deviceId: string, stationId: number) {
    return this.prisma.report.findFirst({
      where: { deviceId, stationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWindowStatsByStationV2(stationId: number) {
    const { HIGH, LOW } = PRICING_CONFIG.WINDOWS;
    const sinceHigh = new Date(Date.now() - HIGH * 60 * 1000);
    const sinceLow = new Date(Date.now() - LOW * 60 * 1000);

    const [countLow, latestLow, countHigh, latestHigh] = await Promise.all([
      this.prisma.report.count({
        where: { stationId, createdAt: { gte: sinceLow } },
      }),
      this.prisma.report.findFirst({
        where: { stationId, createdAt: { gte: sinceLow } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({
        where: { stationId, createdAt: { gte: sinceHigh } },
      }),
      this.prisma.report.findFirst({
        where: { stationId, createdAt: { gte: sinceHigh } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      countHigh,
      latestHigh,
      countLow,
      latestLow,
    };
  }

  // Obtain the reports within low window.
  async listInLowWindowByStation(stationId: number) {
    const sinceLow = new Date(Date.now() - PRICING_CONFIG.WINDOWS.LOW * 60 * 1000);

    return this.prisma.report.findMany({
      where: { stationId, createdAt: { gte: sinceLow } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Reject abnormal report directly.
  async listForOutlierCheck(stationId: number) {
    const since = new Date(
      Date.now() - PRICING_CONFIG.WINDOWS.LOW * 60 * 1000,
    );

    return this.prisma.report.findMany({
      where: { stationId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      // Optional: cap the max rows for performance
      take: 50,
    });
  }

    /**
   * Batch fetch counts and latest reports for a list of stations.
   * This avoids N+1 queries in /stations.
   */
  async getWindowStatsForStations(stationIds: number[]): Promise<WindowStats> {
    if (stationIds.length === 0) {
      return {
        countHighByStationId: new Map(),
        countLowByStationId: new Map(),
        latestHighByStationId: new Map(),
        latestLowByStationId: new Map(),
      };
    }

    const now = Date.now();
    const sinceHigh = new Date(now - PRICING_CONFIG.WINDOWS.HIGH * 60 * 1000);
    const sinceLow = new Date(now - PRICING_CONFIG.WINDOWS.LOW * 60 * 1000);

    const [countHighRows, countLowRows, latestHighRows, latestLowRows] =
      await Promise.all([
        this.prisma.report.groupBy({
          by: ['stationId'],
          where: {
            stationId: { in: stationIds },
            createdAt: { gte: sinceHigh },
          },
          _count: { _all: true },
        }),
        this.prisma.report.groupBy({
          by: ['stationId'],
          where: {
            stationId: { in: stationIds },
            createdAt: { gte: sinceLow },
          },
          _count: { _all: true },
        }),
        this.prisma.report.findMany({
          where: {
            stationId: { in: stationIds },
            createdAt: { gte: sinceHigh },
          },
          orderBy: { createdAt: 'desc' },
          distinct: ['stationId'],
          select: { stationId: true, price: true, createdAt: true },
        }),
        this.prisma.report.findMany({
          where: {
            stationId: { in: stationIds },
            createdAt: { gte: sinceLow },
          },
          orderBy: { createdAt: 'desc' },
          distinct: ['stationId'],
          select: { stationId: true, price: true, createdAt: true },
        }),
      ]);

    const countHighByStationId = new Map<number, number>();
    for (const row of countHighRows) {
      countHighByStationId.set(row.stationId, row._count._all);
    }

    const countLowByStationId = new Map<number, number>();
    for (const row of countLowRows) {
      countLowByStationId.set(row.stationId, row._count._all);
    }

    const latestHighByStationId = new Map<number, { price: number; createdAt: Date }>();
    for (const r of latestHighRows) {
      latestHighByStationId.set(r.stationId, { price: r.price, createdAt: r.createdAt });
    }

    const latestLowByStationId = new Map<number, { price: number; createdAt: Date }>();
    for (const r of latestLowRows) {
      latestLowByStationId.set(r.stationId, { price: r.price, createdAt: r.createdAt });
    }

    return { countHighByStationId, countLowByStationId, latestHighByStationId, latestLowByStationId };
  }
}