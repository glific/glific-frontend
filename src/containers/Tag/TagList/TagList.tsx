import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { GET_TAGS_COUNT, FILTER_TAGS } from 'graphql/queries/Tag';
import { DELETE_TAG } from 'graphql/mutations/Tag';
import { ReactComponent as TagIcon } from 'assets/images/icons/Tags/Dark.svg';
import { ReactComponent as FilledTagIcon } from 'assets/images/icons/Tags/Filled.svg';
import { List } from 'containers/List/List';
import { DATE_TIME_FORMAT } from 'common/constants';
import styles from './TagList.module.css';

const getLabel = (label: string, colorCode: string = '#0C976D') => (
  <div className={styles.LabelContainer}>
    <FilledTagIcon className={styles.FilledTagIcon} stroke={colorCode} />
    <p className={styles.LabelText} style={{ color: colorCode }}>
      {label}
    </p>
  </div>
);

const getDescription = (text: string) => <p className={styles.TableText}>{text}</p>;

const getKeywords = (keyword: any) => (
  <p className={styles.TableText}>{keyword ? keyword.join(', ') : null}</p>
);

const getUpdatedAt = (date: string) => (
  <div className={styles.LastModified}>{moment(date).format(DATE_TIME_FORMAT)}</div>
);

const getColumns = ({ label, description, keywords, colorCode, updatedAt }: any) => ({
  label: getLabel(label, colorCode),
  description: getDescription(description),
  keywords: getKeywords(keywords),
  updatedAt: getUpdatedAt(updatedAt),
});

const columnStyles = [
  styles.Label,
  styles.Description,
  styles.Keywords,
  styles.LastModifiedColumn,
  styles.Actions,
];
const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  countQuery: GET_TAGS_COUNT,
  filterItemsQuery: FILTER_TAGS,
  deleteItemQuery: DELETE_TAG,
};

export const TagList = () => {
  const { t } = useTranslation();

  const columnNames = [
    { name: 'label', label: t('Title') },
    { name: 'description', label: t('Description') },
    { label: t('Keywords') },
    { name: 'updated_at', label: t('Last modified') },
    { label: t('Actions') },
  ];

  const dialogMessage = t("You won't be able to use this for tagging messages.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };
  return (
    <List
      title={t('Tags')}
      listItem="tags"
      listItemName="tag"
      pageLink="tag"
      listIcon={tagIcon}
      button={{ show: true, label: t('Create Tag'), symbol: '+' }}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
    />
  );
};

export default TagList;
