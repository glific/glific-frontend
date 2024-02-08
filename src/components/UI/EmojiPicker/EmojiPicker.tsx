import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  LexicalCommand,
  createCommand,
} from 'lexical';
import { useEffect } from 'react';

export interface EmojiPickerProps {
  displayStyle: object;
  onEmojiSelect: Function;
}

export const EmojiPicker = ({ displayStyle, onEmojiSelect }: EmojiPickerProps) => {
  const [editor] = useLexicalComposerContext();

  return (
    <div data-testid="emoji-container" style={displayStyle}>
      <Picker
        data={data}
        onEmojiSelect={(emoji: any) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertNodes([$createTextNode(emoji.native)]);
            }
          });
        }}
      />
    </div>
  );
};

export default EmojiPicker;
