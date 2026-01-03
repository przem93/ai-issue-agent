import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const STORAGE_KEY = 'ai-issue-agent-data';

// Simple JSON syntax highlighter
const highlightJSON = (json: string): string => {
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
};

interface ImageWithDescription {
  id: string;
  file?: File; // File object (for new uploads)
  preview: string; // Blob URL or base64
  description: string;
  base64?: string; // Base64 for localStorage
  filename?: string; // Filename for localStorage
}

function App() {
  const [projectDescription, setProjectDescription] = useState('');
  const [images, setImages] = useState<ImageWithDescription[]>([]);
  const [steps, setSteps] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProjectDescription(data.projectDescription || '');
        setSteps(data.steps || null);
        
        // Load images from localStorage
        if (data.images && Array.isArray(data.images)) {
          const loadedImages: ImageWithDescription[] = data.images.map(
            (img: { base64: string; description: string; filename: string; id: string }) => ({
              id: img.id || Math.random().toString(36).substring(7),
              preview: img.base64, // Use base64 as preview
              description: img.description || '',
              base64: img.base64,
              filename: img.filename || 'image',
            })
          );
          setImages(loadedImages);
        }
      } catch (err) {
        console.error('Failed to load from localStorage:', err);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (projectDescription || steps || images.length > 0) {
      // Convert images to base64 for storage
      const saveImages = async () => {
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

        const imagesToSave = imagesData.filter((img) => img !== null);

        const data = {
          projectDescription,
          steps,
          images: imagesToSave,
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
          // If storage quota exceeded, try without images
          console.warn('localStorage quota exceeded, saving without images');
          const dataWithoutImages = {
            projectDescription,
            steps,
            images: [],
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithoutImages));
        }
      };

      saveImages();
    }
  }, [projectDescription, steps, images]);

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
    setError(null);
  };

  const handleImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
    // Reset input
    e.target.value = '';
  };

  const handleImageRemove = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image && image.preview && !image.preview.startsWith('data:')) {
        // Only revoke blob URLs, not base64 data URLs
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleImageDescriptionChange = (
    id: string,
    description: string
  ) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, description } : img))
    );
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear localStorage before new request
    localStorage.removeItem(STORAGE_KEY);
    setSteps(null);
    setError(null);
    setLoading(true);

    try {
      // Convert images to base64 (use existing base64 if available)
      const imagesData = await Promise.all(
        images.map(async (img) => {
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
        (img): img is { base64: string; description: string; filename: string } =>
          img !== null
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
        setSteps(JSON.stringify(jsonData, null, 2));
      } catch {
        // If not JSON, use as-is
        setSteps(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>AI Issue Agent</h1>
        <p>Generate actionable steps from your project description</p>
        {(projectDescription || steps || images.length > 0) && (
          <button className="clear-button" onClick={clearStorage}>
            Clear History
          </button>
        )}
      </header>

      <main>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="projectDescription">Project Description</label>
            <textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe your project here... For example: Build a todo app with user authentication and task management"
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="images">Screenshots / Images (optional)</label>
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="file-input"
            />
            {images.length > 0 && (
              <div className="images-preview">
                {images.map((img) => (
                  <div key={img.id} className="image-item">
                    <div className="image-preview-container">
                      <img
                        src={img.preview}
                        alt="Preview"
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => handleImageRemove(img.id)}
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Image description (optional)"
                      value={img.description}
                      onChange={(e) =>
                        handleImageDescriptionChange(img.id, e.target.value)
                      }
                      className="image-description"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

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

        {steps && (
          <div className="steps">
            <div className="steps-header">
              <h2>Generated Steps</h2>
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(steps);
                  alert('Copied to clipboard!');
                }}
              >
                Copy
              </button>
            </div>
            <div className="steps-content">
              <pre
                className="json-output"
                dangerouslySetInnerHTML={{ __html: highlightJSON(steps) }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

