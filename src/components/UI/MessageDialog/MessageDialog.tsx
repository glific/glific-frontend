import { Dialog, DialogContent } from '@mui/material';

import CrossDarkIcon from 'assets/images/icons/CrossDark.svg?react';
import ChatInput from 'containers/Chat/ChatMessages/ChatInput/ChatInput';
import styles from './MessageDialog.module.css';
import { LexicalWrapper } from 'common/LexicalWrapper';

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
      <LexicalWrapper>
        <ChatInput
          onSendMessage={onSendMessage}
          contactStatus=""
          contactBspStatus="SESSION_AND_HSM"
          additionalStyle={styles.ChatInput}
        />
      </LexicalWrapper>
      <CrossDarkIcon className={styles.CloseIcon} onClick={handleClose} data-testid="closeButton" />
    </DialogContent>
  </Dialog>
);
