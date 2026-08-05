import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setErrorMessage } from 'common/notification';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './TryItOut.module.css';

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
  onGoToPersona: () => void;
  onSave: () => void;
  onRunEvaluation: () => void;
  onSendMessage?: (message: string) => Promise<string>;
}

// two exchanges is enough hand-testing to be worth pointing at a real evaluation
const NUDGE_AFTER_MESSAGES = 4;

export const TryItOut = ({
  hasVersions,
  isDirty,
  versionId,
  versionNumber,
  versionStatus,
  liveVersionNumber = null,
  hasGoldenQaSets = false,
  onGoToPersona,
  onSave,
  onRunEvaluation,
  onSendMessage,
}: TryItOutProps) => {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // a transcript belongs to the version that produced it
  useEffect(() => {
    setMessages([]);
    setDraft('');
  }, [versionId]);

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [messages, pending]);

  const canSend = Boolean(onSendMessage);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending || !onSendMessage) return;

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setDraft('');
    setPending(true);

    try {
      const reply = await onSendMessage(trimmed);
      setMessages((current) => [...current, { role: 'assistant', text: reply }]);
    } catch (error: unknown) {
      setErrorMessage(error);
      // the question stays in the transcript so it can be retried by hand
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: t('Could not get a reply. Try sending it again.'), failed: true },
      ]);
    } finally {
      setPending(false);
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
      <div className={styles.TestingNote} data-testid="testingNote">
        {t('Testing')}{' '}
        <b>
          {t('Version')} {versionNumber}
        </b>
        {liveVersionNumber
          ? ` · ${t('sandbox only — real users stay on Version')} ${liveVersionNumber}`
          : ` · ${t('nothing is live yet')}`}
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
                  {t('try a sample question')} →
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
                {message.text}
              </div>
            ))
          )}

          {pending && (
            <div className={`${styles.Message} ${styles.AssistantMessage}`} data-testid="pendingMessage">
              <span className={styles.Typing} />
              {t('Thinking…')}
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
