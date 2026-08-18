import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { setErrorMessage, setNotification } from 'common/notification';
import { CREATE_EVALUATION } from 'graphql/mutations/AIEvaluations';
import { evaluationRunName } from 'containers/AIEvaluation/utils/evaluation/evaluation';
import type { DuplicationFactor } from 'containers/AIEvaluation/types/evaluationType';
import type { GoldenQaSet } from 'containers/AIEvaluation/types/goldenQaType';
import styles from './RunEvaluationDialog.module.css';

export interface RunEvaluationDialogProps {
  sets: GoldenQaSet[];
  versionId?: string;
  versionNumber?: number;
  assistantName?: string;
  onClose: () => void;
  onStarted: () => void;
}

const DUPLICATION_OPTIONS = [
  {
    value: '1',
    title: 'Quick smoke test',
    hint: 'Asks each question once. The fastest way to see if things broadly work.',
  },
  {
    value: '5',
    title: 'Consistency check',
    hint: 'Asks each question five times. Catches answers that change between attempts.',
  },
] as const;

export const RunEvaluationDialog = ({
  sets,
  versionId,
  versionNumber,
  assistantName = 'assistant',
  onClose,
  onStarted,
}: RunEvaluationDialogProps) => {
  const { t } = useTranslation();

  const [goldenQaId, setGoldenQaId] = useState(sets[0]?.id ?? '');
  const [duplication, setDuplication] = useState<`${DuplicationFactor}`>('1');

  const [createEvaluation, { loading }] = useMutation(CREATE_EVALUATION);

  const handleRun = async () => {
    const set = sets.find((entry) => entry.id === goldenQaId);
    if (!set || !versionId) return;

    try {
      const { data } = await createEvaluation({
        variables: {
          input: {
            goldenQaId,
            configId: versionId,
            evaluationName: evaluationRunName(assistantName, versionNumber, set.name),
          },
        },
      });

      const errors = data?.createEvaluation?.errors;
      if (errors?.length) {
        setErrorMessage(errors[0]);
        return;
      }

      setNotification(t('Evaluation started — the result appears here once it completes.'));
      onStarted();
    } catch (error: unknown) {
      setErrorMessage(error);
    }
  };

  return (
    <DialogBox
      open
      titleAlign="left"
      title={t('Run evaluation')}
      buttonOk={t('Run evaluation')}
      buttonCancel={t('Cancel')}
      alignButtons="right"
      buttonOkLoading={loading}
      disableOk={loading || !goldenQaId || !versionId}
      skipCancel={loading}
      handleOk={handleRun}
      handleCancel={() => !loading && onClose()}
      fullWidth
      customStyles={{ paper: styles.Paper }}
    >
      <div data-testid="runEvaluationDialog">
        <div className={styles.Intro}>
          {versionNumber
            ? t('Score version {{version}} against a Golden Q&A set. Each answer is scored 0–5.', {
                version: versionNumber,
              })
            : t('Score this version against a Golden Q&A set. Each answer is scored 0–5.')}
        </div>

        <div className={styles.FieldLabel}>{t('Golden Q&A set')}</div>
        <Dropdown
          placeholder=""
          options={sets.map((set) => ({ id: set.id, label: set.name }))}
          field={{
            name: 'goldenQaSet',
            value: goldenQaId,
            onChange: (event: { target: { value: string } }) => setGoldenQaId(event.target.value),
          }}
        />

        <div className={styles.DuplicationLabel}>{t('How many times to ask each question')}</div>
        <div className={styles.DuplicationOptions} role="radiogroup" data-testid="duplicationOptions">
          {DUPLICATION_OPTIONS.map((option) => (
            <button
              type="button"
              role="radio"
              key={option.value}
              aria-checked={duplication === option.value}
              className={`${styles.DuplicationCard} ${duplication === option.value ? styles.DuplicationCardActive : ''}`}
              onClick={() => setDuplication(option.value)}
              data-testid={`duplicationOption-${option.value}`}
            >
              <span className={styles.DuplicationCount}>{option.value}×</span>
              <span className={styles.DuplicationTitle}>{t(option.title)}</span>
              <span className={styles.DuplicationHint}>{t(option.hint)}</span>
            </button>
          ))}
        </div>

        <div className={styles.Note}>
          {t(
            'Evaluations run in the background. You can keep working and come back — the result appears when it completes.'
          )}
        </div>
      </div>
    </DialogBox>
  );
};
