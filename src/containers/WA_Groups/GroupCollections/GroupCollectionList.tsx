import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { GET_GROUP_COUNT } from 'graphql/queries/Contact';
import { UPDATE_COLLECTION_GROUPS } from 'graphql/mutations/Collection';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import { List } from 'containers/List/List';
import styles from './GroupCollectionList.module.css';

import { GROUP_GET_COLLECTION } from 'graphql/queries/Collection';

export interface CollectionGroupListProps {
  title: string;
  descriptionBox?: any;
}

const getName = (label: string) => (
  <div>
    <div className={styles.NameText}>{label}</div>
  </div>
);

const getColumns = (fields: any) => {
  const { label } = fields;
  return {
    label: getName(label),
  };
};

const columnStyles = [styles.Name, styles.Actions];
const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

const queries = {
  countQuery: GET_GROUP_COUNT,
  filterItemsQuery: GROUP_GET_COLLECTION,
  deleteItemQuery: UPDATE_COLLECTION_GROUPS,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles,
};

export const CollectionGroupList = () => {
  const { t } = useTranslation();
  const params = useParams();

  const collectionId = params.id;

  const getDeleteQueryVariables = (id: any) => ({
    input: {
      waGroupId: id,
      addGroupIds: [],
      deleteGroupIds: [collectionId],
    },
  });

  const columnNames = [{ name: 'label', label: 'Group' }, { label: t('Actions') }];

  const additionalAction = () => [
    {
      icon: <ArrowForwardIcon className={styles.RedirectArrow} />,
      label: t('View Group'),
      link: '/group-details',
      parameter: 'id',
    },
  ];

  const dialogTitle = 'Are you sure you want to remove group from this collection?';
  const dialogMessage = 'The group will no longer receive messages sent to this collection';

  return (
    <>
      <List
        dialogTitle={dialogTitle}
        columnNames={columnNames}
        title={'Group Collection'}
        additionalAction={additionalAction}
        listItem="waGroups"
        listItemName="waGroups"
        searchParameter={['term']}
        filters={{ includeGroups: collectionId }}
        button={{ show: false, label: '' }}
        pageLink="contact"
        listIcon={collectionIcon}
        deleteModifier={{
          variables: getDeleteQueryVariables,
        }}
        editSupport={false}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
      />
    </>
  );
};
