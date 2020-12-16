import React, { ReactNode } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import styles from './DialogBox.module.css';

import { Button } from '../Form/Button/Button';

export interface DialogProps {
  open?: boolean;
  title: string;
  handleOk?: Function;
  handleCancel: Function;
  children?: ReactNode;
  buttonOk?: string;
  buttonCancel?: string;
  titleAlign?: string;
  colorOk?: 'inherit' | 'primary' | 'secondary' | 'default' | undefined;
  colorCancel?: 'inherit' | 'primary' | 'secondary' | 'default' | undefined;
  alignButtons?: string;
  skipCancel?: boolean;
  skipOk?: boolean;
  contentText?: string;
}

export const DialogBox: React.SFC<DialogProps> = ({
  open = true,
  title,
  handleOk = () => {},
  handleCancel,
  children,
  buttonOk = 'Confirm',
  buttonCancel = 'Cancel',
  colorOk = 'primary',
  colorCancel = 'default',
  alignButtons = 'left',
  titleAlign = 'center',
  skipCancel = false,
  skipOk = false,
  contentText,
}) => {
  const handleCancelButton = () => {
    handleCancel();
  };

  const handleOKButton = () => {
    handleOk();
  };

  let cancelButtonDisplay = null;
  if (!skipCancel) {
    cancelButtonDisplay = (
      <Button
        variant="contained"
        onClick={handleCancelButton}
        color={colorCancel}
        data-testid="cancel-button"
      >
        {buttonCancel}
      </Button>
    );
  }

  let titleStyle = styles.DialogTitleCenter;
  if (titleAlign === 'left') {
    titleStyle = styles.DialogTitleLeft;
  }

  let okButtonDisplay = null;
  if (!skipOk) {
    okButtonDisplay = (
      <Button onClick={handleOKButton} color={colorOk} variant="contained" data-testid="ok-button">
        {buttonOk}
      </Button>
    );
  }
  let dialogActionStyle = styles.DialogActions;
  if (alignButtons === 'center') {
    dialogActionStyle = styles.DialogActionsCenter;
  }
  return (
    <div>
      <Dialog
        data-testid="dialogBox"
        open={open}
        classes={{
          container: styles.Dialogbox,
          paper: styles.DialogboxPaper,
          scrollPaper: styles.ScrollPaper,
        }}
        onClose={handleCancelButton}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className={titleStyle} data-testid="dialogTitle">
          {title}
        </DialogTitle>
        <DialogContent>
          {contentText ? (
            <DialogContentText id="alert-dialog-description">{contentText}</DialogContentText>
          ) : null}
          {children}
        </DialogContent>
        <DialogActions className={dialogActionStyle}>
          {okButtonDisplay}
          {cancelButtonDisplay}
        </DialogActions>
      </Dialog>
    </div>
  );
};
