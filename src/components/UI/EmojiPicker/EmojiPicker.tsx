import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export const EmojiPicker = (props: any) => {
  const { displayStyle, onEmojiSelect } = props;
  return (
    <div data-testid="emoji-container" style={displayStyle}>
      <Picker data={data} onEmojiSelect={onEmojiSelect} />
    </div>
  );
};

export default EmojiPicker;
