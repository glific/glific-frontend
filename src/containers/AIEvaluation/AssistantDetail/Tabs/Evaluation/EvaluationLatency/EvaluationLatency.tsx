import { useTranslation } from 'react-i18next';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import type { EvaluationLatencyProps } from 'containers/AIEvaluation/types/evaluationType';
import { formatLatency } from 'containers/AIEvaluation/utils/evaluation/evaluation';
import styles from './EvaluationLatency.module.css';

export const EvaluationLatency = ({ avgResponseMs, variant }: EvaluationLatencyProps) => {
  const { t } = useTranslation();

  if (avgResponseMs == null) return variant === 'text' ? <span className={styles.None}>—</span> : null;

  if (variant === 'text') {
    return (
      <span className={styles.Text} data-testid="evaluationLatency">
        {formatLatency(avgResponseMs)}
      </span>
    );
  }

  return (
    <span className={styles.Chip} data-testid="evaluationLatency">
      <TimerOutlinedIcon className={styles.Icon} />
      {t('Avg response time')} <b className={styles.Value}>{formatLatency(avgResponseMs)}</b>
    </span>
  );
};

export default EvaluationLatency;
