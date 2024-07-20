import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { FormControl, MenuItem, Select } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';

import { List } from 'containers/List/List';
import { WhatsAppToJsx } from 'common/RichEditor';
import { STANDARD_DATE_TIME_FORMAT, GUPSHUP_ENTERPRISE_SHORTCODE } from 'common/constants';
import { capitalizeFirstLetter } from 'common/utils';
import {
  GET_TEMPLATES_COUNT,
  FILTER_TEMPLATES,
  FILTER_SESSION_TEMPLATES,
} from 'graphql/queries/Template';
import {
  BULK_APPLY_TEMPLATES,
  DELETE_TEMPLATE,
  IMPORT_TEMPLATES,
} from 'graphql/mutations/Template';
import { GET_TAGS } from 'graphql/queries/Tags';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import DownArrow from 'assets/images/icons/DownArrow.svg?react';
import ApprovedIcon from 'assets/images/icons/Template/Approved.svg?react';
import RejectedIcon from 'assets/images/icons/Template/Rejected.svg?react';
import ReportIcon from 'assets/images/icons/Template/Report.svg?react';
import PendingIcon from 'assets/images/icons/Template/Pending.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import CopyAllOutlined from 'assets/images/icons/Flow/Copy.svg?react';
import { ProviderContext } from 'context/session';
import { copyToClipboardMethod, exportCsvFile, getFileExtension } from 'common/utils';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { setNotification } from 'common/notification';
import { BULK_APPLY_SAMPLE_LINK } from 'config';
import { speedSendInfo, templateInfo } from 'common/HelpData';
import styles from './Template.module.css';
import { RaiseToGupShup } from './RaiseToGupshupDialog/RaiseToGupShup';

const getLabel = (label: string, quality?: string) => (
  <div className={styles.LabelContainer}>
    <div className={styles.LabelText}>{label}</div>
    <div className={styles.Quality}>{quality || 'Not Rated'}</div>
  </div>
);

const getBody = (text: string) => <p className={styles.TableText}>{WhatsAppToJsx(text)}</p>;

const getReason = (reason: string) => <p className={styles.TableText}>{reason}</p>;

const getUpdatedAt = (date: string) => (
  <div className={styles.LastModified}>{dayjs(date).format(STANDARD_DATE_TIME_FORMAT)}</div>
);

const getTranslations = (language: any, data: string) => {
  const dataObj = JSON.parse(data);
  if (Object.prototype.hasOwnProperty.call(dataObj, language.id)) {
    delete dataObj[language.id];
  }
  return JSON.stringify(dataObj);
};

const getCategory = (category: string) => {
  // let's make category more user friendly
  let categoryName = category.split('_').join(' ').toLowerCase();
  return <p className={styles.TableText}>{capitalizeFirstLetter(categoryName)}</p>;
};

export interface TemplateProps {
  title: string;
  listItem: string;
  listItemName: string;
  pageLink: string;
  listIcon: any;
  filters: any;
  isHSM?: boolean;
  loading?: boolean;
  syncHSMButton?: any;
}

const statusFilter = {
  APPROVED: false,
  PENDING: false,
  REJECTED: false,
};

