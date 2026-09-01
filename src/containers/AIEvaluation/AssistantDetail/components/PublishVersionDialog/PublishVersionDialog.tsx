import { useTranslation } from 'react-i18next';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import type { EvaluationRun } from 'containers/AIEvaluation/types/evaluationType';
import {
  BAND_LABEL,
  MAX_SCORE,
  formatScore,
  overallScore,
  parseEvaluationResults,
  scoreBand,
} from 'containers/AIEvaluation/utils/evaluation/evaluation';
import styles from './PublishVersionDialog.module.css';

export interface PublishVersionDialogProps {
  versionLabel: string;
  targetLabel: string;
  lastRun?: EvaluationRun | null;
  publishing?: boolean;
  onCancel: () => void;
  onPublish: () => void;
  onRunEvaluation: () => void;
}

const withVersionInBold = (sentence: string, version: string) => {
  const [before, ...rest] = sentence.split(version);
  if (rest.length === 0) return sentence;

  return (
    <>
      {before}
      <b>{version}</b>
      {rest.join(version)}
    </>
  );
};

export const PublishVersionDialog = ({
  versionLabel,
  targetLabel,
  lastRun = null,
  publishing = false,
  onCancel,
  onPublish,
  onRunEvaluation,
}: PublishVersionDialogProps) => {
  const { t } = useTranslation();

  const score = lastRun ? overallScore(parseEvaluationResults(lastRun.results)) : null;
  const evaluated = score != null;

  const promoted = `${t('Version')} ${versionLabel}`;
  const intro = t('Promotes {{version}} and makes it live everywhere this assistant is linked in your flows.', {
    version: promoted,
  });

  return (
    <DialogBox
      open
      titleAlign="left"
      title={t('Publish as Version {{version}}?', { version: targetLabel })}
      buttonOk={evaluated ? t('Publish') : t('Run an evaluation')}
      handleOk={evaluated ? onPublish : onRunEvaluation}
      buttonOkLoading={evaluated && publishing}
      buttonMiddle={evaluated ? undefined : t('Go live anyway')}
      handleMiddle={onPublish}
      skipCancel
      handleCancel={onCancel}
      alignButtons="right"
      fullWidth
      customStyles={{ paper: styles.Paper }}
    >
      <div data-testid="publishVersionDialog">
        <div className={styles.Intro}>{withVersionInBold(intro, promoted)}</div>

        {evaluated ? (
          <div className={styles.Note} data-testid="publishLastRun">
            {lastRun?.goldenQa?.name
              ? t('Last evaluated at {{score}}/{{outOf}} — {{band}} — on {{set}}.', {
                  score: formatScore(score),
                  outOf: MAX_SCORE,
                  band: t(BAND_LABEL[scoreBand(score)]),
                  set: lastRun.goldenQa.name,
                })
              : t('Last evaluated at {{score}}/{{outOf}} — {{band}}.', {
                  score: formatScore(score),
                  outOf: MAX_SCORE,
                  band: t(BAND_LABEL[scoreBand(score)]),
                })}
          </div>
        ) : (
          <div className={styles.Warning} data-testid="publishNotEvaluated">
            <WarningAmberIcon className={styles.WarningIcon} />
            <span>
              <b>{t('This version has never been evaluated.')}</b>{' '}
              {t("You won't know how it performs against your Golden Q&A until you run one.")}
            </span>
          </div>
        )}
      </div>
    </DialogBox>
  );
};

export default PublishVersionDialog;
