import React, { useState, useRef } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Container, Button } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import WhatsAppEditor from '../../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';
import Editor from 'draft-js-plugins-editor';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import defaultTheme from 'draft-js-emoji-plugin';
// import editorStyles from './editorStyles.css';
import { EditorState, ContentState, RichUtils, getDefaultKeyBinding } from 'draft-js';
import styles from './ChatInput.module.css';
import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';
import 'draft-js-emoji-plugin/lib/plugin.css';
import { convertToWhatsApp } from '../../../../common/RichEditor';
import { StyledEmojiSelectWrapper, GlobalStyleForEmojiSelect } from './draftJsPluginBaseStyles';
import ReactResizeDetector from 'react-resize-detector';

export interface ChatInputProps {
  onSendMessage(content: string): any;
  handleHeightChange(newHeight: number): void;
}

// defaultTheme.emojiSelectPopover = defaultTheme.emojiSelectPopover + ' hi-there';

const emojiTheme = {
  emojiSelectPopover: styles.EmojiSelector,
};

const emojiPlugin = createEmojiPlugin({ useNativeArt: true }); // , theme: emojiTheme
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
const plugins = [emojiPlugin];

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
