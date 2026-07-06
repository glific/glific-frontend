import { useMutation, useQuery } from '@apollo/client';
import { FormControl, LinearProgress, MenuItem, Select, TableCell, TableRow } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { t } from 'i18next';

import ViewIcon from 'assets/images/icons/ViewLight.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import CopyAllOutlined from 'assets/images/icons/Flow/Copy.svg?react';

import { BULK_APPLY_SAMPLE_LINK } from 'config';
import { List } from 'containers/List/List';
import { templateInfo, templateStatusInfo } from 'common/HelpData';
import { setNotification } from 'common/notification';
import { capitalizeFirstLetter, copyToClipboardMethod, exportCsvFile, getFileExtension } from 'common/utils';

import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Button } from 'components/UI/Form/Button/Button';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { GET_TAGS } from 'graphql/queries/Tags';
import { GET_HSM_CATEGORIES } from 'graphql/queries/Template';
import { BULK_APPLY_TEMPLATES, SYNC_HSM_TEMPLATES } from 'graphql/mutations/Template';

import styles from './HSMListV2.module.css';
import {
  getCollapsedColumns,
  getColumnNames,
  getColumnStyles,
  getColumns,
  groupByShortcode,
  queries,
  showReasonColumn,
  statusFilter,
  templateIcon,
} from './HSMListV2.helper';

// one fully-built row per language variant, using the same column widths as
// the parent row so the sub-row lines up under Title/Languages/Category/etc.
const renderCollapsedRow = (showReason: boolean) => {
  const renderColumns = getCollapsedColumns(showReason);
  const columnStyles = getColumnStyles(showReason);
  return (entry: any, key: string) => (
    <TableRow key={key} className={styles.CollapseRowCustom}>
      {renderColumns(entry).map((cell, index) => (
        <TableCell key={index} className={`${columnStyles[index]} ${styles.RowStyle}`}>
          {cell}
        </TableCell>
      ))}
    </TableRow>
  );
};

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
  const importCancelledRef = useRef(false);

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

  const handleStartImport = () => {
    importCancelledRef.current = false;
    setImporting(true);
  };

  const handleCancelImport = () => {
    importCancelledRef.current = true;
    setImporting(false);
    setNotification(t('Bulk apply cancelled. The upload may still finish in the background.'), 'warning');
  };

  const handleBulkApply = async (result: string, media: any) => {
    const extension = getFileExtension(media.name);
    if (extension !== 'csv') {
      setNotification(t('Please upload a valid CSV file'), 'warning');
      setImporting(false);
    } else {
      try {
        const { data: bulkData } = await bulkApplyTemplates({ variables: { data: result } });
        if (importCancelledRef.current) return;
        const response = bulkData?.bulkApplyTemplates;
        if (response?.csv_rows) exportCsvFile(response.csv_rows, 'result');
        if (response?.errors?.length) {
          setNotification(t('Templates were processed with errors. Please check the csv file for details.'), 'warning');
        } else if (response) {
          setNotification(t('Templates applied successfully. Please check the csv file for the results'));
        }
      } catch {
        if (!importCancelledRef.current) {
          setNotification(t('An error occured! Please check the format of the file'), 'warning');
        }
      } finally {
        if (!importCancelledRef.current) setImporting(false);
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
    setFilters({ ...statusFilter, [event.target.value.toUpperCase()]: true });
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

  const categories: string[] = categoriesData?.whatsappHsmCategories ?? [];

  let filterValue: any = '';
  const statusList = ['Approved', 'Pending', 'Rejected', 'Failed'];
  const filterStatusName = Object.keys(filters).filter((status) => filters[status] === true);
  if (filterStatusName.length === 1) {
    [filterValue] = filterStatusName;
  }

  const appliedFilters: any = { isHsm: true, status: filterValue };
  if (selectedCategory) appliedFilters.category = selectedCategory;

  // when filtering by Rejected/Failed, swap "Last updated" for a "Reason" column.
  const showReason = showReasonColumn(filterValue);

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
        <ImportButton title={t('Bulk apply')} onImport={handleStartImport} afterImport={handleBulkApply} />
      </div>
    </div>
  );

  const filterList = (
    <div className={styles.FilterContainer}>
      <FormControl className={styles.FormStyle}>
        <Select
          aria-label={t('Filter by status')}
          name="template-type"
          value={statusList.filter((status) => filters[status.toUpperCase()] && status)}
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
      {importing && (
        <DialogBox
          title={t('Processing your file')}
          handleCancel={handleCancelImport}
          skipOk
          buttonCancel={t('Cancel')}
          contentAlign="center"
        >
          <div className={styles.BulkApplyProgress}>
            <LinearProgress data-testid="bulkApplyProgressBar" />
            <p>{t('Please wait while we process all the templates')}</p>
          </div>
        </DialogBox>
      )}
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
        columnNames={getColumnNames(showReason)}
        columnStyles={getColumnStyles(showReason)}
        columns={getColumns(showReason, collapseOpen, collapseRow, toggleLanguages)}
        additionalAction={additionalAction}
        restrictedAction={() => ({ edit: false })}
        dialogMessage={t('It will stop showing when you draft a customized message')}
        collapseOpen={collapseOpen}
        collapseRow={collapseRow}
        groupRows={groupByShortcode}
        renderCollapsedRow={renderCollapsedRow(showReason)}
        {...queries}
      />
    </>
  );
};

export default HSMListV2;
