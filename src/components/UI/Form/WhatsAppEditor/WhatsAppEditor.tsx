import React, { useState } from 'react';
import { EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';
// import 'draft-js/dist/Draft.css';
import { convertToWhatsApp } from '../../../../common/RichEditor';
import Editor from 'draft-js-plugins-editor';

import createEmojiPlugin from 'draft-js-emoji-plugin';
// import editorStyles from './editorStyles.css'

export interface WhatsAppEditorProps {
  setMessage(message: string): void;
  sendMessage(): void;
}

export const WhatsAppEditor: React.SFC<WhatsAppEditorProps> = (props) => {
  const emojiPlugin = createEmojiPlugin();
  const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
  const plugins = [emojiPlugin];
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const handleChange = (editorState: any) => {
    setEditorState(editorState);
    props.setMessage(convertToWhatsApp(editorState));
  };

  // const handleKeyCommand = (command: string, editorState: any) => {
  //   // On enter, submit. Otherwise, deal with commands like normal.
  //   if (command === 'enter') {
  //     // Convert Draft.js to WhatsApp
  //     props.sendMessage();
  //     const newState = EditorState.createEmpty();
  //     setEditorState(EditorState.moveFocusToEnd(newState));
  //     return 'handled';
  //   }
  //   const newState = RichUtils.handleKeyCommand(editorState, command);
  //   if (newState) {
  //     setEditorState(newState);
  //     return 'handled';
  //   }
  //   return 'not-handled';
  // };

  // const keyBindingFn = (e: any) => {
  //   // Shift-enter is by default supported. Only 'enter' needs to be changed.
  //   if (e.keyCode === 13 && !e.nativeEvent.shiftKey) {
  //     return 'enter';
  //   }
  //   return getDefaultKeyBinding(e);
  // };

  return (
    // <Editor
    //   editorState={editorState}
    //   placeholder="Start typing..."
    //   onChange={handleChange}
    //   handleKeyCommand={handleKeyCommand}
    //   keyBindingFn={keyBindingFn}
    // />
    <>
      <Editor editorState={editorState} onChange={handleChange} plugins={plugins} />
      <EmojiSuggestions />
      <div>{/* <EmojiSelect /> */}</div>
    </>
  );
};

export default WhatsAppEditor;
