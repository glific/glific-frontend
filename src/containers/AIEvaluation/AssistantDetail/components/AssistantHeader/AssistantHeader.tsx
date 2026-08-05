import { ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/UI/Form/Button/Button';
import { IconButton } from 'components/UI/IconButton/IconButton';
import { copyToClipboard } from 'common/utils';
import CopyIcon from 'assets/images/CopyGreen.svg?react';
import BackIcon from 'assets/images/icons/BackIconFlow.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import styles from './AssistantHeader.module.css';

export interface AssistantHeaderProps {
  name: string;
  assistantId?: string | null;
  isEditingName: boolean;
  nameValue: string;
  savingName?: boolean;
  onNameChange: (value: string) => void;
  onEditName: () => void;
  onSaveName: () => void;
  onCancelName: () => void;
  onBack: () => void;
  actions?: ReactNode;
}

export const AssistantHeader = ({
  name,
  assistantId = null,
  isEditingName,
  nameValue,
  savingName = false,
  onNameChange,
  onEditName,
  onSaveName,
  onCancelName,
  onBack,
  actions,
}: AssistantHeaderProps) => {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  return (
    <div className={styles.PageHeader}>
      <div className={styles.HeaderLeft}>
        <button
          type="button"
          className={styles.BackButton}
          onClick={onBack}
          aria-label={t('Back')}
          data-testid="back-button"
        >
          <BackIcon />
        </button>
        <div className={styles.HeaderText}>
          {isEditingName ? (
            <div className={styles.NameEditRow}>
              <input
                ref={nameInputRef}
                className={styles.NameInput}
                value={nameValue}
                onChange={(event) => onNameChange(event.target.value)}
                data-testid="nameInput"
              />
              <Button variant="contained" onClick={onSaveName} loading={savingName} data-testid="saveNameButton">
                {t('Save')}
              </Button>
              <Button variant="outlined" onClick={onCancelName} data-testid="cancelNameButton">
                {t('Cancel')}
              </Button>
            </div>
          ) : (
            <div className={styles.NameRow}>
              <span className={styles.NameText} data-testid="headerTitle">
                {name}
              </span>
              <IconButton
                size="small"
                className={styles.EditNameButton}
                onClick={onEditName}
                data-testid="editNameButton"
              >
                <EditIcon />
              </IconButton>
            </div>
          )}
          {assistantId && (
            <span
              role="button"
              tabIndex={0}
              className={styles.AssistantId}
              onClick={() => copyToClipboard(assistantId)}
              onKeyDown={() => copyToClipboard(assistantId)}
              data-testid="assistantId"
            >
              <CopyIcon />
              {assistantId}
            </span>
          )}
        </div>
      </div>

      {actions}
    </div>
  );
};

export default AssistantHeader;
