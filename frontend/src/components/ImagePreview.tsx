import type { ImageWithDescription } from '../types';

interface ImagePreviewProps {
  image: ImageWithDescription;
  onRemove: (id: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
}

export const ImagePreview = ({
  image,
  onRemove,
  onDescriptionChange,
}: ImagePreviewProps) => {
  return (
    <div className="image-item">
      <div className="image-preview-container">
        <img src={image.preview} alt="Preview" className="image-preview" />
        <button
          type="button"
          className="remove-image-button"
          onClick={() => onRemove(image.id)}
        >
          ×
        </button>
      </div>
      <input
        type="text"
        placeholder="Image description (optional)"
        value={image.description}
        onChange={(e) => onDescriptionChange(image.id, e.target.value)}
        className="image-description"
      />
    </div>
  );
};

