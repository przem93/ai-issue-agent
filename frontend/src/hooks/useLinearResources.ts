import { useEffect, useState } from 'react';

import { API_URL } from '../utils/constants';

interface LinearTeam {
  id: string;
  name: string;
  key: string;
}

interface LinearProject {
  id: string;
  name: string;
  key: string | null;
}

interface LinearTeamsResponse {
  teams: LinearTeam[];
  teamIds: Array<{
    name: string;
    key: string;
    id: string;
    envExample: string;
  }>;
  error?: string;
}

interface LinearProjectsResponse {
  projects: LinearProject[];
  projectIds: Array<{
    name: string;
    key: string | null;
    id: string;
    envExample: string;
  }>;
  teamId: string;
  error?: string;
}

export const useLinearResources = () => {
  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [projects, setProjects] = useState<LinearProject[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setTeamsLoading(true);
    setTeamsError(null);

    try {
      const response = await fetch(`${API_URL}/api/linear/teams`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LinearTeamsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setTeams(data.teams || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setTeamsError(errorMessage);
      console.error('Error fetching Linear teams:', err);
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchProjects = async (teamId?: string) => {
    setProjectsLoading(true);
    setProjectsError(null);

    try {
      const url = teamId
        ? `${API_URL}/api/linear/projects?teamId=${encodeURIComponent(teamId)}`
        : `${API_URL}/api/linear/projects`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LinearProjectsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setProjects(data.projects || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setProjectsError(errorMessage);
      console.error('Error fetching Linear projects:', err);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    projects,
    teamsLoading,
    projectsLoading,
    teamsError,
    projectsError,
    fetchTeams,
    fetchProjects,
  };
};

