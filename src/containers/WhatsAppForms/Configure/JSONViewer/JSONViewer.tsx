import { useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Screen } from '../FormBuilder/FormBuilder.types';
import { convertFormBuilderToFlowJSON } from '../FormBuilder/FormBuilder.utils';
import styles from './JSONViewer.module.css';

interface JSONViewerProps {
  screens: Screen[];
  onClose: () => void;
}

export const JSONViewer = ({ screens, onClose }: JSONViewerProps) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const flowJSON = useMemo(() => convertFormBuilderToFlowJSON(screens), [screens]);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(flowJSON, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className={styles.JsonViewerContainer}>
      <div className={styles.JsonActions}>
        <div className={styles.Header}>
          <IconButton className={styles.CloseButton} onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
          <span>Form JSON</span>
        </div>
        <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyJSON} size="small">
          {copySuccess ? 'Copied!' : 'Copy JSON'}
        </Button>
      </div>
      <pre data-testid="json-preview" className={styles.JsonCode}>
        {JSON.stringify(flowJSON, null, 2)}
      </pre>
    </div>
  );
};
