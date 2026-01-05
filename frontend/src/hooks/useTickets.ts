import { useState } from 'react';

import type { ImageData, TicketsResponse } from '../types';
import { API_URL } from '../utils/constants';
import { convertImageToBase64 } from '../utils/images';

export const useTickets = () => {
  const [loading, setLoading] = useState<string | null>(null); // stage_id that's loading
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Record<string, TicketsResponse>>({}); // stage_id -> tickets

  const generateTickets = async (
    projectDescription: string,
    stagesJson: string,
    targetStage: string,
    images: Array<{
      base64?: string;
      description: string;
      filename?: string;
      file?: File;
    }>,
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
    }> = []
  ): Promise<TicketsResponse> => {
    setLoading(targetStage);
    setError(null);

    try {
      // Convert images to base64 (use existing base64 if available)
      const imagesData = await Promise.all(
        images.map(async (img): Promise<ImageData | null> => {
          if (img.base64) {
            return {
              base64: img.base64,
              description: img.description,
              filename: img.filename || img.file?.name || 'image',
            };
          }
          if (img.file) {
            return {
              base64: await convertImageToBase64(img.file),
              description: img.description,
              filename: img.file.name,
            };
          }
          return null;
        })
      );

      const validImagesData = imagesData.filter(
        (img): img is ImageData => img !== null
      );

      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectDescription,
          stagesJson,
          targetStage,
          images: validImagesData,
          previousStagesTickets,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();

      // Try to parse as JSON
      let ticketsResponse: TicketsResponse;
      try {
        ticketsResponse = JSON.parse(data);
      } catch {
        throw new Error('Invalid JSON response from server');
      }

      // Store tickets for this stage
      setTickets((prev) => ({
        ...prev,
        [targetStage]: ticketsResponse,
      }));

      return ticketsResponse;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const getTicketsForStage = (stageId: string): TicketsResponse | null => {
    return tickets[stageId] || null;
  };

  return {
    loading,
    error,
    generateTickets,
    getTicketsForStage,
    setError,
  };
};

