import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import {
  BlocksResponse,
  GLIFIC_BLOCKS,
  buildCarouselResponse,
  buildFormResponse,
  buildImagePanelResponse,
  deriveBody,
  unwrap,
} from 'containers/InteractiveMessage/Blocks.helper';
import styles from './BlocksRenderer.module.css';

/**
 * MUI reimplementation of the web widget's block renderer (contract §11).
 *
 * Read-only by default — the interactive-message preview panel and the staff Chat thread both
 * render it that way, and the answered state comes from `answered` / `answer_summary`, which the
 * backend writes into the outbound message's `interactive_content` on response receipt (§3).
 *
 * The flow preview simulator's Web tab passes `interactive`, which turns the controls live and
 * produces a real `{ values, summary }` per §6. That is the only place a console-side response is
 * generated, and it is the only tab that exercises the blocks response contract (§13.5).
 */
export interface BlocksRendererProps {
  /** The envelope, typed (template) or unwrapped (message) — `unwrap` is idempotent. */
  content: any;
  /** Rendered small, for the staff Chat thread rather than the preview panel. */
  compact?: boolean;
  /** Turn the controls live. Off everywhere except the simulator's Web tab. */
  interactive?: boolean;
  /** Called with the §6 `{ values, summary }` when an interactive block is answered. */
  onRespond?: (response: BlocksResponse) => void;
}

interface OptionLike {
  id?: string;
  image?: string;
  image_alt?: string;
  label?: string;
  title?: string;
  description?: string;
}

interface BlockProps {
  props: any;
  interactive: boolean;
  onRespond: (response: BlocksResponse) => void;
}

const asArray = (value: any): any[] => (Array.isArray(value) ? value : []);

const BlockImage = ({ url, alt, className }: { url?: string; alt?: string; className: string }) => {
  if (!url) return null;
  return <img src={url} alt={alt || ''} className={className} loading="lazy" />;
};

const BlockBody = ({ text }: { text?: string }) =>
  text ? (
    <div className={styles.Body} data-testid="blocksBody">
      {text}
    </div>
  ) : null;

const ImagePanel = ({ props, interactive, onRespond }: BlockProps) => (
  <div className={styles.Block} data-testid="blocksImagePanel">
    <BlockBody text={props.body} />
    <div className={styles.OptionGrid}>
      {asArray(props.options).map((option: OptionLike, index: number) => (
        <button
          type="button"
          key={option.id ?? `option-${index}`}
          className={`${styles.Option} ${interactive ? styles.Selectable : ''}`}
          data-testid="imagePanelOption"
          disabled={!interactive}
          onClick={() => onRespond(buildImagePanelResponse(props, option))}
        >
          <BlockImage url={option.image} alt={option.image_alt} className={styles.OptionImage} />
          <span className={styles.OptionLabel}>{option.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const Carousel = ({ props, interactive, onRespond }: BlockProps) => (
  <div className={styles.Block} data-testid="blocksCarousel">
    <BlockBody text={props.body} />
    <div className={styles.CarouselTrack} data-testid="carouselTrack">
      {asArray(props.cards).map((card: OptionLike, index: number) => (
        <div key={card.id ?? `card-${index}`} className={styles.Card} data-testid="carouselCard">
          <BlockImage url={card.image} alt={card.image_alt} className={styles.CardImage} />
          <div className={styles.CardText}>
            <span className={styles.CardTitle}>{card.title}</span>
            {card.description && <span className={styles.CardDescription}>{card.description}</span>}
            <Button
              variant="outlined"
              size="small"
              disabled={!interactive}
              fullWidth
              className={styles.CardButton}
              data-testid="carouselSelect"
              onClick={() => onRespond(buildCarouselResponse(props, card))}
            >
              Select
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FormBlock = ({ props, interactive, onRespond }: BlockProps) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const fields = asArray(props.fields);
  const missingRequired = fields.some((field: any) => field.required && !(values[field.id] ?? '').trim());

  return (
    <div className={styles.Block} data-testid="blocksForm">
      <BlockBody text={props.body} />
      <div className={styles.Fields}>
        {fields.map((field: any, index: number) => (
          <TextField
            key={field.id ?? `field-${index}`}
            size="small"
            fullWidth
            disabled={!interactive}
            variant="outlined"
            label={field.label}
            required={!!field.required}
            placeholder={field.placeholder}
            data-testid="formField"
            value={values[field.id] ?? ''}
            slotProps={{ htmlInput: { 'aria-label': field.label || field.id } }}
            onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
          />
        ))}
        <Button
          variant="contained"
          size="small"
          disabled={!interactive || missingRequired}
          fullWidth
          data-testid="formSubmit"
          onClick={() => onRespond(buildFormResponse(props, values))}
        >
          {props.submit_label || 'Submit'}
        </Button>
      </div>
    </div>
  );
};

/** §6 — a Custom Block is rendered by the org's own component in the widget, not here. */
const NoPreview = ({ body }: { body: string }) => (
  <div className={styles.Block} data-testid="blocksNoPreview">
    <BlockBody text={body} />
    <div className={styles.NoPreview}>This block has no preview</div>
  </div>
);

export const BlocksRenderer = ({
  content,
  compact = false,
  interactive = false,
  onRespond = () => {},
}: BlocksRendererProps) => {
  const envelope = unwrap(content ?? {});
  const component: string = envelope?.component ?? '';
  const props = envelope?.props ?? {};
  const answered = !!envelope?.answered;
  // an already-answered block is never re-answerable: the backend rejects a second submit
  const live = interactive && !answered;

  let block;
  if (component === 'glific/image-panel') {
    block = <ImagePanel props={props} interactive={live} onRespond={onRespond} />;
  } else if (component === 'glific/carousel') {
    block = <Carousel props={props} interactive={live} onRespond={onRespond} />;
  } else if (component === 'glific/form') {
    block = <FormBlock props={props} interactive={live} onRespond={onRespond} />;
  } else {
    block = <NoPreview body={deriveBody(content ?? {})} />;
  }

  return (
    <div
      className={`${styles.Renderer} ${compact ? styles.Compact : ''}`}
      data-testid="blocksRenderer"
      data-component={component}
      data-answered={answered}
      data-interactive={live}
    >
      {block}
      {answered && (
        <div className={styles.Answered} data-testid="blocksAnswered">
          Answered: {envelope.answer_summary || '—'}
        </div>
      )}
    </div>
  );
};

/** True when the component has a real MUI rendering rather than the no-preview placeholder. */
export const hasBlockPreview = (component: string | undefined | null): boolean =>
  !!component && GLIFIC_BLOCKS.includes(component);

export default BlocksRenderer;
