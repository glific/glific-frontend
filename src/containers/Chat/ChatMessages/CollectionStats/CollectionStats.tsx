import React from 'react';

import { useTranslation } from 'react-i18next';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './CollectionStats.module.css';

interface CollectionStatsProps {
  setDialog: any;
  broadcastId: string | null;
}

export const CollectionStats: React.SFC<CollectionStatsProps> = ({ setDialog }) => {
  const { t } = useTranslation();

  const title = (
    <div className={styles.TitleContainer}>
      <div className={styles.FailSend}>
        <div>12</div>
        <div className={styles.Heading}>Failed to send</div>
        <div>--</div>
      </div>
      <div className={styles.SuccessSend}>
        <div>13</div>
        <div className={styles.Heading}>Sent successfully</div>
        <div>--</div>
      </div>
    </div>
  );

  const failureReasons = [
    {
      count: 12,
      reason: 'Never opted in',
    },
    {
      count: 12,
      reason: 'Opted out',
    },
    {
      count: 12,
      reason: 'Opted out from GupShup',
    },
    {
      count: 12,
      reason: 'Out of session window',
    },
    {
      count: 12,
      reason: 'Not on WhatsApp',
    },
    {
      count: 12,
      reason: 'Delivery failure',
    },
  ];

  const content = (
    <div>
      <div className={styles.ReasonHeading}>Reasons for failure</div>

      {failureReasons.map((failure) => (
        <div className={styles.FailureReason}>{`${failure.count}  ${failure.reason}`}</div>
      ))}
    </div>
  );

  return (
    <div>
      <DialogBox
        skipCancel
        handleCancel={() => setDialog(false)}
        handleOk={() => setDialog(false)}
        title={title}
        buttonOk={t('Done')}
      >
        {content}
      </DialogBox>
    </div>
  );
};

export default CollectionStats;