export const Template = ({
  title,
  listItem,
  listItemName,
  pageLink,
  listIcon,
  filters: templateFilters,
  isHSM,
  loading = false,
  syncHSMButton,
}: TemplateProps) => {
  const [open, setOpen] = useState(false);
  const [Id, setId] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { provider } = useContext(ProviderContext);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const [filters, setFilters] = useState<any>({ ...statusFilter, APPROVED: true });

  const [raiseToGupshupTemplate, setRaiseToGupshupTemplate] = useState<any>(null);

  const { data: tag } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const [importTemplatesMutation] = useMutation(IMPORT_TEMPLATES, {
    onCompleted: (data: any) => {
      setImporting(false);
      const { errors } = data.importTemplates;
      if (errors && errors.length > 0) {
        setNotification(t('Error importing templates'), 'warning');
      }
    },
  });

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

  const queries = {
    countQuery: GET_TEMPLATES_COUNT,
    filterItemsQuery: isHSM ? FILTER_TEMPLATES : FILTER_SESSION_TEMPLATES,
    deleteItemQuery: DELETE_TEMPLATE,
  };

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
  ];

  if (isHSM) {
    columnNames.push({ name: 'category', label: t('Category') });
    columnNames.push({ name: 'status', label: t('Status') });
    if (filters.REJECTED) {
      columnNames.push({ label: t('Reason') });
    }
  } else {
    columnNames.push({ name: 'updated_at', label: t('Last modified') });
  }

  columnNames.push({ label: t('Actions') });

  let columnStyles: any = [styles.Name, styles.Body];

  columnStyles = isHSM
    ? [
        ...columnStyles,
        styles.Category,
        styles.Status,
        ...(filters.REJECTED ? [styles.Reason] : []),
        styles.Actions,
      ]
    : [...columnStyles, styles.LastModified, styles.Actions];

  const getColumns = ({
    id,
    language,
    label,
    body,
    updatedAt,
    translations,
    status,
    reason,
    quality,
    category,
  }: any) => {
    const columns: any = {
      id,
      label: getLabel(label, quality),
      body: getBody(body),
    };

    if (isHSM) {
      columns.category = getCategory(category);
      columns.status = getStatus(status);
      if (filters.REJECTED) {
        columns.reason = getReason(reason);
      }
    } else {
      columns.updatedAt = getUpdatedAt(updatedAt);
      columns.translations = getTranslations(language, translations);
    }
    return columns;
  };

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const copyUuid = (_id: string, item: any) => {
    if (item.bspId) {
      copyToClipboardMethod(item.bspId);
    } else {
      setNotification('Sorry! UUID not found', 'warning');
    }
  };

  const setCopyDialog = (id: any) => {
    let redirectPath = 'speed-send';
    if (isHSM) {
      redirectPath = 'template';
    }
    navigate(`/${redirectPath}/${id}/edit`, { state: 'copy' });
  };

  const showRaiseToGupShupDialog = (id: any, item: any) => {
    setRaiseToGupshupTemplate(item);
  };

  const closeDialogBox = () => {
    setRaiseToGupshupTemplate(null);
  };

  const setDialog = (id: string) => {
    if (Id !== id) {
      setId(id);
      setOpen(true);
    } else {
      setOpen(!open);
    }
  };

  const copyAction = {
    label: t('Copy'),
    icon: <DuplicateIcon />,
    parameter: 'id',
    dialog: setCopyDialog,
    insideMore: true,
  };

  let additionalAction: any = () => [
    {
      label: t('Show all languages'),
      icon: <DownArrow data-testid="down-arrow" />,
      parameter: 'id',
      dialog: setDialog,
    },
    copyAction,
  ];

  let defaultSortBy;

  const dialogMessage = t('It will stop showing when you draft a customized message');

  let filterValue: any = '';
  const statusList = ['Approved', 'Pending', 'Rejected'];

  const handleCheckedBox = (event: any) => {
    setFilters({ ...statusFilter, [event.target.value.toUpperCase()]: true });
  };

  const filterStatusName = Object.keys(filters).filter((status) => filters[status] === true);
  if (filterStatusName.length === 1) {
    [filterValue] = filterStatusName;
  }

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

  let appliedFilters = templateFilters;

  const raiseToGupshup = {
    label: t('Report'),
    icon: <ReportIcon />,
    parameter: 'id',
    dialog: showRaiseToGupShupDialog,
    hidden: filterValue !== 'REJECTED',
    insideMore: true,
  };

  if (isHSM) {
    additionalAction = () => [
      {
        label: t('Copy UUID'),
        icon: <CopyAllOutlined data-testid="copy-button" />,
        parameter: 'id',
        dialog: copyUuid,
      },
      copyAction,
      raiseToGupshup,
    ];
    defaultSortBy = 'STATUS';
    appliedFilters = { ...templateFilters, status: filterValue };
  }
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

  const button = { show: true, label: t('Create') };
  let secondaryButton = null;

  if (isHSM) {
    secondaryButton = (
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
  }

  if (provider === GUPSHUP_ENTERPRISE_SHORTCODE) {
    secondaryButton = (
      <ImportButton
        title={t('Import templates')}
        onImport={() => setImporting(true)}
        afterImport={(result: string, media: any) => {
          const extension = getFileExtension(media.name);
          if (extension !== 'csv') {
            setNotification('Please upload a valid CSV file', 'warning');
            setImporting(false);
          } else {
            importTemplatesMutation({ variables: { data: result } });
          }
        }}
      />
    );
    button.show = false;
  }

  appliedFilters = {
    ...appliedFilters,
    ...(selectedTag?.id && { tagIds: [parseInt(selectedTag?.id)] }),
  };

  return (
    <>
      {dialogBox}
      <List
        loadingList={loading}
        helpData={isHSM ? templateInfo : speedSendInfo}
        secondaryButton={secondaryButton}
        title={title}
        listItem={listItem}
        listItemName={listItemName}
        pageLink={pageLink}
        listIcon={listIcon}
        additionalAction={additionalAction}
        dialogMessage={dialogMessage}
        filters={appliedFilters}
        defaultSortBy={defaultSortBy}
        button={button}
        {...columnAttributes}
        {...queries}
        filterList={isHSM && filterTemplateStatus}
        collapseOpen={open}
        collapseRow={Id}
      />
    </>
  );
};

export default Template;
