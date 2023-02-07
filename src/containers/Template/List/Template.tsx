import React, { useContext, useRef, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControlLabel } from '@mui/material';

import { List } from 'containers/List/List';
import { useMutation } from '@apollo/client';
import { WhatsAppToJsx } from 'common/RichEditor';
import { DATE_TIME_FORMAT, GUPSHUP_ENTERPRISE_SHORTCODE } from 'common/constants';
import {
  GET_TEMPLATES_COUNT,
  FILTER_TEMPLATES,
  FILTER_SESSION_TEMPLATES,
} from 'graphql/queries/Template';
import { DELETE_TEMPLATE, IMPORT_TEMPLATES } from 'graphql/mutations/Template';
import { ReactComponent as DownArrow } from 'assets/images/icons/DownArrow.svg';
import { ReactComponent as ApprovedIcon } from 'assets/images/icons/Template/Approved.svg';
import { ReactComponent as ImportIcon } from 'assets/images/icons/Flow/Import.svg';
import { ReactComponent as RejectedIcon } from 'assets/images/icons/Template/Rejected.svg';
import { ReactComponent as PendingIcon } from 'assets/images/icons/Template/Pending.svg';
import { Button } from 'components/UI/Form/Button/Button';
import { ProviderContext } from 'context/session';
import Loading from 'components/UI/Layout/Loading/Loading';
import { setNotification } from 'common/notification';
import styles from './Template.module.css';

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getBody = (text: string) => <p className={styles.TableText}>{WhatsAppToJsx(text)}</p>;

const getReason = (reason: string) => <p className={styles.TableText}>{reason}</p>;

const getUpdatedAt = (date: string) => (
  <div className={styles.LastModified}>{moment(date).format(DATE_TIME_FORMAT)}</div>
);

const getTranslations = (language: any, data: string) => {
  const dataObj = JSON.parse(data);
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
}: TemplateProps) => {
  const [open, setOpen] = useState(false);
  const [Id, setId] = useState('');
  const { t } = useTranslation();

  const { provider } = useContext(ProviderContext);

  const [importing, setImporting] = useState(false);
  const inputRef = useRef<any>(null);

  const [filters, setFilters] = useState<any>({ ...statusFilter, APPROVED: true });

  const [importTemplatesMutation] = useMutation(IMPORT_TEMPLATES, {
    onCompleted: (data: any) => {
      setImporting(false);
      const { errors } = data.importTemplates;
      if (errors && errors.length > 0) {
        setNotification('Error importing templates', 'warning');
      }
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
          <>
            <ApprovedIcon />
            {t('Approved')}
          </>
        );
        break;
      case 'PENDING':
        statusValue = (
          <>
            <PendingIcon />
            {t('Pending')}
          </>
        );
        break;

      case 'REJECTED':
        statusValue = (
          <>
            <RejectedIcon />
            {t('Rejected')}
          </>
        );
        break;

      default:
        statusValue = status;
    }

    return <span className={styles.Status}>{statusValue}</span>;
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

  let columnStyles: any = [styles.Label, styles.Body];

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

  const setDialog = (id: string) => {
    if (Id !== id) {
      setId(id);
      setOpen(true);
    } else {
      setOpen(!open);
    }
  };

  let additionalAction = [
    {
      label: t('Show all languages'),
      icon: <DownArrow />,
      parameter: 'id',
      dialog: setDialog,
    },
  ];

  let defaultSortBy;

  const dialogMessage = t('It will stop showing when you draft a customized message');

  let filterValue: any = '';
  const statusList = ['Approved', 'Pending', 'Rejected'];
  const handleCheckedBox = (event: any) => {
    setFilters({ ...statusFilter, [event.target.name.toUpperCase()]: event.target.checked });
  };

  const filterStatusName = Object.keys(filters).filter((status) => filters[status] === true);
  if (filterStatusName.length === 1) {
    [filterValue] = filterStatusName;
  }

  const filterTemplateStatus = (
    <div className={styles.Filters}>
      {statusList.map((label, index) => {
        const key = index;
        const checked = filters[label.toUpperCase()];
        return (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={checked}
                color="primary"
                onChange={handleCheckedBox}
                name={statusList[index]}
              />
            }
            label={statusList[index]}
            classes={{
              label: styles.FilterLabel,
            }}
          />
        );
      })}
    </div>
  );

  let appliedFilters = templateFilters;

  if (isHSM) {
    additionalAction = [];
    defaultSortBy = 'STATUS';
    appliedFilters = { ...templateFilters, status: filterValue };
  }

  const importTemplates = (event: any) => {
    const media = event.target.files[0];
    const fileReader: any = new FileReader();
    fileReader.onload = function setImport() {
      const mediaName = media.name;
      const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
      if (extension !== 'csv') {
        setNotification('Please upload a valid CSV file', 'warning');
        setImporting(false);
      } else {
        importTemplatesMutation({ variables: { data: fileReader.result } });
      }
    };
    setImporting(true);
    fileReader.readAsText(media);
  };

  const importButton = (
    <div className={styles.Input}>
      <input
        type="file"
        ref={inputRef}
        hidden
        name="file"
        onChange={importTemplates}
        data-testid="import"
      />
      <Button
        onClick={() => {
          if (inputRef.current) inputRef.current.click();
        }}
        variant="contained"
        color="primary"
      >
        {t('Import templates')}
        <ImportIcon />
      </Button>
    </div>
  );

  if (importing) {
    return <Loading />;
  }

  const button = { show: true, label: buttonLabel, symbol: '+' };
  let secondaryButton = null;

  if (provider === GUPSHUP_ENTERPRISE_SHORTCODE) {
    button.show = false;
    secondaryButton = importButton;
  }

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
    />
  );
};

export default Template;
