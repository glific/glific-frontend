import React from 'react';
import { Button } from '../Form/Button/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface DialogProps {
  open?: boolean;
  title: string;
  handleCancel: Function;
  handleOK: Function;
  children?: any;
  discard?: string;
  confirm?: string;
}

export const DialogBox: React.SFC<DialogProps> = ({
  open = true,
  title,
  handleCancel,
  handleOK,
  children,
  discard = 'Cancel',
  confirm = 'Confirm',
}) => {
  const handleCancelButton = () => {
    handleCancel();
  };

  const handleOKButton = () => {
    handleOK();
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleCancelButton}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{children}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant={'contained'} onClick={handleCancelButton} color="primary">
            {discard}
          </Button>
          <Button onClick={handleOKButton} color="secondary" variant={'contained'}>
            {confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
