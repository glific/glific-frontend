import React, { useState } from 'react';
import Editor from 'draft-js-plugins-editor';
import { RichUtils, getDefaultKeyBinding } from 'draft-js';
import { convertToWhatsApp } from '../../../../common/RichEditor';
import ReactResizeDetector from 'react-resize-detector';
import styles from './WhatsAppEditor.module.css';
import { IconButton, ClickAwayListener } from '@material-ui/core';

// Emoji mart <-> DraftJS imports
import createEmojiMartPlugin from 'draft-js-emoji-mart-plugin';
import data from 'emoji-mart/data/apple.json';
import 'emoji-mart/css/emoji-mart.css';
const emojiMartPlugin = createEmojiMartPlugin({
  data,
  set: 'apple',
});
const { Picker } = emojiMartPlugin;
const plugins = [emojiMartPlugin];

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
            plugins={plugins}
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
            />
          ) : null}
        </div>
      </ClickAwayListener>
    </>
  );
};

export default WhatsAppEditor;
