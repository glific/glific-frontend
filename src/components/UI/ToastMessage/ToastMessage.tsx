import React from 'react';
import { Snackbar, SnackbarOrigin } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

interface Props {
  open?: boolean;
  severity?: Severity;
  message: String;
  handleClose: Function;
  vertical: SnackbarOrigin['vertical'];
  horizontal: SnackbarOrigin['horizontal'];
}

// Since attribute severity can only have 5 values,
type Severity = 'error' | 'success' | 'info' | 'warning' | undefined;

export const ToastMessage: React.SFC<Props> = ({
  open = true,
  severity = 'success',
  message,
  handleClose,
  vertical = 'bottom',
  horizontal = 'left',
}) => {
  const handleCloseButton = (event?: React.SyntheticEvent) => {
    handleClose(false);
  };
  return (
    <Snackbar
      anchorOrigin={{
        vertical: vertical,
        horizontal: horizontal,
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
