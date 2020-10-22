import React, { useState, useEffect, ReactNode } from 'react';
import { DialogBox } from '../DialogBox/DialogBox';
import { Dialog, FormControl, DialogTitle, DialogContent } from '@material-ui/core';
import styles from './MessageDialog.module.css';
import { AutoComplete } from '../Form/AutoComplete/AutoComplete';
import ChatInput from '../../../containers/Chat/ChatMessages/ChatInput/ChatInput';

export interface MessageDialogProps {
  title: string;
}

export const MessageDialog = ({ title }: MessageDialogProps) => {
  return (
    <Dialog
      open={true}
      classes={{
        paper: styles.Dialog,
      }}
    >
      <DialogTitle className={styles.DialogTitle}>{title}</DialogTitle>
      <DialogContent>
        <ChatInput
          onSendMessage={(content: any) => {}}
          handleHeightChange={(height: any) => {}}
          contactStatus=""
          contactBspStatus=""
        />
      </DialogContent>
    </Dialog>
  );
};
