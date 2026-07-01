import { useMutation, useQuery } from '@apollo/client';
import { FormControl, MenuItem, Select, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { t } from 'i18next';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
import ViewIcon from 'assets/images/icons/ViewLight.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import CopyAllOutlined from 'assets/images/icons/Flow/Copy.svg?react';

import { BULK_APPLY_SAMPLE_LINK } from 'config';
import { List } from 'containers/List/List';
import { templateInfo, templateStatusInfo, templateLanguageInfo } from 'common/HelpData';
import { setNotification } from 'common/notification';
import { WhatsAppToJsx } from 'common/RichEditor';
import { capitalizeFirstLetter, copyToClipboardMethod, exportCsvFile, getFileExtension } from 'common/utils';

import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Button } from 'components/UI/Form/Button/Button';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_TAGS } from 'graphql/queries/Tags';
import { FILTER_TEMPLATES, GET_TEMPLATES_COUNT, GET_HSM_CATEGORIES } from 'graphql/queries/Template';
import { BULK_APPLY_TEMPLATES, DELETE_TEMPLATE, SYNC_HSM_TEMPLATES } from 'graphql/mutations/Template';

import styles from './HSMListV2.module.css';

dayjs.extend(relativeTime);

const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

const queries = {
  countQuery: GET_TEMPLATES_COUNT,
  filterItemsQuery: FILTER_TEMPLATES,
  deleteItemQuery: DELETE_TEMPLATE,
};

