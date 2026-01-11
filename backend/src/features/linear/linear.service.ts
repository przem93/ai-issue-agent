import { Injectable } from '@nestjs/common';
import { LinearClient } from '@linear/sdk';

export interface LinearIssueInput {
  title: string;
  description?: string;
  teamId: string;
  projectId?: string;
  stateId?: string;
  priority?: number;
  assigneeId?: string;
  labelIds?: string[];
}

export interface LinearIssueResponse {
  success: boolean;
  issueId?: string;
  issueUrl?: string;
  error?: string;
}

@Injectable()
export class LinearService {
  private readonly client: LinearClient | null;
  private readonly defaultTeamId: string;
  private readonly defaultProjectId: string | undefined;

  constructor() {
    const apiKey = process.env.LINEAR_API_KEY || '';
    this.defaultTeamId = process.env.LINEAR_TEAM_ID || '';
    this.defaultProjectId = process.env.LINEAR_PROJECT_ID || undefined;

    if (!apiKey) {
      console.warn('LINEAR_API_KEY is not set. Linear integration will not work.');
      this.client = null;
    } else {
      this.client = new LinearClient({ apiKey });
    }

    if (!this.defaultTeamId) {
      console.warn('LINEAR_TEAM_ID is not set. Linear integration will not work.');
    }
  }

