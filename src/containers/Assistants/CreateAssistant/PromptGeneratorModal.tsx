import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { CircularProgress, IconButton, Modal, OutlinedInput, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { setErrorMessage } from 'common/notification';

import { Button } from 'components/UI/Form/Button/Button';
import { Input } from 'components/UI/Form/Input/Input';

import { GENERATE_PROMPT } from 'graphql/mutations/PromptGenerator';
import { PROMPT_GENERATION } from 'graphql/queries/PromptGenerator';

import styles from './PromptGeneratorModal.module.css';

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

export type PromptAnswers = Record<AnswerKey, string>;

export interface PromptGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  // answers are owned by the parent page so they survive closing/reopening the modal
  // (e.g. generate → not happy → reopen → tweak) without a round-trip to the server
  answers: PromptAnswers;
  setAnswers: Dispatch<SetStateAction<PromptAnswers>>;
}

interface Question {
  key: AnswerKey;
  title: string;
  question: string;
  example: string;
  placeholder: string;
}

export const initialPromptAnswers: PromptAnswers = {
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
    title: t('Name'),
    question: t("What is your organisation's name and the name you want to give this AI assistant?"),
    example: t('E.g. "Chatbot name: SNEHA DIDI, by org: SNEHA"'),
    placeholder: t('Organisation name and chatbot name...'),
  },
  {
    key: 'purpose',
    title: t('Core purpose'),
    question: t('In one or two sentences, what is this assistant supposed to help people with?'),
    example: t('E.g. "Responds to queries from women on early childhood healthcare, pregnancy, government schemes."'),
    placeholder: t('Describe the core purpose...'),
  },
  {
    key: 'audience',
    title: t('Audience'),
    question: t('Who will be chatting with the assistant? Describe in as much detail as possible.'),
    example: t('E.g. "Pregnant or new mothers from urban slums, low literacy, familiar with everyday Hindi or Urdu."'),
    placeholder: t('Describe your audience...'),
  },
  {
    key: 'language',
    title: t('Language'),
    question: t("What language(s) should it reply in — always English, always Hindi, or match the user's language?"),
    example: t('Specify Hinglish, Hindi script, regional languages, or match the input language.'),
    placeholder: t('Language preference...'),
  },
  {
    key: 'tone',
    title: t('Tone'),
    question: t('What tone? (Simple & friendly / formal / instructional like a health worker)'),
    example: t('E.g. "Language a 5-year-old will understand" or "Formal structured responses."'),
    placeholder: t('Describe the tone...'),
  },
  {
    key: 'format',
    title: t('Response format'),
    question: t('How long should responses be, and in what format (bullet points, short paragraphs, numbered steps)?'),
    example: t('E.g. "Max 3 short sentences" or "Use numbered steps for instructions."'),
    placeholder: t('Describe the response format...'),
  },
  {
    key: 'offLimits',
    title: t('Off-limits'),
    question: t('Are there any topics the assistant must never respond to?'),
    example: t('E.g. "No medical diagnosis or legal advice." Type NA if none.'),
    placeholder: t('List off-limits topics, or NA...'),
  },
  {
    key: 'fallback',
    title: t('Fallback'),
    question: t("What should the assistant say when it doesn't know the answer?"),
    example: t('E.g. "Sorry, I\'m not sure about that — please contact our helpline."'),
    placeholder: t('Exact fallback message...'),
  },
  {
    key: 'escalation',
    title: t('Escalation'),
    question: t('How should users reach a human or escalate urgent / out-of-scope queries?'),
    example: t('E.g. "Call 1800-xxx-xxx" or "Reply AGENT to talk to staff." Type NA if none.'),
    placeholder: t('Escalation path, or NA...'),
  },
];

type Phase = 'questions' | 'generating' | 'ready' | 'error';

