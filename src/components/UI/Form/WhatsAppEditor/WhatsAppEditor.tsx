import React, { useState } from 'react';
import { Picker } from 'emoji-mart';
import { RichUtils, getDefaultKeyBinding, Modifier, EditorState, Editor } from 'draft-js';
import { IconButton, ClickAwayListener } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css';
import ReactResizeDetector from 'react-resize-detector';

import { convertToWhatsApp } from '../../../../common/RichEditor';
import styles from './WhatsAppEditor.module.css';

interface WhatsAppEditorProps {
  handleHeightChange(newHeight: number): void;
  sendMessage(message: string): void;
  editorState: any;
  setEditorState(editorState: any): void;
}

export const WhatsAppEditor: React.SFC<WhatsAppEditorProps> = (props) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleChange = (editorState: any) => {
    props.setEditorState(editorState);
  };

  const handleKeyCommand = (command: string, editorState: any) => {
    // On enter, submit. Otherwise, deal with commands like normal.
    if (command === 'enter') {
      // Convert Draft.js to WhatsApp
      props.sendMessage(convertToWhatsApp(editorState));
      return 'handled';
    }
    if (command === 'underline') {
      return 'handled';
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      props.setEditorState(newState);
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
    const contentState = props.editorState.getCurrentContent();
    const selectionState = props.editorState.getSelection();
    const ModifiedContent = Modifier.insertText(contentState, selectionState, emoji.native);
    const editorState = EditorState.createWithContent(ModifiedContent);
    props.setEditorState(editorState);
  };

  return (
    <>
      <ReactResizeDetector
        data-testid="resizer"
        handleHeight
        onResize={(width: any, height: any) => props.handleHeightChange(height - 40)} // 40 is the initial height
      >
        <div className={styles.Editor}>
          <Editor
            data-testid="editor"
            editorState={props.editorState}
            onChange={handleChange}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
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
              title="Pick your emoji…"
              emoji="point_up"
              style={{ position: 'absolute', bottom: '60px', right: '-150px', zIndex: 100 }}
              onSelect={handleEmoji}
            />
          ) : null}
        </div>
      </ClickAwayListener>
    </>
  );
};

export default WhatsAppEditor;
