import { useMutation, useSubscription } from '@apollo/client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { setErrorMessage } from 'common/notification';
import { Button } from 'components/UI/Form/Button/Button';
import { SEND_ASSISTANT_MESSAGE } from 'graphql/mutations/Assistant';
import { LLM_CALL_RESPONSE_SUBSCRIPTION } from 'graphql/subscriptions/Assistant';
import { getUserSession } from 'services/AuthService';
import styles from './TryItOut.module.css';

interface LlmCallResponse {
  answer?: string | null;
  conversationId?: string | null;
  requestId?: string | null;
  errors?: { key?: string; message: string }[] | null;
}

export interface SandboxMessage {
  role: 'user' | 'assistant';
  text: string;
  failed?: boolean;
}

export interface TryItOutProps {
  hasVersions: boolean;
  isDirty: boolean;
  versionId?: string;
  versionNumber?: number;
  versionStatus?: string;
  liveVersionNumber?: number | null;
  hasGoldenQaSets?: boolean;
  assistantId?: string;
  onGoToPersona: () => void;
  onSave: () => void;
  onRunEvaluation: () => void;
}

const NUDGE_AFTER_MESSAGES = 4;

export const TryItOut = ({
  hasVersions,
  isDirty,
  versionId,
  versionNumber,
  versionStatus,
  liveVersionNumber = null,
  hasGoldenQaSets = false,
  assistantId,
  onGoToPersona,
  onSave,
  onRunEvaluation,
}: TryItOutProps) => {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  // the server issues the requestId, so we only learn it when the mutation answers. Until
  // then any subscription event could be ours, so they are held rather than dropped.
  const pendingRequestIdRef = useRef<string | null>(null);
  const earlyResponsesRef = useRef<LlmCallResponse[]>([]);
  const conversationIdRef = useRef<string>('');

  const [sendAssistantMessage] = useMutation(SEND_ASSISTANT_MESSAGE);

  // a transcript belongs to the version that produced it
  useEffect(() => {
    setMessages([]);
    setDraft('');
    setPending(false);
    pendingRequestIdRef.current = null;
    conversationIdRef.current = '';
  }, [versionId]);

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [messages, pending]);

  const startNewChat = () => {
    setMessages([]);
    setDraft('');
    setPending(false);
    pendingRequestIdRef.current = null;
    earlyResponsesRef.current = [];
    conversationIdRef.current = '';
  };

  const finish = (message: SandboxMessage) => {
    pendingRequestIdRef.current = null;
    earlyResponsesRef.current = [];
    setMessages((current) => [...current, message]);
    setPending(false);
  };

  const handleResponse = (result: LlmCallResponse) => {
    if (result.conversationId) conversationIdRef.current = result.conversationId;

    if (result.errors?.length) {
      finish({ role: 'assistant', text: result.errors[0].message, failed: true });
      return;
    }

    finish({ role: 'assistant', text: result.answer ?? t('Could not get a reply. Try sending it again.') });
  };

  useSubscription(LLM_CALL_RESPONSE_SUBSCRIPTION, {
    variables: { organizationId: getUserSession('organizationId') },
    skip: !pending,
    onData: ({ data }) => {
      const result: LlmCallResponse | undefined = data?.data?.llmCallResponse;
      if (!result) return;

      // the mutation has not told us our requestId yet — hold this in case it is ours
      if (!pendingRequestIdRef.current) {
        earlyResponsesRef.current.push(result);
        return;
      }

      // the subscription is organisation-wide, so other tabs' answers reach us too
      if (result.requestId !== pendingRequestIdRef.current) return;

      handleResponse(result);
    },
  });

  const canSend = Boolean(assistantId);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending || !assistantId) return;

    pendingRequestIdRef.current = null;
    earlyResponsesRef.current = [];

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setDraft('');
    setPending(true);

    try {
      const response = await sendAssistantMessage({
        variables: {
          input: {
            assistantId,
            message: trimmed,
            ...(conversationIdRef.current ? { conversationId: conversationIdRef.current } : {}),
          },
        },
      });

      const result: LlmCallResponse | undefined = response.data?.sendAssistantMessage;

      if (result?.errors?.length) {
        setErrorMessage(result.errors[0]);
        finish({ role: 'assistant', text: result.errors[0].message, failed: true });
        return;
      }

      if (result?.conversationId) conversationIdRef.current = result.conversationId;

      // an answer here means there is nothing to wait for
      if (result?.answer) {
        finish({ role: 'assistant', text: result.answer });
        return;
      }

      pendingRequestIdRef.current = result?.requestId ?? null;

      // the answer may already have arrived while the mutation was still in flight
      const early = earlyResponsesRef.current.find(
        (event) => event.requestId && event.requestId === pendingRequestIdRef.current
      );
      earlyResponsesRef.current = [];
      if (early) handleResponse(early);
    } catch (error: unknown) {
      setErrorMessage(error);
      // the question stays in the transcript so it can be retried by hand
      finish({ role: 'assistant', text: t('Could not get a reply. Try sending it again.'), failed: true });
    }
  };

  const blocker = (title: string, note: string, action: ReactNode, icon?: string) => (
    <div className={styles.Blocker} data-testid="tryItOutBlocker">
      {icon && <div className={styles.BlockerIcon}>{icon}</div>}
      <div className={styles.BlockerTitle}>{title}</div>
      <div className={styles.BlockerNote}>{note}</div>
      <div className={styles.BlockerAction}>{action}</div>
    </div>
  );

  if (!hasVersions) {
    return blocker(
      t('Save your first version to try it out'),
      t('Try It Out runs against a saved config on the server.'),
      <Button variant="outlined" onClick={onGoToPersona} data-testid="goToPersonaButton">
        {t('Go to Persona & Prompt')}
      </Button>
    );
  }

  if (isDirty) {
    return blocker(
      t('Save a version to try it out'),
      t(
        "Try It Out runs against a saved config on the server, not what's in your browser — that's what lets your teammates test the same thing you're testing."
      ),
      <Button variant="contained" color="primary" onClick={onSave} data-testid="saveFromTryItOutButton">
        {t('Save Version')}
      </Button>,
      '🔒'
    );
  }

  if (versionStatus === 'in_progress') {
    return blocker(
      t('This version is still being prepared'),
      t('It can be tested once the server has finished building it.'),
      null,
      '⏳'
    );
  }

  if (versionStatus === 'failed') {
    return blocker(
      t('This version failed to build'),
      t('Save a new version to try it out.'),
      <Button variant="outlined" onClick={onGoToPersona} data-testid="goToPersonaButton">
        {t('Go to Persona & Prompt')}
      </Button>,
      '⚠️'
    );
  }

  const showNudge = messages.length >= NUDGE_AFTER_MESSAGES && hasGoldenQaSets;

  return (
    <div data-testid="tryItOut">
      <div className={styles.SandboxHeader}>
        <div className={styles.TestingNote} data-testid="testingNote">
          {t('Testing')}{' '}
          <b>
            {t('Version')} {versionNumber}
          </b>
          {liveVersionNumber
            ? ` · ${t('sandbox only — real users stay on Version')} ${liveVersionNumber}`
            : ` · ${t('nothing is live yet')}`}
        </div>

        {messages.length > 0 && (
          <Button
            variant="outlined"
            className={styles.NewChatButton}
            onClick={startNewChat}
            data-testid="newChatButton"
          >
            {t('New chat')}
          </Button>
        )}
      </div>

      <div className={styles.Card}>
        <div className={styles.Chat} ref={chatRef} data-testid="sandboxChat">
          {messages.length === 0 && !pending ? (
            <div className={styles.EmptyState} data-testid="sandboxEmpty">
              {t('Send a message to test this version.')}
              {canSend && (
                <button
                  type="button"
                  className={styles.SampleLink}
                  onClick={() => send(t('What can you help me with?'))}
                  data-testid="sampleQuestionButton"
                >
                  {t('Try a sample question')} →
                </button>
              )}
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                // append-only transcript, so the index is stable for a given message
                key={`${message.role}-${index}`}
                className={`${styles.Message} ${message.role === 'user' ? styles.UserMessage : styles.AssistantMessage} ${
                  message.failed ? styles.FailedMessage : ''
                }`}
                data-testid={message.role === 'user' ? 'userMessage' : 'assistantMessage'}
              >
                {message.role === 'assistant' && !message.failed ? (
                  // the model answers in markdown; what the user typed is shown verbatim
                  <div className={styles.Markdown}>
                    <Markdown
                      components={{
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                      }}
                    >
                      {message.text}
                    </Markdown>
                  </div>
                ) : (
                  message.text
                )}
              </div>
            ))
          )}

          {pending && (
            <div
              className={`${styles.Message} ${styles.AssistantMessage} ${styles.TypingBubble}`}
              aria-label={t('Thinking…')}
              data-testid="pendingMessage"
            >
              <span className={styles.TypingDot} />
              <span className={styles.TypingDot} />
              <span className={styles.TypingDot} />
            </div>
          )}
        </div>

        <div className={styles.Composer}>
          <input
            className={styles.ComposerInput}
            value={draft}
            placeholder={t('Type a message as a user would…')}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') send(draft);
            }}
            data-testid="sandboxInput"
          />
          <Button
            variant="contained"
            color="primary"
            className={styles.SendButton}
            onClick={() => send(draft)}
            disabled={!canSend || pending || draft.trim() === ''}
            data-testid="sendMessageButton"
          >
            {t('Send')}
          </Button>
        </div>

        {!canSend && (
          <div className={styles.Note} data-testid="sandboxUnavailable">
            {t('Testing a version needs a sandbox endpoint, which is not available yet.')}
          </div>
        )}

        {showNudge && (
          <div className={styles.Nudge} data-testid="evaluationNudge">
            <div className={styles.NudgeIcon}>✓</div>
            <div className={styles.NudgeText}>
              <div className={styles.NudgeTitle}>{t('Happy with these responses?')}</div>
              <div className={styles.Note}>
                {t(
                  'Trying a few questions by hand is a good start — an evaluation checks every question in your Golden Q&A set and catches answers that change between attempts.'
                )}
              </div>
            </div>
            <Button
              variant="contained"
              color="primary"
              className={styles.NudgeButton}
              onClick={onRunEvaluation}
              data-testid="runEvaluationButton"
            >
              {t('Run an evaluation')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TryItOut;
