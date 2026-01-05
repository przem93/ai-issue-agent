import type { ImageWithDescription } from '../types';

import { ImagePreview } from './ImagePreview';

interface ImageUploadProps {
  images: ImageWithDescription[];
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
}

export const ImageUpload = ({
  images,
  onAdd,
  onRemove,
  onDescriptionChange,
}: ImageUploadProps) => {
  return (
    <div className="form-group">
      <label htmlFor="images">Screenshots / Images (optional)</label>
      <input
        type="file"
        id="images"
        accept="image/*"
        multiple
        onChange={onAdd}
        className="file-input"
      />
      {images.length > 0 && (
        <div className="images-preview">
          {images.map((img) => (
            <ImagePreview
              key={img.id}
              image={img}
              onRemove={onRemove}
              onDescriptionChange={onDescriptionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

