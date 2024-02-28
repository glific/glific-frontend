import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export interface EmojiPickerProps {
  displayStyle: object;
  onEmojiSelect: Function;
}

export const EmojiPicker = ({ displayStyle, onEmojiSelect }: EmojiPickerProps) => {
  return (
    <div data-testid="emoji-container" style={displayStyle}>
      <Picker data={data} onEmojiSelect={onEmojiSelect} />
    </div>
  );
};

export default EmojiPicker;
