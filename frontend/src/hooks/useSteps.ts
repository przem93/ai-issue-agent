import { useState } from 'react';

import type { ImageData } from '../types';
import { API_URL } from '../utils/constants';
import { convertImageToBase64 } from '../utils/images';

export const useSteps = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSteps = async (
    projectDescription: string,
    images: Array<{
      base64?: string;
      description: string;
      filename?: string;
      file?: File;
    }>
  ): Promise<string> => {
    setLoading(true);
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

      const response = await fetch(`${API_URL}/api/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectDescription,
          images: validImagesData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();

      // Try to parse as JSON and format it nicely
      try {
        const jsonData = JSON.parse(data);
        return JSON.stringify(jsonData, null, 2);
      } catch {
        // If not JSON, use as-is
        return data;
      }
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
    generateSteps,
    setError,
  };
};

