import React from 'react';
import { Snackbar, Button, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
// import Alert from '@material-ui/lab/Alert';

interface Props {
  open: boolean;
  severity: Severity;
  message: String;
  seconds: number;
  handleClose: Function;
}

// Since attribute severity can only have 5 values,
type Severity = 'error' | 'success' | 'info' | 'warning' | undefined;

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ToastMessage: React.SFC<Props> = ({ open, severity, message, seconds, handleClose }) => {
  const handleCloseButton = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    handleClose();
  };
  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        autoHideDuration={seconds}
        onClose={handleCloseButton}
      >
        <Alert onClose={handleCloseButton} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ToastMessage;
