import React, { useState, useEffect, ReactNode } from 'react';
import { DialogBox } from '../DialogBox/DialogBox';
import { Dialog, FormControl, DialogTitle, DialogContent } from '@material-ui/core';
import styles from './MessageDialog.module.css';
import { ReactComponent as CrossDarkIcon } from '../../../assets/images/icons/CrossDark.svg';
import ChatInput from '../../../containers/Chat/ChatMessages/ChatInput/ChatInput';

export interface MessageDialogProps {
  title: string;
  onSendMessage: any;
  handleClose: any;
}

export const MessageDialog = ({ title, onSendMessage, handleClose }: MessageDialogProps) => {
  return (
    <Dialog
      open={true}
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
          handleHeightChange={(height: any) => {}}
          contactStatus=""
          contactBspStatus="SESSION_AND_HSM"
          additionalStyle={styles.ChatInput}
        />
        <CrossDarkIcon
          className={styles.CloseIcon}
          onClick={handleClose}
          data-testid="closeButton"
        />
      </DialogContent>
    </Dialog>
  );
};
