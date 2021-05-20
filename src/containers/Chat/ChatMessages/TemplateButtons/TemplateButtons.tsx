import React from 'react';
import { Button } from '@material-ui/core';

import styles from './TemplateButtons.module.css';

interface TemplateButtonProps {
  template: Array<string>;
  callbackTemplateButtonClick?: any;
}

export const TemplateButtons: React.SFC<TemplateButtonProps> = ({
  template,
  callbackTemplateButtonClick = () => null,
}) => {
  const handleButtonClick = (type: string, value: string) => {
    if (type === 'call-to-action') {
      if (value) window.open(value, '_blank');
    } else {
      callbackTemplateButtonClick(value);
    }
  };

  return (
    <div className={styles.TemplateButtonContainer}>
      {template?.map(({ title, value, type }: any) => (
        <Button
          className={styles.TemplateButton}
          key={value}
          onClick={() => handleButtonClick(type, value)}
        >
          {title}
        </Button>
      ))}
    </div>
  );
};

export default TemplateButtons;
