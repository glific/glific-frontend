import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControlLabel } from '@material-ui/core';

import { List } from 'containers/List/List';
import { useMutation, useQuery } from '@apollo/client';
import { WhatsAppToJsx } from 'common/RichEditor';
import { DATE_TIME_FORMAT } from 'common/constants';
import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES } from 'graphql/queries/Template';
import { DELETE_TEMPLATE, IMPORT_TEMPLATES } from 'graphql/mutations/Template';
import { ReactComponent as DownArrow } from 'assets/images/icons/DownArrow.svg';
import { ReactComponent as ApprovedIcon } from 'assets/images/icons/Template/Approved.svg';
import { ReactComponent as ImportIcon } from 'assets/images/icons/Flow/Import.svg';
import { ReactComponent as RejectedIcon } from 'assets/images/icons/Template/Rejected.svg';
import { ReactComponent as PendingIcon } from 'assets/images/icons/Template/Pending.svg';
import { Button } from 'components/UI/Form/Button/Button';
import Loading from 'components/UI/Layout/Loading/Loading';
import { setNotification } from 'common/notification';
import { GET_ORGANIZATION_PROVIDER } from 'graphql/queries/Organization';
import styles from './Template.module.css';

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getBody = (text: string) => <p className={styles.TableText}>{WhatsAppToJsx(text)}</p>;

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

const queries = {
  countQuery: GET_TEMPLATES_COUNT,
  filterItemsQuery: FILTER_TEMPLATES,
  deleteItemQuery: DELETE_TEMPLATE,
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

export const Template: React.SFC<TemplateProps> = (props) => {
  const {
    title,
    listItem,
    listItemName,
    pageLink,
    listIcon,
    filters: templateFilters,
    buttonLabel,
    isHSM,
  } = props;
  const [open, setOpen] = useState(false);
  const [Id, setId] = useState('');
  const { t } = useTranslation();

  const [isEnterprise, setIsEnterprise] = useState(false);

  const [importing, setImporting] = useState(false);
  const inputRef = useRef<any>(null);

  const { data: organizationProvider } = useQuery(GET_ORGANIZATION_PROVIDER);

  const [filters, setFilters] = useState<any>({ ...statusFilter, APPROVED: true });

  const [importTemplatesMutation] = useMutation(IMPORT_TEMPLATES, {
    onCompleted: (data: any) => {
      setImporting(false);
      if (data.importTemplates.errors.length > 0) {
        setNotification('Error importing templates', 'warning');
      }
    },
  });

  useEffect(() => {
    if (organizationProvider) {
      if (organizationProvider.organization.organization.bsp.shortcode === 'gupshup_enterprise') {
        setIsEnterprise(true);
      }
    }
  }, [organizationProvider]);
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

  let columnNames = ['TITLE', 'BODY'];
  columnNames = isHSM
    ? [...columnNames, 'STATUS', 'ACTIONS']
    : [...columnNames, 'LAST MODIFIED', 'ACTIONS'];

  let columnStyles: any = [styles.Label, styles.Body];

  columnStyles = isHSM
    ? [...columnStyles, styles.Status, styles.Actions]
    : [...columnStyles, styles.LastModified, styles.Actions];

  const getColumns = ({ id, language, label, body, updatedAt, translations, status }: any) => {
    const columns: any = {
      id,
      label: getLabel(label),
      body: getBody(body),
    };
    if (isHSM) {
      columns.status = getStatus(status);
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
    const fileReader: any = new FileReader();
    fileReader.onload = function setImport() {
      importTemplatesMutation({ variables: { data: fileReader.result } });
    };
    setImporting(true);
    fileReader.readAsText(event.target.files[0]);
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

  const button = { show: true, label: buttonLabel };
  let secondaryButton = null;

  if (isEnterprise) {
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
