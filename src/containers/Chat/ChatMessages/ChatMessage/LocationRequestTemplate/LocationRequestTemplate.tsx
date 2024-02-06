import { Button } from '@mui/material';
import LocationIconDark from 'assets/images/icons/Location/Dark.svg?react';
import styles from './LocationRequestTemplate.module.css';
import { ChatMessageType } from '../ChatMessageType/ChatMessageType';
import { SAMPLE_MEDIA_FOR_SIMULATOR } from 'common/constants';

export interface LocationRequestTemplateProps {
  content: any;
  disabled?: boolean;

  isSimulator?: boolean;
  onSendLocationClick?: any;
}

export const LocationRequestTemplate = ({
  content,
  disabled = false,
  isSimulator = false,

  onSendLocationClick = () => {},
}: LocationRequestTemplateProps) => {
  const body = content.body.text;
  const locationPayload = SAMPLE_MEDIA_FOR_SIMULATOR[5].payload;
  return (
    <div>
      <div className={styles.MessageContent}>
        <ChatMessageType type="TEXT" body={body} isSimulatedMessage={isSimulator} />
      </div>
      <Button
        variant="text"
        disabled={disabled}
        startIcon={<LocationIconDark />}
        onClick={() => onSendLocationClick(locationPayload)}
        className={isSimulator ? styles.SimulatorButton : styles.ChatButton}
      >
        Send Location
      </Button>
    </div>
  );
};
