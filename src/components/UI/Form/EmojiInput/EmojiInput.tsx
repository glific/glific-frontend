import React, { useState, useEffect, forwardRef } from 'react';
import { Editor, RichUtils, Modifier } from 'draft-js';
import { InputAdornment, IconButton } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { Input } from '../Input/Input';
import { EditorState, ContentState } from 'draft-js';
import Styles from './EmojiInput.module.css';

export const EmojiInput = ({ field: { onChange, ...rest }, ...props }: any) => {
  const ref = React.useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleKeyCommand = (command: any, editorState: any) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      props.form.setFieldValue('body', newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const updateValue = (emoji: any) => {
    const contentState = props.form.values.body.getCurrentContent();
    let selectionState: any = props.form.values.body.getSelection();
    const ModifiedContent = Modifier.insertText(contentState, selectionState, emoji.native);
    let myeditorState = EditorState.createWithContent(ModifiedContent);
    myeditorState = EditorState.moveFocusToEnd(myeditorState);
    props.form.setFieldValue('body', myeditorState);
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
    editorState: props.form.values.body,
    handleKeyCommand: handleKeyCommand,
    onBlur: props.form.handleBlur,
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
    props.form.setFieldValue('body', editorState);
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
