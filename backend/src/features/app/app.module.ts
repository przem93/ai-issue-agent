import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { StepsModule } from '@features/steps/steps.module';
import { TicketsModule } from '@features/tickets/tickets.module';

@Module({
  imports: [StepsModule, TicketsModule],
  controllers: [AppController],
})
export class AppModule {}
