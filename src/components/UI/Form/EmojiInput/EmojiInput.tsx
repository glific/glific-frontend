import { useState } from 'react';
import { InputAdornment, IconButton, ClickAwayListener } from '@mui/material';
import { EmojiPicker } from 'components/UI/EmojiPicker/EmojiPicker';
import { Editor } from 'containers/Template/Editor';
import Styles from './EmojiInput.module.css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { BeautifulMentionNode } from 'lexical-beautiful-mentions';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
} from 'lexical';

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

interface EmojiPickerProps {
  handleClickAway: any;
  showEmojiPicker: any;
  setShowEmojiPicker: any;
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

  const picker = (
    <EmojiPickerComponent
      handleClickAway={handleClickAway}
      setShowEmojiPicker={setShowEmojiPicker}
      showEmojiPicker={showEmojiPicker}
    />
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

const EmojiPickerComponent = ({
  showEmojiPicker,
  setShowEmojiPicker,
  handleClickAway,
}: EmojiPickerProps) => {
  const [editor] = useLexicalComposerContext();

  const emojiStyles = {
    position: 'absolute',
    bottom: '60px',
    right: '-150px',
    zIndex: 100,
  };

  return (
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

        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={(emoji: any) => {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  selection.insertNodes([$createTextNode(emoji.native)]);
                }
              });
            }}
            displayStyle={emojiStyles}
          />
        )}
      </InputAdornment>
    </ClickAwayListener>
  );
};
