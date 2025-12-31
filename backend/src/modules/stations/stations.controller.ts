import { Controller, Get, Query, Param } from '@nestjs/common';
import { StationsService } from './stations.service';
import { GetStationsDto } from './dto/get-stations.dto';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  async getStations(@Query() query: GetStationsDto) {
    return this.stationsService.getStations(query);
  }

  @Get(':id')
  async getStation(@Param('id') id: string) {
    return this.stationsService.getStationById(Number(id));
  }
}