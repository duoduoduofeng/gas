import { Body, Controller, Post, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './report.type';
import { checkRateLimit } from '../shared/utils/rate-limit';
import { PRICING_CONFIG } from '../prices/pricing.config';
import { median, isOutlierByMedian } from '../shared/utils/outlier';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() dto: CreateReportDto) {
    // Avoid attack.
    const ok = checkRateLimit(
      `report:${dto.deviceId}`,
      PRICING_CONFIG.DEFENSE.MAX_UPLOAD_TIMES,                 // max 3 reports
      PRICING_CONFIG.DEFENSE.WINDOW_MINUTES * 60 * 1000,    // per 10 minutes
    );

    if (!ok) {
      throw new HttpException(
        'Too many reports, please try later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Deduplicate: same device + station + similar price within set minutes.
    const latest = await this.reportsService.findLatestByDeviceAndStation(dto.deviceId, dto.stationId);
    if (latest) {
      const withinWindow = Date.now() - latest.createdAt.getTime() <= PRICING_CONFIG.DEDUP.WINDOW_MINUTES * 60 * 1000;
      const samePrice = Math.abs(latest.price - dto.price) < PRICING_CONFIG.DEDUP.PRICE_EPSILON;

      if (withinWindow && samePrice) {
        // return existing one, do not insert a new row
        return latest;
      }
    }

    // Outlier rejection: reject reports deviating too much from recent median
    const recent = await this.reportsService.listForOutlierCheck(dto.stationId);

    if (recent.length >= PRICING_CONFIG.OUTLIER.MIN_REPORTS) {
      const m = median(recent.map(r => r.price));

      if (m !== null && isOutlierByMedian(dto.price, m,PRICING_CONFIG.OUTLIER.MAX_DEVIATION_RATIO,)) {
        throw new BadRequestException('Reported price looks abnormal.');
      }
    }

    return this.reportsService.create(dto);
  }


  // http://localhost:3000/reports?stationId=1
  // import { Body, Controller, Get, Post, Query, HttpException, HttpStatus } from '@nestjs/common';
  // replaced by StationsController.Get(':id')
  // @Get()
  // async list(@Query('stationId') stationId?: string): Promise<Report[]> {
  //   if (!stationId) return [];
  //   return this.reportsService.listByStation(Number(stationId));
  // }
}