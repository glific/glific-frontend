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

const nullBalance = () => (
  <div className={`${styles.WalletBalance} ${styles.WalletBalanceHigh}`}>
    <div className={styles.WalletBalanceText}>
      <SelectWhiteIcon className={styles.Icon} />
      Wallet balance is okay
    </div>
  </div>
);

const gupshupSettings = (fullOpen: boolean) => (
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

const balanceOkay = (fullOpen: boolean, displayBalance: any) =>
  fullOpen ? (
    <div className={styles.WalletBalanceText}>
      <SelectWhiteIcon className={styles.Icon} />
      Wallet balance is okay: ${displayBalance}
    </div>
  ) : (
    <div className={styles.WalletBalanceText}>${displayBalance}</div>
  );

const balanceLow = (fullOpen: boolean, displayBalance: any) => (
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

  const updateBalanceValue = (balance: any) => {
    if (balance && balance !== null) {
      setDisplayBalance(balance);
    }
  };

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
            updateBalanceValue(balance.balance);
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
    if (displayBalance === null && !error) {
      return nullBalance();
    }
    return gupshupSettings(fullOpen);
  };

  console.log(error);
  if (error) {
    errorBody();
  }

  const updateBody = () => {
    if (displayBalance > 1) {
      return balanceOkay(fullOpen, displayBalance);
    }

    return balanceLow(fullOpen, displayBalance);
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
