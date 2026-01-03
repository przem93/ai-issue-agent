import { Module } from '@nestjs/common';

import { CompletionService } from '@features/completion/completion.service';

@Module({
  providers: [CompletionService],
  exports: [CompletionService],
})
export class CompletionModule {}
