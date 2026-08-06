import { t } from 'i18next';
import { Outlet } from 'react-router';
import { ErrorPage } from 'components/UI/ErrorPage/ErrorPage';
import { getOrganizationServices } from 'services/AuthService';
import styles from './AIEvaluationGuard.module.css';

export const isAIEvaluationV2Enabled = () =>
  Boolean(getOrganizationServices('aiEvaluationsEnabled')) && Boolean(getOrganizationServices('aiEvaluationV2Enabled'));

export const AIEvaluationGuard = () => {
  if (!isAIEvaluationV2Enabled()) {
    return (
      <div className={styles.Panel} data-testid="aiEvaluationV2Disabled">
        <ErrorPage title={t('AI Evaluation v2 is not enabled for your organisation.')} />
      </div>
    );
  }

  return <Outlet />;
};

export default AIEvaluationGuard;
