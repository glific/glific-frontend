import React, { useState } from 'react';
import { RichUtils, Modifier, EditorState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import { InputAdornment, IconButton, ClickAwayListener } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

import { Input } from '../Input/Input';
import Styles from './EmojiInput.module.css';

export interface EmojiInputProps {
  field: any;
  form: any;
  label: string;
  placeholder: string;
  rows: number;
}

const DraftField = React.forwardRef(function DraftField(inputProps: any, ref: any) {
  const { component: Component, editorRef, ...other } = inputProps;
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef?.current?.focus();
    },
  }));

  return <Component ref={editorRef} {...other} />;
});

export const EmojiInput: React.FC<EmojiInputProps> = ({
  field: { onChange, ...rest },
  ...props
}: EmojiInputProps) => {
  const inputRef = React.useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleKeyCommand = (command: any, editorState: any) => {
    if (command === 'underline') {
      return 'handled';
    }
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      props.form.setFieldValue(rest.name, newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const updateValue = (emoji: any) => {
    const editorContentState = props.form.values[rest.name].getCurrentContent();
    const editorSelectionState: any = props.form.values[rest.name].getSelection();
    const ModifiedContent = Modifier.insertText(
      editorContentState,
      editorSelectionState,
      emoji.native
    );
    let updatedEditorState = EditorState.createWithContent(ModifiedContent);
    updatedEditorState = EditorState.moveFocusToEnd(updatedEditorState);
    props.form.setFieldValue(rest.name, updatedEditorState);
  };

  const draftJsChange = (editorState: any) => {
    props.form.setFieldValue(rest.name, editorState);
  };

  const inputProps = {
    component: Editor,
    editorState: props.form.values[rest.name],
    handleKeyCommand,
    editorRef: inputRef,
    onBlur: props.form.handleBlur,
    onChange: draftJsChange,
  };

  const editor = { inputComponent: DraftField, inputProps };

  const emojiPicker = showEmojiPicker ? (
    <Picker
      data-testid="emoji-container"
      title="Pick your emoji…"
      emoji="point_up"
      style={{ position: 'absolute', top: '10px', right: '0px', zIndex: 2 }}
      onSelect={updateValue}
    />
  ) : (
    <></>
  );

  const handleClickAway = () => {
    setShowEmojiPicker(false);
  };

  const picker = (
    <ClickAwayListener onClickAway={handleClickAway}>
      <InputAdornment position="end" className={Styles.EmojiPosition}>
        <IconButton
          color="primary"
          data-testid="emoji-picker"
          aria-label="pick emoji"
          component="span"
          className={Styles.Emoji}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <span role="img" aria-label="pick emoji">
            😀
          </span>
        </IconButton>

        {emojiPicker}
      </InputAdornment>
    </ClickAwayListener>
  );

  const input = <Input field={{ ...rest }} {...props} editor={editor} emojiPicker={picker} />;

  return input;
};
