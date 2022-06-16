import React, { useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import { Picker } from 'emoji-mart';

export const EmojiPicker = (props: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const { displayStyle } = props;
  useEffect(() => {
    // eslint-disable-next-line no-new
    new Picker({ ...props, data, ref });
  }, []);

  return <div data-testid="emoji-container" ref={ref} style={displayStyle} />;
};

export default EmojiPicker;
