import React, { ReactNode } from 'react';
import { Button } from '../Form/Button/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import styles from './DialogBox.module.css';

interface DialogProps {
  open?: boolean;
  title: string;
  handleOk: Function;
  handleCancel: Function;
  children?: ReactNode;
  buttonOk?: string;
  buttonCancel?: string;
  colorOk?: string;
  colorCancel?: string;
}

export const DialogBox: React.SFC<DialogProps> = ({
  open = true,
  title,
  handleOk,
  handleCancel,
  children,
  buttonOk = 'Confirm',
  buttonCancel = 'Cancel',
  colorOk = 'primary',
  colorCancel = 'default',
}) => {
  const handleCancelButton = () => {
    handleCancel();
  };

  const handleOKButton = () => {
    handleOk();
  };

  return (
    <div>
      <Dialog
        data-testid="dialogBox"
        open={open}
        classes={{
          container: styles.Dialogbox,
          paper: styles.DialogboxPaper,
          scrollPaper: styles.ScrollPaper,
        }}
        onClose={handleCancelButton}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className={styles.DialogTitle}>
          {title}
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <Button
            onClick={handleOKButton}
            color={colorOk}
            variant={'contained'}
            data-testid="ok-button"
          >
            {buttonOk}
          </Button>
          <Button
            variant={'contained'}
            onClick={handleCancelButton}
            color={colorCancel}
            data-testid="cancel-button"
          >
            {buttonCancel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
