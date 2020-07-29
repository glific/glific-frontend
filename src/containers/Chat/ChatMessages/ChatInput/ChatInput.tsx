import React, { useState } from 'react';
import { Container, Button } from '@material-ui/core';
import WhatsAppEditor from '../../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';
import styles from './ChatInput.module.css';
import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';

export interface ChatInputProps {
  onSendMessage(content: string): any;
  handleHeightChange(newHeight: number): void;
}

export const ChatInput: React.SFC<ChatInputProps> = (props) => {
  const [message, setMessage] = useState('');

  const submitMessage = () => {
    if (!message) return;
    setMessage('');

    if (typeof props.onSendMessage === 'function') {
      props.onSendMessage(message);
    }
  };

  return (
    <Container className={styles.ChatInput}>
      <div className={styles.ChatInputElements}>
        <WhatsAppEditor
          data-testid="message-input"
          setMessage={setMessage} // Primarily for message length
          sendMessage={submitMessage}
          handleHeightChange={props.handleHeightChange}
        />
        <div className={styles.SendButtonContainer}>
          <Button
            className={styles.SendButton}
            data-testid="send-button"
            variant="contained"
            color="primary"
            disableElevation
            onClick={submitMessage}
            disabled={message.length === 0}
          >
            Send
            <img className={styles.SendIcon} src={sendMessageIcon} alt="Send Message" />
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default ChatInput;
