import React from 'react';
import { Button } from '@material-ui/core';

import styles from './TemplateButtons.module.css';

interface TemplateButtonProps {
  template: Array<any>;
  callbackTemplateButtonClick?: any;
  isSimulator?: any;
}

export const TemplateButtons: React.FC<TemplateButtonProps> = ({
  template,
  callbackTemplateButtonClick,
  isSimulator = false,
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
      {template?.map(({ title, value, type, tooltip, icon }): any => (
        <Button
          key={title}
          title={tooltip}
          className={`${styles.TemplateButton} ${isSimulator ? styles.Simulator : styles.Chat}`}
          onClick={() => handleButtonClick(type, value)}
          startIcon={icon}
          disabled={!isSimulator}
        >
          {title}
        </Button>
      ))}
    </div>
  );
};

export default TemplateButtons;
