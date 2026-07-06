import { Tooltip as MuiTooltip } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { t } from 'i18next';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
import DownArrow from 'assets/images/icons/DownArrow.svg?react';
import { WhatsAppToJsx } from 'common/RichEditor';
import { capitalizeFirstLetter } from 'common/utils';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { FILTER_TEMPLATES, GET_TEMPLATES_COUNT } from 'graphql/queries/Template';
import { DELETE_TEMPLATE } from 'graphql/mutations/Template';

import styles from './HSMListV2.module.css';

dayjs.extend(relativeTime);

export const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

export const queries = {
  countQuery: GET_TEMPLATES_COUNT,
  filterItemsQuery: FILTER_TEMPLATES,
  deleteItemQuery: DELETE_TEMPLATE,
};

export const statusFilter = {
  APPROVED: false,
  PENDING: false,
  REJECTED: false,
  FAILED: false,
};

// Two-letter chips for the Languages column. Falls back to the first two letters
// of the language name when a code isn't mapped.
const LANGUAGE_CODES: Record<string, string> = {
  English: 'EN',
  Hindi: 'HI',
  Marathi: 'MR',
  Tamil: 'TA',
  Telugu: 'TE',
  Kannada: 'KN',
  Malayalam: 'ML',
  Gujarati: 'GU',
  Bengali: 'BN',
  Punjabi: 'PA',
  Odia: 'OR',
  Urdu: 'UR',
  Assamese: 'AS',
  Spanish: 'ES',
  French: 'FR',
};
const languageCode = (label = '') => LANGUAGE_CODES[label] ?? label.slice(0, 2).toUpperCase();

const statusChipClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return styles.ChipPending;
    case 'REJECTED':
    case 'FAILED':
      return styles.ChipRejected;
    default:
      return styles.ChipApproved;
  }
};

// highlight {{1}}, {{2}} ... variables in the body like a WhatsApp message preview.
const highlightVariables = (text = '') =>
  text.split(/(\{\{\d+\}\})/g).map((part, index) =>
    /^\{\{\d+\}\}$/.test(part) ? (
      <span key={index} className={styles.PreviewVar}>
        {part}
      </span>
    ) : (
      part
    )
  );

// WhatsApp-style message preview shown when hovering a title / body.
const messagePreview = (variant: any, title: string) => (
  <div className={styles.PreviewCard}>
    <div className={styles.PreviewHeader}>
      {(title || '').toUpperCase()} · {languageCode(variant.language?.label ?? variant.language)}
    </div>
    <div className={styles.PreviewBubble}>
      <div className={styles.PreviewBody}>{highlightVariables(variant.body)}</div>
      {variant.footer && <div className={styles.PreviewFooter}>{variant.footer}</div>}
    </div>
  </div>
);

// shared tooltip slot styling for the WhatsApp-style cards.
const previewSlotProps = {
  tooltip: { className: styles.PreviewTooltip },
  arrow: { className: styles.PreviewArrow },
};

// status label shown in the language chip tooltip.
const statusLabel = (status: string) => {
  switch ((status || '').toUpperCase()) {
    case 'PENDING':
      return t('Pending');
    case 'REJECTED':
      return t('Rejected');
    case 'FAILED':
      return t('Failed');
    default:
      return t('Approved');
  }
};

const languageChip = (variant: any, key: string | number) => {
  const status = variant.status;
  const label = variant.language?.label ?? variant.language;
  return (
    <Tooltip key={key} title={statusLabel(status)} placement="top">
      <span className={`${styles.LangChip} ${statusChipClass(status)}`}>
        <span className={styles.LangDot} />
        {languageCode(label)}
      </span>
    </Tooltip>
  );
};

const categoryLabel = (category = '') => capitalizeFirstLetter(category.split('_').join(' ').toLowerCase());

