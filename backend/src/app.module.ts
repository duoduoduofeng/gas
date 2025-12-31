import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { StationsModule } from './modules/stations/stations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PricesModule } from './modules/prices/prices.module';
import { HealthModule } from './modules/health/health.module';
import { VersionModule } from './modules/version/version.module';

// StationsModule has defined the necessary three components:
// imports, controllers, providers
@Module({
  imports: [
    DatabaseModule, 
    StationsModule, 
    ReportsModule, 
    PricesModule,
    HealthModule,
    VersionModule,
  ],
})

export class AppModule {}