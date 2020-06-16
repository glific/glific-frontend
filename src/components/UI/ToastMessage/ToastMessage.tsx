import React, { SyntheticEvent } from 'react';
import { Snackbar } from '@material-ui/core';
// import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Alert from '@material-ui/lab/Alert';

interface Props {
  open: boolean;
  severity: Severity;
  message: String;
  // seconds: number;
  handleClose: Function;
}

// Since attribute severity can only have 5 values,
type Severity = 'error' | 'success' | 'info' | 'warning' | undefined;

type CloseButton = (event: SyntheticEvent<Element, Event>) => void;

const ToastMessage: React.SFC<Props> = ({ open, severity, message, handleClose }) => {
  const handleCloseButton = (event: SyntheticEvent<Element, Event>) => {
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
