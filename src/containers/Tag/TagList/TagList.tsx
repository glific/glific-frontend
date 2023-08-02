import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as AddIcon } from 'assets/images/add.svg';
import { ReactComponent as FlowIcon } from 'assets/images/icons/Flow/Dark.svg';
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
const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_TAG_COUNT,
  filterItemsQuery: FILTER_TAGS,
  deleteItemQuery: DELETE_TAG,
};

export const TagList = () => {
  const { t } = useTranslation();
  const [importing, setImporting] = useState(false);

  const getColumns = ({ label, updatedAt, id }: any) => ({
    name: getName(label),
    noOfFlows: noOfFlows(id),
    created: getCreated(updatedAt),
  });

  const columnNames = [
    { label: t('Title') },
    { label: t('No. of flows') },
    { label: t('Created') },
    { label: t('Actions') },
  ];

  const dialogMessage = t("You won't be able to use this flow.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const addIcon = <AddIcon style={{ marginRight: '10px', height: '12px', width: '12px' }} />;
  const Link = 'https://glific.org/';

  return (
    <List
      title={t('Tags')}
      listItem="tags"
      listItemName="tag"
      pageLink="tag"
      listIcon={flowIcon}
      listLink={Link}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
      //   searchParameter={['name_or_keyword_or_tags']}
      //   additionalAction={additionalAction}
      button={{ show: true, label: t('Create'), symbol: addIcon }}
      loadingList={importing}
    />
  );
};

export default TagList;
