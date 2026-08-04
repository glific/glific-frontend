import { useTranslation } from 'react-i18next';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './HeaderActions.module.css';

export interface HeaderActionsProps {
  /** anything unsaved anywhere on the page swaps Publish for Discard + Save Version */
  isDirty: boolean;
  saving?: boolean;
  onDiscard: () => void;
  onSave: () => void;
  /** a new assistant has nothing to publish until it has been saved once */
  showPublish?: boolean;
  publishing?: boolean;
  publishDisabled?: boolean;
  onPublish?: () => void;
}

export const HeaderActions = ({
  isDirty,
  saving = false,
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
          {t('unsaved changes')}
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
          disabled={saving}
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
      {t('Publish & go live')}
    </Button>
  );
};

export default HeaderActions;
