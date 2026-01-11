import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { LinearService } from '@features/linear/linear.service';
import { StepsService } from '@features/steps/steps.service';
import { TicketsService } from '@features/tickets/tickets.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly stepsService: StepsService,
    private readonly ticketsService: TicketsService,
    private readonly linearService: LinearService,
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

  @Post('linear/issues')
  async createLinearIssues(
    @Body()
    body: {
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
      teamId?: string;
      projectId?: string;
      stateId?: string;
      priority?: number;
      assigneeId?: string;
      labelIds?: string[];
    },
  ) {
    const { tickets, teamId, projectId, stateId, priority, assigneeId, labelIds } = body;

    const linearIssues = tickets.map((ticket) =>
      this.linearService.formatTicketForLinear(ticket, teamId, {
        projectId,
        stateId,
        priority,
        assigneeId,
        labelIds,
      }),
    );

    const results = await this.linearService.createIssues(linearIssues);

    return {
      success: results.every((r) => r.success),
      results,
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }

  @Get('linear/teams')
  async getLinearTeams() {
    try {
      console.log('GET /api/linear/teams called');
      const teams = await this.linearService.getTeams();
      console.log('Teams fetched successfully, count:', teams.length);
      return {
        teams,
        // Helper: show team IDs for easy copy-paste to env
        teamIds: teams.map((team) => ({
          name: team.name,
          key: team.key,
          id: team.id,
          envExample: `LINEAR_TEAM_ID=${team.id}`,
        })),
      };
    } catch (error) {
      console.error('Error in getLinearTeams:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error message:', errorMessage);
      return {
        teams: [],
        teamIds: [],
        error: errorMessage,
      };
    }
  }

  @Get('linear/projects')
  async getLinearProjects(
    @Query('teamId') teamId?: string,
  ) {
    const projects = await this.linearService.getProjects(teamId);
    return {
      projects,
      // Helper: show project IDs for easy copy-paste to env
      projectIds: projects.map((project) => ({
        name: project.name,
        key: project.key,
        id: project.id,
        envExample: `LINEAR_PROJECT_ID=${project.id}`,
      })),
      // Show which team was used (if any)
      teamId: teamId || process.env.LINEAR_TEAM_ID || 'not specified',
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
