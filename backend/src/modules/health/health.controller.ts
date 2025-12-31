import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    try {
      // Simple DB ping
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        db: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'degraded',
        db: 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }
}