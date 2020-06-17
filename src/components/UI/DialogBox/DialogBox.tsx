import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface DialogProps {
  open?: boolean;
  message: String;
  handleDelete: Function;
  handleClose: Function;
}

const DialogBox: React.SFC<DialogProps> = ({ open = true, message, handleDelete, handleClose }) => {
  const handleCancelButton = () => {
    handleClose();
  };

  const handleOKButton = () => {
    handleDelete();
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
          <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelButton} color="primary">
            Disagree
          </Button>
          <Button onClick={handleOKButton} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DialogBox;
