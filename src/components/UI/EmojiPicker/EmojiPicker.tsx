import React, { useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import { Picker } from 'emoji-mart';

export const EmojiPicker = (props: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const executedRef = useRef(false);

  const { displayStyle } = props;
  useEffect(() => {
    // this is workaround to fix issue with duplicate emoji picker
    // https://github.com/missive/emoji-mart/issues/617
    if (executedRef.current) return;
    // eslint-disable-next-line no-new
    new Picker({ ...props, data, ref });
    executedRef.current = true;
  }, []);

  return <div data-testid="emoji-container" ref={ref} style={displayStyle} />;
};

export default EmojiPicker;
