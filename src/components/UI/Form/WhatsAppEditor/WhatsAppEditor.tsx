import React, { useState } from 'react';
import { Picker } from 'emoji-mart';
import { RichUtils, getDefaultKeyBinding, Modifier, EditorState, Editor } from 'draft-js';
import { IconButton, ClickAwayListener } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css';
import ReactResizeDetector from 'react-resize-detector';
import { useTranslation } from 'react-i18next';

import { convertToWhatsApp } from 'common/RichEditor';
import styles from './WhatsAppEditor.module.css';

interface WhatsAppEditorProps {
  handleHeightChange(newHeight: number): void;
  sendMessage(message: string): void;
  editorState: any;
  setEditorState(editorState: any): void;
  readOnly?: boolean;
}

export const WhatsAppEditor: React.SFC<WhatsAppEditorProps> = (props) => {
  const { setEditorState, sendMessage, editorState, handleHeightChange, readOnly = false } = props;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { t } = useTranslation();

  const handleChange = (editorStateChange: any) => {
    setEditorState(editorStateChange);
  };

  const handleKeyCommand = (command: string, editorStateChange: any) => {
    // On enter, submit. Otherwise, deal with commands like normal.
    if (command === 'enter') {
      // Convert Draft.js to WhatsApp
      sendMessage(convertToWhatsApp(editorStateChange));
      return 'handled';
    }
    if (command === 'underline') {
      return 'handled';
    }

    const newState = RichUtils.handleKeyCommand(editorStateChange, command);
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

  const handleClickAway = () => {
    setShowEmojiPicker(false);
  };

  const handleEmoji = (emoji: any) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const ModifiedContent = Modifier.insertText(contentState, selectionState, emoji.native);
    const editorStateCopy = EditorState.createWithContent(ModifiedContent);
    setEditorState(editorStateCopy);
  };

  const emojiStyles: any = {
    position: 'absolute',
    bottom: '60px',
    right: '-150px',
    zIndex: 100,
  };

  if (window.innerWidth <= 768) {
    emojiStyles.right = '5%';
  }

  return (
    <>
      <ReactResizeDetector
        data-testid="resizer"
        handleHeight
        onResize={(width: any, height: any) => handleHeightChange(height - 40)} // 40 is the initial height
      >
        <div className={styles.Editor}>
          <Editor
            data-testid="editor"
            editorState={editorState}
            onChange={handleChange}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
            placeholder={t('Type a message...')}
            readOnly={readOnly}
          />
        </div>
      </ReactResizeDetector>
      <ClickAwayListener onClickAway={handleClickAway}>
        <div>
          <div className={styles.EmojiButton}>
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
          {showEmojiPicker ? (
            <Picker
              data-testid="emoji-popup"
              title={t('Pick your emoji…')}
              emoji="point_up"
              style={emojiStyles}
              onSelect={handleEmoji}
            />
          ) : null}
        </div>
      </ClickAwayListener>
    </>
  );
};

export default WhatsAppEditor;
