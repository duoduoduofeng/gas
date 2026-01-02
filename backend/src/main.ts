import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { validatePricingConfig } from './modules/prices/pricing.config.validate';
import * as fs from "fs";

async function bootstrap() {
  validatePricingConfig();
  
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: fs.readFileSync("/app/certs/dev-key.pem"),
      cert: fs.readFileSync("/app/certs/dev-cert.pem"),
    },
  });

  app.enableCors({
    origin: [
      "https://localhost:5173", 
      "https://127.0.0.1:5173", 
      "https://192.168.1.240:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true }, 
  }));

  await app.listen(3000, "0.0.0.0");
}

bootstrap();