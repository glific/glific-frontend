import React from 'react';

import styles from './WebhookLogsList.module.css';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Dark.svg';
import { List } from '../../List/List';
import { FILTER_WEBHOOK_LOGS, GET_WEBHOOK_LOGS_COUNT } from '../../../graphql/queries/WebhookLogs';

export interface TagListProps {}

// const getLabel = (label: string, colorCode: string = '#0C976D') => (
//   <div className={styles.LabelContainer}>
//     <FilledTagIcon className={styles.FilledTagIcon} stroke={colorCode} />
//     <p className={styles.LabelText} style={{ color: colorCode }}>
//       {label}
//     </p>
//   </div>
// );

const getDescription = (text: string) => <p className={styles.TableText}>{text}</p>;

// const getKeywords = (keyword: any) => (
//   <p className={styles.TableText}>{keyword ? keyword.join(', ') : null}</p>
// );

// const getUpdatedAt = (date: string) => (
//   <div className={styles.LastModified}>{moment(date).format(DATE_TIME_FORMAT)}</div>
// );

const getColumns = ({ url, statusCode, updatedAt }: any) => ({
  url: getDescription(url),
  statusCode: getDescription(statusCode),
  updatedAt: getDescription(updatedAt),
});

const columnNames = ['URL', 'STATUS', 'LAST MODIFIED', 'ACTIONS'];
const dialogMessage = "You won't be able to use this for tagging messages.";
const columnStyles = [styles.Label, styles.Description, styles.Keywords, styles.Actions];
const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  countQuery: GET_WEBHOOK_LOGS_COUNT,
  filterItemsQuery: FILTER_WEBHOOK_LOGS,
  deleteItemQuery: DELETE_TAG,
};

const columnAttributes = {
  columnNames,
  columns: getColumns,
  columnStyles,
};

const restrictedAction = () => {
  return { delete: false, edit: true };
};

export const WebhookLogsList: React.SFC<TagListProps> = () => (
  <List
    title="Webhook Logs"
    listItem="webhookLogs"
    listItemName="webhookLog"
    pageLink="webhookLog"
    listIcon={tagIcon}
    searchParameter="url"
    button={{ show: false, label: '' }}
    dialogMessage={dialogMessage}
    {...queries}
    restrictedAction={restrictedAction}
    {...columnAttributes}
  />
);
