import React, { useState, useEffect, createRef } from 'react';
import { TextField } from '@material-ui/core';
import { ReactComponent as Icon } from '../../../../assets/images/icons/GreenTick.svg';

import styles from './InlineInput.module.css';

export interface InlineInputProps {
  value: string;
  label?: string;
  closeModal: any;
  callback: any;
}

export const InlineInput: React.SFC<InlineInputProps> = ({
  value,
  closeModal,
  callback,
  label = 'Input',
}) => {
  const [inputVal, setInputVal] = useState(value);
  const [isError, setIsError] = useState(false);
  const containerRef: any = createRef();

  const handleCallback = () => {
    if (inputVal) {
      callback(inputVal);
    } else {
      setIsError(true);
    }
  };

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
    <Icon onClick={handleCallback} className={styles.Icon} title="Save" data-testid="save-button" />
  );

  return (
    <div ref={containerRef} onBlur={handleClose}>
      <TextField
        variant="outlined"
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
      {isError ? <p className={styles.ErrorText}>Required</p> : null}
    </div>
  );
};
