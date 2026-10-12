import { useTranslation } from 'react-i18next';
import { getOrganizationServices } from 'services/AuthService';
import styles from './Guardrails.module.css';

export const Guardrails = () => {
  const { t } = useTranslation();
  const isAiGuardrailEnabled = Boolean(getOrganizationServices('aiGuardrailEnabled'));

  return (
    <div className={styles.Placeholder} data-testid="guardrails">
      {isAiGuardrailEnabled
        ? t('Guardrails for this assistant are being rolled out for your organization. Check back soon.')
        : `${t('Guardrails')} ${t('coming soon')}`}
    </div>
  );
};

export default Guardrails;
