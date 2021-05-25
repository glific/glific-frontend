import React from 'react';
import { Button } from '@material-ui/core';
import CallIcon from '@material-ui/icons/Call';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import styles from './TemplateButtons.module.css';

interface TemplateButtonProps {
  template: Array<any>;
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

  const startIcon = (type: string, value: string) => {
    if (type === 'call-to-action') {
      return value ? <OpenInNewIcon /> : <CallIcon />;
    }
    return null;
  };

  return (
    <div className={styles.TemplateButtonContainer}>
      {template?.map(({ title, value, type, tooltip }: any) => (
        <Button
          key={title}
          title={tooltip}
          className={styles.TemplateButton}
          onClick={() => handleButtonClick(type, value)}
          startIcon={startIcon(type, value)}
        >
          {title}
        </Button>
      ))}
    </div>
  );
};

export default TemplateButtons;
