import { useEffect, useState } from 'react';

import type { Stage, StagesResponse } from '../types';

import { StageItem } from './StageItem';

interface StagesListProps {
  stepsJson: string;
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
    targetStage: string,
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
    }>
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
}

export const StagesList = ({
  stepsJson,
  projectDescription,
  images,
  onGenerateTickets,
  loadingStageId,
  ticketsByStage,
}: StagesListProps) => {
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    try {
      const parsed: StagesResponse = JSON.parse(stepsJson);
      setStages(parsed.stages || []);
    } catch (err) {
      console.error('Failed to parse stages JSON:', err);
      setStages([]);
    }
  }, [stepsJson]);

  if (stages.length === 0) {
    return null;
  }

  return (
    <div className="stages-list">
      <h3>Stages ({stages.length})</h3>
      {stages.map((stage, index) => {
        // Get tickets from all previous stages (stages before current index)
        const previousStages = stages.slice(0, index);
        const previousStagesTickets = previousStages
          .map((prevStage) => ticketsByStage[prevStage.stage_id])
          .filter((tickets): tickets is NonNullable<typeof tickets> => tickets !== undefined && tickets !== null);

        // Disable if there are previous stages but not all of them have tickets
        const hasAllPreviousTickets = previousStages.length === 0 || previousStagesTickets.length === previousStages.length;

        return (
          <StageItem
            key={stage.stage_id}
            stage={stage}
            stageIndex={index}
            projectDescription={projectDescription}
            stagesJson={stepsJson}
            images={images}
            tickets={ticketsByStage[stage.stage_id] || null}
            loading={loadingStageId === stage.stage_id}
            previousStagesTickets={previousStagesTickets}
            hasAllPreviousTickets={hasAllPreviousTickets}
            onGenerateTickets={() =>
              onGenerateTickets(projectDescription, stepsJson, stage.stage_id, previousStagesTickets)
            }
          />
        );
      })}
    </div>
  );
};

