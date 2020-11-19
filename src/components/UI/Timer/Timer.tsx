import React, { useState, useEffect } from 'react';
import moment from 'moment';

import { ReactComponent as ContactOptOutIcon } from '../../../assets/images/icons/ContactOptOut.svg';
import styles from './Timer.module.css';

export interface TimerProps {
  time: any;
  contactStatus?: string;
  contactBspStatus?: string;
}

export const Timer: React.FC<TimerProps> = (props: TimerProps) => {
  const [currentTime, setCurrentTime] = useState(moment(new Date()));
  const { contactStatus, contactBspStatus, time } = props;
  useEffect(() => {
    setInterval(() => {
      setCurrentTime(moment(new Date()));
    }, 60000);
  }, []);

  if ((contactStatus && contactStatus === 'INVALID') || contactBspStatus === 'NONE' || !time) {
    return <ContactOptOutIcon />;
  }

  let timerStyle = styles.TimerNormal;
  const lastMessageTime = moment(time);
  const duration = moment.duration(currentTime.diff(lastMessageTime));
  let hours: string | number = Math.floor(duration.asHours());

  if (hours < 0 || Number.isNaN(hours)) {
    hours = 0;
  }

  hours = hours > 24 ? 0 : 24 - hours;

  if (hours === 0) {
    timerStyle = styles.TimerEnd;
  } else if (hours < 5) {
    timerStyle = styles.TimerApproachEnd;
  }

  if (hours < 10 && hours > 0) {
    hours = `0: ${hours.toString()}`;
  }

  return (
    <div className={timerStyle} data-testid="timerCount">
      {hours}
    </div>
  );
};
