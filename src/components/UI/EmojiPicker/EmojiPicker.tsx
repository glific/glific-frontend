import React, { useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import { Picker } from 'emoji-mart';

export const EmojiPicker = (props: any) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line no-new
    new Picker({ ...props, data, ref });
  }, []);

  return <div ref={ref} />;
};

export default EmojiPicker;
