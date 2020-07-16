import React, { useState } from 'react';
import { InputAdornment } from '@material-ui/core';
import Smiley from '../../../../assets/images/icons/Smiley.png';
import { Picker } from 'emoji-mart';
import { Input } from '../Input/Input';
import Styles from './EmojiInput.module.css';

export const EmojiInput = (props: any) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const updateValue = (emoji: any) => {
    var event = { target: { name: props.field.name, value: props.field.value + emoji.native } };
    props.field.onChange(event);
  };

  const emojiPicker = showEmojiPicker ? (
    <Picker
      title="Pick your emoji…"
      emoji="point_up"
      style={{ position: 'absolute', top: '10px', right: '0px', zIndex: 2 }}
      onSelect={updateValue}
    />
  ) : null;

  const picker = (
    <InputAdornment position="end" className={Styles.EmojiPosition}>
      <img
        src={Smiley}
        alt="emoji picker"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className={Styles.Emoji}
      />
      {emojiPicker}
    </InputAdornment>
  );

  const input = <Input {...props} emojiPicker={picker} />;

  return input;
};
