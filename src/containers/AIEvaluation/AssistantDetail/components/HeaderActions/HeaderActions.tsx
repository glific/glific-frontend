import { useTranslation } from 'react-i18next';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './HeaderActions.module.css';

export interface HeaderActionsProps {
  isDirty: boolean;
  saving?: boolean;
  saveDisabled?: boolean;
  onDiscard: () => void;
  onSave: () => void;
  showPublish?: boolean;
  publishing?: boolean;
  publishDisabled?: boolean;
  onPublish?: () => void;
}

export const HeaderActions = ({
  isDirty,
  saving = false,
  saveDisabled = false,
  onDiscard,
  onSave,
  showPublish = false,
  publishing = false,
  publishDisabled = false,
  onPublish,
}: HeaderActionsProps) => {
  const { t } = useTranslation();

  if (isDirty) {
    return (
      <div className={styles.DirtyActions}>
        <span className={styles.UnsavedPill} data-testid="unsavedChanges">
          <span className={styles.UnsavedDot} />
          {t('Unsaved changes')}
        </span>
        <button type="button" className={styles.DiscardLink} onClick={onDiscard} data-testid="discardButton">
          {t('Discard')}
        </button>
        <Button
          variant="contained"
          color="primary"
          className={styles.PublishButton}
          onClick={onSave}
          loading={saving}
          disabled={saving || saveDisabled}
          data-testid="saveVersionButton"
        >
          {t('Save Version')}
        </Button>
      </div>
    );
  }

  if (!showPublish) return null;

  return (
    <Button
      variant="contained"
      color="primary"
      className={styles.PublishButton}
      onClick={onPublish}
      loading={publishing}
      disabled={publishDisabled}
      data-testid="publishButton"
    >
      {t('Publish & Go Live')}
    </Button>
  );
};

export default HeaderActions;
