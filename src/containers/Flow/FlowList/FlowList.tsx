import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useLazyQuery } from '@apollo/client';

import styles from './FlowList.module.css';
import { ReactComponent as FlowIcon } from '../../../assets/images/icons/Flow/Dark.svg';
import { ReactComponent as DuplicateIcon } from '../../../assets/images/icons/Flow/Duplicate.svg';
import { ReactComponent as ExportIcon } from '../../../assets/images/icons/Flow/Export.svg';
import { ReactComponent as ConfigureIcon } from '../../../assets/images/icons/Configure/UnselectedDark.svg';
import { ReactComponent as ContactVariable } from '../../../assets/images/icons/ContactVariable.svg';
import { ReactComponent as WebhookLogsIcon } from '../../../assets/images/icons/Webhook/WebhookLight.svg';
import { List } from '../../List/List';
import { FILTER_FLOW, GET_FLOWS, GET_FLOW_COUNT, EXPORT_FLOW } from '../../../graphql/queries/Flow';
import { DELETE_FLOW } from '../../../graphql/mutations/Flow';
import { setVariables, DATE_TIME_FORMAT } from '../../../common/constants';

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

const columnStyles = [styles.Name, styles.DateColumn, styles.DateColumn, styles.Actions];
const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_FLOW_COUNT,
  filterItemsQuery: FILTER_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

const configureIcon = <ConfigureIcon />;

export const FlowList: React.SFC<FlowListProps> = () => {
  const history = useHistory();
  const { t } = useTranslation();

  const [flowName, setFlowName] = useState('');

  const [exportFlowMutation] = useLazyQuery(EXPORT_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ exportFlow }) => {
      const { exportData } = exportFlow;
      const blob = new Blob([exportData], { type: 'application/json' });
      const href = await URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `${flowName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });

  const setDialog = (id: any) => {
    history.push({ pathname: `/flow/${id}/edit`, state: 'copy' });
  };

  const exportFlow = (id: any, item: any) => {
    setFlowName(item.name);
    exportFlowMutation({ variables: { id } });
  };

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
    lastPublishedAt: getDate(lastPublishedAt, t('Not published yet')),
    lastChangedAt: getDate(lastChangedAt, t('Nothing in draft')),
  });

  const columnNames = ['NAME', 'LAST PUBLISHED', 'LAST SAVED IN DRAFT', 'ACTIONS'];
  const dialogMessage = t("You won't be able to use this flow.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

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
