import React, { useState } from 'react';
import { Picker } from 'emoji-mart';
import { RichUtils, getDefaultKeyBinding, Modifier, EditorState, Editor } from 'draft-js';
import { IconButton, ClickAwayListener } from '@material-ui/core';
import ReactResizeDetector from 'react-resize-detector';
import { useTranslation } from 'react-i18next';

import { getPlainTextFromEditor } from 'common/RichEditor';
import styles from './WhatsAppEditor.module.css';

interface WhatsAppEditorProps {
  handleHeightChange(newHeight: number): void;
  sendMessage(message: string): void;
  editorState: any;
  setEditorState(editorState: any): void;
  readOnly?: boolean;
}

export const WhatsAppEditor = ({
  setEditorState,
  sendMessage,
  editorState,
  handleHeightChange,
  readOnly = false,
}: WhatsAppEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { t } = useTranslation();

  const handleChange = (editorStateChange: any) => {
    setEditorState(editorStateChange);
  };

  const updateValue = (input: any, isEmoji: boolean = false) => {
    const editorContentState = editorState.getCurrentContent();
    const editorSelectionState: any = editorState.getSelection();
    const ModifiedContent = Modifier.replaceText(
      editorContentState,
      editorSelectionState,
      isEmoji ? input.native : input
    );
    let updatedEditorState = EditorState.push(editorState, ModifiedContent, 'insert-characters');
    if (!isEmoji) {
      const editorSelectionStateMod = updatedEditorState.getSelection();
      const updatedSelection = editorSelectionStateMod.merge({
        anchorOffset: editorSelectionStateMod.getAnchorOffset() - 1,
        focusOffset: editorSelectionStateMod.getFocusOffset() - 1,
      });
      updatedEditorState = EditorState.forceSelection(updatedEditorState, updatedSelection);
    }
    setEditorState(updatedEditorState);
  };

  const handleKeyCommand = (command: string, editorStateChange: any) => {
    // On enter, submit. Otherwise, deal with commands like normal.
    if (command === 'enter') {
      // Convert Draft.js to WhatsApp
      sendMessage(getPlainTextFromEditor(editorStateChange));
      return 'handled';
    }

    if (command === 'underline') {
      return 'handled';
    }

    if (command === 'bold') {
      updateValue('**');
    } else if (command === 'italic') {
      updateValue('__');
    } else {
      const newState = RichUtils.handleKeyCommand(editorStateChange, command);
      if (newState) {
        setEditorState(newState);
        return 'handled';
      }
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
              onSelect={(emoji) => updateValue(emoji, true)}
            />
          ) : null}
        </div>
      </ClickAwayListener>
    </>
  );
};

export default WhatsAppEditor;
