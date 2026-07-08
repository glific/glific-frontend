import { t } from 'i18next';

import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

import styles from './AttachmentTypeSelector.module.css';

export interface AttachmentTypeOption {
  id: string;
  label: string;
}

export const attachmentTileMeta: {
  [key: string]: { icon: any; format: string; maxSizeLabel: string; maxSizeMB: number; accept: string };
} = {
  IMAGE: {
    icon: <ImageOutlinedIcon />,
    format: 'JPG, PNG',
    maxSizeLabel: 'Max 5 MB',
    maxSizeMB: 5,
    accept: 'image/*',
  },
  DOCUMENT: {
    icon: <InsertDriveFileOutlinedIcon />,
    format: 'PDF',
    maxSizeLabel: 'Max 16 MB',
    maxSizeMB: 16,
    accept: 'application/pdf',
  },
  VIDEO: {
    icon: <VideocamOutlinedIcon />,
    format: 'MP4',
    maxSizeLabel: 'Max 16 MB',
    maxSizeMB: 16,
    accept: 'video/*',
  },
};

const titleCase = (value: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : value);

export interface AttachmentTypeSelectorProps {
  options: AttachmentTypeOption[];
  value: AttachmentTypeOption | null;
  onChange: (option: AttachmentTypeOption) => void;
  onClear: () => void;
  method: 'url' | 'upload';
  onSelectUrlMethod: () => void;
  onSelectUploadMethod: () => void;
  disabled?: boolean;
  label?: string;
}

export const AttachmentTypeSelector = ({
  options,
  value,
  onChange,
  onClear,
  method,
  onSelectUrlMethod,
  onSelectUploadMethod,
  disabled = false,
  label = t('Attachment Type'),
}: AttachmentTypeSelectorProps) => (
  <>
    <p className={styles.FieldLabel}>{label}</p>
    <div className={styles.TileRow}>
      {options.map((option) => {
        const meta = attachmentTileMeta[option.id];
        return (
          <button
            type="button"
            key={option.id}
            disabled={disabled}
            className={`${styles.Tile} ${value?.id === option.id ? styles.TileSelected : ''}`}
            onClick={() => onChange(option)}
          >
            {meta?.icon && <span className={styles.TileIcon}>{meta.icon}</span>}
            <span className={styles.TileTitle}>{titleCase(option.id)}</span>
            {meta?.format && <span className={styles.TileMeta}>{meta.format}</span>}
            {meta?.maxSizeLabel && <span className={styles.TileMeta}>{meta.maxSizeLabel}</span>}
          </button>
        );
      })}
    </div>
    {value && !disabled ? (
      <button type="button" className={styles.ClearSelectionLink} onClick={onClear}>
        {t('Clear attachment selection')}
      </button>
    ) : null}

    {value ? (
      <>
        <p className={styles.FieldLabel}>{t('How would you like to provide the attachment?')}</p>
        <div className={styles.MethodToggleRow}>
          <button
            type="button"
            disabled={disabled}
            className={`${styles.MethodToggle} ${method === 'url' ? styles.TileSelected : ''}`}
            onClick={onSelectUrlMethod}
          >
            {t('Provide URL')}
          </button>
          <button
            type="button"
            disabled={disabled}
            className={`${styles.MethodToggle} ${method === 'upload' ? styles.TileSelected : ''}`}
            onClick={onSelectUploadMethod}
          >
            {t('Upload File')}
          </button>
        </div>
      </>
    ) : null}
  </>
);

export default AttachmentTypeSelector;
