import { useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import WhiteIcon from 'assets/images/icons/White.svg?react';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { BSPBALANCE } from 'graphql/queries/Organization';
import { BSP_BALANCE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
import { getUserSession } from 'services/AuthService';
import { GUPSHUP_ENTERPRISE_SHORTCODE } from 'common/constants';
import { ProviderContext } from 'context/session';
import styles from './WalletBalance.module.css';

export interface WalletBalanceProps {
  fullOpen: boolean;
}

export const WalletBalance = ({ fullOpen }: WalletBalanceProps) => {
  const variables = { organizationId: getUserSession('organizationId') };
  const [retried, setRetried] = useState(false);
  const [displayBalance, setDisplayBalance] = useState<any>(null);
  const { t } = useTranslation();
  const { provider } = useContext(ProviderContext);

  const balanceString = t('Wallet balance');

  const gupshupSettings = (isFullOpen: boolean) => (
    <Tooltip title={t('For any help, please contact the Glific team')} placement="top-start">
      <div className={`${styles.WalletBalance} ${styles.WalletBalanceLow}`}>
        {isFullOpen ? (
          <div className={styles.WalletBalanceLowText}>
            <WhiteIcon className={styles.Icon} />
            {t('Verify Gupshup settings')}
          </div>
        ) : (
          <div className={styles.WalletBalanceText}>
            <WhiteIcon className={styles.Icon} />
          </div>
        )}
      </div>
    </Tooltip>
  );

  const balanceOkay = (fullOpenFlag: boolean, displayBalanceText: any) =>
    fullOpenFlag ? (
      <div className={styles.WalletBalanceText}>
        {balanceString}
        <span className={styles.Balance}> ${displayBalance}</span>
      </div>
    ) : (
      <div className={styles.WalletBalanceText}>${displayBalanceText}</div>
    );

  const balanceLow = (fullOpenStatus: boolean, displayBalanceMessage: any) => (
    <>
      {fullOpenStatus ? (
        <div className={styles.WalletBalanceLowText}>
          {balanceString}
          <span className={styles.BalanceLow}> ${displayBalance}</span>
        </div>
      ) : (
        <div className={styles.WalletBalanceText}>${displayBalanceMessage}</div>
      )}
    </>
  );

  // get gupshup balance
  const {
    data: balanceData,
    loading,
    error,
    refetch,
    subscribeToMore,
  } = useQuery(BSPBALANCE, {
    variables,
  });

  const updateBalanceValue = (balance: any) => {
    if (balance) {
      setDisplayBalance(parseFloat(balance).toFixed(2));
    }
  };

  useEffect(() => {
    if (balanceData) {
      const balance = JSON.parse(balanceData.bspbalance);
      // check if we are not getting balance as null
      if (balance) {
        setDisplayBalance(parseFloat(balance.balance).toFixed(2));
      }
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

  if (loading && !retried) {
    return (
      <div className={styles.WalletBalance} data-testid="loading">
        <Skeleton variant="rounded" width="100%" height="100%" />
      </div>
    );
  }

  const errorBody = () => {
    return gupshupSettings(fullOpen);
  };

  if (error) {
    if (!retried) {
      refetch();
      setRetried(true);
    } else {
      errorBody();
    }
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

  if (provider === GUPSHUP_ENTERPRISE_SHORTCODE) {
    return null;
  }

  return updateBalance;
};
