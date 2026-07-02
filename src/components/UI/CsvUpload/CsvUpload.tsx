import { useTranslation } from 'react-i18next';

import { setNotification } from 'common/notification';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';

import styles from './CsvUpload.module.css';

export interface CsvUploadProps {
  fileName: string;
  onFileSelect: (content: string | ArrayBuffer | null, fileName: string) => void;
  onClear: () => void;
  inputId: string;
  inputTestId?: string;
  sampleUrl: string;
  sampleFileName?: string;
  sampleText: string;
}

export const CsvUpload = ({
  fileName,
  onFileSelect,
  onClear,
  inputId,
  inputTestId,
  sampleUrl,
  sampleFileName = 'sample.csv',
  sampleText,
}: CsvUploadProps) => {
  const { t } = useTranslation();

  const handleFile = (event: any) => {
    const media = event.target.files?.[0];
    if (!media) return;

    if (!media.name.toLowerCase().endsWith('.csv')) {
      setNotification(t('Please upload a valid CSV file'), 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onFileSelect(reader.result, media.name);
    reader.readAsText(media);
  };

  return (
    <div className={styles.UploadContainer}>
      <label className={styles.Upload} htmlFor={inputId}>
        <span className={styles.FileInput}>
          {fileName ? (
            <>
              {fileName}
              <button
                type="button"
                data-testid="cross-icon"
                className={styles.CrossIcon}
                aria-label={t('Remove file')}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onClear();
                }}
              >
                <CrossIcon />
              </button>
            </>
          ) : (
            <span className={styles.UploadFile}>
              <UploadIcon /> {t('Upload File')}
            </span>
          )}
          <input type="file" id={inputId} disabled={!!fileName} data-testid={inputTestId} onChange={handleFile} />
        </span>
      </label>
      <div className={styles.Sample}>
        {sampleText}{' '}
        <a href={sampleUrl} download={sampleFileName}>
          {t('Download Sample')}
        </a>
      </div>
    </div>
  );
};

export default CsvUpload;
