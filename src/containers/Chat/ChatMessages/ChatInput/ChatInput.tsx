import React, { useState, useRef } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Container, Button } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
// import WhatsAppEditor from '../../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';
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

export const ChatInput: React.SFC<ChatInputProps> = ({ onSendMessage, handleHeightChange }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const inputEl = useRef('');

  const submitMessage = () => {
    // close emoji picker
    setShowEmojiPicker(false);
    console.log(message);
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

  const handleChange = (editorState: any) => {
    setEditorState(editorState);
    setMessage(convertToWhatsApp(editorState));
    // inputEl.current.focus();
  };

  const handleKeyCommand = (command: string, editorState: any) => {
    // On enter, submit. Otherwise, deal with commands like normal.
    if (command === 'enter') {
      // Convert Draft.js to WhatsApp
      submitMessage();
      const newState = EditorState.createEmpty();
      // setEditorState(newState);
      // setEditorState(EditorState.moveFocusToEnd(newState));
      setEditorState(
        EditorState.moveFocusToEnd(
          EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
        )
      );
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

  return (
    <Container className={styles.ChatInput}>
      <div className={styles.ChatInputElements}>
        <ReactResizeDetector
          handleHeight
          onResize={(width: any, height: any) => handleHeightChange(height - 40)} // 40 is the initial height
        >
          <div className={styles.Editor}>
            {/* <WhatsAppEditor
            data-testid="message-input"
            setMessage={(message: string) => setMessage(message)} // Primarily for message length
            sendMessage={() => submitMessage()}
          /> */}
            {/* <div className={styles.Editor}> */}
            <Editor
              editorState={editorState}
              onChange={handleChange}
              plugins={plugins}
              handleKeyCommand={handleKeyCommand}
              keyBindingFn={keyBindingFn}
              // ref={inputEl}
            />
            {/* <EmojiSuggestions /> */}
            {/* </div> */}
            {/* <StyledEmojiSelectWrapper>
            <GlobalStyleForEmojiSelect />
            <EmojiSelect />
          </StyledEmojiSelectWrapper> */}
            {/* </div> */}
          </div>
        </ReactResizeDetector>
        {/* <div className={styles.EmojiContainer}>
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
        </div> */}
        <div className={styles.Buttons}>
          <EmojiSelect />
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
      </div>
      {emojiPicker}
    </Container>
  );
};

export default ChatInput;
