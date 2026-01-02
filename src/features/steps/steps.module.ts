import { Module } from '@nestjs/common';

import { StepsService } from '@features/steps/steps.service';
import { CompletionModule } from '@features/completion/completion.module';

@Module({
  imports: [CompletionModule],
  providers: [StepsService],
  exports: [StepsService],
})
export class StepsModule {}
