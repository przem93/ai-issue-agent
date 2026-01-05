import type { Stage } from '../types';

import { TicketList } from './TicketList';

interface StageItemProps {
  stage: Stage;
  stageIndex: number;
  projectDescription: string;
  stagesJson: string;
  images: Array<{
    base64?: string;
    description: string;
    filename?: string;
    file?: File;
  }>;
  tickets: {
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
  } | null;
  loading: boolean;
  previousStagesTickets: Array<{
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
  hasAllPreviousTickets: boolean;
  onGenerateTickets: () => void;
}

export const StageItem = ({
  stage,
  stageIndex,
  projectDescription,
  stagesJson,
  images,
  tickets,
  loading,
  previousStagesTickets,
  hasAllPreviousTickets,
  onGenerateTickets,
}: StageItemProps) => {
  // Disable button if this is not the first stage and not all previous stages have tickets
  const isDisabled = stageIndex > 0 && !hasAllPreviousTickets;
  const disabledReason = isDisabled
    ? 'Generate tickets for all previous stages first'
    : undefined;

  return (
    <div className="stage-item">
      <div className="stage-header">
        <h3>
          {stage.stage_id}: {stage.title}
        </h3>
        <button
          className="generate-tickets-button"
          onClick={onGenerateTickets}
          disabled={loading || isDisabled}
          title={disabledReason}
          style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          {loading ? 'Generating...' : 'Generate Tickets'}
        </button>
      </div>
      {isDisabled && (
        <p className="stage-warning" style={{ color: '#ff9800', fontStyle: 'italic' }}>
          {disabledReason}
        </p>
      )}
      <p className="stage-goal">{stage.goal}</p>

      {tickets && <TicketList tickets={tickets.tickets} />}
    </div>
  );
};

