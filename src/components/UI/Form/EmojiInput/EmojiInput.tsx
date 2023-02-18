import React, { useState, useMemo, useCallback, forwardRef } from 'react';
import { RichUtils, Modifier, EditorState, ContentState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin from '@draft-js-plugins/mention';
import { InputAdornment, IconButton, ClickAwayListener } from '@mui/material';

import { getPlainTextFromEditor } from 'common/RichEditor';
import { EmojiPicker } from 'components/UI/EmojiPicker/EmojiPicker';
import { Input } from '../Input/Input';
import Styles from './EmojiInput.module.css';

export interface EmojiInputProps {
  field: any;
  form: any;
  label: string;
  placeholder: string;
  disabled?: boolean;
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

const DraftField = forwardRef((inputProps: any, ref) => {
  const {
    component: Component,
    open,
    suggestions,
    onOpenChange,
    onSearchChange,
    ...other
  } = inputProps;

  const { MentionSuggestions, plugins } = useMemo(getMentionComponentAndPlugin, []);

  return (
    <>
      <Component ref={ref} editorKey="editor" plugins={plugins} {...other} />
      <MentionSuggestions
        open={open}
        onOpenChange={onOpenChange}
        suggestions={suggestions}
        onSearchChange={onSearchChange}
      />
    </>
  );
});

export const EmojiInput = ({
  field: { value, name, onBlur },
  handleChange,
  getEditorValue,
  handleBlur,
  ...props
}: EmojiInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const updateValue = (input: any, isEmoji = false) => {
    const editorContentState = value.getCurrentContent();
    const editorSelectionState: any = value.getSelection();
    const ModifiedContent = Modifier.replaceText(
      editorContentState,
      editorSelectionState,
      isEmoji ? input.native : input
    );
    let updatedEditorState = EditorState.push(value, ModifiedContent, 'insert-characters');
    if (!isEmoji) {
      const editorSelectionStateMod = updatedEditorState.getSelection();
      const updatedSelection = editorSelectionStateMod.merge({
        anchorOffset: editorSelectionStateMod.getAnchorOffset() - 1,
        focusOffset: editorSelectionStateMod.getFocusOffset() - 1,
      });
      updatedEditorState = EditorState.forceSelection(updatedEditorState, updatedSelection);
    }
    props.form.setFieldValue(name, updatedEditorState);
  };

  const handleKeyCommand = (command: any, editorState: any) => {
    if (command === 'underline') {
      return 'handled';
    }
    if (command === 'bold') {
      updateValue('**');
    } else if (command === 'italic') {
      updateValue('__');
    } else {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        props.form.setFieldValue(name, newState);
        return 'handled';
      }
    }
    return 'not-handled';
  };

  const draftJsChange = (editorState: any) => {
    if (handleChange) {
      handleChange(getPlainTextFromEditor(props.form.values.example));
    }
    if (getEditorValue) {
      getEditorValue(editorState);
    }
    props.form.setFieldValue(name, editorState);
  };

  const mentions = props.inputProp?.suggestions || [];

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);

  const onOpenChange = (_open: boolean) => {
    setOpen(_open);
  };

  const getSuggestions = useCallback(customSuggestionsFilter, []);

  const onSearchChange = ({ value: searchValue }: { value: string }) => {
    setSuggestions(getSuggestions(searchValue, mentions));
  };

  const inputProps = {
    component: Editor,
    editorState: value,
    open,
    readOnly: props.disabled,
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
    <EmojiPicker
      onEmojiSelect={(emojiValue: any) => updateValue(emojiValue, true)}
      displayStyle={{ position: 'absolute', top: '10px', right: '0px', zIndex: 2 }}
    />
  ) : (
    ''
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

  const input = (
    <Input field={{ name, value, onBlur }} {...props} editor={editor} emojiPicker={picker} />
  );

  return input;
};
