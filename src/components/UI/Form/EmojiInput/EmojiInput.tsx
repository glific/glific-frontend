import { useState } from 'react';
import { InputAdornment, IconButton, ClickAwayListener } from '@mui/material';
import EmojiIcon from 'assets/images/icons/EmojiIcon.svg?react';
import { EmojiPicker } from 'components/UI/EmojiPicker/EmojiPicker';
import { Editor } from './Editor';
import Styles from './EmojiInput.module.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createTextNode, $getSelection, $isRangeSelection } from 'lexical';
import { LexicalWrapper } from 'common/LexicalWrapper';

export interface EmojiInputProps {
  field: any;
  form: any;
  label: string;
  placeholder: string;
  disabled?: boolean;
  rows: number;
  handleChange?: any;
  handleBlur?: any;
  inputProp?: any;
  isEditing?: boolean;
  translation?: string;
}

interface EmojiPickerProps {
  handleClickAway: any;
  showEmojiPicker: any;
  setShowEmojiPicker: any;
}

export const EmojiInput = ({
  field: { value, name, onBlur },
  handleChange,
  handleBlur,
  isEditing = false,
  translation,
  ...props
}: EmojiInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const lexicalChange = (editorState: any) => {
    if (handleChange) {
      handleChange(editorState);
    }
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
    <LexicalWrapper>
      <Editor
        isEditing={isEditing}
        field={{ name, value, onBlur }}
        {...props}
        picker={picker}
        onChange={handleChange}
      />
    </LexicalWrapper>
  );

  return (
    <>
      {translation && <div className={Styles.Translation}>{translation}</div>}
      {input}
    </>
  );
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
            <EmojiIcon />
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
