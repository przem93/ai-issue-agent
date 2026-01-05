import { Body, Controller, Get, Post } from '@nestjs/common';

import { StepsService } from '@features/steps/steps.service';
import { TicketsService } from '@features/tickets/tickets.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly stepsService: StepsService,
    private readonly ticketsService: TicketsService,
  ) {}

  @Get()
  getHello() {
    return { message: 'Hello from AI Issue Agent!' };
  }

  @Post('steps')
  createSteps(
    @Body()
    body: {
      projectDescription: string;
      images?: Array<{
        base64: string;
        description: string;
        filename: string;
      }>;
    },
  ) {
    return this.stepsService.createSteps(
      body.projectDescription,
      body.images || [],
    );
  }

  @Post('tickets')
  createTickets(
    @Body()
    body: {
      projectDescription: string;
      stagesJson: string;
      targetStage: string;
      images?: Array<{
        base64: string;
        description: string;
        filename: string;
      }>;
      previousStagesTickets?: Array<{
        stage_id: string;
        stage_title: string;
        tickets: Array<{
          ticket_id: string;
          title: string;
          context: string;
          scope: string[];
          non_scope: string[];
          technical_approach: string;
          files_or_modules: string[];
          acceptance_criteria: string[];
          edge_cases: string[];
          validation: string[];
          dependencies: string[];
        }>;
      }>;
    },
  ) {
    return this.ticketsService.createTickets(
      body.projectDescription,
      body.stagesJson,
      body.targetStage,
      body.images || [],
      body.previousStagesTickets || [],
    );
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
