import { useMutation } from '@apollo/client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningIcon from 'assets/images/icons/Warning.svg?react';
import { setErrorMessage } from 'common/notification';
import { Button } from 'components/UI/Form/Button/Button';
import { SEND_ASSISTANT_MESSAGE } from 'graphql/mutations/Assistant';
import type { AssistantChatResponse, SandboxMessage } from 'containers/AIEvaluation/types/sandboxType';
import { clearSandboxChat, readSandboxChat, writeSandboxChat } from 'containers/AIEvaluation/services/sandboxChatCache';
import { normalizeLineBreaks } from 'containers/AIEvaluation/utils/sandbox';
import { useAssistantChatResponse } from 'containers/AIEvaluation/hooks/useAssistantChatResponse';
import styles from './TryItOut.module.css';

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

const SLOW_REPLY_MS = 30_000;
const REPLY_TIMEOUT_MS = 90_000;
const LATE_REPLY_GRACE_MS = 120_000;

const ChatMessage = ({ message }: { message: SandboxMessage }) => {
  const isUser = message.role === 'user';
  const text = normalizeLineBreaks(message.text);

  return (
    <div
      className={`${styles.Message} ${isUser ? styles.UserMessage : styles.AssistantMessage} ${
        message.failed ? styles.FailedMessage : ''
      }`}
      data-testid={isUser ? 'userMessage' : 'assistantMessage'}
    >
      {!isUser && !message.failed ? (
        <div className={styles.Markdown}>
          <Markdown
            components={{
              a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
            }}
          >
            {text}
          </Markdown>
        </div>
      ) : (
        text
      )}
    </div>
  );
};

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
  const [slow, setSlow] = useState(false);
  const [awaitingLate, setAwaitingLate] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string>('');
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sendAssistantMessage] = useMutation(SEND_ASSISTANT_MESSAGE);

  const stopWaiting = () => {
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    if (lateTimerRef.current) clearTimeout(lateTimerRef.current);
    slowTimerRef.current = null;
    timeoutTimerRef.current = null;
    lateTimerRef.current = null;
    setSlow(false);
    setAwaitingLate(false);
  };

  // timers outlive the component otherwise, and fire against an unmounted tab
  useEffect(() => stopWaiting, []);

  useEffect(() => {
    const cached = readSandboxChat(assistantId, versionId);
    setMessages(cached?.messages ?? []);
    conversationIdRef.current = cached?.conversationId ?? '';
    setDraft('');
    setPending(false);
    stopWaiting();
    assistantChatResponse.reset();
  }, [assistantId, versionId]);

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [messages, pending]);

  const startNewChat = () => {
    clearSandboxChat(assistantId, versionId);
    setMessages([]);
    setDraft('');
    setPending(false);
    stopWaiting();
    assistantChatResponse.reset();
    conversationIdRef.current = '';
  };

  const finish = (message: SandboxMessage) => {
    stopWaiting();
    assistantChatResponse.reset();
    setMessages((current) => {
      const placeholder = current.findLastIndex((entry) => entry.timedOut);
      const next =
        placeholder === -1
          ? [...current, message]
          : current.map((entry, index) => (index === placeholder ? message : entry));

      writeSandboxChat(assistantId, versionId, { messages: next, conversationId: conversationIdRef.current });
      return next;
    });
    setPending(false);
  };

  const giveUp = () => {
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = null;
    setSlow(false);
    setPending(false);

    setMessages((current) => {
      const next: SandboxMessage[] = [
        ...current,
        {
          role: 'assistant',
          text: t('No reply came back in time. The assistant may be busy — try sending it again.'),
          failed: true,
          timedOut: true,
        },
      ];
      writeSandboxChat(assistantId, versionId, { messages: next, conversationId: conversationIdRef.current });
      return next;
    });

    // the request id is deliberately left in place — it is what matches the late answer
    setAwaitingLate(true);
    lateTimerRef.current = setTimeout(() => {
      assistantChatResponse.reset();
      stopWaiting();
    }, LATE_REPLY_GRACE_MS);
  };

  const handleResponse = (result: AssistantChatResponse) => {
    if (result.conversationId) conversationIdRef.current = result.conversationId;

    if (result.errors?.length) {
      finish({ role: 'assistant', text: result.errors[0].message, failed: true });
      return;
    }

    finish({ role: 'assistant', text: result.answer ?? t('Could not get a reply. Try sending it again.') });
  };

  const assistantChatResponse = useAssistantChatResponse({
    enabled: pending || awaitingLate,
    onResponse: handleResponse,
  });

  const canSend = Boolean(assistantId);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending || !assistantId) return;

    assistantChatResponse.reset();

    setMessages((current) => {
      // asking something new gives up on the older answer for good, so its placeholder stops
      // being a slot waiting to be filled
      const settled = current.map(({ timedOut, ...entry }) => entry);
      const next: SandboxMessage[] = [...settled, { role: 'user', text: trimmed }];
      writeSandboxChat(assistantId, versionId, { messages: next, conversationId: conversationIdRef.current });
      return next;
    });
    setDraft('');
    setPending(true);

    stopWaiting();
    slowTimerRef.current = setTimeout(() => setSlow(true), SLOW_REPLY_MS);
    timeoutTimerRef.current = setTimeout(giveUp, REPLY_TIMEOUT_MS);

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

      const result: AssistantChatResponse | undefined = response.data?.sendAssistantMessage;

      if (result?.errors?.length) {
        setErrorMessage(result.errors[0]);
        finish({ role: 'assistant', text: result.errors[0].message, failed: true });
        return;
      }

      if (result?.conversationId) conversationIdRef.current = result.conversationId;

      if (result?.answer) {
        finish({ role: 'assistant', text: result.answer });
        return;
      }

      const early = assistantChatResponse.expect(result?.requestId ?? null);
      if (early) handleResponse(early);
    } catch (error: unknown) {
      setErrorMessage(error);
      finish({ role: 'assistant', text: t('Could not get a reply. Try sending it again.'), failed: true });
    }
  };

  const blocker = (title: string, note: string, action: ReactNode, icon?: ReactNode) => (
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
      <LockOutlinedIcon fontSize="inherit" />
    );
  }

  if (versionStatus === 'in_progress') {
    return blocker(
      t('This version is still being prepared'),
      t('It can be tested once the server has finished building it.'),
      null,
      <HourglassEmptyIcon fontSize="inherit" />
    );
  }

  if (versionStatus === 'failed') {
    return blocker(
      t('This version failed to build'),
      t('Save a new version to try it out.'),
      <Button variant="outlined" onClick={onGoToPersona} data-testid="goToPersonaButton">
        {t('Go to Persona & Prompt')}
      </Button>,
      <WarningIcon />
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
                  {t('Try a sample question')}
                  <ArrowForwardIcon className={styles.SampleArrow} fontSize="inherit" />
                </button>
              )}
            </div>
          ) : (
            messages.map((message, index) => <ChatMessage key={`${message.role}-${index}`} message={message} />)
          )}

          {pending && (
            <>
              <div
                className={`${styles.Message} ${styles.AssistantMessage} ${styles.TypingBubble}`}
                aria-label={t('Thinking…')}
                data-testid="pendingMessage"
              >
                <span className={styles.TypingDot} />
                <span className={styles.TypingDot} />
                <span className={styles.TypingDot} />
              </div>

              {slow && (
                <div className={styles.SlowNote} role="status" data-testid="slowReplyNote">
                  {t('Still waiting — a long prompt or a reasoning model can take a while.')}
                </div>
              )}
            </>
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
            <div className={styles.NudgeIcon}>
              <CheckIcon fontSize="inherit" />
            </div>
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
