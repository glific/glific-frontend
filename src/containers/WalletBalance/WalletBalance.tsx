import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { CircularProgress } from '@material-ui/core';

import styles from './WalletBalance.module.css';
import { ReactComponent as WhiteIcon } from '../../assets/images/icons/White.svg';
import { ReactComponent as SelectWhiteIcon } from '../../assets/images/icons/SelectWhite.svg';
import { getUserSession } from '../../services/AuthService';
import { Tooltip } from '../../components/UI/Tooltip/Tooltip';
import { BSPBALANCE } from '../../graphql/queries/Organization';
import PERIODIC_INFO_SUBSCRIPTION from '../../graphql/subscriptions/PeriodicInfo';

export const WalletBalance: React.FC<{ fullOpen: any }> = (fullOpen) => {
  const variables = { organizationId: getUserSession('organizationId') };
  const [displayText, setDisplayText] = useState<any>();

  // get gupshup balance
  const { data: balanceData, subscribeToMore } = useQuery(BSPBALANCE, {
    variables,
  });

  const lodding = (
    <div className={`${styles.WalletBalance} ${styles.WalletBalanceHigh}`} data-testid="lodding">
      <div className={styles.WalletBalanceText}>
        <CircularProgress size={14} className={styles.Progress} />
      </div>
    </div>
  );

  const updateBody = useCallback((balance) => {
    if (balance.balance > 1) {
      return fullOpen.fullOpen ? (
        <div className={styles.WalletBalanceText}>
          <SelectWhiteIcon className={styles.Icon} />
          Wallet balance is okay: ${balance.balance}
        </div>
      ) : (
        <div className={styles.WalletBalanceText}>${balance.balance}</div>
      );
    }
    return (
      <Tooltip title="You will be unable to send messages without recharge" placement="top-start">
        {fullOpen.fullOpen ? (
          <div className={styles.WalletBalanceText}>
            <WhiteIcon className={styles.Icon} />
            Wallet balance is low: ${balance.balance}
          </div>
        ) : (
          <div className={styles.WalletBalanceText}>${balance.balance}</div>
        )}
      </Tooltip>
    );
  }, []);

  const updateBalance = useCallback((balance) => {
    return (
      <div
        className={`${styles.WalletBalance} ${
          balance && balance.balance > 1 ? styles.WalletBalanceHigh : styles.WalletBalanceLow
        }`}
        data-testid="WalletBalance"
      >
        {updateBody(balance)}
      </div>
    );
  }, []);

  // use subscription to update balance
  useEffect(() => {
    subscribeToMore({
      document: PERIODIC_INFO_SUBSCRIPTION,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        const balance = JSON.parse(subscriptionData.data.periodicInfo.value);
        setDisplayText(updateBalance(balance));
      },
    });
  }, [subscribeToMore]);

  // get balance on load
  useEffect(() => {
    if (balanceData) {
      const balance = JSON.parse(balanceData.bspbalance.value);
      setDisplayText(updateBalance(balance));
    }
  }, [balanceData]);

  return displayText || lodding;
};

export default WalletBalance;
