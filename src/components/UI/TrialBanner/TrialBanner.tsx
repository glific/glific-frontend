import { useState, useEffect } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import styles from './TrialBanner.module.css';

interface TrialBannerProps {
  trialExpirationDate: string | null;
  isTrial: boolean;
}

export const TrialBanner = ({ trialExpirationDate, isTrial }: TrialBannerProps) => {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!isTrial || !trialExpirationDate) return;

    const calculateDays = () => {
      const now = dayjs();
      const expiryDate = dayjs(trialExpirationDate.replace(' ', 'T'));
      const days = expiryDate.diff(now, 'day');
      setDaysRemaining(days >= 0 ? days : 0);
    };

    calculateDays();
    const interval = setInterval(calculateDays, 60000);

    return () => clearInterval(interval);
  }, [trialExpirationDate, isTrial]);

  if (!isTrial || daysRemaining === null) {
    return null;
  }

  const isCritical = daysRemaining <= 3;

  const getMessage = () => {
    if (daysRemaining === 0)
      return "Your Glific trial ends today. Get support if you're stuck, or schedule a call to purchase your own account";
    if (daysRemaining === 1)
      return "Your Glific trial ends in 1 day. Get support if you're stuck, or schedule a call to purchase your own account";
    return `Your Glific trial ends in ${daysRemaining} days. Get support if you're stuck, or schedule a call to purchase your own account`;
  };

  return (
    <div className={`${styles.trialBanner} ${isCritical ? styles.critical : styles.safe}`}>
      <div className={styles.messageContainer}>
        <AccessTimeIcon className={styles.icon} />
        <span className={styles.message}>{getMessage()}</span>
      </div>

      <div className={styles.buttonsContainer}>
        <a href="mailto:connect@glific.org" className={styles.ctaButton}>
          📧 Get Support
        </a>

        <a
          href="https://calendar.app.google/USJMfhSsDvW5yS6B7"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaButton}
        >
          📅 Schedule Call
        </a>
      </div>
    </div>
  );
};
