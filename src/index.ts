import { config } from 'dotenv';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '@features/app/app.module';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
