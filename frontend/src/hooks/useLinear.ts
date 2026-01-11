import { useState } from 'react';

import { API_URL } from '../utils/constants';

interface Ticket {
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

interface CreateLinearIssuesResponse {
  success: boolean;
  results: Array<{
    success: boolean;
    issueId?: string;
    issueUrl?: string;
    error?: string;
  }>;
  total: number;
  successful: number;
  failed: number;
}

export const useLinear = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLinearIssues = async (
    tickets: Ticket[],
    options?: {
      teamId?: string;
      projectId?: string;
      stateId?: string;
      priority?: number;
      assigneeId?: string;
      labelIds?: string[];
    }
  ): Promise<CreateLinearIssuesResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/linear/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickets,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CreateLinearIssuesResponse = await response.json();

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createLinearIssues,
    setError,
  };
};

