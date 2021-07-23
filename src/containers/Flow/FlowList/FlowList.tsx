import React, { useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';

import styles from './FlowList.module.css';
import { ReactComponent as FlowIcon } from '../../../assets/images/icons/Flow/Dark.svg';
import { ReactComponent as DuplicateIcon } from '../../../assets/images/icons/Flow/Duplicate.svg';
import { ReactComponent as ExportIcon } from '../../../assets/images/icons/Flow/Export.svg';
import { ReactComponent as ImportIcon } from '../../../assets/images/icons/Flow/Import.svg';
import { ReactComponent as ConfigureIcon } from '../../../assets/images/icons/Configure/UnselectedDark.svg';
import { ReactComponent as ContactVariable } from '../../../assets/images/icons/ContactVariable.svg';
import { ReactComponent as WebhookLogsIcon } from '../../../assets/images/icons/Webhook/WebhookLight.svg';
import { List } from '../../List/List';
import { FILTER_FLOW, GET_FLOWS, GET_FLOW_COUNT, EXPORT_FLOW } from '../../../graphql/queries/Flow';
import { DELETE_FLOW, IMPORT_FLOW } from '../../../graphql/mutations/Flow';
import { setVariables, DATE_TIME_FORMAT } from '../../../common/constants';
import { exportFlowMethod } from '../../../common/utils';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { setErrorMessage } from '../../../common/notification';

export interface FlowListProps {}

const getName = (text: string, keywordsList: any) => {
  const keywords = keywordsList.map((keyword: any) => keyword);

  return (
    <p className={`${styles.TableText} ${styles.NameText}`}>
      {text}
      <br />
      <div className={styles.Keyword}>{keywords.join(', ')}</div>
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

const columnStyles = [styles.Name, styles.DateColumn, styles.DateColumn, styles.Actions];
const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_FLOW_COUNT,
  filterItemsQuery: FILTER_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

const configureIcon = <ConfigureIcon />;

export const FlowList: React.SFC<FlowListProps> = () => {
  const client = useApolloClient();
  const history = useHistory();
  const { t } = useTranslation();
  const inputRef = useRef<any>(null);

  const [flowName, setFlowName] = useState('');
  const [importing, setImporting] = useState(false);

  const [importFlow] = useMutation(IMPORT_FLOW, {
    onCompleted: (result: any) => {
      const { success } = result.importFlow;
      if (!success) {
        const message = 'This could happen if the flow is already present.';
        setErrorMessage(
          client,
          { message },
          'Sorry something went wrong, the import was unsuccessful'
        );
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
    history.push({ pathname: `/flow/${id}/edit`, state: 'copy' });
  };

  const exportFlow = (id: any, item: any) => {
    setFlowName(item.name);
    exportFlowMutation({ variables: { id } });
  };

  const changeHandler = (event: any) => {
    const fileReader: any = new FileReader();
    fileReader.onload = function () {
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
      <ImportIcon
        className={styles.ImportIcon}
        onClick={() => {
          if (inputRef.current) inputRef.current.click();
        }}
      />
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

  const getColumns = ({ name, keywords, lastChangedAt, lastPublishedAt }: any) => ({
    name: getName(name, keywords),
    lastPublishedAt: getLastPublished(lastPublishedAt, t('Not published yet')),
    lastChangedAt: getDate(lastChangedAt, t('Nothing in draft')),
  });

  const columnNames = ['NAME', 'LAST PUBLISHED', 'LAST SAVED IN DRAFT', 'ACTIONS'];
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
        refetchQueries={{ query: GET_FLOWS, variables: setVariables() }}
        {...queries}
        {...columnAttributes}
        searchParameter="nameOrKeyword"
        removeSortBy={[t('Last Published'), t('Last Saved in Draft')]}
        additionalAction={additionalAction}
        button={{ show: true, label: t('+ CREATE FLOW') }}
        secondaryButton={importButton}
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
