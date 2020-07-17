import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Container, Button } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw } from 'draft-js';
import { draftToMarkdown } from 'markdown-draft-js';
import 'draft-js/dist/Draft.css';

import styles from './ChatInput.module.css';

import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';

export interface ChatInputProps {
  onSendMessage(content: string): any;
}

export const ChatInput: React.SFC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const handleChange = (editorState: any) => {
    // Gets markdown equivalent for Draft.js content
    let markdownString = draftToMarkdown(convertToRaw(editorState.getCurrentContent()));

    // Markdown does bold in double asterisks. WhatApp displays bold in single asterisks. Regex replaces ** with *.
    let findDoubleAsterisks = new RegExp(/\*{2}(.+?)\*{2}/g);
    let messageText = markdownString.replace(findDoubleAsterisks, '*$1*');
    setEditorState(editorState);
    setMessage(messageText);
  };

  const handleKeyCommand = (command: string, editorState: any) => {
    // On enter, submit. Otherwise, deal with commands like normal.
    if (command === 'enter') {
      submitMessage();
      return 'handled';
    }
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const keyBindingFn = (e: any) => {
    // Shift-enter is by default supported. Only 'enter' needs to be changed.
    if (e.keyCode === 13 && !e.nativeEvent.shiftKey) {
      return 'enter';
    }
    return getDefaultKeyBinding(e);
  };

  const submitMessage = () => {
    // close emoji picker
    setShowEmojiPicker(false);

    if (!message) return;

    setMessage('');
    setEditorState(() => EditorState.createEmpty());

    if (typeof onSendMessage === 'function') {
      onSendMessage(message);
    }
  };

  let emojiPicker;
  if (showEmojiPicker) {
    emojiPicker = (
      <Picker
        data-testid="emoji-popup"
        title="Pick your emoji…"
        emoji="point_up"
        style={{ position: 'absolute', bottom: '190px', right: '444px' }}
        onSelect={(emoji: any) => setMessage(message + emoji.native)}
      />
    );
  }

  return (
    <Container className={styles.ChatInput}>
      <div className={styles.ChatInputElements}>
        <div className={styles.InputContainer}>
          <Editor
            data-testid="message-input"
            editorState={editorState}
            placeholder="Start typing..."
            onChange={handleChange}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
          />
        </div>
        <div className={styles.EmojiContainer}>
          <IconButton
            data-testid="emoji-picker"
            color="primary"
            aria-label="pick emoji"
            component="span"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <span role="img" aria-label="pick emoji">
              😀
            </span>
          </IconButton>
        </div>
        <div className={styles.SendButtonContainer}>
          <Button
            className={styles.SendButton}
            data-testid="send-button"
            variant="contained"
            color="primary"
            onClick={submitMessage}
            disabled={message.length === 0}
          >
            Send
            <img className={styles.SendIcon} src={sendMessageIcon} alt="Send Message" />
          </Button>
        </div>
      </div>
      {emojiPicker}
    </Container>
  );
};

export default ChatInput;
