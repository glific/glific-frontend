import React, { useEffect, useState } from 'react';
import { useSubscription } from '@apollo/client/react';
import { CircularProgress } from '@material-ui/core';

import styles from './WalletBalance.module.css';
import { ReactComponent as WhiteIcon } from '../../assets/images/icons/White.svg';
import { ReactComponent as SelectWhiteIcon } from '../../assets/images/icons/SelectWhite.svg';
import { getUserSession } from '../../services/AuthService';
import { Tooltip } from '../../components/UI/Tooltip/Tooltip';
import PERIODIC_INFO_SUBSCRIPTION from '../../graphql/subscriptions/PeriodicInfo';

export const WalletBalance: React.FC<{ fullOpen: any }> = (fullOpen) => {
  const subscriptionVariables = { organizationId: getUserSession('organizationId') };
  const [skip, setSkip] = useState<boolean>(true);

  let balance;
  let displayText;

  useEffect(() => {
    if (subscriptionVariables.organizationId) setSkip(false);
  }, [subscriptionVariables]);

  const { data } = useSubscription(PERIODIC_INFO_SUBSCRIPTION, {
    skip,
    variables: subscriptionVariables,
  });

  if (data) {
    balance = JSON.parse(data.periodicInfo.value);
    if (balance.balance > 1) {
      displayText = (
        <div className={styles.WalletBalance} data-testid="WalletBalance">
          {fullOpen.fullOpen ? (
            <div className={styles.WalletBalanceText}>
              <SelectWhiteIcon className={styles.Icon} />
              Wallet balance is okay: ${balance.balance}
            </div>
          ) : (
            `$${balance.balance}`
          )}
        </div>
      );
    } else {
      displayText = (
        <div className={styles.WalletBalanceLow} data-testid="WalletBalance">
          <Tooltip
            title="You will be unable to send messages without recharge"
            placement="top-start"
          >
            {fullOpen.fullOpen ? (
              <div className={styles.WalletBalanceText}>
                <WhiteIcon className={styles.Icon} />
                Wallet balance is low: ${balance.balance}
              </div>
            ) : (
              `$${balance.balance}`
            )}
          </Tooltip>
        </div>
      );
    }
  }

  return (
    displayText || (
      <div className={styles.WalletBalance} data-testid="WalletBalance">
        <CircularProgress size={25} className={styles.Progress} />
      </div>
    )
  );
};

export default WalletBalance;
