import React from 'react';
import styles from './Timer.module.css';
import moment from 'moment';
export interface TimerProps {
  time: any;
}

export const Timer: React.FC<TimerProps> = (props: TimerProps) => {
  const currentTime = moment(new Date());
  var lastMessageTime = moment(props.time);
  var duration = moment.duration(currentTime.diff(lastMessageTime));
  var hours: string | number = Math.floor(duration.asHours());
  hours = hours > 24 ? 0 : 24 - hours;
  let timerStyle = styles.TimerNormal;
  if (hours === 0) {
    timerStyle = styles.TimerEnd;
  } else if (hours < 5) {
    timerStyle = styles.TimerApproachEnd;
  }

  if (hours < 10 && hours > 0) {
    hours = '0' + hours.toString();
  }

  return <div className={timerStyle}>{hours}</div>;
};