const statusFilter = {
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

// status meta drives the label (header) and sentence (body) shown in the chip tooltip.
const statusMeta = (status: string) => {
  switch ((status || '').toUpperCase()) {
    case 'PENDING':
      return { label: t('Pending'), text: t('the template in this language is pending.') };
    case 'REJECTED':
      return { label: t('Rejected'), text: t('the template in this language was rejected.') };
    case 'FAILED':
      return { label: t('Failed'), text: t('the template in this language failed.') };
    default:
      return { label: t('Approved'), text: t('the template in this language is approved.') };
  }
};

// designed status tooltip, styled like a WhatsApp message card.
const statusTooltip = (status: string) => {
  const meta = statusMeta(status);
  return (
    <div className={styles.PreviewCard}>
      <div className={styles.PreviewHeader}>{meta.label}</div>
      <div className={styles.PreviewBubble}>
        <div className={styles.PreviewBody}>{meta.text}</div>
      </div>
    </div>
  );
};

const languageChip = (variant: any, key: string | number) => {
  const status = variant.status;
  const label = variant.language?.label ?? variant.language;
  return (
    <Tooltip key={key} title={statusTooltip(status)} placement="top" arrow slotProps={previewSlotProps}>
      <span className={`${styles.LangChip} ${statusChipClass(status)}`}>
        <span className={styles.LangDot} />
        {languageCode(label)}
      </span>
    </Tooltip>
  );
};

const categoryLabel = (category = '') => capitalizeFirstLetter(category.split('_').join(' ').toLowerCase());

const getTitle = (title: string, quality: string, primary: any) => (
  <div className={styles.LabelContainer}>
    <Tooltip title={messagePreview(primary, title)} placement="bottom-start" arrow slotProps={previewSlotProps}>
      <div className={styles.LabelText}>{title}</div>
    </Tooltip>
    <div className={styles.Quality}>{quality && quality !== 'UNKNOWN' ? quality : t('Not Rated')}</div>
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

// HSM templates come back from the backend as flat, one-row-per-language records.
// Group them by shortcode so each template shows as a single parent row, keeping
// the full variant list so the parent can render the Languages/Category columns
// and the expand chevron can reveal each language as a child row. Templates
// without a shortcode can't be grouped, so they stay standalone (keyed by id).
const groupByShortcode = (items: any[] = []) => {
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

// each child row of an expanded group renders the variant's body + a single
// language chip + its category badge + relative date, aligned to the columns.
const collapsedColumns = (variant: any) => [
  <Tooltip
    key="body"
    title={messagePreview(variant, variant.title)}
    placement="bottom-start"
    arrow
    slotProps={previewSlotProps}
  >
    <p className={styles.CollapseBody}>{WhatsAppToJsx(variant.body)}</p>
  </Tooltip>,
  languageChip(variant, 'lang'),
  <p key="category" className={styles.TableText}>
    {categoryLabel(variant.category)}
  </p>,
  <div key="updated" className={styles.LastModifiedText}>
    {dayjs(variant.updatedAt).fromNow()}
  </div>,
  <div key="actions" className={styles.Actions} />,
];

const columnNames: any = [
  { name: 'label', label: t('Title') },
  {
    label: (
      <span className={styles.HeaderWithIcon}>
        {t('Languages')}
        <HelpIcon darkIcon={false} helpData={templateLanguageInfo} />
      </span>
    ),
  },
  { label: t('Category') },
  { name: 'updated_at', label: t('Last updated') },
  { label: t('Actions') },
];

const columnStyles: any = [styles.Name, styles.Languages, styles.Category, styles.LastModified, styles.Actions];

// build the per-variant data the collapse renderer reads, keyed by language id.
const buildVariantData = (variants: any[] = []) =>
  variants.reduce((acc: Record<string, any>, variant, index) => {
    acc[variant.language?.id ?? `v-${index}`] = {
      language: variant.language?.label,
      title: variant.shortcode || variant.label,
      body: variant.body,
      footer: variant.footer,
      category: variant.category,
      status: variant.status,
      updatedAt: variant.updatedAt,
    };
    return acc;
  }, {});

const getColumns = ({ id, label, shortcode, quality, updatedAt, variants, body, footer, language }: any) => ({
  id,
  label: getTitle(shortcode || label, quality, { body, footer, language }),
  languages: getLanguages(variants),
  category: getCategories(variants),
  updatedAt: getUpdatedAt(updatedAt),
  translations: JSON.stringify(buildVariantData(variants)),
});

const HSMListV2 = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<any>({ ...statusFilter, APPROVED: true });
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [collapseRow, setCollapseRow] = useState('');

  const { data: tagsData } = useQuery(GET_TAGS, { variables: {}, fetchPolicy: 'network-only' });
  const { data: categoriesData } = useQuery(GET_HSM_CATEGORIES);

  const [syncHsmTemplates] = useMutation(SYNC_HSM_TEMPLATES, { fetchPolicy: 'network-only' });
  const [bulkApplyTemplates] = useMutation(BULK_APPLY_TEMPLATES);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const { data: syncData } = await syncHsmTemplates();
      const errors = syncData?.syncHsmTemplate?.errors;
      if (!syncData?.syncHsmTemplate || errors?.length) {
        setNotification(t('Sorry, failed to sync HSM updates. Please try again.'), 'warning');
      } else {
        setNotification(t('HSM queued for sync. Check notifications for updates.'), 'success');
      }
    } catch {
      setNotification(t('Sorry, failed to sync HSM updates. Please try again.'), 'warning');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleBulkApply = async (result: string, media: any) => {
    const extension = getFileExtension(media.name);
    if (extension !== 'csv') {
      setNotification(t('Please upload a valid CSV file'), 'warning');
      setImporting(false);
    } else {
      try {
        const { data: bulkData } = await bulkApplyTemplates({ variables: { data: result } });
        const response = bulkData?.bulkApplyTemplates;
        if (response?.csv_rows) exportCsvFile(response.csv_rows, 'result');
        if (response?.errors?.length) {
          setNotification(t('Templates were processed with errors. Please check the csv file for details.'), 'warning');
        } else if (response) {
          setNotification(t('Templates applied successfully. Please check the csv file for the results'));
        }
      } catch {
        setNotification(t('An error occured! Please check the format of the file'), 'warning');
      } finally {
        setImporting(false);
      }
    }
  };

  const navigateToCreate = () => {
    if (selectedTag?.label) {
      navigate('/template/add', { state: { tag: selectedTag } });
    } else {
      navigate('/template/add');
    }
  };
  const button = { show: true, label: t('Create'), action: navigateToCreate };

  const handleView = (id: any) => navigate(`/template/${id}/edit`);

  const setCopyDialog = (id: any) => navigate(`/template/${id}/edit`, { state: 'copy' });

  const copyUuid = (_id: string, item: any) => {
    if (item.bspId) {
      copyToClipboardMethod(item.bspId);
    } else {
      setNotification(t('Sorry! UUID not found'), 'warning');
    }
  };

  const toggleLanguages = (id: string) => {
    if (collapseRow !== id) {
      setCollapseRow(id);
      setCollapseOpen(true);
    } else {
      setCollapseOpen(!collapseOpen);
    }
  };

  const handleCheckedBox = (event: any) => {
    const value = event.target.value;
    // "All" clears every status so the backend returns templates of any status.
    setFilters(value === 'All' ? { ...statusFilter } : { ...statusFilter, [value.toUpperCase()]: true });
  };

  useEffect(() => {
    const tagValue = searchParams.get('tag');

    if (tagValue && tagsData) {
      const tag = tagsData?.tags.find((tag: any) => tagValue === tag.label);
      setSelectedTag(tag);
    } else {
      setSelectedTag(null);
    }
  }, [searchParams, tagsData]);

  const additionalAction = () => [
    {
      label: t('View'),
      icon: <ViewIcon data-testid="view-icon" />,
      parameter: 'id',
      dialog: handleView,
    },
    {
      label: t('Copy UUID'),
      icon: <CopyAllOutlined data-testid="copy-button" />,
      parameter: 'id',
      dialog: copyUuid,
    },
    {
      label: t('Copy'),
      icon: <DuplicateIcon data-testid="copyTemplate" />,
      parameter: 'id',
      dialog: setCopyDialog,
    },
  ];

  if (importing) {
    return <Loading message={t('Please wait while we process all the templates')} />;
  }

  const categories: string[] = categoriesData?.whatsappHsmCategories ?? [];

  let filterValue: any = '';
  const statusList = ['All', 'Approved', 'Pending', 'Rejected', 'Failed'];
  const filterStatusName = Object.keys(filters).filter((status) => filters[status] === true);
  if (filterStatusName.length === 1) {
    [filterValue] = filterStatusName;
  }

  // "All" leaves filterValue empty, so no status filter is sent and every
  // template is returned regardless of status.
  const appliedFilters: any = { isHsm: true };
  if (filterValue) appliedFilters.status = filterValue;
  if (selectedCategory) appliedFilters.category = selectedCategory;

  const syncHSMButton = (
    <Button
      variant="outlined"
      color="primary"
      loading={syncLoading}
      className={styles.HsmUpdates}
      data-testid="syncHsm"
      onClick={handleSync}
    >
      {t('SYNC HSM')}
    </Button>
  );

  const secondaryButton = (
    <div className={styles.SecondaryButton}>
      {syncHSMButton}
      <div className={styles.ImportButton}>
        <a href={BULK_APPLY_SAMPLE_LINK} target="_blank" rel="noreferrer" className={styles.HelperText}>
          {t('View Sample')}
        </a>
        <ImportButton title={t('Bulk apply')} onImport={() => setImporting(true)} afterImport={handleBulkApply} />
      </div>
    </div>
  );

  const filterList = (
    <div className={styles.FilterContainer}>
      <FormControl className={styles.FormStyle}>
        <Select
          aria-label={t('Filter by status')}
          name="template-type"
          value={statusList.find((status) => filters[status.toUpperCase()]) ?? 'All'}
          onChange={handleCheckedBox}
          className={styles.DropDown}
          data-testid="dropdown-template"
        >
          {statusList.map((status: any) => (
            <MenuItem data-testid="template-item" key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <HelpIcon darkIcon={false} helpData={templateStatusInfo} />
      <FormControl className={styles.FormStyle}>
        <Select
          aria-label={t('Filter by category')}
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className={styles.DropDown}
          displayEmpty
          data-testid="categoryFilter"
        >
          <MenuItem value="">{t('All Categories')}</MenuItem>
          {categories.map((category: string) => (
            <MenuItem key={category} value={category}>
              {capitalizeFirstLetter(category.split('_').join(' ').toLowerCase())}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <AutoComplete
        isFilterType
        placeholder={t('Select tag')}
        options={tagsData ? tagsData.tags : []}
        optionLabel="label"
        multiple={false}
        onChange={(value: any) => {
          // preserve any other existing query params (e.g. List's search) when
          // updating the tag filter instead of replacing the whole query string.
          setSearchParams((params) => {
            const next = new URLSearchParams(params);
            if (value) {
              next.set('tag', value.label);
            } else {
              next.delete('tag');
            }
            return next;
          });
        }}
        form={{ setFieldValue: () => {} }}
        field={{
          value: selectedTag,
        }}
      />
    </div>
  );

  return (
    <>
      <List
        title={t('HSM Templates')}
        listItem={'sessionTemplates'}
        listItemName={t('HSM Template')}
        pageLink={'template'}
        listIcon={templateIcon}
        helpData={templateInfo}
        button={button}
        secondaryButton={secondaryButton}
        filterList={filterList}
        filters={selectedTag?.id ? { ...appliedFilters, tagIds: [parseInt(selectedTag.id)] } : appliedFilters}
        columnNames={columnNames}
        columnStyles={columnStyles}
        columns={getColumns}
        additionalAction={additionalAction}
        restrictedAction={() => ({ edit: false })}
        dialogMessage={t('It will stop showing when you draft a customized message')}
        collapseOpen={collapseOpen}
        collapseRow={collapseRow}
        expandableRows
        onToggleRow={toggleLanguages}
        groupRows={groupByShortcode}
        collapsedColumns={collapsedColumns}
        {...queries}
      />
    </>
  );
};

export default HSMListV2;
