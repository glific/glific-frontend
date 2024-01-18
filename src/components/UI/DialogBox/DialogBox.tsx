import { ReactNode } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './DialogBox.module.css';

export interface DialogProps {
  open?: boolean;
  title: string;
  handleOk?: Function;
  handleCancel?: Function;
  handleMiddle?: Function;
  children?: ReactNode;
  buttonOk?: string;
  buttonCancel?: string;
  titleAlign?: string;
  contentAlign?: string;
  colorOk?: any;
  colorCancel?: any;
  alignButtons?: string;
  skipCancel?: boolean;
  skipOk?: boolean;
  disableOk?: boolean;
  alwaysOntop?: boolean;
  buttonMiddle?: string | null;
  additionalTitleStyles?: string | null;
  buttonOkLoading?: boolean;
}

export const DialogBox = ({
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
  colorCancel = 'secondary',
  alignButtons = 'left',
  titleAlign = 'center',
  contentAlign = 'left',
  skipCancel = false,
  skipOk = false,
  disableOk = false,
  alwaysOntop = false,
  buttonMiddle,
  buttonOkLoading = false,
}: DialogProps) => {
  let cancelButtonDisplay = null;
  if (!skipCancel) {
    cancelButtonDisplay = (
      <Button
        variant="outlined"
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
      <Button
        onClick={() => handleMiddle()}
        color="primary"
        variant="outlined"
        data-testid="middle-button"
      >
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
      slotProps={{
        backdrop: {
          classes: {
            root: styles.BackdropRoot,
          },
        },
      }}
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
      <IconButton aria-label="close" className={styles.CloseIcon} onClick={() => handleCancel()}>
        <CloseIcon />
      </IconButton>
      <DialogContent className={contentStyle} data-testid="dialog-content">
        {children}
      </DialogContent>
      <DialogActions className={dialogActionStyle}>
        {cancelButtonDisplay}
        {middleButtonDisplay}
        {okButtonDisplay}
      </DialogActions>
    </Dialog>
  );
};
