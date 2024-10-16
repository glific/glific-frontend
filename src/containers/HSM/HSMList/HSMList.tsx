import { useMutation, useQuery } from '@apollo/client';
import { FormControl, MenuItem, Select } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import CopyAllOutlined from 'assets/images/icons/Flow/Copy.svg?react';
import ApprovedIcon from 'assets/images/icons/Template/Approved.svg?react';
import RejectedIcon from 'assets/images/icons/Template/Rejected.svg?react';
import ReportIcon from 'assets/images/icons/Template/Report.svg?react';
import PendingIcon from 'assets/images/icons/Template/Pending.svg?react';

import { BULK_APPLY_SAMPLE_LINK } from 'config';
import { List } from 'containers/List/List';
import { RaiseToGupShup } from 'containers/HSM/RaiseToGupshupDialog/RaiseToGupShup';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { templateInfo } from 'common/HelpData';
import { setNotification } from 'common/notification';
import { WhatsAppToJsx } from 'common/RichEditor';
import {
  capitalizeFirstLetter,
  copyToClipboardMethod,
  exportCsvFile,
  getFileExtension,
} from 'common/utils';

import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Button } from 'components/UI/Form/Button/Button';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import { Loading } from 'components/UI/Layout/Loading/Loading';

import { GET_TAGS } from 'graphql/queries/Tags';
import {
  BULK_APPLY_TEMPLATES,
  DELETE_TEMPLATE,
  SYNC_HSM_TEMPLATES,
} from 'graphql/mutations/Template';
import { FILTER_TEMPLATES, GET_TEMPLATES_COUNT } from 'graphql/queries/Template';

import styles from './HSMList.module.css';

const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

const statusFilter = {
  APPROVED: false,
  PENDING: false,
  REJECTED: false,
};
const getLabel = (label: string, quality?: string) => (
  <div className={styles.LabelContainer}>
    <div className={styles.LabelText}>{label}</div>
    <div className={styles.Quality}>{quality && quality !== 'UNKNOWN' ? quality : 'Not Rated'}</div>
  </div>
);

const getBody = (text: string) => <p className={styles.TableText}>{WhatsAppToJsx(text)}</p>;

const getReason = (reason: string) => <p className={styles.TableText}>{reason}</p>;

const getCategory = (category: string) => {
  // let's make category more user friendly
  let categoryName = category.split('_').join(' ').toLowerCase();
  return <p className={styles.TableText}>{capitalizeFirstLetter(categoryName)}</p>;
};

const getUpdatedAt = (date: string) => (
  <div className={styles.LastModified}>{dayjs(date).format(STANDARD_DATE_TIME_FORMAT)}</div>
);

const queries = {
  countQuery: GET_TEMPLATES_COUNT,
  filterItemsQuery: FILTER_TEMPLATES,
  deleteItemQuery: DELETE_TEMPLATE,
};

