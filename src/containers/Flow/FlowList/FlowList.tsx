import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import moment from 'moment';

import styles from './FlowList.module.css';
import { ReactComponent as FlowIcon } from '../../../assets/images/icons/Flow/Dark.svg';
import { ReactComponent as DuplicateIcon } from '../../../assets/images/icons/Flow/Duplicate.svg';
import { ReactComponent as ConfigureIcon } from '../../../assets/images/icons/Configure/UnselectedDark.svg';
import { ReactComponent as WebhookLogsIcon } from '../../../assets/images/icons/Webhook/WebhookLight.svg';
import { List } from '../../List/List';
import { FILTER_FLOW, GET_FLOWS, GET_FLOW_COUNT } from '../../../graphql/queries/Flow';
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

const getUpdatedAt = (date: string) => (
  <div className={styles.LastModified}>{moment(date).format(DATE_TIME_FORMAT)}</div>
);

const getColumns = ({ name, updatedAt, keywords }: any) => ({
  name: getName(name, keywords),
  updatedAt: getUpdatedAt(updatedAt),
});

const columnNames = ['NAME', 'LAST MODIFIED', 'ACTIONS'];
const dialogMessage = "You won't be able to use this flow.";
const columnStyles = [styles.Name, styles.LastModified, styles.Actions];
const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_FLOW_COUNT,
  filterItemsQuery: FILTER_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

const columnAttributes = {
  columnNames,
  columns: getColumns,
  columnStyles,
};

const configureIcon = <ConfigureIcon />;

export const FlowList: React.SFC<FlowListProps> = () => {
  const history = useHistory();

  const setDialog = (id: any) => {
    history.push({ pathname: `/flow/${id}/edit`, state: 'copy' });
  };

  const additionalAction = [
    {
      label: 'Configure',
      icon: configureIcon,
      parameter: 'uuid',
      link: '/flow/configure',
    },
    {
      label: 'Make a copy',
      icon: <DuplicateIcon />,
      parameter: 'id',
      dialog: setDialog,
    },
  ];

  return (
    <>
      <List
        title="Flows"
        listItem="flows"
        listItemName="flow"
        pageLink="flow"
        listIcon={flowIcon}
        dialogMessage={dialogMessage}
        refetchQueries={{ query: GET_FLOWS, variables: setVariables() }}
        {...queries}
        {...columnAttributes}
        searchParameter="name"
        additionalAction={additionalAction}
        button={{ show: true, label: '+ CREATE FLOW' }}
      />

      <Link to="/webhook-logs" className={styles.Webhook}>
        <WebhookLogsIcon />
        View webhook logs
      </Link>
    </>
  );
};
