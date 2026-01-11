import { useEffect, useRef, useState } from 'react';

import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { ProjectDescriptionForm } from './components/ProjectDescriptionForm';
import { StepsOutput } from './components/StepsOutput';
import { useImages } from './hooks/useImages';
import { useLinearResources } from './hooks/useLinearResources';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSteps } from './hooks/useSteps';
import { useTickets } from './hooks/useTickets';
import { STORAGE_KEY } from './utils/constants';
import type { TicketsResponse } from './types';

function App() {
  const {
    projectDescription,
    setProjectDescription,
    images: storedImages,
    setImages: setStoredImages,
    steps,
    setSteps,
    ticketsByStage: storedTicketsByStage,
    setTicketsByStage: setStoredTicketsByStage,
    clearStorage: clearLocalStorage,
  } = useLocalStorage();

  const {
    images,
    addImages,
    removeImage,
    updateImageDescription,
    clearImages,
  } = useImages(storedImages);

  // Sync images with localStorage whenever they change (user modifications)
  // But don't sync if we're loading from localStorage
  const skipSyncRef = useRef(false);

  useEffect(() => {
    // If storedImages changed and has images, and we don't have images,
    // it means we're loading from localStorage - skip syncing back
    if (storedImages.length > 0 && images.length === 0) {
      skipSyncRef.current = true;
      return;
    }

    // Reset skip flag after the load
    if (skipSyncRef.current && images.length > 0) {
      skipSyncRef.current = false;
    }

    // Only sync if images changed and we're not skipping sync
    if (!skipSyncRef.current && images.length > 0) {
      const imagesChanged =
        JSON.stringify(images.map((img) => ({ id: img.id, description: img.description }))) !==
        JSON.stringify(storedImages.map((img) => ({ id: img.id, description: img.description })));

      if (imagesChanged) {
        setStoredImages(images);
      }
    }
  }, [images, storedImages, setStoredImages]);

  const { loading, error, generateSteps, setError } = useSteps();
  const {
    loading: ticketsLoading,
    error: ticketsError,
    generateTickets,
  } = useTickets();
  const {
    teams,
    projects,
    teamsLoading,
    projectsLoading,
    teamsError,
    projectsError,
    fetchProjects,
  } = useLinearResources();

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Fetch projects when team is selected
  useEffect(() => {
    if (selectedTeamId) {
      fetchProjects(selectedTeamId);
      // Reset project selection when team changes
      setSelectedProjectId('');
    } else {
      fetchProjects();
      setSelectedProjectId('');
    }
  }, [selectedTeamId]);
  // Sync ticketsByStage with localStorage
  const [ticketsByStage, setTicketsByStage] = useState<
    Record<string, TicketsResponse>
  >(storedTicketsByStage);

  // Sync ticketsByStage with localStorage when it changes
  useEffect(() => {
    if (Object.keys(ticketsByStage).length > 0) {
      setStoredTicketsByStage(ticketsByStage);
    }
  }, [ticketsByStage, setStoredTicketsByStage]);

  // Load ticketsByStage from localStorage on mount
  useEffect(() => {
    if (Object.keys(storedTicketsByStage).length > 0) {
      setTicketsByStage(storedTicketsByStage);
    }
  }, [storedTicketsByStage]);

  const handleImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await addImages(files);
    // Reset input
    e.target.value = '';
  };

  const clearStorage = () => {
    clearImages();
    clearLocalStorage();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear localStorage before new request
    localStorage.removeItem(STORAGE_KEY);
    setSteps(null);
    setError(null);
    setTicketsByStage({});
    setStoredTicketsByStage({});

    try {
      const result = await generateSteps(projectDescription, images);
      setSteps(result);
    } catch (err) {
      // Error is already handled in useSteps
    }
  };

  const handleGenerateTickets = async (
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
    }> = []
  ) => {
    try {
      const ticketsResponse = await generateTickets(
        projectDescription,
        stagesJson,
        targetStage,
        images,
        previousStagesTickets
      );
      setTicketsByStage((prev) => ({
        ...prev,
        [targetStage]: ticketsResponse,
      }));
    } catch (err) {
      // Error is already handled in useTickets
    }
  };

  const showClearButton = !!(
    projectDescription ||
    steps ||
    images.length > 0 ||
    Object.keys(ticketsByStage).length > 0
  );

  return (
    <div className="container">
      <Header showClearButton={showClearButton} onClear={clearStorage} />

      <main>
        <form onSubmit={handleSubmit} className="form">
          <ProjectDescriptionForm
            value={projectDescription}
            onChange={setProjectDescription}
          />

          <ImageUpload
            images={images}
            onAdd={handleImageAdd}
            onRemove={removeImage}
            onDescriptionChange={updateImageDescription}
          />

          <button
            type="submit"
            disabled={loading || !projectDescription.trim()}
          >
            {loading ? 'Generating Steps...' : 'Generate Steps'}
          </button>
        </form>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {ticketsError && (
          <div className="error">
            <strong>Tickets Error:</strong> {ticketsError}
          </div>
        )}

        {steps && (
          <>
            <div className="linear-context" style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Linear Context</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label htmlFor="linear-team">Team *</label>
                  <select
                    id="linear-team"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    disabled={teamsLoading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      cursor: teamsLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <option value="">Select a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.key})
                      </option>
                    ))}
                  </select>
                  {teamsError && (
                    <p style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '5px' }}>
                      {teamsError}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="linear-project">Project (optional)</label>
                  <select
                    id="linear-project"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={projectsLoading || !selectedTeamId}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      cursor: projectsLoading || !selectedTeamId ? 'not-allowed' : 'pointer',
                      opacity: !selectedTeamId ? 0.6 : 1,
                    }}
                  >
                    <option value="">No project (optional)</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {projectsError && (
                    <p style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '5px' }}>
                      {projectsError}
                    </p>
                  )}
                  {!selectedTeamId && (
                    <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '5px', fontStyle: 'italic' }}>
                      Select a team first to load projects
                    </p>
                  )}
                </div>
              </div>
            </div>

            <StepsOutput
              steps={steps}
              projectDescription={projectDescription}
              images={images}
              onGenerateTickets={handleGenerateTickets}
              loadingStageId={ticketsLoading}
              ticketsByStage={ticketsByStage}
              selectedTeamId={selectedTeamId}
              selectedProjectId={selectedProjectId}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
