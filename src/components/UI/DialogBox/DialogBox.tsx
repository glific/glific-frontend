import React from 'react';
import { Button } from '../Form/Button/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface DialogProps {
  open?: boolean;
  message: String;
  handleCancel: Function;
  handleOK: Function;
  children?: any;
}

export const DialogBox: React.SFC<DialogProps> = ({
  open = true,
  message,
  children,
  handleCancel,
  handleOK,
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
        <DialogTitle id="alert-dialog-title">{message}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{children}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant={'contained'} onClick={handleCancelButton} color="primary">
            Disagree
          </Button>
          <Button onClick={handleOKButton} color="secondary" variant={'contained'}>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
