import { useState, useMemo, forwardRef } from 'react';
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

export const EmojiInput = ({
  field: { value, name, onBlur },
  handleChange,
  getEditorValue,
  handleBlur,
  ...props
}: EmojiInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const lexicalChange = (editorState: any) => {
    if (handleChange) {
      handleChange(editorState);
    }
    if (getEditorValue) {
      getEditorValue(editorState);
    }

    props.form.setFieldValue(name, editorState);
  };

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
