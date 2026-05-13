import { Button } from 'components/UI/Form/Button/Button';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { t } from 'i18next';

import styles from './OrgEvalAccessGateUi.module.css';

export function OrgEvalAccessGateLoading() {
  return (
    <div className={styles.Panel} data-testid="orgEvalAccessGateLoading">
      <Loading whiteBackground/>
    </div>
  );
}

type OrgEvalAccessGateErrorProps = {
  onRetry: () => void;
};

export function OrgEvalAccessGateError({ onRetry }: OrgEvalAccessGateErrorProps) {
  return (
    <div className={styles.Panel} data-testid="orgEvalAccessGateError">
      <p className={styles.ErrorText}>
        {t('Something went wrong while checking your AI Evaluations access. Please refresh the page or try again.')}
      </p>
      <Button variant="contained" color="primary" onClick={onRetry}>
        {t('Refresh')}
      </Button>
    </div>
  );
}
