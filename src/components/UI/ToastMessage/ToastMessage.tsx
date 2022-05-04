import React from 'react';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import { ReactComponent as CrossIcon } from 'assets/images/icons/Cross.svg';
import styles from './ToastMessage.module.css';

// Since attribute severity can only have 5 values,
type Severity = 'error' | 'success' | 'info' | 'warning' | undefined;

interface ToastMessageProps {
  open?: boolean;
  severity?: Severity;
  message: String;
  handleClose: Function;
  hideDuration?: number | null;
}

export const ToastMessage = ({
  open = true,
  severity = 'success',
  message,
  handleClose,
  hideDuration = 5000,
}: ToastMessageProps) => {
  const handleCloseButton = () => {
    handleClose(false);
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      classes={{ anchorOriginTopCenter: styles.SnackBar }}
      open={open}
      onClose={handleCloseButton}
      autoHideDuration={hideDuration}
    >
      <Alert
        severity={severity}
        icon={false}
        action={<CrossIcon onClick={handleCloseButton} data-testid="crossIcon" />}
        classes={{
          standardSuccess: styles.Success,
          standardWarning: styles.Warning,
          action: styles.Action,
          message: styles.Message,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
