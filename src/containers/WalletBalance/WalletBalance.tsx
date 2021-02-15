import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { CircularProgress } from '@material-ui/core';

import styles from './WalletBalance.module.css';
import { ReactComponent as WhiteIcon } from '../../assets/images/icons/White.svg';
import { ReactComponent as SelectWhiteIcon } from '../../assets/images/icons/SelectWhite.svg';
import { Tooltip } from '../../components/UI/Tooltip/Tooltip';
import { BSPBALANCE } from '../../graphql/queries/Organization';
import { BSP_BALANCE_SUBSCRIPTION } from '../../graphql/subscriptions/PeriodicInfo';
import { getUserSession } from '../../services/AuthService';

export interface WalletBalanceProps {
  fullOpen: boolean;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({ fullOpen }) => {
  const variables = { organizationId: getUserSession('organizationId') };
  const [displayBalance, setDisplayBalance] = useState<any>(null);

  // get gupshup balance
  const { data: balanceData, loading, error, subscribeToMore } = useQuery(BSPBALANCE, {
    variables,
  });

  useEffect(() => {
    if (balanceData) {
      const balance = JSON.parse(balanceData.bspbalance);
      setDisplayBalance(balance.balance);
    }
  }, [balanceData]);

  // use subscription to update balance
  useEffect(() => {
    if (subscribeToMore) {
      subscribeToMore({
        document: BSP_BALANCE_SUBSCRIPTION,
        variables,
        updateQuery: (prev, { subscriptionData }) => {
          if (subscriptionData.data.bspBalance) {
            const balance = JSON.parse(subscriptionData.data.bspBalance);
            setDisplayBalance(balance.balance);
          }
        },
      });
    }
  }, [subscribeToMore]);

  if (loading) {
    return (
      <div className={`${styles.WalletBalance} ${styles.WalletBalanceHigh}`} data-testid="loading">
        <div className={styles.WalletBalanceText}>
          <CircularProgress size={14} className={styles.Progress} />
        </div>
      </div>
    );
  }

  const errorBody = () => {
    return (
      <Tooltip title="For any help, please contact the Glific team" placement="top-start">
        <div className={`${styles.WalletBalance} ${styles.WalletBalanceLow}`}>
          {fullOpen ? (
            <div className={styles.WalletBalanceText}>
              <WhiteIcon className={styles.Icon} />
              Verify Gupshup settings
            </div>
          ) : (
            <div className={styles.WalletBalanceText}>
              <WhiteIcon className={styles.Icon} />
            </div>
          )}
        </div>
      </Tooltip>
    );
  };

  if (error) {
    errorBody();
  }

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
        displayBalance !== null && displayBalance > 1
          ? styles.WalletBalanceHigh
          : styles.WalletBalanceLow
      }`}
      data-testid="WalletBalance"
    >
      {displayBalance !== null ? updateBody() : errorBody()}
    </div>
  );

  return updateBalance;
};
