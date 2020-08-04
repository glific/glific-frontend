import React, { useState, useEffect } from 'react';
import { Editor, RichUtils, Modifier } from 'draft-js';
import { InputAdornment, IconButton } from '@material-ui/core';
import { convertToWhatsApp } from '../../../../common/RichEditor';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { Input } from '../Input/Input';
import { EditorState, ContentState } from 'draft-js';
import Styles from './EmojiInput.module.css';

export const EmojiInput = ({ field: { onChange, ...rest }, ...props }: any) => {
  const ref = React.useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [edit, setEdit] = useState(true);

  useEffect(() => {
    if (edit && rest.value !== '') {
      setEditorState(EditorState.createWithContent(ContentState.createFromText(rest.value)));
      setEdit(false);
    }
  }, [rest.value]);

  const handleKeyCommand = (command: any, editorState: any) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const updateValue = (emoji: any) => {
    const contentState = editorState.getCurrentContent();
    const length = editorState.getCurrentContent().getPlainText().length;
    let selectionState: any = editorState.getSelection();
    selectionState = selectionState.set('focusOffset', length);
    selectionState = selectionState.set('anchorOffset', length);
    const ModifiedContent = Modifier.insertText(contentState, selectionState, emoji.native);
    const myeditorState = EditorState.createWithContent(ModifiedContent);
    setEditorState(myeditorState);
    const content = myeditorState.getCurrentContent().getPlainText();
    const event = { target: { name: rest.name, value: content } };
    onChange(event);
  };

  const InputWrapper = (props: any) => {
    const { component: Component, inputRef, ...other } = props;
    React.useImperativeHandle(inputRef, () => ({
      focus: () => {
        const current: any = ref.current;
        if (current) current.focus();
      },
    }));
    return <Component ref={ref} {...other} />;
  };

  const inputComponent = InputWrapper;
  const inputProps = {
    component: Editor,
    editorState: editorState,
    onChange: setEditorState,
    handleKeyCommand: handleKeyCommand,
  };

  const editor = { inputComponent: inputComponent, inputProps: inputProps };

  const emojiPicker = showEmojiPicker ? (
    <Picker
      data-testid="emoji-container"
      title="Pick your emoji…"
      emoji="point_up"
      style={{ position: 'absolute', top: '10px', right: '0px', zIndex: 2 }}
      onSelect={updateValue}
    />
  ) : null;

  const draftJsChange = (editorState: any) => {
    setEdit(false);
    const content = convertToWhatsApp(editorState);
    let eventState = {
      target: { name: rest.name, value: content },
    };
    onChange(eventState);
  };

  const picker = (
    <InputAdornment position="end" className={Styles.EmojiPosition}>
      <IconButton
        color="primary"
        aria-label="pick emoji"
        component="span"
        className={Styles.Emoji}
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        <span role="img" aria-label="pick emoji" data-testid="emoji-picker">
          😀
        </span>
      </IconButton>

      {emojiPicker}
    </InputAdornment>
  );

  const input = (
    <Input
      field={{ onChange: draftJsChange, ...rest }}
      {...props}
      editor={editor}
      emojiPicker={picker}
    />
  );

  return input;
};
