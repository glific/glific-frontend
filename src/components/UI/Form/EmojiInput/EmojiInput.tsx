import React, { useState, useCallback } from 'react';
import { RichUtils, Modifier, EditorState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, { defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import { InputAdornment, IconButton, ClickAwayListener } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { useTranslation } from 'react-i18next';

import { Input } from '../Input/Input';
import Styles from './EmojiInput.module.css';
import { convertToWhatsApp } from '../../../../common/RichEditor';

export interface EmojiInputProps {
  field: any;
  form: any;
  label: string;
  placeholder: string;
  rows: number;
  handleChange?: any;
  inputProp?: any;
}

const mentionPlugin = createMentionPlugin();
const { MentionSuggestions } = mentionPlugin;
const plugins = [mentionPlugin];

const DraftField = React.forwardRef((inputProps: any, ref: any) => {
  const {
    component: Component,
    editorRef,
    open,
    suggestions,
    onOpenChange,
    onSearchChange,
    ...other
  } = inputProps;

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef?.current?.focus();
    },
  }));

  return (
    <>
      <Component ref={editorRef} editorKey="editor" plugins={plugins} {...other} />
      <MentionSuggestions
        open={open}
        onOpenChange={onOpenChange}
        suggestions={suggestions}
        onSearchChange={onSearchChange}
        onAddMention={() => {
          // get the mention object selected
        }}
      />
    </>
  );
});

export const EmojiInput: React.FC<EmojiInputProps> = ({
  field: { onChange, ...rest },
  handleChange,
  ...props
}: EmojiInputProps) => {
  const inputRef = React.useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { t } = useTranslation();

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
    if (handleChange) {
      handleChange(convertToWhatsApp(props.form.values.example));
    }
    props.form.setFieldValue(rest.name, editorState);
  };

  const handleBlur = (event: any) => {
    props.form.handleBlur(event);
    /**
     * To get callback on parent since we don't have callback on form
     */
    if (props.inputProp?.onBlur) {
      props.inputProp.onBlur(props.form.values[rest.name]);
    }
  };

  const mentions = props.inputProp?.suggestions || [];

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);

  const onOpenChange = useCallback((_open: boolean) => {
    setOpen(_open);
  }, []);

  const onSearchChange = useCallback(({ value }: { value: string }) => {
    setSuggestions(defaultSuggestionsFilter(value, mentions));
  }, []);

  const inputProps = {
    component: Editor,
    editorState: props.form.values[rest.name],
    editorRef: inputRef,
    open,
    suggestions,
    onOpenChange,
    onSearchChange,
    handleKeyCommand,
    onBlur: handleBlur,
    onChange: draftJsChange,
  };

  const editor = { inputComponent: DraftField, inputProps };

  const emojiPicker = showEmojiPicker ? (
    <Picker
      data-testid="emoji-container"
      title={t('Pick your emoji…')}
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
