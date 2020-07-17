import React, { useState } from 'react';
import { InputAdornment, IconButton } from '@material-ui/core';

import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
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
      data-testid="emoji-container"
      title="Pick your emoji…"
      emoji="point_up"
      style={{ position: 'absolute', top: '10px', right: '0px', zIndex: 2 }}
      onSelect={updateValue}
    />
  ) : null;

  const picker = (
    <InputAdornment position="end" className={Styles.EmojiPosition}>
      <IconButton
        data-testid="emoji-picker"
        color="primary"
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
  );

  const input = <Input {...props} emojiPicker={picker} />;

  return input;
};
