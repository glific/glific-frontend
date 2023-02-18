import React, { useState, useEffect, createRef } from 'react';
import { TextField } from '@mui/material';

import { ReactComponent as Icon } from 'assets/images/icons/GreenTick.svg';
import styles from './InlineInput.module.css';

export interface InlineInputProps {
  value: string;
  label?: string;
  closeModal: any;
  callback: any;
  error: string | null;
}

export const InlineInput = ({
  value,
  closeModal,
  callback,
  label = 'Input',
  error,
}: InlineInputProps) => {
  const [inputVal, setInputVal] = useState(value);
  const containerRef: any = createRef();

  const handleClose = (e: any) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClose);
    return () => document.removeEventListener('mousedown', handleClose);
  });

  const endAdornment = (
    <Icon
      onClick={() => callback(inputVal)}
      className={styles.Icon}
      title="Save"
      data-testid="save-button"
    />
  );

  return (
    <div ref={containerRef} onBlur={handleClose}>
      <TextField
        variant="outlined"
        data-testid="inline-input"
        value={inputVal}
        label={label}
        fullWidth
        onChange={(event) => setInputVal(event.target.value)}
        InputProps={{
          classes: {
            input: styles.InlineInput,
          },
          endAdornment,
        }}
        autoFocus
      />
      {error ? <p className={styles.ErrorText}>{error}</p> : null}
    </div>
  );
};
