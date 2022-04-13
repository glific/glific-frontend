import React, { ReactNode } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';

import { Button } from 'components/UI/Form/Button/Button';
import styles from './DialogBox.module.css';

export interface DialogProps {
  open?: boolean;
  title: string | ReactNode;
  handleOk?: Function;
  handleCancel?: Function;
  handleMiddle?: Function;
  children?: ReactNode;
  buttonOk?: string;
  buttonCancel?: string;
  titleAlign?: string;
  contentAlign?: string;
  colorOk?: 'inherit' | 'primary' | 'secondary' | 'default' | undefined;
  colorCancel?: 'inherit' | 'primary' | 'secondary' | 'default' | undefined;
  alignButtons?: string;
  skipCancel?: boolean;
  skipOk?: boolean;
  contentText?: string;
  disableOk?: boolean;
  alwaysOntop?: boolean;
  buttonMiddle?: string | null;
  additionalTitleStyles?: string | null;
  buttonOkLoading?: boolean;
}

export const DialogBox: React.SFC<DialogProps> = ({
  open = true,
  title,
  handleOk = () => {},
  handleCancel = () => {},
  handleMiddle = () => {},
  children,
  additionalTitleStyles,
  buttonOk = 'Confirm',
  buttonCancel = 'Cancel',
  colorOk = 'primary',
  colorCancel = 'default',
  alignButtons = 'left',
  titleAlign = 'center',
  contentAlign = 'left',
  skipCancel = false,
  skipOk = false,
  contentText,
  disableOk = false,
  alwaysOntop = false,
  buttonMiddle,
  buttonOkLoading = false,
}) => {
  let cancelButtonDisplay = null;
  if (!skipCancel) {
    cancelButtonDisplay = (
      <Button
        variant="contained"
        onClick={() => handleCancel()}
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

  if (additionalTitleStyles) {
    titleStyle = [titleStyle, additionalTitleStyles].join(' ');
  }

  let contentStyle = styles.DialogContentLeft;
  if (contentAlign === 'center') {
    contentStyle = styles.DialogContentCenter;
  }

  let middleButtonDisplay;

  if (buttonMiddle) {
    middleButtonDisplay = (
      <Button onClick={() => handleMiddle()} color="primary" variant="outlined">
        {buttonMiddle}
      </Button>
    );
  }

  let okButtonDisplay = null;
  if (!skipOk) {
    okButtonDisplay = (
      <Button
        onClick={() => handleOk()}
        disabled={disableOk}
        color={colorOk}
        variant="contained"
        data-testid="ok-button"
        loading={buttonOkLoading}
      >
        {buttonOk}
      </Button>
    );
  }
  let dialogActionStyle = styles.DialogActions;
  if (alignButtons === 'center') {
    dialogActionStyle = styles.DialogActionsCenter;
  }
  return (
    <Dialog
      data-testid="dialogBox"
      open={open}
      classes={{
        container: styles.Dialogbox,
        paper: styles.DialogboxPaper,
        scrollPaper: styles.ScrollPaper,
        root: alwaysOntop ? styles.DialogboxRoot : '',
      }}
      onClose={() => handleCancel()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" className={titleStyle} data-testid="dialogTitle">
        {title}
      </DialogTitle>
      <DialogContent className={contentStyle}>
        {contentText && (
          <DialogContentText id="alert-dialog-description">{contentText}</DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogActions className={dialogActionStyle}>
        {okButtonDisplay}
        {middleButtonDisplay}
        {cancelButtonDisplay}
      </DialogActions>
    </Dialog>
  );
};
