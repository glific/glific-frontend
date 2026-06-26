import { Loading } from 'components/UI/Layout/Loading/Loading';
import { ErrorPage } from 'components/UI/ErrorPage/ErrorPage';
import { t } from 'i18next';

import styles from './OrgEvalAccessGateUi.module.css';

export function OrgEvalAccessGateLoading() {
  return (
    <div className={styles.Panel} data-testid="orgEvalAccessGateLoading">
      <Loading whiteBackground />
    </div>
  );
}

type OrgEvalAccessGateErrorProps = {
  onRetry: () => void;
};

export function OrgEvalAccessGateError({ onRetry }: OrgEvalAccessGateErrorProps) {
  return (
    <div className={styles.Panel} data-testid="orgEvalAccessGateError">
      <ErrorPage title={t('Something went wrong while checking your AI Evaluations access.')} onRefresh={onRetry} />
    </div>
  );
}
