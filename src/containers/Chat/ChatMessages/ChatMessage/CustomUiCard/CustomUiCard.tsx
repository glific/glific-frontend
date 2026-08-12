import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import styles from './CustomUiCard.module.css';

/**
 * Generic staff-facing rendering of a Custom UI interactive message.
 *
 * Native block rendering is deliberately out of scope for the staff console — end users see the
 * real block in the web widget. Here we show what was sent (component, fallback text, raw
 * payload) and, once the contact has replied, the answered state.
 */
export interface CustomUiCardProps {
  /** The parsed `interactive_content` envelope (contract §2/§3). */
  content: any;
  /** Simulator variant: renders on the tinted simulator bubble and accepts a reply. */
  isSimulator?: boolean;
  /** Inbox variant: the card is never interactive in the staff inbox. */
  disabled?: boolean;
  /** Called with `{ values, summary }` when the simulator user submits a response. */
  onRespond?: (response: { values: any; summary: string }) => void;
}

/**
 * Turn typed simulator text into a Custom UI response body.
 *
 * A valid JSON object is used as `values` verbatim; anything else becomes `{ input: <text> }`.
 * The summary is the raw text either way, clamped to the contract §7 limit of 500 chars.
 */
export const parseCustomUiResponse = (text: string): { values: any; summary: string } => {
  const trimmed = (text || '').trim();
  let values: any = { input: trimmed };

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        values = parsed;
      }
    } catch (error) {
      // not JSON — fall through to the { input: text } shape
    }
  }

  return { values, summary: trimmed.slice(0, 500) };
};

export const CustomUiCard = ({
  content,
  isSimulator = false,
  disabled = false,
  onRespond = () => {},
}: CustomUiCardProps) => {
  const [showPayload, setShowPayload] = useState(false);
  const [responseText, setResponseText] = useState('');

  const component = content?.component || 'unknown';
  const fallback = content?.fallback || '';
  const answered = !!content?.answered;
  const answerSummary = content?.answer_summary;

  const payload = JSON.stringify(
    { component, props: content?.props ?? {}, ...(content?.context !== undefined ? { context: content.context } : {}) },
    null,
    2
  );

  const canRespond = isSimulator && !disabled && !answered;

  const handleSubmit = () => {
    if (!responseText.trim()) return;
    onRespond(parseCustomUiResponse(responseText));
    setResponseText('');
  };

  return (
    <div
      className={`${styles.Card} ${isSimulator ? styles.Simulator : styles.Inbox} ${answered ? styles.Answered : ''}`}
      data-testid="customUiCard"
      data-answered={answered}
    >
      <div className={styles.Header} data-testid="customUiHeader">
        Interactive · {component}
      </div>

      <div className={styles.Fallback} data-testid="customUiFallback">
        {fallback}
      </div>

      <button
        type="button"
        className={styles.PayloadToggle}
        data-testid="customUiPayloadToggle"
        onClick={() => setShowPayload(!showPayload)}
      >
        {showPayload ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        {showPayload ? 'Hide payload' : 'Show payload'}
      </button>

      {showPayload && (
        <pre className={styles.Payload} data-testid="customUiPayload">
          {payload}
        </pre>
      )}

      {answered && (
        <div className={styles.AnswerSummary} data-testid="customUiAnswerSummary">
          Answered: {answerSummary || '—'}
        </div>
      )}

      {canRespond && (
        <div className={styles.Respond}>
          <TextField
            size="small"
            fullWidth
            variant="outlined"
            placeholder="Reply text, or a JSON object of values"
            value={responseText}
            data-testid="customUiResponseInput"
            slotProps={{ htmlInput: { 'aria-label': 'Custom UI response' } }}
            onChange={(event) => setResponseText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            variant="text"
            className={styles.RespondButton}
            data-testid="customUiRespondButton"
            onClick={handleSubmit}
          >
            Send response
          </Button>
        </div>
      )}
    </div>
  );
};
