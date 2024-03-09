import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import ContactOptOutIcon from 'assets/images/icons/ContactOptOut.svg?react';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import styles from './Timer.module.css';

export interface TimerProps {
  time: any;
  contactStatus?: string;
  contactBspStatus?: string;
  variant?: 'primary' | 'secondary';
}

export const Timer = (props: TimerProps) => {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const { t } = useTranslation();

  const link = (
    <a
      className={styles.TooltipArrow}
      target="_blank"
      rel="noreferrer"
      href="https://glific.org/session-window/"
      onClick={(e) => {
        e.preventDefault();
        window.open('https://glific.org/session-window/', '_blank');
      }}
    >
      {t('Learn more about the WhatsApp session window here.')}
    </a>
  );
  const createTooltip = (title: string) => (
    <>
      {title} {link}
    </>
  );

  const { contactStatus, contactBspStatus, time, variant = 'primary' } = props;

  let intervalID: any;
  useEffect(() => {
    intervalID = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);

    return () => clearInterval(intervalID);
  }, []);

  if ((contactStatus && contactStatus === 'INVALID') || contactBspStatus === 'NONE') {
    return (
      <Tooltip
        tooltipClass={`${styles.Tooltip} ${styles.TimerEndTooltip}`}
        tooltipArrowClass={styles.TooltipArrow}
        title={t(
          'User has not opted in to your number. You can only send message them when they initiate the conversation.'
        )}
        placement="bottom"
      >
        <ContactOptOutIcon />
      </Tooltip>
    );
  }

  let tooltip = createTooltip(t('Session window is open to message this contact.'));
  let timerStyle = styles.TimerNormal;
  let tooltipStyle = styles.TimerNormalTooltip;

  let hours: string | number = 0;
  if (time) {
    const lastMessageTime = dayjs(time);
    const duration = currentTime.diff(lastMessageTime, "hour")
    hours = Math.floor(duration);
    if (hours < 0) hours = 0;
    hours = hours > 24 ? 0 : 24 - hours;
  }

  if (hours < 0 || Number.isNaN(hours)) {
    hours = 0;
  }

  if (hours === 0) {
    timerStyle = styles.TimerEnd;
    tooltipStyle = styles.TimerApproachTooltip;
    tooltip = createTooltip(
      t('Session message window has expired! You can only send a template message now.')
    );
  } else if (hours < 5) {
    timerStyle = styles.TimerApproachEnd;
    tooltipStyle = styles.TimerApproachTooltip;
    tooltip = createTooltip(t('Your message window is about to expire!'));
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
      <div
        className={timerStyle + ' ' + (variant === 'secondary' && styles.SecondaryTimer)}
        data-testid="timerCount"
      >
        {hours} hrs
      </div>
    </Tooltip>
  );
};
