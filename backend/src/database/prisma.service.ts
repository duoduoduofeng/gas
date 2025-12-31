import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: 
        // If debug mode, print the log of sql queries.
        // Log of prisma is white list, but not level setting.
        process.env.NODE_ENV === 'debug'
            ? [
                { emit: 'stdout', level: 'query' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
              ]
            : [
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
              ],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}