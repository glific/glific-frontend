import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Button, IconButton } from '@mui/material';
import { copyToClipboard } from 'common/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Screen } from '../FormBuilder/FormBuilder.types';
import {
  convertFlowJSONToFormBuilder,
  convertFormBuilderToFlowJSON,
  hasFormErrors,
} from '../FormBuilder/FormBuilder.utils';
import {
  convertFlowJSONToFormBuilder,
  convertFormBuilderToFlowJSON,
  hasFormErrors,
} from '../FormBuilder/FormBuilder.utils';
import styles from './JSONViewer.module.css';

interface ValidationResult {
  isValidJson: boolean;
  isValidContent: boolean;
  jsonError: string | null;
  contentError: string | null;
  convertedScreens: Screen[] | null;
}

interface JSONViewerProps {
  screens: Screen[];
  onClose: () => void;
  onScreensChange?: (screens: Screen[]) => void;
}

const validateJSON = (jsonString: string): ValidationResult => {
  const result: ValidationResult = {
    isValidJson: false,
    isValidContent: false,
    jsonError: null,
    contentError: null,
    convertedScreens: null,
  };

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(jsonString);
    result.isValidJson = true;
  } catch (e) {
    result.jsonError = e instanceof Error ? e.message : 'Invalid JSON syntax';
    return result;
  }

  try {
    if (!parsedJson.screens || !Array.isArray(parsedJson.screens)) {
      result.contentError = 'Missing or invalid "screens" array';
      return result;
    }

    if (parsedJson.screens.length === 0) {
      result.contentError = 'Screens array cannot be empty';
      return result;
    }

    const convertedScreens = convertFlowJSONToFormBuilder(parsedJson);

    if (!convertedScreens || convertedScreens.length === 0) {
      result.contentError = 'Failed to parse JSON.';
      return result;
    }

    if (hasFormErrors(convertedScreens)) {
      result.contentError = 'Form has validation errors (missing required fields)';
      result.convertedScreens = convertedScreens;
      return result;
    }

    result.isValidContent = true;
    result.convertedScreens = convertedScreens;
  } catch (e) {
    result.contentError = e instanceof Error ? e.message : 'Failed to convert to form builder format';
  }

  return result;
};

export const JSONViewer = ({ screens, onClose, onScreensChange }: JSONViewerProps) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [validation, setValidation] = useState<ValidationResult>({
    isValidJson: true,
    isValidContent: true,
    jsonError: null,
    contentError: null,
    convertedScreens: null,
  });

  const flowJSON = useMemo(() => convertFormBuilderToFlowJSON(screens), [screens]);

  useEffect(() => {
    setJsonText(JSON.stringify(flowJSON, null, 2));
  }, [flowJSON]);

  useEffect(() => {
    if (!jsonText || !jsonText.trim()) {
      setValidation({
        isValidJson: false,
        isValidContent: false,
        jsonError: 'JSON cannot be empty',
        contentError: null,
        convertedScreens: null,
      });
      return;
    }
    const result = validateJSON(jsonText);
    setValidation(result);
  }, [jsonText]);

  const handleCopyJSON = () => {
    copyToClipboard(jsonText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleJsonChange = useCallback((e: any) => {
    setJsonText(e.target.value);
  }, []);

  const handleApplyChanges = useCallback(() => {
    if (validation.isValidContent && validation.convertedScreens && onScreensChange) {
      onScreensChange(validation.convertedScreens);
    }
  }, [validation, onScreensChange]);

  const isEditable = !!onScreensChange;
  const hasChanges = jsonText !== JSON.stringify(flowJSON, null, 2);

  return (
    <div className={styles.JsonViewerContainer}>
      <div className={styles.JsonActions}>
        <div className={styles.Header}>
          <IconButton className={styles.CloseButton} onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
          <span>Form JSON</span>
        </div>
        <div className={styles.ActionButtons}>
          {isEditable && hasChanges && validation.isValidContent && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyChanges}
              size="small"
              className={styles.ApplyButton}
            >
              Apply Changes
            </Button>
          )}
          <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyJSON} size="small">
            {copySuccess ? 'Copied!' : 'Copy JSON'}
          </Button>
        </div>
      </div>

      {(validation.jsonError || validation.contentError) && (
        <div data-testid="json-error" className={styles.ErrorMessage}>
          {validation.jsonError || validation.contentError}
        </div>
      )}

      <textarea
        data-testid="json-preview"
        className={`${styles.JsonCode} ${!validation.isValidJson ? styles.JsonError : ''}`}
        value={jsonText}
        onChange={handleJsonChange}
        readOnly={!isEditable}
        spellCheck={false}
      />
    </div>
  );
};
