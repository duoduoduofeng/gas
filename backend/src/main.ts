import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { validatePricingConfig } from './modules/prices/pricing.config.validate';

async function bootstrap() {
  validatePricingConfig();
  
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true }, 
}));
  await app.listen(3000);
}

bootstrap();