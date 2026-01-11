import { highlightJSON } from '../utils/json';

import { StagesList } from './StagesList';

interface StepsOutputProps {
  steps: string;
  projectDescription: string;
  images: Array<{
    base64?: string;
    description: string;
    filename?: string;
    file?: File;
  }>;
  onGenerateTickets: (
    projectDescription: string,
    stagesJson: string,
    targetStage: string
  ) => Promise<void>;
  loadingStageId: string | null;
  ticketsByStage: Record<
    string,
    {
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
    }
  >;
  selectedTeamId?: string;
  selectedProjectId?: string;
  showStages?: boolean;
}

export const StepsOutput = ({
  steps,
  projectDescription,
  images,
  onGenerateTickets,
  loadingStageId,
  ticketsByStage,
  selectedTeamId,
  selectedProjectId,
  showStages = true,
}: StepsOutputProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(steps);
    alert('Copied to clipboard!');
  };

  // Try to parse as JSON to check if it's stages JSON
  let isStagesJson = false;
  try {
    const parsed = JSON.parse(steps);
    isStagesJson = parsed.stages && Array.isArray(parsed.stages);
  } catch {
    // Not JSON or not stages JSON
  }

  return (
    <div className="steps">
      <div className="steps-header">
        <h2>Generated Steps</h2>
        <button className="copy-button" onClick={handleCopy}>
          Copy JSON
        </button>
      </div>
      {showStages && isStagesJson ? (
        <StagesList
          stepsJson={steps}
          projectDescription={projectDescription}
          images={images}
          onGenerateTickets={onGenerateTickets}
          loadingStageId={loadingStageId}
          ticketsByStage={ticketsByStage}
          selectedTeamId={selectedTeamId}
          selectedProjectId={selectedProjectId}
        />
      ) : (
        <div className="steps-content">
          <pre
            className="json-output"
            dangerouslySetInnerHTML={{ __html: highlightJSON(steps) }}
          />
        </div>
      )}
    </div>
  );
};

