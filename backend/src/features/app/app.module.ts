import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { LinearModule } from '@features/linear/linear.module';
import { StepsModule } from '@features/steps/steps.module';
import { TicketsModule } from '@features/tickets/tickets.module';

@Module({
  imports: [StepsModule, TicketsModule, LinearModule],
  controllers: [AppController],
})
export class AppModule {}
