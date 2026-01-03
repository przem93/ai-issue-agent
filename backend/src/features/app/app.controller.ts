import { Body, Controller, Get, Post } from '@nestjs/common';

import { StepsService } from '@features/steps/steps.service';

@Controller('api')
export class AppController {
  constructor(private readonly stepsService: StepsService) {}

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

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
