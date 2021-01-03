import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { CircularProgress } from '@material-ui/core';

import styles from './WalletBalance.module.css';
import { ReactComponent as WhiteIcon } from '../../assets/images/icons/White.svg';
import { ReactComponent as SelectWhiteIcon } from '../../assets/images/icons/SelectWhite.svg';
import { getUserSession } from '../../services/AuthService';
import { Tooltip } from '../../components/UI/Tooltip/Tooltip';
import { BSPBALANCE } from '../../graphql/queries/Organization';
import PERIODIC_INFO_SUBSCRIPTION from '../../graphql/subscriptions/PeriodicInfo';

export interface WalletBalanceProps {
  fullOpen: boolean;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({ fullOpen }) => {
  const variables = { organizationId: getUserSession('organizationId') };
  const [displayBalance, setDisplayBalance] = useState<any>(null);

  // get gupshup balance
  const { data: balanceData, subscribeToMore } = useQuery(BSPBALANCE, {
    variables,
  });

  const loading = (
    <div className={`${styles.WalletBalance} ${styles.WalletBalanceHigh}`} data-testid="loading">
      <div className={styles.WalletBalanceText}>
        <CircularProgress size={14} className={styles.Progress} />
      </div>
    </div>
  );

  const updateBody = () => {
    if (displayBalance > 1) {
      return fullOpen ? (
        <div className={styles.WalletBalanceText}>
          <SelectWhiteIcon className={styles.Icon} />
          Wallet balance is okay: ${displayBalance}
        </div>
      ) : (
        <div className={styles.WalletBalanceText}>${displayBalance}</div>
      );
    }

    return (
      <Tooltip title="You will be unable to send messages without recharge" placement="top-start">
        {fullOpen ? (
          <div className={styles.WalletBalanceText}>
            <WhiteIcon className={styles.Icon} />
            Wallet balance is low: ${displayBalance}
          </div>
        ) : (
          <div className={styles.WalletBalanceText}>${displayBalance}</div>
        )}
      </Tooltip>
    );
  };

  const updateBalance = (
    <div
      className={`${styles.WalletBalance} ${
        displayBalance && displayBalance > 1 ? styles.WalletBalanceHigh : styles.WalletBalanceLow
      }`}
      data-testid="WalletBalance"
    >
      {displayBalance ? updateBody() : null}
    </div>
  );

  // use subscription to update balance
  useEffect(() => {
    subscribeToMore({
      document: PERIODIC_INFO_SUBSCRIPTION,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        const balance = JSON.parse(subscriptionData.data.periodicInfo.value);
        setDisplayBalance(balance.balance);
      },
    });
  }, [subscribeToMore]);

  // get balance on load
  useEffect(() => {
    if (balanceData) {
      const balance = JSON.parse(balanceData.bspbalance.value);
      setDisplayBalance(balance.balance);
    }
  }, [balanceData]);

  if (!balanceData) {
    return loading;
  }

  return updateBalance;
};
