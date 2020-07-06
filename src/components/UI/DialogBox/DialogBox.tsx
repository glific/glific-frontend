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
  handleCancel: Function;
  handleOk: Function;
  children?: ReactNode;
  buttonOk?: string;
  buttonCancel?: string;
}

export const DialogBox: React.SFC<DialogProps> = ({
  open = true,
  title,
  handleCancel,
  handleOk,
  children,
  buttonOk = 'Confirm',
  buttonCancel = 'Cancel',
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
          paper: styles.DialogBox, // class name, e.g. `classes-nesting-label-x`
        }}
        onClose={handleCancelButton}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className={styles.DialogTitle}>
          {title}
        </DialogTitle>
        <DialogContent>{children}</DialogContent>

        <DialogActions className={styles.DialogActions}>
          <Button onClick={handleOKButton} color="primary" variant={'contained'}>
            {buttonOk}
          </Button>
          <Button variant={'contained'} onClick={handleCancelButton} color="secondary">
            {buttonCancel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
