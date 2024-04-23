import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import styles from './UploadFile.module.css';

export const UploadFile = () => {
  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  return (
    <Button
      className="Container"
      fullWidth={true}
      component="label"
      role={undefined}
      variant="text"
      tabIndex={-1}
    >
      <div className={styles.Container}>
        <UploadIcon />
        Upload file
        <VisuallyHiddenInput type="file" />
      </div>
    </Button>
  );
};
