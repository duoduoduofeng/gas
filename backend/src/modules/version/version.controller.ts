import { Controller, Get } from '@nestjs/common';

@Controller()
export class VersionController {
  @Get('version')
  version() {
    return {
      name: 'gas-backend',
      env: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    };
  }
}