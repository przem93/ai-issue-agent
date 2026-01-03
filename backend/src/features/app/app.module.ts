import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { StepsModule } from '@features/steps/steps.module';

@Module({
  imports: [StepsModule],
  controllers: [AppController],
})
export class AppModule {}
