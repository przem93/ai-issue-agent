import { useState } from 'react';

import type { Stage } from '../types';
import { useLinear } from '../hooks/useLinear';

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
  selectedTeamId?: string;
  selectedProjectId?: string;
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
  selectedTeamId,
  selectedProjectId,
  onGenerateTickets,
}: StageItemProps) => {
  const { loading: linearLoading, error: linearError, createLinearIssues } = useLinear();
  const [linearSuccess, setLinearSuccess] = useState(false);

  // Disable button if this is not the first stage and not all previous stages have tickets
  const isDisabled = stageIndex > 0 && !hasAllPreviousTickets;
  const disabledReason = isDisabled
    ? 'Generate tickets for all previous stages first'
    : undefined;

  // Check if tickets are available for this stage
  const hasTickets = tickets !== null && tickets.tickets.length > 0;
  // Check if team is selected (required for Linear)
  const canCreateInLinear = hasTickets && selectedTeamId;

  const handleCreateLinearIssues = async () => {
    if (!tickets || tickets.tickets.length === 0 || !selectedTeamId) {
      return;
    }

    try {
      setLinearSuccess(false);
      const result = await createLinearIssues(tickets.tickets, {
        teamId: selectedTeamId,
        projectId: selectedProjectId || undefined,
      });
      if (result.success) {
        setLinearSuccess(true);
        // Reset success message after 3 seconds
        setTimeout(() => setLinearSuccess(false), 3000);
      }
    } catch (err) {
      // Error is already handled in useLinear
    }
  };

  return (
    <div className="stage-item">
      <div className="stage-header">
        <h3>
          {stage.stage_id}: {stage.title}
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="generate-tickets-button"
            onClick={onGenerateTickets}
            disabled={loading || isDisabled}
            title={disabledReason}
            style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            {loading ? 'Generating...' : 'Generate Tickets'}
          </button>
          <button
            className="create-linear-button"
            onClick={handleCreateLinearIssues}
            disabled={!canCreateInLinear || linearLoading}
            title={
              !selectedTeamId
                ? 'Select a team first'
                : !hasTickets
                  ? 'Generate tickets first'
                  : undefined
            }
            style={
              !canCreateInLinear
                ? { opacity: 0.5, cursor: 'not-allowed' }
                : linearSuccess
                  ? { backgroundColor: '#4caf50', color: 'white' }
                  : undefined
            }
          >
            {linearLoading
              ? 'Creating...'
              : linearSuccess
                ? '✓ Created in Linear'
                : 'Create in Linear'}
          </button>
        </div>
      </div>
      {isDisabled && (
        <p className="stage-warning" style={{ color: '#ff9800', fontStyle: 'italic' }}>
          {disabledReason}
        </p>
      )}
      {linearError && (
        <p className="stage-error" style={{ color: '#f44336', fontStyle: 'italic' }}>
          Linear Error: {linearError}
        </p>
      )}
      <p className="stage-goal">{stage.goal}</p>

      {tickets && <TicketList tickets={tickets.tickets} />}
    </div>
  );
};

