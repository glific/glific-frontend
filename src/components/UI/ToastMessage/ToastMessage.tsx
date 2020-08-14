import React from 'react';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Styles from './ToastMessage.module.css';
import { ReactComponent as CrossIcon } from '../../../assets/images/icons/Cross.svg';

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
      classes={{ anchorOriginTopCenter: Styles.SnackBar }}
      open={open}
      onClose={handleCloseButton}
    >
      <Alert
        severity={severity}
        icon={false}
        action={<CrossIcon onClick={handleCloseButton} data-testid="crossIcon" />}
        classes={{
          standardSuccess: Styles.Success,
          action: Styles.Action,
          message: Styles.Message,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
