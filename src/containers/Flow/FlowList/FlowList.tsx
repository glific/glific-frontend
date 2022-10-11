import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useLazyQuery, useMutation } from '@apollo/client';

import { ReactComponent as FlowIcon } from 'assets/images/icons/Flow/Dark.svg';
import { ReactComponent as DuplicateIcon } from 'assets/images/icons/Flow/Duplicate.svg';
import { ReactComponent as ExportIcon } from 'assets/images/icons/Flow/Export.svg';
import { ReactComponent as ImportIcon } from 'assets/images/icons/Flow/Import.svg';
import { ReactComponent as ConfigureIcon } from 'assets/images/icons/Configure/UnselectedDark.svg';
import { ReactComponent as ContactVariable } from 'assets/images/icons/ContactVariable.svg';
import { ReactComponent as WebhookLogsIcon } from 'assets/images/icons/Webhook/WebhookLight.svg';
import { ReactComponent as PinIcon } from 'assets/images/icons/Pin/Active.svg';
import { FILTER_FLOW, GET_FLOW_COUNT, EXPORT_FLOW, RELEASE_FLOW } from 'graphql/queries/Flow';
import { DELETE_FLOW, IMPORT_FLOW } from 'graphql/mutations/Flow';
import { List } from 'containers/List/List';
import Loading from 'components/UI/Layout/Loading/Loading';
import { DATE_TIME_FORMAT } from 'common/constants';
import { exportFlowMethod, organizationHasDynamicRole } from 'common/utils';
import { setNotification } from 'common/notification';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './FlowList.module.css';

const getName = (text: string, keywordsList: any, roles: any) => {
  const keywords = keywordsList.map((keyword: any) => keyword);
  const accessRoles = roles && roles.map((role: any) => role.label);
  const hasDynamicRole = organizationHasDynamicRole();
  return (
    <p className={styles.NameText}>
      {text}
      <br />
      <span className={styles.Keyword}>{keywords.join(', ')}</span>
      {hasDynamicRole && (
        <span className={styles.Roles}>{accessRoles && accessRoles.join(', ')} </span>
      )}
    </p>
  );
};

const getDate = (date: string, fallback: string = '') => (
  <div className={styles.LastPublished}>
    {date ? moment(date).format(DATE_TIME_FORMAT) : fallback}
  </div>
);

const getLastPublished = (date: string, fallback: string = '') =>
  date ? (
    <div className={styles.LastPublished}>{moment(date).format(DATE_TIME_FORMAT)}</div>
  ) : (
    <div className={styles.LastPublishedFallback}>{fallback}</div>
  );

const displayPinned = (isPinned: boolean) => {
  if (isPinned) {
    return <PinIcon />;
  }
  return '';
};

const columnStyles = [
  styles.Pinned,
  styles.Name,
  styles.DateColumn,
  styles.DateColumn,
  styles.Actions,
];
const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_FLOW_COUNT,
  filterItemsQuery: FILTER_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

const configureIcon = <ConfigureIcon />;

export const FlowList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const inputRef = useRef<any>(null);

  const [flowName, setFlowName] = useState('');
  const [importing, setImporting] = useState(false);

  const [releaseFlow] = useLazyQuery(RELEASE_FLOW);

  useEffect(() => {
    releaseFlow();
  }, []);

  const [importFlow] = useMutation(IMPORT_FLOW, {
    onCompleted: (result: any) => {
      const { success } = result.importFlow;
      if (!success) {
        setNotification(
          t(
            'Sorry! An error occurred! This could happen if the flow is already present or error in the import file.'
          ),
          'error'
        );
      } else {
        setNotification(t('The flow has been imported successfully.'));
      }
      setImporting(false);
    },
  });

  const [exportFlowMutation] = useLazyQuery(EXPORT_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ exportFlow }) => {
      const { exportData } = exportFlow;
      await exportFlowMethod(exportData, flowName);
    },
  });

  const setDialog = (id: any) => {
    navigate(`/flow/${id}/edit`, { state: 'copy' });
  };

  const exportFlow = (id: any, item: any) => {
    setFlowName(item.name);
    exportFlowMutation({ variables: { id } });
  };

  const changeHandler = (event: any) => {
    const fileReader: any = new FileReader();
    fileReader.onload = function setImport() {
      importFlow({ variables: { flow: fileReader.result } });
    };
    setImporting(true);
    fileReader.readAsText(event.target.files[0]);
  };

  const importButton = (
    <span>
      <input
        type="file"
        ref={inputRef}
        hidden
        name="file"
        onChange={changeHandler}
        data-testid="import"
      />
      <Button
        onClick={() => {
          if (inputRef.current) inputRef.current.click();
        }}
        variant="contained"
        color="primary"
      >
        {t('Import flow')}
        <ImportIcon />
      </Button>
    </span>
  );

  const additionalAction = [
    {
      label: t('Configure'),
      icon: configureIcon,
      parameter: 'uuid',
      link: '/flow/configure',
    },
    {
      label: t('Make a copy'),
      icon: <DuplicateIcon />,
      parameter: 'id',
      dialog: setDialog,
    },
    {
      label: t('Export flow'),
      icon: <ExportIcon />,
      parameter: 'id',
      dialog: exportFlow,
    },
  ];

  const getColumns = ({
    name,
    keywords,
    lastChangedAt,
    lastPublishedAt,
    isPinned,
    roles,
  }: any) => ({
    pin: displayPinned(isPinned),
    name: getName(name, keywords, roles),
    lastPublishedAt: getLastPublished(lastPublishedAt, t('Not published yet')),
    lastChangedAt: getDate(lastChangedAt, t('Nothing in draft')),
  });

  const columnNames = [' ', 'TITLE', 'LAST PUBLISHED', 'LAST SAVED IN DRAFT', 'ACTIONS'];
  const dialogMessage = t("You won't be able to use this flow.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  if (importing) {
    return <Loading message="Uploading" />;
  }

  return (
    <>
      <List
        title={t('Flows')}
        listItem="flows"
        listItemName="flow"
        pageLink="flow"
        listIcon={flowIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        searchParameter={['nameOrKeyword']}
        removeSortBy={['LAST PUBLISHED', 'LAST SAVED IN DRAFT']}
        additionalAction={additionalAction}
        button={{ show: true, label: t('+ Create Flow') }}
        secondaryButton={importButton}
        defaultSortBy=" "
        listOrder="desc"
      />

      <Link to="/webhook-logs" className={styles.Webhook}>
        <WebhookLogsIcon />
        {t('View webhook logs')}
      </Link>
      <Link to="/contact-fields" className={styles.ContactFields}>
        <ContactVariable />
        {t('View contact variables')}
      </Link>
    </>
  );
};

export default FlowList;