// leading chevron toggles the row's language variants open/closed. Always
// shown so the column stays aligned across rows, even for single-language
// templates.
const getTitle = (name: string, shortcode: string, primary: any, isOpen: boolean, onToggle: () => void) => (
  <div className={styles.LabelContainer}>
    <div className={styles.TitleRow}>
      <button
        type="button"
        data-testid="expand-toggle"
        aria-label={t('Toggle language variants')}
        aria-expanded={isOpen}
        className={`${styles.ChevronBtn} ${isOpen ? styles.ChevronOpen : ''}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <DownArrow />
      </button>
      <MuiTooltip
        title={messagePreview(primary, shortcode || name)}
        placement="bottom-start"
        arrow
        slotProps={previewSlotProps}
      >
        <div className={styles.LabelText}>{name}</div>
      </MuiTooltip>
    </div>
    {shortcode && <div className={styles.ShortCode}>{shortcode}</div>}
  </div>
);

// the Languages column shows one chip per language variant, coloured by status.
const getLanguages = (variants: any[] = []) => (
  <div className={styles.ChipRow}>{variants.map((variant, index) => languageChip(variant, variant.id ?? index))}</div>
);

// the Category column aggregates the variants' categories, e.g. "Utility ×2".
const getCategories = (variants: any[] = []) => {
  const counts = new Map<string, number>();
  variants.forEach((variant) => {
    const category = variant.category || '';
    counts.set(category, (counts.get(category) ?? 0) + 1);
  });
  return (
    <div className={styles.ChipRow}>
      {Array.from(counts.entries()).map(([category, count]) => (
        <p key={category} className={styles.TableText}>
          {categoryLabel(category)}
          {count > 1 ? ` ×${count}` : ''}
        </p>
      ))}
    </div>
  );
};

const getUpdatedAt = (date: string) => <div className={styles.LastModifiedText}>{dayjs(date).fromNow()}</div>;

const getReason = (reason: string) => <p className={styles.TableText}>{reason}</p>;

// the Reason column replaces "Last updated" when filtering by Rejected/Failed.
export const showReasonColumn = (status: string) => status === 'REJECTED' || status === 'FAILED';

// HSM templates come back from the backend as flat, one-row-per-language records.
// Group them by shortcode so each template shows as a single parent row, keeping
// the full variant list so the parent can render the Languages/Category columns
// and the expand chevron can reveal each language as a child row. Templates
// without a shortcode can't be grouped, so they stay standalone (keyed by id).
export const groupByShortcode = (items: any[] = []) => {
  const groups = new Map<string, any[]>();
  items.forEach((item) => {
    const key = item.shortcode ? `sc:${item.shortcode}` : `id:${item.id}`;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  });

  return Array.from(groups.values()).map((variants) => {
    // show the English variant as the parent row when present, else the first.
    const primary = variants.find((variant) => variant.language?.label === 'English') ?? variants[0];
    // most recently updated variant drives the parent's "last updated".
    const latest = variants.reduce((a, b) => (dayjs(b.updatedAt).isAfter(dayjs(a.updatedAt)) ? b : a));
    return { ...primary, updatedAt: latest.updatedAt, variants };
  });
};

export const getColumnNames = (showReason: boolean): any => [
  { name: 'label', label: t('Title') },
  { label: t('Languages') },
  { label: t('Category') },
  showReason ? { label: t('Reason') } : { name: 'updated_at', label: t('Last updated') },
  { label: t('Actions') },
];

export const getColumnStyles = (showReason: boolean): any => [
  styles.Name,
  styles.Languages,
  styles.Category,
  showReason ? styles.Reason : styles.LastModified,
  styles.Actions,
];

// Per-language row shown when a template is expanded: body preview + language
// chip + category + relative date (or reason when filtering by
// Rejected/Failed), aligned to the same columns as the parent row. Built as
// live JSX (not JSON-serialized), so Pager's generic collapsedRowData can
// render these `cells` directly instead of only the plain label+body pair
// InteractiveMessageList uses.
const buildVariantData =
  (showReason: boolean) =>
  (variants: any[] = []) =>
    variants.reduce((acc: Record<string, any>, variant, index) => {
      acc[variant.language?.id ?? `v-${index}`] = {
        cells: [
          <MuiTooltip
            key="body"
            title={messagePreview(variant, variant.shortcode || variant.label)}
            placement="bottom-start"
            arrow
            slotProps={previewSlotProps}
          >
            <p className={styles.CollapseBody}>{WhatsAppToJsx(variant.body)}</p>
          </MuiTooltip>,
          languageChip(variant, 'lang'),
          <p key="category" className={styles.TableText}>
            {categoryLabel(variant.category)}
          </p>,
          showReason ? (
            <p key="reason" className={styles.TableText}>
              {variant.reason}
            </p>
          ) : (
            <div key="updated" className={styles.LastModifiedText}>
              {dayjs(variant.updatedAt).fromNow()}
            </div>
          ),
          <div key="actions" className={styles.Actions} />,
        ],
      };
      return acc;
    }, {});

export const getColumns =
  (showReason: boolean, collapseOpen: boolean, collapseRow: string | undefined, onToggle: (id: string) => void) =>
  ({ id, label, shortcode, updatedAt, reason, variants, body, footer, language }: any) => ({
    id,
    label: getTitle(label || shortcode, shortcode, { body, footer, language }, collapseOpen && collapseRow === id, () =>
      onToggle(id)
    ),
    languages: getLanguages(variants),
    category: getCategories(variants),
    ...(showReason ? { reason: getReason(reason) } : { updatedAt: getUpdatedAt(updatedAt) }),
    translations: buildVariantData(showReason)(variants),
  });
