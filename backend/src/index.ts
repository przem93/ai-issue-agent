import { config } from 'dotenv';

import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';

import { AppModule } from '@features/app/app.module';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default to configure custom
  });

  // Increase body size limit for images (default is 100kb, we need more for base64 images)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
