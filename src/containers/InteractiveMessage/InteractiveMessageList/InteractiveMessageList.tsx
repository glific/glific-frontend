import React from 'react';

import moment from 'moment';
import { useTranslation } from 'react-i18next';

import styles from './InteractiveMessageList.module.css';
import { ReactComponent as InteractiveMessageIcon } from '../../../assets/images/icons/InteractiveMessage/Dark.svg';

import { List } from '../../List/List';
import { FILTER_FLOW, GET_FLOW_COUNT } from '../../../graphql/queries/Flow';
import { DELETE_FLOW } from '../../../graphql/mutations/Flow';
import { DATE_TIME_FORMAT } from '../../../common/constants';

export interface InteractiveMessageListProps {}

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
const interactiveMsgIcon = <InteractiveMessageIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_FLOW_COUNT,
  filterItemsQuery: FILTER_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

export const InteractiveMessageList: React.SFC<InteractiveMessageListProps> = () => {
  const { t } = useTranslation();

  const getColumns = ({ name, keywords, lastChangedAt, lastPublishedAt }: any) => ({
    name: getName(name, keywords),
    lastPublishedAt: getDate(lastPublishedAt, t('Not published yet')),
    lastChangedAt: getDate(lastChangedAt, t('Nothing in draft')),
  });

  const columnNames = ['TITLE', 'MESSAGE', 'TYPE', 'ACTIONS'];
  const dialogMessage = t("You won't be able to use this interactive message.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <>
      <List
        title={t('Interactive msg')}
        listItem="flows"
        listItemName="flow"
        pageLink="interactive-message"
        listIcon={interactiveMsgIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        button={{ show: true, label: t('+ ADD NEW') }}
      />
    </>
  );
};

export default InteractiveMessageList;
