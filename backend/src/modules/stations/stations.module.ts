import { Module } from '@nestjs/common';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { ReportsModule } from '../reports/reports.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, ReportsModule],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})

export class StationsModule {}