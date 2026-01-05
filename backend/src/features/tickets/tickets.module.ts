import { Module } from '@nestjs/common';

import { TicketsService } from '@features/tickets/tickets.service';
import { CompletionModule } from '@features/completion/completion.module';

@Module({
  imports: [CompletionModule],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
