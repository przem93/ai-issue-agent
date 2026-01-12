import { useEffect, useRef, useState } from 'react';

import type { ImageWithDescription, StoredData, TicketsResponse } from '../types';
import { STORAGE_KEY } from '../utils/constants';
import { convertImageToBase64 } from '../utils/images';

export const useLocalStorage = () => {
  const [projectDescription, setProjectDescription] = useState('');
  const [images, setImages] = useState<ImageWithDescription[]>([]);
  const [steps, setSteps] = useState<string | null>(null);
  const [ticketsByStage, setTicketsByStage] = useState<
    Record<string, TicketsResponse>
  >({});
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const isInitialMount = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: StoredData = JSON.parse(saved);
        setProjectDescription(data.projectDescription || '');
        setSteps(data.steps || null);

        // Load images from localStorage
        if (data.images && Array.isArray(data.images)) {
          const loadedImages: ImageWithDescription[] = data.images.map(
            (img) => ({
              id: img.id || Math.random().toString(36).substring(7),
              preview: img.base64, // Use base64 as preview
              description: img.description || '',
              base64: img.base64,
              filename: img.filename || 'image',
            })
          );
          setImages(loadedImages);
        }

        // Load tickets from localStorage
        if (data.ticketsByStage && typeof data.ticketsByStage === 'object') {
          setTicketsByStage(data.ticketsByStage);
        }

        // Load selected team and project from localStorage
        if (data.selectedTeamId) {
          setSelectedTeamId(data.selectedTeamId);
        }
        if (data.selectedProjectId) {
          setSelectedProjectId(data.selectedProjectId);
        }
      } catch (err) {
        console.error('Failed to load from localStorage:', err);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  // Skip saving on initial mount to avoid overwriting with empty state
  useEffect(() => {
    // Skip save on initial mount (after loading from localStorage)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (
      projectDescription ||
      steps ||
      images.length > 0 ||
      Object.keys(ticketsByStage).length > 0 ||
      selectedTeamId ||
      selectedProjectId
    ) {
      const saveToStorage = async () => {
        // Convert images to base64 for storage
        const imagesData = await Promise.all(
          images.map(async (img) => {
            // If already has base64, use it; otherwise convert
            if (img.base64) {
              return {
                id: img.id,
                base64: img.base64,
                description: img.description,
                filename: img.filename || img.file?.name || 'image',
              };
            }
            if (img.file) {
              const base64 = await convertImageToBase64(img.file);
              return {
                id: img.id,
                base64,
                description: img.description,
                filename: img.file.name,
              };
            }
            return null;
          })
        );

        const imagesToSave = imagesData.filter(
          (img): img is {
            id: string;
            base64: string;
            description: string;
            filename: string;
          } => img !== null
        );

        const data: StoredData = {
          projectDescription,
          steps,
          images: imagesToSave,
          ticketsByStage,
          selectedTeamId: selectedTeamId || undefined,
          selectedProjectId: selectedProjectId || undefined,
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
          // If storage quota exceeded, try without images
          console.warn('localStorage quota exceeded, saving without images');
          const dataWithoutImages: StoredData = {
            projectDescription,
            steps,
            images: [],
            ticketsByStage,
            selectedTeamId: selectedTeamId || undefined,
            selectedProjectId: selectedProjectId || undefined,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithoutImages));
        }
      };

      saveToStorage();
    }
  }, [projectDescription, steps, images, ticketsByStage, selectedTeamId, selectedProjectId]);

  const clearStorage = () => {
    // Revoke blob URLs before clearing
    images.forEach((img) => {
      if (img.preview && !img.preview.startsWith('data:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    localStorage.removeItem(STORAGE_KEY);
    setProjectDescription('');
    setImages([]);
    setSteps(null);
    setTicketsByStage({});
    setSelectedTeamId('');
    setSelectedProjectId('');
  };

  return {
    projectDescription,
    setProjectDescription,
    images,
    setImages,
    steps,
    setSteps,
    ticketsByStage,
    setTicketsByStage,
    selectedTeamId,
    setSelectedTeamId,
    selectedProjectId,
    setSelectedProjectId,
    clearStorage,
  };
};

