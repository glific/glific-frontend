import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './UnsavedChangesDialogs.module.css';

interface WarningDialogProps {
  title: string;
  subtitle: string;
  buttonOk: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const WarningDialog = ({ title, subtitle, buttonOk, onConfirm, onCancel }: WarningDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <DialogBox
      title={title}
      handleCancel={onCancel}
      handleOk={onConfirm}
      buttonOk={buttonOk}
      buttonCancel={t('Keep editing')}
      alignButtons="center"
      colorOk="warning"
    >
      <div className={styles.DiscardSubtitle}>{subtitle}</div>
      <div className={styles.DiscardWarning}>{t('Any edits made since your last save will be lost.')}</div>
    </DialogBox>
  );
};

export interface DiscardDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/** shown by the Discard link — reverts the page to the last saved version */
export const DiscardDialog = ({ onConfirm, onCancel }: DiscardDialogProps) => {
  const { t } = useTranslation();

  return (
    <WarningDialog
      title={t('Discard unsaved changes?')}
      subtitle={t(
        "Reverts the prompt, model, settings and knowledge base back to what they were before you started editing. This can't be undone."
      )}
      buttonOk={t('Discard changes')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export interface LeaveDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/** shown when navigating away with unsaved changes */
export const LeaveDialog = ({ onConfirm, onCancel }: LeaveDialogProps) => {
  const { t } = useTranslation();

  return (
    <WarningDialog
      title={t('Leave without saving?')}
      subtitle={t('Your changes have not been saved as a version yet.')}
      buttonOk={t('Leave')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
