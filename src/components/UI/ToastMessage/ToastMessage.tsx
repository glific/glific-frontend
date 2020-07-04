import React from 'react';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

interface Props {
  open?: boolean;
  severity?: Severity;
  message: String;
  handleClose: Function;
  hideDuration?: number;
}

// Since attribute severity can only have 5 values,
type Severity = 'error' | 'success' | 'info' | 'warning' | undefined;

export const ToastMessage: React.SFC<Props> = ({
  open = true,
  severity = 'success',
  message,
  handleClose,
  hideDuration = 5000,
}) => {
  const handleCloseButton = (event?: React.SyntheticEvent) => {
    handleClose(false);
  };
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={open}
      onClose={handleCloseButton}
      autoHideDuration={hideDuration}
    >
      <Alert severity={severity} onClose={handleCloseButton}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
