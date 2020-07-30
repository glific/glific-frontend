import React, { useState } from 'react';
import { Container, Button } from '@material-ui/core';
import WhatsAppEditor from '../../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';
import styles from './ChatInput.module.css';
import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';
import { EditorState, ContentState } from 'draft-js';
import { convertToWhatsApp } from '../../../../common/RichEditor';

export interface ChatInputProps {
  onSendMessage(content: string): any;
  handleHeightChange(newHeight: number): void;
}

export const ChatInput: React.SFC<ChatInputProps> = (props) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const submitMessage = (message: string) => {
    if (!message) return;

    // Resetting the EditorState
    setEditorState(
      EditorState.moveFocusToEnd(
        EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
      )
    );

    if (typeof props.onSendMessage === 'function') {
      props.onSendMessage(message);
    }
  };

  return (
    <Container className={styles.ChatInput}>
      <div className={styles.ChatInputElements}>
        <WhatsAppEditor
          data-testid="message-input"
          editorState={editorState}
          setEditorState={setEditorState}
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
            onClick={() => submitMessage(convertToWhatsApp(editorState))}
            disabled={!editorState.getCurrentContent().hasText()}
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
