import { useState, useEffect } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';

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
      const expiryDate = dayjs(trialExpirationDate);
      const days = expiryDate.diff(now, 'day');
      setDaysRemaining(days > 0 ? days : 0);
    };

    calculateDays();
    const interval = setInterval(calculateDays, 60000);

    return () => clearInterval(interval);
  }, [trialExpirationDate, isTrial]);

  if (!isTrial || daysRemaining === null) {
    return null;
  }

  const isCritical = daysRemaining <= 3;
  const backgroundColor = isCritical ? '#d32f2f' : '#119656';

  const getMessage = () => {
    if (daysRemaining === 0) return '⚠️ Your trial expires today!';
    if (daysRemaining === 1) return '⚠️ Your trial expires tomorrow!';
    return `Your trial expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`;
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor,
        color: 'white',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AccessTimeIcon style={{ fontSize: '20px' }} />
        <strong style={{ fontSize: '15px', fontWeight: '600' }}>{getMessage()}</strong>
        {daysRemaining > 0 && (
          <span style={{ fontSize: '14px', opacity: 0.95 }}>• Upgrade now to keep using all features</span>
        )}
      </div>
    </div>
  );
};
