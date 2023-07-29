import { useContext, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { FormControl, MenuItem, Select } from '@mui/material';

import { List } from 'containers/List/List';
import { useMutation, useQuery } from '@apollo/client';
import { WhatsAppToJsx } from 'common/RichEditor';
import { DATE_TIME_FORMAT, GUPSHUP_ENTERPRISE_SHORTCODE } from 'common/constants';
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
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import { ReactComponent as DownArrow } from 'assets/images/icons/LanguageTranslation.svg';
import { ReactComponent as ApprovedIcon } from 'assets/images/icons/Template/Approved.svg';
import { ReactComponent as RejectedIcon } from 'assets/images/icons/Template/Rejected.svg';
import { ReactComponent as PendingIcon } from 'assets/images/icons/Template/Pending.svg';
import { ProviderContext } from 'context/session';
import { copyToClipboardMethod, exportCsvFile, getFileExtension } from 'common/utils';
import Loading from 'components/UI/Layout/Loading/Loading';
import { setNotification } from 'common/notification';
import { BULK_APPLY_SAMPLE_LINK } from 'config';
import styles from './Template.module.css';
import { ReactComponent as CopyAllOutlined } from 'assets/images/icons/Flow/Copy.svg';
import { GET_TAGS } from 'graphql/queries/Tags';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getBody = (text: string) => <p className={styles.TableText}>{WhatsAppToJsx(text)}</p>;

const getReason = (reason: string) => <p className={styles.TableText}>{reason}</p>;

const getUpdatedAt = (date: string) => (
  <div className={styles.LastModified}>{moment(date).format(DATE_TIME_FORMAT)}</div>
);

const getTranslations = (language: any, data: string) => {
  const dataObj = JSON.parse(data);
  console.log('dataObj', dataObj);
  if (Object.prototype.hasOwnProperty.call(dataObj, language.id)) {
    delete dataObj[language.id];
  }
  return JSON.stringify(dataObj);
};

export interface TemplateProps {
  title: string;
  listItem: string;
  listItemName: string;
  pageLink: string;
  listIcon: any;
  filters: any;
  buttonLabel: string;
  isHSM?: boolean;
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
  buttonLabel,
  isHSM,
  syncHSMButton,
}: TemplateProps) => {
  const [open, setOpen] = useState(false);
  const [Id, setId] = useState('');
  const { t } = useTranslation();

  const { provider } = useContext(ProviderContext);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const [filters, setFilters] = useState<any>({ ...statusFilter, APPROVED: true });

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
          <div className={styles.AlginCenter}>
            <ApprovedIcon />
            {t('Approved')}
          </div>
        );
        break;
      case 'PENDING':
        statusValue = (
          <div className={styles.AlginCenter}>
            <PendingIcon />
            {t('Pending')}
          </div>
        );
        break;

      case 'REJECTED':
        statusValue = (
          <div className={styles.AlginCenter}>
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
    ? [...columnStyles, styles.Status, ...(filters.REJECTED ? [styles.Reason] : []), styles.Actions]
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
  }: any) => {
    const columns: any = {
      id,
      label: getLabel(label),
      body: getBody(body),
    };
    if (isHSM) {
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

  const setDialog = (id: string) => {
    if (Id !== id) {
      setId(id);
      setOpen(true);
    } else {
      setOpen(!open);
    }
  };

  let additionalAction: any = () => [
    {
      label: t('Show all languages'),
      icon: <DownArrow data-testid="down-arrow" />,
      parameter: 'id',
      dialog: setDialog,
    },
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

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  // console.log('statusList', statusList, filters);
  const filterTemplateStatus = (
    <FormControl sx={{ width: 150 }}>
      <Select
        aria-label="template-type"
        name="template-type"
        value={statusList.filter((status) => filters[status.toUpperCase()] && status)}
        onChange={handleCheckedBox}
        MenuProps={MenuProps}
        className={styles.DropDown}
        sx={{ '& > fieldset': { border: 'none' } }}
      >
        {statusList.map((status: any) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  let appliedFilters = templateFilters;

  if (isHSM) {
    additionalAction = () => [
      {
        label: t('Copy UUID'),
        icon: <CopyAllOutlined data-testid="copy-button" />,
        parameter: 'id',
        dialog: copyUuid,
      },
    ];
    defaultSortBy = 'STATUS';
    appliedFilters = { ...templateFilters, status: filterValue };
  }

  if (importing) {
    return <Loading message="Please wait while we process all the templates" />;
  }

  const button = { show: true, label: buttonLabel, symbol: '+' };
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

  // OnChange handler for the dropdown
  const handleDropdownChange = (event: any) => {
    setSelectedTag(event.target.value);
  };

  const tagFilter = (
    <AutoComplete
      isFilterType
      placeholder="Select tag"
      options={tag ? tag.tags : []}
      optionLabel="label"
      disabled={false}
      hasCreateOption={false}
      multiple={false}
      onChange={(value: any) => {
        setSelectedTag(value);
      }}
      form={{ setFieldValue: handleDropdownChange }}
      field={{
        value: selectedTag,
        onChange: handleDropdownChange,
      }}
    />
  );

  appliedFilters = {
    ...appliedFilters,
    ...(selectedTag?.id && { tagIds: [parseInt(selectedTag?.id)] }),
  };

  return (
    <List
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
      filterDropdowm={isHSM && tagFilter}
      syncHSMButton={syncHSMButton}
    />
  );
};

export default Template;
