import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { BlocksRenderer, hasBlockPreview } from 'components/blocks/BlocksRenderer';
import { MAX_SUMMARY_LENGTH, clampText, deriveBody } from 'containers/InteractiveMessage/Blocks.helper';
import styles from './BlocksCard.module.css';

/**
 * Staff-facing rendering of a Blocks message in the Chat thread (contract §11).
 *
 * Built-in blocks get the MUI renderer, so staff see roughly what the contact saw, including the
 * answered state the backend writes into the outbound message's content (§3). A Custom Block has
 * no console renderer, so it shows the derived body (§9) plus the raw payload instead.
 */
export interface BlocksCardProps {
  /** The parsed `interactive_content` envelope. */
  content: any;
  /** Simulator variant: renders on the tinted simulator bubble and accepts a reply. */
  isSimulator?: boolean;
  /** Inbox variant: the card is never interactive in the staff inbox. */
  disabled?: boolean;
  /** Called with `{ values, summary }` when the simulator user submits a response. */
  onRespond?: (response: { values: any; summary: string }) => void;
}

/**
 * Turn typed simulator text into a Blocks response body.
 *
 * A valid JSON object is used as `values` verbatim; anything else becomes `{ input: <text> }`.
 * The summary is the raw text either way, clamped to the contract §7 limit of 500 chars.
 */
export const parseBlocksResponse = (text: string): { values: any; summary: string } => {
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

  return { values, summary: clampText(trimmed, MAX_SUMMARY_LENGTH) };
};

export const BlocksCard = ({
  content,
  isSimulator = false,
  disabled = false,
  onRespond = () => {},
}: BlocksCardProps) => {
  const [showPayload, setShowPayload] = useState(false);
  const [responseText, setResponseText] = useState('');

  const component = content?.component || 'unknown';
  const renderable = hasBlockPreview(component);
  const canRespond = isSimulator && !disabled && !content?.answered;

  const handleSubmit = () => {
    if (!responseText.trim()) return;
    onRespond(parseBlocksResponse(responseText));
    setResponseText('');
  };

  const payload = JSON.stringify(
    { component, props: content?.props ?? {}, ...(content?.context !== undefined ? { context: content.context } : {}) },
    null,
    2
  );

  return (
    <div
      className={`${styles.Card} ${isSimulator ? styles.Simulator : styles.Inbox}`}
      data-testid="blocksCard"
      data-answered={!!content?.answered}
    >
      <div className={styles.Header} data-testid="blocksHeader">
        Block · {component}
      </div>

      {renderable ? (
        <BlocksRenderer content={content} compact />
      ) : (
        <>
          <div className={styles.DerivedBody} data-testid="blocksDerivedBody">
            {deriveBody(content ?? {}) || 'This block has no preview'}
          </div>
          {content?.answered && (
            <div className={styles.AnswerSummary} data-testid="blocksAnswerSummary">
              Answered: {content.answer_summary || '—'}
            </div>
          )}
        </>
      )}

      <button
        type="button"
        className={styles.PayloadToggle}
        data-testid="blocksPayloadToggle"
        onClick={() => setShowPayload(!showPayload)}
      >
        {showPayload ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        {showPayload ? 'Hide payload' : 'Show payload'}
      </button>

      {showPayload && (
        <pre className={styles.Payload} data-testid="blocksPayload">
          {payload}
        </pre>
      )}

      {canRespond && (
        <div className={styles.Respond}>
          <TextField
            size="small"
            fullWidth
            variant="outlined"
            placeholder="Reply text, or a JSON object of values"
            value={responseText}
            data-testid="blocksResponseInput"
            slotProps={{ htmlInput: { 'aria-label': 'Blocks response' } }}
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
            data-testid="blocksRespondButton"
            onClick={handleSubmit}
          >
            Send response
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * The inbound reply to a Blocks message (§4). Its body is the summary; the raw `values` map is
 * only ever on this message, which is why the response JSON is shown here rather than on the
 * outbound bubble.
 */
export const BlocksResponseCard = ({ content }: { content: any }) => {
  const [showValues, setShowValues] = useState(false);
  const values = content?.values ?? {};

  return (
    <div className={`${styles.Card} ${styles.Response}`} data-testid="blocksResponseCard">
      <div className={styles.Header}>Block reply · {content?.component || 'unknown'}</div>
      <div className={styles.Summary} data-testid="blocksResponseSummary">
        {content?.summary || '—'}
      </div>
      <button
        type="button"
        className={styles.PayloadToggle}
        data-testid="blocksResponseToggle"
        onClick={() => setShowValues(!showValues)}
      >
        {showValues ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        {showValues ? 'Hide response' : 'Show response'}
      </button>
      {showValues && (
        <pre className={styles.Payload} data-testid="blocksResponseValues">
          {JSON.stringify(values, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default BlocksCard;
