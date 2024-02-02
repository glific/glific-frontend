import { Button } from '@mui/material';
import LocationIconDark from 'assets/images/icons/Location/Dark.svg?react';
import styles from './LocationRequestTemplate.module.css';
import { ChatMessageType } from '../ChatMessageType/ChatMessageType';

export interface LocationRequestTemplateProps {
  content: any;
  disabled?: boolean;

  isSimulator?: boolean;
  onSendLocationClick?: any;
}

const locationPayload = {
  type: 'location',
  name: 'location',
  id: 'LOCATION',
  payload: {
    type: 'location',
    latitude: '41.725556',
    longitude: '-49.946944',
  },
};

export const LocationRequestTemplate = ({
  content,
  disabled = false,
  isSimulator = false,

  onSendLocationClick = () => {},
}: LocationRequestTemplateProps) => {
  const body = content.body.text;
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
