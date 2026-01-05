import { useEffect, useState } from 'react';

import type { ImageWithDescription } from '../types';
import { convertImageToBase64 } from '../utils/images';

export const useImages = (initialImages: ImageWithDescription[] = []) => {
  // Initialize with initialImages
  const [images, setImages] = useState<ImageWithDescription[]>(initialImages);

  // Sync with initialImages when they change (e.g., loaded from localStorage)
  useEffect(() => {
    // If initialImages changed and we don't have images, load them
    // This handles the case when images are loaded from localStorage after mount
    if (initialImages.length > 0 && images.length === 0) {
      setImages(initialImages);
    }
  }, [initialImages, images.length]);

  const addImages = async (files: File[]) => {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substring(7);
        const preview = URL.createObjectURL(file);
        const base64 = await convertImageToBase64(file);
        setImages((prev) => [
          ...prev,
          { id, file, preview, description: '', base64, filename: file.name },
        ]);
      }
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image && image.preview && !image.preview.startsWith('data:')) {
        // Only revoke blob URLs, not base64 data URLs
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const updateImageDescription = (id: string, description: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, description } : img))
    );
  };

  const clearImages = () => {
    images.forEach((img) => {
      if (img.preview && !img.preview.startsWith('data:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImages([]);
  };

  return {
    images,
    setImages,
    addImages,
    removeImage,
    updateImageDescription,
    clearImages,
  };
};

