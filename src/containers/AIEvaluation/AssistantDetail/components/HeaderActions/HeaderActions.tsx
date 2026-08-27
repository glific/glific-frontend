import { useTranslation } from 'react-i18next';
import { Button } from 'components/UI/Form/Button/Button';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
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
  /** why publishing is off — shown on hover, since a greyed-out button explains nothing on its own */
  publishDisabledReason?: string;
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
  publishDisabledReason,
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
        <Button
          variant="outlined"
          className={styles.CloseButton}
          onClick={onDiscard}
          disabled={saving}
          data-testid="discardButton"
        >
          {t('Close')}
        </Button>
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

  const publishButton = (
    <Button
      variant="contained"
      color="primary"
      className={styles.PublishButton}
      onClick={onPublish}
      loading={publishing}
      disabled={publishDisabled}
      data-testid="publishButton"
    >
      {t('Go Live')}
    </Button>
  );

  // a disabled button swallows no pointer events of its own, so the reason has to hang off a
  // wrapper — which is exactly what Tooltip renders around its child
  if (publishDisabled && publishDisabledReason) {
    return (
      <Tooltip title={publishDisabledReason} placement="bottom">
        {publishButton}
      </Tooltip>
    );
  }

  return publishButton;
};
