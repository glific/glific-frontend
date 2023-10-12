import { useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

import WhiteIcon from 'assets/images/icons/White.svg?react';
import SelectWhiteIcon from 'assets/images/icons/SelectWhite.svg?react';
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

  const balanceOkayString = t('Wallet balance is okay');
  const balanceLowString = t('Wallet balance is low');

  const nullBalance = () => (
    <div className={`${styles.WalletBalance} ${styles.WalletBalanceHigh}`}>
      <div className={styles.WalletBalanceText}>
        <SelectWhiteIcon className={styles.Icon} />
        {balanceOkayString}
      </div>
    </div>
  );

  const gupshupSettings = (isFullOpen: boolean) => (
    <Tooltip title={t('For any help, please contact the Glific team')} placement="top-start">
      <div className={`${styles.WalletBalance} ${styles.WalletBalanceLow}`}>
        {isFullOpen ? (
          <div className={styles.WalletBalanceText}>
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
        <SelectWhiteIcon className={styles.Icon} />
        {balanceOkayString}: ${displayBalance}
      </div>
    ) : (
      <div className={styles.WalletBalanceText}>${displayBalanceText}</div>
    );

  const balanceLow = (fullOpenStatus: boolean, displayBalanceMessage: any) => (
    <Tooltip
      title={t('You will be unable to send messages without recharge')}
      placement="top-start"
    >
      {fullOpenStatus ? (
        <div className={styles.WalletBalanceText}>
          <WhiteIcon className={styles.Icon} />
          {balanceLowString}: ${displayBalance}
        </div>
      ) : (
        <div className={styles.WalletBalanceText}>${displayBalanceMessage}</div>
      )}
    </Tooltip>
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
