import { useState, useMemo, useCallback, forwardRef } from 'react';
import { RichUtils, Modifier, EditorState, ContentState } from 'draft-js';
import createMentionPlugin from '@draft-js-plugins/mention';
import { InputAdornment, IconButton, ClickAwayListener } from '@mui/material';

import { EmojiPicker } from 'components/UI/EmojiPicker/EmojiPicker';
import { Editor } from 'containers/Template/Editor';
import Styles from './EmojiInput.module.css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { BeautifulMentionNode } from 'lexical-beautiful-mentions';

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

  const lexicalChange = (editorState: any) => {
    if (handleChange) {
      handleChange(editorState);
    }
    if (getEditorValue) {
      getEditorValue(editorState);
    }

    props.form.setFieldValue(name, editorState);
  };

  const mentions = props.inputProp?.suggestions || [];

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

  const emojiStyles = {
    position: 'absolute',
    bottom: '60px',
    right: '-150px',
    zIndex: 100,
  };

  const picker = (
    <ClickAwayListener onClickAway={handleClickAway}>
      <InputAdornment className={Styles.EmojiPosition} position="end">
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

        {showEmojiPicker && <EmojiPicker onEmojiSelect={() => {}} displayStyle={emojiStyles} />}
      </InputAdornment>
    </ClickAwayListener>
  );

  const input = (
    <LexicalComposer
      initialConfig={{
        namespace: 'template-input',
        onError: (error) => console.log(error),
        nodes: [BeautifulMentionNode],
      }}
    >
      <Editor field={{ name, value, onBlur }} {...props} picker={picker} onChange={lexicalChange} />
    </LexicalComposer>
  );

  return input;
};
