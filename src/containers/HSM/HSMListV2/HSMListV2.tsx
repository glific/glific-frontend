import { useMutation, useQuery } from '@apollo/client';
import { FormControl, MenuItem, Select } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { t } from 'i18next';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
import ViewIcon from 'assets/images/icons/ViewLight.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import CopyAllOutlined from 'assets/images/icons/Flow/Copy.svg?react';

import { BULK_APPLY_SAMPLE_LINK } from 'config';
import { List } from 'containers/List/List';
import { templateInfo } from 'common/HelpData';
import { setNotification } from 'common/notification';
import { WhatsAppToJsx } from 'common/RichEditor';
import { capitalizeFirstLetter, copyToClipboardMethod, exportCsvFile, getFileExtension } from 'common/utils';

import { Button } from 'components/UI/Form/Button/Button';
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

const languageChip = (label: string, status: string, key: string | number) => (
  <span key={key} className={`${styles.LangChip} ${statusChipClass(status)}`}>
    <span className={styles.LangDot} />
    {languageCode(label)}
  </span>
);

const categoryClass = (category: string) => {
  switch ((category || '').toUpperCase()) {
    case 'MARKETING':
      return styles.CatMarketing;
    case 'AUTHENTICATION':
      return styles.CatAuthentication;
    case 'UTILITY':
      return styles.CatUtility;
    default:
      return styles.CatService;
  }
};
const categoryLabel = (category = '') => capitalizeFirstLetter(category.split('_').join(' ').toLowerCase());

const categoryBadge = (category: string, count: number, key: string | number) => (
  <span key={key} className={`${styles.CatBadge} ${categoryClass(category)}`}>
    {categoryLabel(category)}
    {count > 1 && <span className={styles.CatCount}>×{count}</span>}
  </span>
);

const getTitle = (title: string, tag?: { label: string }) => (
  <div className={styles.LabelContainer}>
    <div className={styles.LabelText}>{title}</div>
    {tag?.label && <div className={styles.TagChip}>{tag.label}</div>}
  </div>
);

// the Languages column shows one chip per language variant, coloured by status.
const getLanguages = (variants: any[] = []) => (
  <div className={styles.ChipRow}>
    {variants.map((variant, index) => languageChip(variant.language?.label, variant.status, variant.id ?? index))}
  </div>
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
      {Array.from(counts.entries()).map(([category, count]) => categoryBadge(category, count, category))}
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
  <p className={styles.CollapseBody}>{WhatsAppToJsx(variant.body)}</p>,
  languageChip(variant.language, variant.status, 'lang'),
  <span className={`${styles.CatBadge} ${categoryClass(variant.category)}`}>{categoryLabel(variant.category)}</span>,
  <div className={styles.LastModifiedText}>{dayjs(variant.updatedAt).fromNow()}</div>,
  <div key="actions" className={styles.Actions} />,
];

const columnNames: any = [
  { name: 'label', label: t('Title') },
  { label: t('Languages') },
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
      body: variant.body,
      category: variant.category,
      status: variant.status,
      updatedAt: variant.updatedAt,
    };
    return acc;
  }, {});

const getColumns = ({ id, label, shortcode, tag, updatedAt, variants }: any) => ({
  id,
  label: getTitle(shortcode || label, tag),
  languages: getLanguages(variants),
  category: getCategories(variants),
  updatedAt: getUpdatedAt(updatedAt),
  translations: JSON.stringify(buildVariantData(variants)),
});

const HSMListV2 = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [collapseRow, setCollapseRow] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTagId = searchParams.get('tag') ?? '';

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

  const handleBulkApply = async (result: string) => {
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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const media = event.target.files?.[0];
    if (!media) return;
    const extension = getFileExtension(media.name);
    if (extension !== 'csv') {
      setNotification(t('Please upload a valid CSV file'), 'warning');
      return;
    }
    setImporting(true);
    const fileReader = new FileReader();
    fileReader.onload = () => handleBulkApply(fileReader.result as string);
    fileReader.readAsText(media);
    event.target.value = '';
  };

  const handleView = (id: any) => navigate(`/template/${id}/edit`);

  const setCopyDialog = (id: any) => navigate(`/template/${id}/edit`, { state: 'copy' });

  const copyUuid = (_id: string, item: any) => {
    if (item.bspId) {
      copyToClipboardMethod(item.bspId);
    } else {
      setNotification('Sorry! UUID not found', 'warning');
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

  const filters: any = { isHsm: true };
  if (selectedCategory) filters.category = selectedCategory;
  if (selectedTagId) filters.tagIds = [parseInt(selectedTagId, 10)];

  const secondaryButton = (
    <div className={styles.SecondaryActions}>
      <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={handleFileChange} data-testid="import" />
      <Button variant="outlined" color="primary" onClick={() => fileInputRef.current?.click()} data-testid="bulkApply">
        {t('Bulk apply')}
      </Button>

      <div className={styles.SyncWrapper}>
        <Button variant="outlined" color="primary" loading={syncLoading} onClick={handleSync} data-testid="syncHsm">
          {t('Sync HSM')}
        </Button>
        <a href={BULK_APPLY_SAMPLE_LINK} target="_blank" rel="noreferrer" className={styles.ViewSample}>
          {t('View sample')}
        </a>
      </div>

      <Button variant="outlined" color="primary" onClick={() => setShowLibrary(true)} data-testid="templateLibrary">
        {t('Template library')}
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/template/add')}
        data-testid="createTemplate"
      >
        {t('Create')}
      </Button>
    </div>
  );

  const filterList = (
    <div className={styles.FilterContainer}>
      <FormControl className={styles.FormStyle}>
        <Select
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

      <FormControl className={styles.FormStyle}>
        <Select
          value={selectedTagId}
          onChange={(event) => setSearchParams(event.target.value ? { tag: event.target.value } : {})}
          className={styles.DropDown}
          displayEmpty
          data-testid="tagFilter"
        >
          <MenuItem value="">{t('All Tags')}</MenuItem>
          {(tagsData?.tags ?? []).map((tag: any) => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );

  return (
    <>
      <List
        title={t('Templates')}
        listItem={'sessionTemplates'}
        listItemName={'HSM Template'}
        pageLink={'template'}
        listIcon={templateIcon}
        helpData={templateInfo}
        button={{ show: false }}
        secondaryButton={secondaryButton}
        filterList={filterList}
        filters={filters}
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
