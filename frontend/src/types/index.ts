export interface ImageWithDescription {
  id: string;
  file?: File; // File object (for new uploads)
  preview: string; // Blob URL or base64
  description: string;
  base64?: string; // Base64 for localStorage
  filename?: string; // Filename for localStorage
}

export interface StoredData {
  projectDescription: string;
  steps: string | null;
  images: Array<{
    id: string;
    base64: string;
    description: string;
    filename: string;
  }>;
  ticketsByStage?: Record<string, TicketsResponse>;
  selectedTeamId?: string;
  selectedProjectId?: string;
}

export interface ImageData {
  base64: string;
  description: string;
  filename: string;
}

// Types for stages/steps
export interface Stage {
  stage_id: string;
  title: string;
  goal: string;
  scope_in: string[];
  scope_out: string[];
  repo_changes: {
    create_or_update: Array<{
      path_examples: string[];
      description: string;
    }>;
    dependencies: Array<{
      name: string;
      reason: string;
      scope: 'runtime' | 'dev';
    }>;
    configuration: Array<{
      area: string;
      details: string;
    }>;
  };
  architecture: {
    modules: string[];
    data_flow: string;
    key_abstractions: string[];
    interfaces_contracts: string[];
  };
  implementation_details: {
    components: string[];
    services: string[];
    state_management: string;
    storage: string;
    networking: string;
    error_handling: string[];
    edge_cases: string[];
  };
  quality_strategy: {
    tests: {
      unit: string;
      integration: string;
      e2e: string;
    };
    observability: string;
    performance_notes: string;
    security_notes: string;
  };
  stage_exit_criteria: string[];
}

export interface StagesResponse {
  project_name: string;
  assumptions: string[];
  stages: Stage[];
}

// Types for tickets
export interface Ticket {
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
}

export interface TicketsResponse {
  stage_id: string;
  stage_title: string;
  tickets: Ticket[];
}
