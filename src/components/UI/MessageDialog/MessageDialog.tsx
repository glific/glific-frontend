import { Dialog, DialogContent } from '@material-ui/core';

import { ReactComponent as CrossDarkIcon } from 'assets/images/icons/CrossDark.svg';
import ChatInput from 'containers/Chat/ChatMessages/ChatInput/ChatInput';
import styles from './MessageDialog.module.css';

export interface MessageDialogProps {
  title: string;
  onSendMessage: any;
  handleClose: any;
}

export const MessageDialog = ({ title, onSendMessage, handleClose }: MessageDialogProps) => (
  <Dialog
    open
    classes={{
      paper: styles.Dialog,
    }}
  >
    <DialogContent className={styles.DialogContent}>
      <div className={styles.DialogTitle} data-testid="title">
        {title}
      </div>
      <ChatInput
        onSendMessage={onSendMessage}
        handleHeightChange={() => {}}
        contactStatus=""
        contactBspStatus="SESSION_AND_HSM"
        additionalStyle={styles.ChatInput}
      />
      <CrossDarkIcon className={styles.CloseIcon} onClick={handleClose} data-testid="closeButton" />
    </DialogContent>
  </Dialog>
);
