import { useState } from 'react';
import CallIcon from '@mui/icons-material/Call';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { TableCell, TableRow, Tooltip as MuiTooltip } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { t } from 'i18next';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
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

export const languageCode = (locale = '') => locale.slice(0, 2).toUpperCase();

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

const previewButtonIcon = (type: string) => {
  switch (type) {
    case 'URL':
      return <OpenInNewIcon className={styles.PreviewButtonIcon} />;
    case 'PHONE_NUMBER':
      return <CallIcon className={styles.PreviewButtonIcon} />;
    default:
      return null;
  }
};

const parsePreviewButtons = (buttons?: string | null) => {
  if (!buttons) return [];
  try {
    const parsed = JSON.parse(buttons);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const PreviewMedia = ({ media }: { media: any }) => {
  const [errored, setErrored] = useState(false);

  if (!media || !media.sourceUrl) return null;

  return (
    <div className={styles.PreviewMedia}>
      {errored ? (
        <div className={styles.PreviewMediaFallback} data-testid="preview-media-fallback">
          <ImageOutlinedIcon className={styles.PreviewMediaIcon} />
        </div>
      ) : (
        <img
          className={styles.PreviewMediaImage}
          src={media.sourceUrl}
          alt={media.caption || ''}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
};

const messagePreview = (variant: any, title: string) => {
  const buttons = parsePreviewButtons(variant.buttons);

  return (
    <div className={styles.PreviewCard}>
      <div className={styles.PreviewHeader}>
        {(title || '').toUpperCase()} · {languageCode(variant.language?.locale)}
      </div>
      <div className={styles.PreviewBubble}>
        <PreviewMedia media={variant.MessageMedia} />
        <div className={styles.PreviewBody}>{highlightVariables(variant.body)}</div>
        {variant.footer && <div className={styles.PreviewFooter}>{variant.footer}</div>}
      </div>
      {buttons.length > 0 && (
        <div className={styles.PreviewButtons}>
          {buttons.map((button: any, index: number) => (
            <div key={`${button.text}-${index}`} className={styles.PreviewButton}>
              {previewButtonIcon(button.type)}
              {button.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const previewSlotProps = {
  tooltip: { className: styles.PreviewTooltip },
  arrow: { className: styles.PreviewArrow },
};

const statusLabel = (status = '') => {
  const label = capitalizeFirstLetter(status.toLowerCase());
  return t(label, label);
};

const languageChip = (variant: any, key: string | number) => {
  const status = variant.status;
  return (
    <Tooltip key={key} title={statusLabel(status)} placement="top">
      <span className={`${styles.LangChip} ${statusChipClass(status)}`}>
        <span className={styles.LangDot} />
        {languageCode(variant.language?.locale)}
      </span>
    </Tooltip>
  );
};

export const categoryLabel = (category = '') => capitalizeFirstLetter(category.split('_').join(' ').toLowerCase());

const getTitle = (elementName: string, tagLabel: string | undefined, primary: any, expand?: any) => (
  <div className={styles.TitleRow}>
    {expand && (
      <button
        type="button"
        data-testid="expand-toggle"
        aria-label={t('Toggle language variants')}
        aria-expanded={expand.isOpen}
        className={`${styles.ChevronBtn} ${expand.isOpen ? styles.ChevronOpen : ''}`}
        onClick={() => expand.onToggle(expand.id)}
      >
        <ExpandMoreIcon />
      </button>
    )}
    <div className={styles.LabelContainer}>
      <MuiTooltip
        title={messagePreview(primary, elementName)}
        placement="bottom-start"
        arrow
        slotProps={previewSlotProps}
      >
        <div className={styles.LabelText}>{elementName}</div>
      </MuiTooltip>
      {tagLabel && <div className={styles.TagChip}>{tagLabel}</div>}
    </div>
  </div>
);

const getLanguages = (variants: any[] = []) => (
  <div className={styles.ChipRow}>{variants.map((variant, index) => languageChip(variant, variant.id ?? index))}</div>
);

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

export const showReasonColumn = (status: string) => status === 'REJECTED' || status === 'FAILED';

export const groupByShortcode = (items: any[] = []) => {
  const groups = new Map<string, any[]>();
  items.forEach((item) => {
    const key = item.shortcode ? `sc:${item.shortcode}` : `id:${item.id}`;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  });

  return Array.from(groups.values()).map((variants) => {
    const primary = variants.find((variant) => variant.language?.label === 'English') ?? variants[0];
    const latest = variants.reduce((a, b) => (dayjs(b.updatedAt).isAfter(dayjs(a.updatedAt)) ? b : a));
    return { ...primary, updatedAt: latest.updatedAt, variants };
  });
};

export const getCollapsedColumns = (showReason: boolean) => (variant: any) => [
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
];

export const getColumnNames = (showReason: boolean): any => [
  { name: 'label', label: t('Element name') },
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

const renderCollapsedRows = (variants: any[] = [], showReason: boolean) => {
  const renderColumns = getCollapsedColumns(showReason);
  const columnStyles = getColumnStyles(showReason);
  return (
    <>
      {variants.map((variant, index) => (
        <TableRow key={variant.id ?? index} className={styles.CollapseRowCustom}>
          {renderColumns(variant).map((cell, cellIndex) => (
            <TableCell key={cellIndex} className={`${columnStyles[cellIndex]} ${styles.RowStyle}`}>
              {cell}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export const getColumns =
  (showReason: boolean, collapse?: { collapseRow: string; collapseOpen: boolean; onToggle: (id: string) => void }) =>
  ({ id, label, shortcode, updatedAt, reason, variants, body, footer, language, buttons, MessageMedia, tag }: any) => ({
    id,
    label: getTitle(
      shortcode || label,
      tag?.label,
      { body, footer, language, buttons, MessageMedia },
      collapse
        ? { isOpen: collapse.collapseOpen && collapse.collapseRow === id, onToggle: collapse.onToggle, id }
        : undefined
    ),
    languages: getLanguages(variants),
    category: getCategories(variants),
    ...(showReason ? { reason: getReason(reason) } : { updatedAt: getUpdatedAt(updatedAt) }),
    collapseContent: renderCollapsedRows(variants, showReason),
  });
