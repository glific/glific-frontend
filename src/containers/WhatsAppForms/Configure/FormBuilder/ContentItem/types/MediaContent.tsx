import { useState, useRef } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ContentItem, ContentItemData } from '../../FormBuilder.types';
import styles from './ContentTypes.module.css';
import { Button } from 'components/UI/Form/Button/Button';

interface MediaContentProps {
  data: ContentItemData;
  onUpdate: (updates: Partial<ContentItem>) => void;
  type: string;
}

export const MediaContent = ({ data, onUpdate, type }: MediaContentProps) => {
  const [imageUrl, setImageUrl] = useState(data.text || '');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setError('');
    onUpdate({ data: { ...data, text: url } });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG)');
      return;
    }

    const maxSize = 300 * 1024; // 300KB
    if (file.size > maxSize) {
      setError(`File size must be less than 300KB. Current size: ${Math.round(file.size / 1024)}KB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;

      handleUrlChange(base64String);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    setImageUrl('');
    setError('');
    onUpdate({ data: { ...data, text: '' } });
  };

  return (
    <div className={styles.MediaContentContainer}>
      {!imageUrl ? (
        <>
          <div className={styles.MediaHeader}>
            <h4 className={styles.MediaTitle}>Choose JPG or PNG file</h4>
          </div>
          <div
            className={`${styles.UploadArea} ${isDragging ? styles.UploadAreaDragging : ''} ${
              error ? styles.UploadAreaError : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <CloudUploadIcon className={styles.UploadIcon} />
            <p className={styles.UploadText}>Drag and drop files</p>
            <p className={styles.UploadSubtext}>
              Or{' '}
              <span className={styles.UploadLink} onClick={handleChooseFile}>
                choose file on your device
              </span>
            </p>
          </div>
          {error && (
            <div className={styles.ErrorMessage}>
              <span>⚠</span> {error}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </>
      ) : (
        <div className={styles.ImagePreviewContainer}>
          <img src={imageUrl} alt="Uploaded media" className={styles.PreviewImage} />
        </div>
      )}

      <div className={styles.FileInfo}>
        <div>
          <p>Maximum file size: 300kb</p>
          <p>Acceptable file types: JPEG, PNG</p>
        </div>

        {imageUrl && (
          <Button
            onClick={handleDelete}
            variant="outlined"
            color="secondary"
            size="small"
            className={styles.DeleteButton}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};
