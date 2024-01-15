import { useTranslation } from 'react-i18next';
import FlowIcon from 'assets/images/icons/Flow/Dark.svg?react';
import { GET_TAG_COUNT, FILTER_TAGS } from 'graphql/queries/Tags';
import { DELETE_TAG } from 'graphql/mutations/Tags';
import { List } from 'containers/List/List';
import styles from './TagList.module.css';

const getName = (Name: any) => {
  return <div className={styles.NameText}>{Name}</div>;
};
const noOfFlows = (number: any) => {
  return <div className={styles.NameText}>{number}</div>;
};
const getCreated = (updatedAt: any) => {
  return <div className={styles.TableText}>{updatedAt}</div>;
};

const columnStyles = [styles.Name, styles.Count, styles.DateColumn, styles.Actions];
const tagIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_TAG_COUNT,
  filterItemsQuery: FILTER_TAGS,
  deleteItemQuery: DELETE_TAG,
};

export const TagList = () => {
  const { t } = useTranslation();

  const getColumns = ({ label, updatedAt, id }: any) => ({
    name: getName(label),
    noOfFlows: noOfFlows(id),
    created: getCreated(updatedAt),
  });

  const columnNames = [
    { name: 'label', label: t('Title') },
    { label: t('No. of flows') },
    { label: t('Created') },
    { label: t('Actions') },
  ];

  const dialogMessage = t("You won't be able to use this tag.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const helpData = {
    heading:
      'You have the ability to create and edit tags, allowing you to assign tags to messages, templates, flows, and more.',
    body: <></>,
    link: '',
  };

  return (
    <List
      helpData={helpData}
      title={t('Tags')}
      listItem="tags"
      listItemName="tag"
      pageLink="tag"
      listIcon={tagIcon}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
      button={{ show: true, label: t('Create') }}
    />
  );
};

export default TagList;