export const PromptGeneratorModal = ({ open, onClose, onApply, answers, setAnswers }: PromptGeneratorModalProps) => {
  const { t } = useTranslation();
  const questions = getQuestions(t);

  const [phase, setPhase] = useState<Phase>('questions');
  const [generatedText, setGeneratedText] = useState('');
  const [inlineError, setInlineError] = useState('');
  // expand the preview so the whole generated prompt is visible without scrolling
  const [expanded, setExpanded] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // all fields are mandatory — generation is only allowed once every question is answered
  const allAnswered = questions.every((question) => answers[question.key].trim() !== '');

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

  const markReady = (text: string) => {
    clearTimers();
    stopPolling();
    setGeneratedText(text);
    setPhase('ready');
  };

  // derive state from polling results (Apollo recommends derived state over
  // onCompleted/onError when those callbacks set local state)
  useEffect(() => {
    const result = pollData?.promptGeneration?.promptGeneration;
    if (!result) return;
    if (result.status === 'ready') {
      if (result.generatedPrompt?.trim()) {
        markReady(result.generatedPrompt);
      } else {
        handleFailure(t('Prompt generation failed. Please try again.'));
      }
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
          markReady(generation.generatedPrompt || '');
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

  const handleClear = () => {
    setAnswers(initialPromptAnswers);
  };

  const handleApply = () => {
    // keep the answers in the parent page so reopening the modal still shows them;
    // closing unmounts the modal, which resets the local phase/preview state.
    handleClose();
    onApply(generatedText);
  };

  const isGenerating = phase === 'generating' || generating;

  const renderQuestions = () => (
    <>
      <div className={styles.BetaBanner} data-testid="betaBanner">
        {t('This is a beta feature, currently in testing — shared for feedback & testing only.')}
      </div>

      <div className={styles.ScrollArea}>
        {questions.map((question, index) => (
          <div className={styles.Question} key={question.key}>
            <div className={styles.QuestionHeader}>
              <span className={styles.Number}>{index + 1}</span>
              <span className={styles.QuestionTitle}>{question.title}</span>
            </div>
            <p className={styles.QuestionText}>{question.question}</p>
            <p className={styles.Example}>{question.example}</p>
            <Input
              field={{
                name: question.key,
                value: answers[question.key],
                onChange: handleChange(question.key),
                onBlur: () => {},
              }}
              placeholder={question.placeholder}
              textArea
              rows={3}
            />
          </div>
        ))}
      </div>

      <div className={styles.Footer}>
        <span className={styles.FooterNote}>{t('All 9 questions help generate a better prompt')}</span>
        <div className={styles.FooterActions}>
          <Button variant="outlined" onClick={handleClear} data-testid="clearAnswersButton">
            {t('Clear')}
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={!allAnswered}
            data-testid="generatePromptButton"
          >
            {t('Generate Prompt')}
          </Button>
        </div>
      </div>
    </>
  );

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
      <div className={styles.ButtonRow}>
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
      <div className={styles.ReviewNotice} data-testid="reviewNotice">
        <strong>{t('This is an AI generated prompt.')}</strong>{' '}
        {t('Please review and edit if required before adding it to your assistant.')}
      </div>
      <div className={styles.PreviewToolbar}>
        <IconButton
          size="small"
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? t('Collapse') : t('Expand')}
          data-testid="togglePreviewSize"
        >
          {expanded ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
        </IconButton>
      </div>
      <OutlinedInput
        name="generated-prompt"
        value={generatedText}
        onChange={(event) => setGeneratedText(event.target.value)}
        className={styles.PreviewInput}
        multiline
        rows={expanded ? 26 : 12}
        data-testid="generatedPrompt"
        inputProps={{ 'data-testid': 'generatedPromptInput' }}
      />
      <div className={styles.ButtonRow}>
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
        <div className={`${styles.Container} ${expanded && phase === 'ready' ? styles.ContainerExpanded : ''}`}>
          <div className={styles.Header}>
            <div className={styles.HeaderText}>
              <h5 className={styles.Title}>
                {t('Generate Prompt with AI')}
                <span className={styles.BetaBadge}>{t('BETA')}</span>
              </h5>
              <span className={styles.Subtitle}>{t('Answer 9 questions to get a tailored assistant prompt')}</span>
            </div>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              data-testid="closePromptGenerator"
              className={styles.CloseButton}
            >
              <CloseIcon />
            </IconButton>
          </div>
          {body}
        </div>
      </div>
    </Modal>
  );
};
