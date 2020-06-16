import React from 'react';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

interface Props {
  open: boolean;
  severity: Severity;
  message: String;
  handleClose: Function;
}

// Since attribute severity can only have 5 values,
type Severity = 'error' | 'success' | 'info' | 'warning' | undefined;

const ToastMessage: React.SFC<Props> = ({ open, severity, message, handleClose }) => {
  const handleCloseButton = (event?: React.SyntheticEvent) => {
    handleClose(false);
  };
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={open}
      autoHideDuration={4000}
    >
      <Alert severity={severity} onClose={handleCloseButton}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
