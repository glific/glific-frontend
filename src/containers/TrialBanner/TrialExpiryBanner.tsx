import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Button, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { GET_ORGANIZATION_STATUS } from 'graphql/queries/Organization';
import styles from './TrialExpiryBanner.module.css';

export const TrialExpiryBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, loading, error } = useQuery(GET_ORGANIZATION_STATUS);

  if (loading) return null;
  if (error) return null;

  const organization = data?.organization?.organization;
  const isTrialOrg = organization?.isTrialOrg;
  const trialExpirationDate = organization?.trialExpirationDate;
  const isSuspended = organization?.isSuspended;

  const daysRemaining = trialExpirationDate
    ? Math.ceil((new Date(trialExpirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const shouldShowBanner = isTrialOrg && !isSuspended && daysRemaining > 0 && daysRemaining <= 7;

  if (!shouldShowBanner) return null;

  const isUrgent = daysRemaining <= 2;

  const handleGetSupport = () => {
    window.location.href = 'mailto:connect@glific.org?subject=Glific Trial Support';
  };

  const handleScheduleCall = () => {
    window.open('https://calendar.app.google/USJMfhSsDvW5yS6B7', '_blank');
  };

  const handleBannerClick = () => {
    setIsExpanded(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsExpanded(true);
    }
  };

  return (
    <div className={styles.BannerContainer}>
      <Collapse in={!isExpanded}>
        <div
          className={isUrgent ? styles.CollapsedBannerUrgent : styles.CollapsedBanner}
          onClick={handleBannerClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Expand trial banner"
        >
          <div className={styles.BannerHeader}>
            <div className={styles.BannerTitle}>
              {isUrgent && <WarningAmberIcon className={styles.WarningIcon} />}
              <span className={styles.TrialBadge}>TRIAL</span>
              <span className={styles.DaysText}>{daysRemaining}d left</span>
            </div>
            <IconButton size="small" className={styles.ExpandIcon} aria-hidden="true">
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </div>
          <p className={styles.BannerSubtext}>{isUrgent ? 'Expiring soon!' : 'Click for options'}</p>
        </div>
      </Collapse>

      <Collapse in={isExpanded}>
        <div className={isUrgent ? styles.ExpandedBannerUrgent : styles.ExpandedBanner}>
          <div className={styles.ExpandedHeader}>
            <div className={styles.ExpandedHeaderContent}>
              {isUrgent && <WarningAmberIcon className={styles.WarningIcon} />}
              <span className={styles.TrialBadge}>TRIAL</span>
              <span className={styles.DaysText}>{daysRemaining}d left</span>
            </div>
            <IconButton
              size="small"
              className={styles.CloseButton}
              onClick={() => setIsExpanded(false)}
              aria-label="collapse banner"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          <p className={styles.ExpandedSubtext}>{isUrgent ? 'Trial expires soon!' : 'Your trial ends soon'}</p>

          <div className={styles.ActionButtons}>
            <Button
              className={isUrgent ? styles.SupportButtonUrgent : styles.SupportButton}
              onClick={handleGetSupport}
              fullWidth
              size="small"
            >
              Get Support
            </Button>
            <Button
              className={isUrgent ? styles.ScheduleButtonUrgent : styles.ScheduleButton}
              onClick={handleScheduleCall}
              fullWidth
              size="small"
            >
              Schedule Call
            </Button>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default TrialExpiryBanner;