export const HSMList = () => {
  const [importing, setImporting] = useState(false);
  const [raiseToGupshupTemplate, setRaiseToGupshupTemplate] = useState<any>(null);
  const [filters, setFilters] = useState<any>({ ...statusFilter, APPROVED: true });
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [syncTemplateLoad, setSyncTemplateLoad] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [bulkApplyTemplates] = useMutation(BULK_APPLY_TEMPLATES, {
    onCompleted: (data: any) => {
      setImporting(false);
      if (data && data.bulkApplyTemplates) {
        exportCsvFile(data.bulkApplyTemplates.csv_rows, 'result');
        setNotification(
          t('Templates applied successfully. Please check the csv file for the results')
        );
      }
    },
    onError: () => {
      setImporting(false);
      setNotification(t('An error occured! Please check the format of the file'), 'warning');
    },
  });

  const [syncHsmTemplates] = useMutation(SYNC_HSM_TEMPLATES, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data.errors) {
        setNotification(t('Sorry, failed to sync HSM updates.'), 'warning');
      } else {
        setNotification(t('HSMs updated successfully.'), 'success');
      }
      setSyncTemplateLoad(false);
    },
    onError: () => {
      setNotification(t('Sorry, failed to sync HSM updates.'), 'warning');
      setSyncTemplateLoad(false);
    },
  });

  const { data: tag } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const getStatus = (status: string) => {
    let statusValue;
    switch (status) {
      case 'APPROVED':
        statusValue = (
          <div className={styles.AlignCenter}>
            <ApprovedIcon />
            {t('Approved')}
          </div>
        );
        break;
      case 'PENDING':
        statusValue = (
          <div className={styles.AlignCenter}>
            <PendingIcon />
            {t('Pending')}
          </div>
        );
        break;

      case 'REJECTED':
        statusValue = (
          <div className={styles.AlignCenter}>
            <RejectedIcon />
            {t('Rejected')}
          </div>
        );
        break;

      default:
        statusValue = status;
    }

    return <span>{statusValue}</span>;
  };

  const columnNames: any = [
    { name: 'label', label: t('Title') },
    { name: 'body', label: t('Body') },
    { name: 'category', label: t('Category') },
    { name: 'status', label: t('Status') },
  ];

  if (filters.REJECTED) {
    columnNames.push({ label: t('Reason') });
  } else {
    columnNames.push({ name: 'updated_at', label: t('Last modified') });
  }
  columnNames.push({ label: t('Actions') });

  let columnStyles: any = [
    styles.Name,
    styles.Body,
    styles.Category,
    styles.Status,
    ...(filters.REJECTED ? [styles.Reason] : []),
    styles.Actions,
  ];

  const getColumns = ({ id, label, body, status, reason, quality, category, updatedAt }: any) => {
    const columns: any = {
      id,
      label: getLabel(label, quality),
      body: getBody(body),
      category: getCategory(category),
      status: getStatus(status),
    };

    if (filters.REJECTED) {
      columns.reason = getReason(reason);
    } else {
      columns.updatedAt = getUpdatedAt(updatedAt);
    }

    return columns;
  };

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const handleHsmUpdates = () => {
    setSyncTemplateLoad(true);
    syncHsmTemplates();
  };

  let filterValue: any = '';
  const statusList = ['Approved', 'Pending', 'Rejected'];

  const setCopyDialog = (id: any) => {
    navigate(`/template/${id}/edit`, { state: 'copy' });
  };

  const copyUuid = (_id: string, item: any) => {
    if (item.bspId) {
      copyToClipboardMethod(item.bspId);
    } else {
      setNotification('Sorry! UUID not found', 'warning');
    }
  };

  const showRaiseToGupShupDialog = (id: any, item: any) => {
    setRaiseToGupshupTemplate(item);
  };

  const closeDialogBox = () => {
    setRaiseToGupshupTemplate(null);
  };

  const handleCheckedBox = (event: any) => {
    setFilters({ ...statusFilter, [event.target.value.toUpperCase()]: true });
  };

  const filterStatusName = Object.keys(filters).filter((status) => filters[status] === true);
  if (filterStatusName.length === 1) {
    [filterValue] = filterStatusName;
  }

  const syncHSMButton = (
    <Button
      variant="outlined"
      color="primary"
      loading={syncTemplateLoad}
      className={styles.HsmUpdates}
      data-testid="updateHsm"
      onClick={() => handleHsmUpdates()}
      aria-hidden="true"
    >
      SYNC HSM
    </Button>
  );
  const dialogMessage = t('It will stop showing when you draft a customized message');

  const filterTemplateStatus = (
    <>
      <FormControl className={styles.FormStyle}>
        <Select
          aria-label="template-type"
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
      <AutoComplete
        isFilterType
        placeholder="Select tag"
        options={tag ? tag.tags : []}
        optionLabel="label"
        multiple={false}
        onChange={(value: any) => {
          setSelectedTag(value);
        }}
        form={{ setFieldValue: () => {} }}
        field={{
          value: selectedTag,
        }}
      />
      {syncHSMButton}
    </>
  );

  const secondaryButton = (
    <div className={styles.ImportButton}>
      <a
        href={BULK_APPLY_SAMPLE_LINK}
        target="_blank"
        rel="noreferrer"
        className={styles.HelperText}
      >
        View Sample
      </a>
      <ImportButton
        title={t('Bulk apply')}
        onImport={() => setImporting(true)}
        afterImport={(result: string, media: any) => {
          const extension = getFileExtension(media.name);
          if (extension !== 'csv') {
            setNotification('Please upload a valid CSV file', 'warning');
            setImporting(false);
          } else {
            bulkApplyTemplates({ variables: { data: result } });
          }
        }}
      />
    </div>
  );

  let additionalAction: any = () => [
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
      insideMore: true,
    },
    {
      label: t('Report'),
      icon: <ReportIcon />,
      parameter: 'id',
      dialog: showRaiseToGupShupDialog,
      hidden: filterValue !== 'REJECTED',
      insideMore: true,
    },
  ];

  const defaultSortBy = 'STATUS';
  const appliedFilters = { isHsm: true, status: filterValue };
  const button = { show: true, label: t('Create') };

  let dialogBox;
  if (raiseToGupshupTemplate) {
    dialogBox = (
      <RaiseToGupShup
        handleCancel={closeDialogBox}
        templateId={raiseToGupshupTemplate?.id}
        label={raiseToGupshupTemplate?.label}
      />
    );
  }

  if (importing) {
    return <Loading message="Please wait while we process all the templates" />;
  }

  return (
    <>
      {dialogBox}
      <List
        loadingList={syncTemplateLoad}
        helpData={templateInfo}
        secondaryButton={secondaryButton}
        title={'Templates'}
        listItem={'sessionTemplates'}
        listItemName={'HSM Template'}
        pageLink={'template'}
        listIcon={templateIcon}
        additionalAction={additionalAction}
        dialogMessage={dialogMessage}
        filters={appliedFilters}
        defaultSortBy={defaultSortBy}
        button={button}
        {...columnAttributes}
        {...queries}
        filterList={filterTemplateStatus}
      />
    </>
  );
};

export default HSMList;
