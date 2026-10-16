import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { GuardrailEditorProps } from 'containers/AIEvaluation/types/guardrailType';
import styles from './GuardrailEditor.module.css';

export const GuardrailEditor = ({ summary, toggleTestId, bodyTestId, children }: GuardrailEditorProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.Editor}>
      <button
        type="button"
        className={styles.EditToggle}
        onClick={() => setExpanded((open) => !open)}
        data-testid={toggleTestId}
      >
        <EditOutlinedIcon className={styles.EditIcon} />
        {t('Configure')}
        <span className={styles.EditSummary}>· {summary}</span>
        {expanded ? <ExpandMoreIcon className={styles.EditCaret} /> : <ChevronRightIcon className={styles.EditCaret} />}
      </button>

      {expanded && (
        <div className={styles.EditorBody} data-testid={bodyTestId}>
          {children}
        </div>
      )}
    </div>
  );
};

export default GuardrailEditor;