  /**
   * Create a single issue in Linear
   */
  async createIssue(input: LinearIssueInput): Promise<LinearIssueResponse> {
    if (!this.client) {
      return {
        success: false,
        error: 'LINEAR_API_KEY is not configured',
      };
    }

    try {
      const issuePayload: any = {
        title: input.title,
        teamId: input.teamId,
      };

      if (input.description) {
        issuePayload.description = input.description;
      }

      if (input.projectId) {
        issuePayload.projectId = input.projectId;
      }

      if (input.stateId) {
        issuePayload.stateId = input.stateId;
      }

      if (input.priority !== undefined) {
        issuePayload.priority = input.priority;
      }

      if (input.assigneeId) {
        issuePayload.assigneeId = input.assigneeId;
      }

      if (input.labelIds && input.labelIds.length > 0) {
        issuePayload.labelIds = input.labelIds;
      }

      const issuePayloadResult = await this.client.createIssue(issuePayload);

      if (issuePayloadResult && issuePayloadResult.success) {
        // Fetch the created issue to get its details
        const issue = await issuePayloadResult.issue;
        if (issue) {
          return {
            success: true,
            issueId: issue.id,
            issueUrl: issue.url || '',
          };
        }
      }

      // Check if there's an error in the payload result
      const errorMessage = (issuePayloadResult as any)?.error?.message || 'Failed to create issue';
      return {
        success: false,
        error: errorMessage,
      };
    } catch (error) {
      console.error('Error creating issue:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create multiple issues in Linear
   */
  async createIssues(
    inputs: LinearIssueInput[],
  ): Promise<LinearIssueResponse[]> {
    const results: LinearIssueResponse[] = [];

    for (const input of inputs) {
      const result = await this.createIssue(input);
      results.push(result);
      // Add a small delay to avoid rate limiting
      if (inputs.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  /**
   * Convert ticket data to Linear issue format
   */
  formatTicketForLinear(
    ticket: {
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
    },
    teamId?: string,
    options?: {
      projectId?: string;
      stateId?: string;
      priority?: number;
      assigneeId?: string;
      labelIds?: string[];
    },
  ): LinearIssueInput {
    // Use provided teamId or fallback to env variable
    const finalTeamId = teamId || this.defaultTeamId;
    if (!finalTeamId) {
      throw new Error('Team ID is required. Provide it in request body or set LINEAR_TEAM_ID environment variable.');
    }

    // Use provided projectId or fallback to env variable
    const finalProjectId = options?.projectId || this.defaultProjectId;

    // Build description from ticket data
    const descriptionParts: string[] = [];

    if (ticket.context) {
      descriptionParts.push(`## Context\n${ticket.context}`);
    }

    if (ticket.scope.length > 0) {
      descriptionParts.push(
        `## Scope\n${ticket.scope.map((s) => `- ${s}`).join('\n')}`,
      );
    }

    if (ticket.non_scope.length > 0) {
      descriptionParts.push(
        `## Out of Scope\n${ticket.non_scope.map((s) => `- ${s}`).join('\n')}`,
      );
    }

    if (ticket.technical_approach) {
      descriptionParts.push(
        `## Technical Approach\n${ticket.technical_approach}`,
      );
    }

    if (ticket.files_or_modules.length > 0) {
      descriptionParts.push(
        `## Files/Modules\n${ticket.files_or_modules.map((f) => `- ${f}`).join('\n')}`,
      );
    }

    if (ticket.acceptance_criteria.length > 0) {
      descriptionParts.push(
        `## Acceptance Criteria\n${ticket.acceptance_criteria.map((c) => `- ${c}`).join('\n')}`,
      );
    }

    if (ticket.edge_cases.length > 0) {
      descriptionParts.push(
        `## Edge Cases\n${ticket.edge_cases.map((e) => `- ${e}`).join('\n')}`,
      );
    }

    if (ticket.validation.length > 0) {
      descriptionParts.push(
        `## Validation\n${ticket.validation.map((v) => `- ${v}`).join('\n')}`,
      );
    }

    if (ticket.dependencies.length > 0) {
      descriptionParts.push(
        `## Dependencies\n${ticket.dependencies.map((d) => `- ${d}`).join('\n')}`,
      );
    }

    const description = descriptionParts.join('\n\n');

    return {
      title: ticket.title,
      description,
      teamId: finalTeamId,
      projectId: finalProjectId,
      stateId: options?.stateId,
      priority: options?.priority,
      assigneeId: options?.assigneeId,
      labelIds: options?.labelIds,
    };
  }

  /**
   * Get teams from Linear workspace
   */
  async getTeams(): Promise<{ id: string; name: string; key: string }[]> {
    if (!this.client) {
      console.warn('Linear client is not initialized');
      return [];
    }

    try {
      console.log('Fetching teams from Linear...');
      const teams = await this.client.teams();
      console.log('Teams response:', teams ? 'received' : 'null');

      if (!teams || !teams.nodes) {
        console.warn('No teams returned from Linear API');
        return [];
      }

      const teamsList = teams.nodes.map((team) => ({
        id: team.id,
        name: team.name,
        key: team.key,
      }));

      // Log teams with their UUIDs for easy access
      if (teamsList.length > 0) {
        console.log('Available Linear teams:');
        teamsList.forEach((team) => {
          console.log(`  - ${team.name} (key: ${team.key}) - UUID: ${team.id}`);
        });
      }

      return teamsList;
    } catch (error) {
      console.error('Error fetching Linear teams:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      return [];
    }
  }

  /**
   * Get projects from Linear workspace
   * @param teamId Optional team ID to filter projects by team
   */
  async getProjects(teamId?: string): Promise<{ id: string; name: string; key: string | null }[]> {
    if (!this.client) {
      return [];
    }

    // Use teamId from parameter, env variable, or defaultTeamId
    const finalTeamId = teamId || this.defaultTeamId;

    try {
      let projects;

      if (finalTeamId) {
        // Get projects for specific team
        const team = await this.client.team(finalTeamId);
        projects = await team?.projects();
      } else {
        // Get all projects
        projects = await this.client.projects();
      }

      if (!projects) {
        return [];
      }

      const projectsList = projects.nodes.map((project) => ({
        id: project.id,
        name: project.name,
        key: (project as any).key || null,
      }));

      // Log projects with their UUIDs for easy access
      if (projectsList.length > 0) {
        console.log('Available Linear projects:');
        projectsList.forEach((project) => {
          console.log(`  - ${project.name} (key: ${project.key || 'N/A'}) - UUID: ${project.id}`);
        });
      }

      return projectsList;
    } catch (error) {
      console.error('Error fetching Linear projects:', error);
      return [];
    }
  }
}
