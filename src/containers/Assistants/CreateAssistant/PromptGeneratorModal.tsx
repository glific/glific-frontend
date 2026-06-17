import { useEffect, useRef, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { CircularProgress, LinearProgress, Modal, OutlinedInput, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { setErrorMessage } from 'common/notification';

import { Button } from 'components/UI/Form/Button/Button';
import { Input } from 'components/UI/Form/Input/Input';

import { GENERATE_PROMPT } from 'graphql/mutations/PromptGenerator';
import { PROMPT_GENERATION } from 'graphql/queries/PromptGenerator';

import styles from './PromptGeneratorModal.module.css';

export interface PromptGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
}

type AnswerKey =
  | 'name'
  | 'purpose'
  | 'audience'
  | 'language'
  | 'tone'
  | 'format'
  | 'offLimits'
  | 'fallback'
  | 'escalation';

type Answers = Record<AnswerKey, string>;

interface Question {
  key: AnswerKey;
  label: string;
  helperText: string;
  textArea?: boolean;
}

const initialAnswers: Answers = {
  name: '',
  purpose: '',
  audience: '',
  language: '',
  tone: '',
  format: '',
  offLimits: '',
  fallback: '',
  escalation: '',
};

// poll for at most ~20 seconds (10 polls at 2s interval)
const POLL_INTERVAL = 2000;
const MAX_POLL_DURATION = 20000;

const getQuestions = (t: TFunction): Question[] => [
  {
    key: 'name',
    label: t('Organisation & chatbot name'),
    helperText: t('e.g. "Pratham; the bot is called Saathi"'),
  },
  {
    key: 'purpose',
    label: t('What does the assistant help with?'),
    helperText: t('Describe in 1-2 sentences what the assistant should do.'),
    textArea: true,
  },
  {
    key: 'audience',
    label: t('Who chats with the bot?'),
    helperText: t('Describe literacy, language familiarity and context of your users.'),
  },
  {
    key: 'language',
    label: t('Language policy'),
    helperText: t('e.g. English only / Hindi / match the user / Hinglish'),
  },
  {
    key: 'tone',
    label: t('Tone'),
    helperText: t('e.g. Simple & friendly / Formal / Instructional'),
  },
  {
    key: 'format',
    label: t('Response format'),
    helperText: t('Length and structure: bullets / numbered / short paragraphs'),
  },
  {
    key: 'offLimits',
    label: t('Off-limits topics'),
    helperText: t('Topics the bot must avoid, or type NA.'),
  },
  {
    key: 'fallback',
    label: t('Fallback message'),
    helperText: t("The exact text to send when the bot doesn't know the answer."),
    textArea: true,
  },
  {
    key: 'escalation',
    label: t('Escalation path'),
    helperText: t('Phone/email/next step when the bot cannot help, or type NA.'),
  },
];

type Phase = 'questions' | 'generating' | 'ready' | 'error';

export const PromptGeneratorModal = ({ open, onClose, onApply }: PromptGeneratorModalProps) => {
  const { t } = useTranslation();
  const questions = getQuestions(t);
  const totalSteps = questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [phase, setPhase] = useState<Phase>('questions');
  const [generatedText, setGeneratedText] = useState('');
  const [inlineError, setInlineError] = useState('');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [generatePrompt, { loading: generating }] = useMutation(GENERATE_PROMPT);
  const [pollPromptGeneration, { data: pollData, error: pollError, stopPolling, startPolling }] = useLazyQuery(
    PROMPT_GENERATION,
    {
      fetchPolicy: 'network-only',
    }
  );

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleFailure = (message: string) => {
    clearTimers();
    stopPolling();
    setInlineError(message);
    setPhase('error');
  };

  // derive state from polling results (Apollo recommends derived state over
  // onCompleted/onError when those callbacks set local state)
  useEffect(() => {
    const result = pollData?.promptGeneration?.promptGeneration;
    if (!result) return;
    if (result.status === 'ready') {
      clearTimers();
      stopPolling();
      setGeneratedText(result.generatedPrompt || '');
      setPhase('ready');
    } else if (result.status === 'failed') {
      handleFailure(result.errorMessage || t('Prompt generation failed. Please try again.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollData]);

  useEffect(() => {
    if (pollError) {
      setErrorMessage(pollError);
      handleFailure(t('Prompt generation failed. Please try again.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollError]);

  // cleanup on unmount
  useEffect(
    () => () => {
      clearTimers();
      stopPolling();
    },
    []
  );

  const handleChange = (key: AnswerKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetAll = () => {
    clearTimers();
    stopPolling();
    setStep(0);
    setAnswers(initialAnswers);
    setPhase('questions');
    setGeneratedText('');
    setInlineError('');
  };

  const handleClose = () => {
    clearTimers();
    stopPolling();
    onClose();
  };

  const handleGenerate = () => {
    setInlineError('');
    setPhase('generating');
    generatePrompt({
      variables: { input: answers },
      onCompleted: (data) => {
        const generation = data?.generatePrompt?.promptGeneration;
        const errors = data?.generatePrompt?.errors;
        if (errors && errors.length > 0) {
          handleFailure(errors[0].message || t('Prompt generation failed. Please try again.'));
          return;
        }
        if (!generation?.id) {
          handleFailure(t('Prompt generation failed. Please try again.'));
          return;
        }
        if (generation.status === 'ready') {
          setGeneratedText(generation.generatedPrompt || '');
          setPhase('ready');
          return;
        }
        if (generation.status === 'failed') {
          handleFailure(generation.errorMessage || t('Prompt generation failed. Please try again.'));
          return;
        }
        // status is in_progress -> start polling
        pollPromptGeneration({ variables: { id: generation.id } });
        startPolling(POLL_INTERVAL);
        timeoutRef.current = setTimeout(() => {
          handleFailure(t('Prompt generation timed out. Please try again.'));
        }, MAX_POLL_DURATION);
      },
      onError: (error) => {
        setErrorMessage(error);
        handleFailure(t('Prompt generation failed. Please try again.'));
      },
    });
  };

  const handleRetry = () => {
    setInlineError('');
    setPhase('questions');
  };

  const handleApply = () => {
    handleClose();
    onApply(generatedText);
    resetAll();
  };

  const isGenerating = phase === 'generating' || generating;

  const renderQuestions = () => {
    const question = questions[step];
    const isLastStep = step === totalSteps - 1;
    const progress = ((step + 1) / totalSteps) * 100;

    return (
      <>
        <div className={styles.ProgressWrapper}>
          <LinearProgress variant="determinate" value={progress} data-testid="progressBar" />
          <span className={styles.StepCount}>
            {t('Step')} {step + 1} / {totalSteps}
          </span>
        </div>

        <div className={styles.Question}>
          <Typography variant="h5" className={styles.QuestionLabel}>
            {question.label}
          </Typography>
          <Input
            field={{
              name: question.key,
              value: answers[question.key],
              onChange: handleChange(question.key),
              onBlur: () => {},
            }}
            placeholder={question.helperText}
            textArea={question.textArea}
            rows={question.textArea ? 4 : undefined}
            helperText={question.helperText}
          />
        </div>

        <div className={styles.Footer}>
          <Button
            variant="outlined"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            data-testid="backButton"
          >
            {t('Back')}
          </Button>
          {isLastStep ? (
            <Button variant="contained" onClick={handleGenerate} data-testid="generatePromptButton">
              {t('Generate Prompt')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setStep((prev) => Math.min(totalSteps - 1, prev + 1))}
              data-testid="nextButton"
            >
              {t('Next')}
            </Button>
          )}
        </div>
      </>
    );
  };

  const renderGenerating = () => (
    <div className={styles.LoadingState} data-testid="generatingState">
      <CircularProgress size={28} />
      <Typography>{t('Generating…')}</Typography>
    </div>
  );

  const renderError = () => (
    <div className={styles.ErrorState}>
      <Typography className={styles.ErrorText} data-testid="promptError">
        {inlineError}
      </Typography>
      <div className={styles.Footer}>
        <Button variant="outlined" onClick={handleClose} data-testid="errorCloseButton">
          {t('Close')}
        </Button>
        <Button variant="contained" onClick={handleRetry} data-testid="retryButton">
          {t('Retry')}
        </Button>
      </div>
    </div>
  );

  const renderReady = () => (
    <>
      <Typography className={styles.ReviewNotice} data-testid="reviewNotice">
        {t('This is an AI generated prompt. Please review and edit if required.')}
      </Typography>
      <OutlinedInput
        name="generated-prompt"
        value={generatedText}
        onChange={(event) => setGeneratedText(event.target.value)}
        className={styles.PreviewInput}
        multiline
        rows={12}
        data-testid="generatedPrompt"
        inputProps={{ 'data-testid': 'generatedPromptInput' }}
      />
      <div className={styles.Footer}>
        <Button variant="outlined" onClick={handleClose} data-testid="readyCancelButton">
          {t('Cancel')}
        </Button>
        <Button variant="contained" onClick={handleApply} data-testid="usePromptButton">
          {t('Use this Prompt')}
        </Button>
      </div>
    </>
  );

  let body;
  if (isGenerating) {
    body = renderGenerating();
  } else if (phase === 'ready') {
    body = renderReady();
  } else if (phase === 'error') {
    body = renderError();
  } else {
    body = renderQuestions();
  }

  return (
    <Modal open={open} onClose={handleClose} data-testid="promptGeneratorModal">
      <div className={styles.ModalBox}>
        <div className={styles.Container}>
          <h5 className={styles.Title}>{t('Generate Prompt with AI')}</h5>
          {body}
        </div>
      </div>
    </Modal>
  );
};
