import { useState } from 'react';
import { useNavigate } from 'react-router';
import { t } from 'i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MoreOptionsIcon from 'assets/images/icons/MoreOptions/More.svg?react';
import ViewIcon from 'assets/images/icons/ViewLight.svg?react';
import AddLanguageIcon from 'assets/images/icons/AddLanguage.svg?react';
import { copyToClipboardMethod } from 'common/utils';
import Menu from 'components/UI/Menu/Menu';

import type { GroupedTemplate, LanguageVariant, StatusType } from 'containers/HSM/HSMListV2/HSMList.types';
import styles from './HSMExpandableTable.module.css';

dayjs.extend(relativeTime);

const STATUS_CHIP_CLASS: Record<StatusType, string> = {
  APPROVED: styles.ChipApproved,
  PENDING: styles.ChipPending,
  REJECTED: styles.ChipRejected,
  FAILED: styles.ChipFailed,
};

const STATUS_BADGE_CLASS: Record<StatusType, string> = {
  APPROVED: styles.StatusApproved,
  PENDING: styles.StatusPending,
  REJECTED: styles.StatusRejected,
  FAILED: styles.StatusFailed,
};

const STATUS_LABEL: Record<StatusType, 'Approved' | 'Pending' | 'Rejected' | 'Failed'> = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
};


const LanguageChip = ({ variant }: { variant: LanguageVariant }) => (
  <span className={`${styles.LangChip} ${STATUS_CHIP_CLASS[variant.status]}`}>
    <span className={styles.ChipDot} />
    {variant.language.label.slice(0, 2).toUpperCase()}
  </span>
);

const LanguageChips = ({ variants }: { variants: LanguageVariant[] }) => {
  const visible = variants.slice(0, 4);
  const extra = variants.length - 4;
  return (
    <div className={styles.LangChips}>
      {visible.map((v) => (
        <LanguageChip key={v.id} variant={v} />
      ))}
      {extra > 0 && <span className={`${styles.LangChip} ${styles.MoreChip}`}>+{extra}</span>}
    </div>
  );
};

const SingleLangChip = ({ variant }: { variant: LanguageVariant }) => (
  <div className={styles.LangChips}>
    <LanguageChip variant={variant} />
  </div>
);

const StatusBadge = ({ status }: { status: StatusType }) => (
  <span className={`${styles.StatusBadge} ${STATUS_BADGE_CLASS[status]}`}>
    {t(STATUS_LABEL[status])}
  </span>
);

const formatCategory = (category: string) => {
  if (category === 'UTILITY_BY_META') return 'Utility by Meta';
  return category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, ' ');
};

const CategoryLabel = ({ category }: { category: string }) => (
  <span className={`${styles.CategoryBadge} ${(styles as Record<string, string>)[`Cat_${category}`] ?? ''}`}>
    {category === 'UTILITY_BY_META' && <span style={{ fontSize: 11 }}>⚠</span>}
    {formatCategory(category)}
  </span>
);

const MixedCategories = ({ variants }: { variants: LanguageVariant[] }) => {
  const counts = variants.reduce<Record<string, number>>((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={styles.MixedCategories}>
      {Object.entries(counts).map(([cat, count]) => (
        <span key={cat} className={`${styles.CategoryBadge} ${(styles as Record<string, string>)[`Cat_${cat}`] ?? ''}`}>
          {formatCategory(cat)}{count > 1 ? `×${count}` : ''}
        </span>
      ))}
    </div>
  );
};

interface HSMExpandableTableProps {
  templates: GroupedTemplate[];
}

const HSMExpandableTable = ({ templates }: HSMExpandableTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleRow = (shortcode: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(shortcode) ? next.delete(shortcode) : next.add(shortcode);
      return next;
    });
  };

  if (templates.length === 0) {
    return <div className={styles.EmptyState}>{t('No templates found')}</div>;
  }

  return (
    <div className={styles.Table}>
      <div className={styles.HeaderRow}>
        <div />
        <div>{t('Title')}</div>
        <div>{t('Languages')}</div>
        <div>{t('Category')}</div>
        <div>{t('Last Updated')}</div>
        <div />
      </div>

      {templates.map((template) => {
        const isExpanded = expandedRows.has(template.shortcode);
        const firstVariant = template.languageVariants[0];

        const parentMenuItems = [
          {
            title: t('Copy UUID'),
            onClick: () => {
              if (firstVariant?.bspId) copyToClipboardMethod(firstVariant.bspId);
            },
          },
          {
            title: t('Duplicate'),
            onClick: () =>
              navigate('/template-v2/add', { state: { mode: 'copy', shortcode: template.shortcode } }),
          },
        ];

        return (
          <div key={template.shortcode}>
            <div
              className={`${styles.Row} ${isExpanded ? styles.RowExpanded : ''}`}
              onClick={() => toggleRow(template.shortcode)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleRow(template.shortcode)}
              aria-expanded={isExpanded}
            >
              <div className={`${styles.Chevron} ${isExpanded ? styles.ChevronOpen : ''}`}>
                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
              </div>

              <div className={styles.TitleCell}>
                <span className={styles.TemplateLabel}>{template.label}</span>
                {template.tag && <span className={styles.TagPill}>{template.tag.label}</span>}
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <LanguageChips variants={template.languageVariants} />
              </div>

              <div className={styles.CategoryCell}>
                <MixedCategories variants={template.languageVariants} />
              </div>

              <div className={styles.LastModified}>
                {firstVariant?.updatedAt ? dayjs(firstVariant.updatedAt).fromNow() : '—'}
              </div>

              <div className={styles.ActionsCell} onClick={(e) => e.stopPropagation()}>
                <span
                  className={styles.ActionIcon}
                  title={t('Add new language')}
                  onClick={() =>
                    navigate('/template-v2/add', {
                      state: { mode: 'add-language', shortcode: template.shortcode },
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={() => {}}
                  aria-label={t('Add new language')}
                >
                  <AddLanguageIcon width={16} height={16} />
                </span>
                <span
                  className={styles.ActionIcon}
                  title={t('View')}
                  onClick={() => navigate(`/template/${firstVariant?.id}/edit`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={() => {}}
                  aria-label={t('View')}
                >
                  <ViewIcon width={16} height={16} />
                </span>
                <Menu menus={parentMenuItems} placement="bottom-end">
                  <span className={styles.ActionIcon} aria-label={t('More options')}>
                    <MoreOptionsIcon width={16} height={16} />
                  </span>
                </Menu>
              </div>
            </div>

            {isExpanded &&
              template.languageVariants.map((variant) => (
                <div key={variant.id} className={styles.SubRow}>
                  <div className={styles.SubRowIndent} />
                  <div className={styles.BodyCell}>{variant.body}</div>
                  <div>
                    <SingleLangChip variant={variant} />
                  </div>
                  <div className={styles.CategoryCell}>
                    <CategoryLabel category={variant.category} />
                  </div>
                  <div className={styles.LastModified}>
                    {variant.updatedAt ? dayjs(variant.updatedAt).fromNow() : '—'}
                  </div>
                  <div />
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
};

export default HSMExpandableTable;
