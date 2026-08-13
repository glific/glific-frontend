import { Button, TextField } from '@mui/material';
import { GLIFIC_BLOCKS, deriveBody, unwrap } from 'containers/InteractiveMessage/Blocks.helper';
import styles from './BlocksRenderer.module.css';

/**
 * MUI reimplementation of the web widget's block renderer (contract §11).
 *
 * Used in two read-only places: the interactive-message preview panel and the staff Chat
 * thread. Fidelity is best-effort — the contact sees the real thing in the widget — so nothing
 * here is interactive. The answered state is driven by `answered` / `answer_summary`, which the
 * backend writes into the outbound message's `interactive_content` on response receipt (§3).
 */
export interface BlocksRendererProps {
  /** The envelope, typed (template) or unwrapped (message) — `unwrap` is idempotent. */
  content: any;
  /** Rendered small, for the staff Chat thread rather than the preview panel. */
  compact?: boolean;
}

interface OptionLike {
  id?: string;
  image?: string;
  image_alt?: string;
  label?: string;
  title?: string;
  description?: string;
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

const ImagePanel = ({ props }: { props: any }) => (
  <div className={styles.Block} data-testid="blocksImagePanel">
    <BlockBody text={props.body} />
    <div className={styles.OptionGrid}>
      {asArray(props.options).map((option: OptionLike, index: number) => (
        <div key={option.id ?? `option-${index}`} className={styles.Option} data-testid="imagePanelOption">
          <BlockImage url={option.image} alt={option.image_alt} className={styles.OptionImage} />
          <span className={styles.OptionLabel}>{option.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const Carousel = ({ props }: { props: any }) => (
  <div className={styles.Block} data-testid="blocksCarousel">
    <BlockBody text={props.body} />
    <div className={styles.CarouselTrack} data-testid="carouselTrack">
      {asArray(props.cards).map((card: OptionLike, index: number) => (
        <div key={card.id ?? `card-${index}`} className={styles.Card} data-testid="carouselCard">
          <BlockImage url={card.image} alt={card.image_alt} className={styles.CardImage} />
          <div className={styles.CardText}>
            <span className={styles.CardTitle}>{card.title}</span>
            {card.description && <span className={styles.CardDescription}>{card.description}</span>}
            <Button variant="outlined" size="small" disabled fullWidth className={styles.CardButton}>
              Select
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FormBlock = ({ props }: { props: any }) => (
  <div className={styles.Block} data-testid="blocksForm">
    <BlockBody text={props.body} />
    <div className={styles.Fields}>
      {asArray(props.fields).map((field: any, index: number) => (
        <TextField
          key={field.id ?? `field-${index}`}
          size="small"
          fullWidth
          disabled
          variant="outlined"
          label={field.label}
          required={!!field.required}
          placeholder={field.placeholder}
          data-testid="formField"
        />
      ))}
      <Button variant="contained" size="small" disabled fullWidth data-testid="formSubmit">
        {props.submit_label || 'Submit'}
      </Button>
    </div>
  </div>
);

/** §6 — a Custom Block is rendered by the org's own component in the widget, not here. */
const NoPreview = ({ body }: { body: string }) => (
  <div className={styles.Block} data-testid="blocksNoPreview">
    <BlockBody text={body} />
    <div className={styles.NoPreview}>This block has no preview</div>
  </div>
);

export const BlocksRenderer = ({ content, compact = false }: BlocksRendererProps) => {
  const envelope = unwrap(content ?? {});
  const component: string = envelope?.component ?? '';
  const props = envelope?.props ?? {};
  const answered = !!envelope?.answered;

  let block;
  if (component === 'glific/image-panel') {
    block = <ImagePanel props={props} />;
  } else if (component === 'glific/carousel') {
    block = <Carousel props={props} />;
  } else if (component === 'glific/form') {
    block = <FormBlock props={props} />;
  } else {
    block = <NoPreview body={deriveBody(content ?? {})} />;
  }

  return (
    <div
      className={`${styles.Renderer} ${compact ? styles.Compact : ''}`}
      data-testid="blocksRenderer"
      data-component={component}
      data-answered={answered}
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
