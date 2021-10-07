import React, { useState, useMemo, useCallback } from 'react';
import { RichUtils, Modifier, EditorState, ContentState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin from '@draft-js-plugins/mention';
import { InputAdornment, IconButton, ClickAwayListener } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { useTranslation } from 'react-i18next';

import { convertToWhatsApp } from 'common/RichEditor';
import { Input } from '../Input/Input';
import Styles from './EmojiInput.module.css';

export interface EmojiInputProps {
  field: any;
  form: any;
  label: string;
  placeholder: string;
  rows: number;
  handleChange?: any;
  handleBlur?: any;
  getEditorValue?: any;
  inputProp?: any;
}

const getMentionComponentAndPlugin = () => {
  const mentionPlugin = createMentionPlugin({
    theme: Styles,
  });
  const { MentionSuggestions } = mentionPlugin;
  const plugins = [mentionPlugin];
  return { plugins, MentionSuggestions };
};

const customSuggestionsFilter = (searchValue: string, suggestions: Array<any>) => {
  const size = (list: any) => (list.constructor.name === 'List' ? list.size : list.length);

  const get = (obj: any, attr: any) => (obj.get ? obj.get(attr) : obj[attr]);

  const value = searchValue.toLowerCase();
  const filteredSuggestions = suggestions.filter(
    (suggestion) => !value || get(suggestion, 'name').toLowerCase().indexOf(value) > -1
  );

  /**
   * We can restrict no of values from dropdown using this
   * Currently returning all values for give dropdown
   */
  const length = size(filteredSuggestions);
  return filteredSuggestions.slice(0, length);
};

const DraftField = (inputProps: any) => {
  const {
    component: Component,
    editorRef,
    open,
    suggestions,
    onOpenChange,
    onSearchChange,
    ...other
  } = inputProps;

  const { MentionSuggestions, plugins } = useMemo(getMentionComponentAndPlugin, []);

  return (
    <>
      <Component ref={editorRef} editorKey="editor" plugins={plugins} {...other} />
      <MentionSuggestions
        open={open}
        onOpenChange={onOpenChange}
        suggestions={suggestions}
        onSearchChange={onSearchChange}
      />
    </>
  );
};

export const EmojiInput: React.FC<EmojiInputProps> = ({
  field: { onChange, ...rest },
  handleChange,
  getEditorValue,
  handleBlur,
  ...props
}: EmojiInputProps) => {
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
    if (getEditorValue) {
      getEditorValue(editorState);
    } else {
      props.form.setFieldValue(rest.name, editorState);
    }
  };

  const mentions = props.inputProp?.suggestions || [];

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);

  const onOpenChange = (_open: boolean) => {
    setOpen(_open);
  };

  const getSuggestions = useCallback(customSuggestionsFilter, []);

  const onSearchChange = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value, mentions));
  };

  const inputProps = {
    component: Editor,
    editorState: props.form.values[rest.name],
    open,
    suggestions,
    onOpenChange,
    onSearchChange,
    handlePastedText: (text: string, html: string, editorState: EditorState) => {
      const pastedBlocks = ContentState.createFromText(text).getBlockMap();
      const newState = Modifier.replaceWithFragment(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        pastedBlocks
      );
      const newEditorState = EditorState.push(editorState, newState, 'insert-fragment');
      draftJsChange(newEditorState);
      return 'handled';
    },
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
