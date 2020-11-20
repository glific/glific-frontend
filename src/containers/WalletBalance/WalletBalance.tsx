import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client/react';
import { CircularProgress } from '@material-ui/core';

import styles from './WalletBalance.module.css';
import { ReactComponent as WhiteIcon } from '../../assets/images/icons/White.svg';
import { ReactComponent as SelectWhiteIcon } from '../../assets/images/icons/SelectWhite.svg';
import { getUserSession } from '../../services/AuthService';
import { Tooltip } from '../../components/UI/Tooltip/Tooltip';
import PERIODIC_INFO_SUBSCRIPTION from '../../graphql/subscriptions/PeriodicInfo';
import { BSPBALANCE } from '../../graphql/queries/Organization';

export const WalletBalance: React.FC<{ fullOpen: any }> = (fullOpen) => {
  const variables = { organizationId: getUserSession('organizationId') };
  const [skip, setSkip] = useState<boolean>(true);

  let balance;
  let displayText;

  useEffect(() => {
    if (variables.organizationId) setSkip(false);
  }, [variables]);

  // get gupshup balance
  const { data: balanceData } = useQuery(BSPBALANCE, {
    variables,
  });

  // set gupshup subscription
  const { data } = useSubscription(PERIODIC_INFO_SUBSCRIPTION, {
    skip,
    variables,
  });

  if (balanceData) {
    balance = JSON.parse(balanceData.bspbalance.value);
  }

  if (data) {
    balance = JSON.parse(data.periodicInfo.value);
  }

  if (balance) {
    let body;
    if (balance.balance > 1) {
      body = fullOpen.fullOpen ? (
        <div className={styles.WalletBalanceText}>
          <SelectWhiteIcon className={styles.Icon} />
          Wallet balance is okay: ${balance.balance}
        </div>
      ) : (
        <div className={styles.WalletBalanceText}>${balance.balance}</div>
      );
    } else {
      body = (
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
    }
    displayText = (
      <div
        className={`${styles.WalletBalance} ${
          balance && balance.balance > 1 ? styles.WalletBalanceHigh : styles.WalletBalanceLow
        }`}
        data-testid="WalletBalance"
      >
        {body}
      </div>
    );
  }

  const lodding = (
    <div className={styles.WalletBalance} data-testid="WalletBalance">
      <div className={styles.WalletBalanceText}>
        <CircularProgress size={14} className={styles.Progress} />
      </div>
    </div>
  );

  return displayText || lodding;
};

export default WalletBalance;
