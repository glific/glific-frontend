import React from 'react';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import Editor from 'draft-js-plugins-editor';
import { RichUtils, getDefaultKeyBinding } from 'draft-js';
import 'draft-js-emoji-plugin/lib/plugin.css';
import { convertToWhatsApp } from '../../../../common/RichEditor';
import ReactResizeDetector from 'react-resize-detector';
import styles from './WhatsAppEditor.module.css';

const emojiPlugin = createEmojiPlugin({ useNativeArt: true }); // , theme: emojiTheme
const { EmojiSelect } = emojiPlugin;
const plugins = [emojiPlugin];

interface WhatsAppEditorProps {
  handleHeightChange(newHeight: number): void;
  sendMessage(message: string): void;
  editorState: any;
  setEditorState(editorState: any): void;
}

export const WhatsAppEditor: React.SFC<WhatsAppEditorProps> = (props) => {
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
      <div className={styles.EmojiButton}>
        <EmojiSelect aria-label="pick emoji" data-testid="emoji-picker" />
      </div>
    </>
  );
};

export default WhatsAppEditor;
