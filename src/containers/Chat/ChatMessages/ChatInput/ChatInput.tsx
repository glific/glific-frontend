import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Container, Button } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import WhatsAppEditor from '../../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';

import styles from './ChatInput.module.css';

import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';

export interface ChatInputProps {
  onSendMessage(content: string): any;
}

export const ChatInput: React.SFC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const submitMessage = () => {
    // close emoji picker
    setShowEmojiPicker(false);

    if (!message) return;
    setMessage('');

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
          <WhatsAppEditor
            data-testid="message-input"
            setMessage={(message: string) => setMessage(message)} // Primarily for message length
            sendMessage={() => submitMessage()}
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
