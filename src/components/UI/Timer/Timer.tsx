import React, { useState, useEffect } from 'react';
import moment from 'moment';

import { ReactComponent as ContactOptOutIcon } from '../../../assets/images/icons/ContactOptOut.svg';
import styles from './Timer.module.css';
import Tooltip from '../Tooltip/Tooltip';

export interface TimerProps {
  time: any;
  contactStatus?: string;
  contactBspStatus?: string;
}

const link = (
  <a
    className={styles.TooltipArrow}
    target="_blank"
    rel="noreferrer"
    href="https://glific.org/session-window/"
  >
    Learn more about the WhatsApp session window here.
  </a>
);
const createTooltip = (title: string) => {
  return (
    <React.Fragment key="sessionTooltip">
      {title} {link}
    </React.Fragment>
  );
};
let tooltip = createTooltip('Session window is open to message this contact.');

export const Timer: React.FC<TimerProps> = (props: TimerProps) => {
  const [currentTime, setCurrentTime] = useState(moment(new Date()));
  const { contactStatus, contactBspStatus, time } = props;
  useEffect(() => {
    setInterval(() => {
      setCurrentTime(moment(new Date()));
    }, 60000);
  }, []);

  if ((contactStatus && contactStatus === 'INVALID') || contactBspStatus === 'NONE' || !time) {
    return (
      <Tooltip
        tooltipClass={`${styles.Tooltip} ${styles.TimerEndTooltip}`}
        tooltipArrowClass={styles.TooltipArrow}
        title="User has not opted in to your number. You can only send message them when they initiate the conversation."
        placement="bottom"
      >
        <ContactOptOutIcon />
      </Tooltip>
    );
  }

  let timerStyle = styles.TimerNormal;
  let tooltipStyle = styles.TimerNormalTooltip;
  const lastMessageTime = moment(time);
  const duration = moment.duration(currentTime.diff(lastMessageTime));
  let hours: string | number = Math.floor(duration.asHours());

  if (hours < 0 || Number.isNaN(hours)) {
    hours = 0;
  }

  hours = hours > 24 ? 0 : 24 - hours;

  if (hours === 0) {
    timerStyle = styles.TimerEnd;
    tooltipStyle = styles.TimerApproachTooltip;
    tooltip = createTooltip(
      'Session message window has expired! You can only send a template message now.'
    );
  } else if (hours < 5) {
    timerStyle = styles.TimerApproachEnd;
    tooltipStyle = styles.TimerApproachTooltip;
    tooltip = createTooltip('Your message window is about to expire!');
  }

  if (hours < 10 && hours > 0) {
    hours = `0${hours.toString()}`;
  }

  return (
    <Tooltip
      tooltipClass={`${styles.Tooltip} ${tooltipStyle}`}
      tooltipArrowClass={styles.TooltipArrow}
      title={tooltip}
      placement="bottom"
      interactive
    >
      <div className={timerStyle} data-testid="timerCount">
        {hours}
      </div>
    </Tooltip>
  );
};
