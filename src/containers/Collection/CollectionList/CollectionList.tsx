import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import AddContactIcon from 'assets/images/icons/Contact/Add.svg?react';
import AddGroupIcon from 'assets/images/icons/AddGroupIcon.svg?react';
import ExportIcon from 'assets/images/icons/Flow/Export.svg?react';
import { DELETE_COLLECTION } from 'graphql/mutations/Collection';
import { GET_COLLECTIONS_COUNT, FILTER_COLLECTIONS, EXPORT_COLLECTION_DATA } from 'graphql/queries/Collection';
import { List } from 'containers/List/List';
import { getUserRolePermissions, getUserRole } from 'context/role';
import { setNotification } from 'common/notification';
import {
  COLLECTION_SEARCH_QUERY_VARIABLES,
  CONTACTS_COLLECTION,
  GROUP_COLLECTION_SEARCH_QUERY_VARIABLES,
  WA_GROUPS_COLLECTION,
} from 'common/constants';
import { CircularProgress, Modal } from '@mui/material';
import styles from './CollectionList.module.css';
import { exportCsvFile } from 'common/utils';
import { useNavigate, Link, useLocation } from 'react-router';
import { collectionInfo } from 'common/HelpData';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WaGroups';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import AddToCollection from 'containers/Chat/ChatMessages/AddToCollection/AddToCollection';

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getDescription = (description: string) => <div className={styles.DescriptionText}>{description}</div>;

const getContact = (totalCount: number, groups: boolean, id: any) => (
  <Link data-testid="view" to={`/collection/${id}/${groups ? 'groups' : 'contacts'}`} className={styles.UserCount}>
    {`${totalCount} ${groups ? 'group' : 'contact'}${totalCount === 1 ? '' : 's'}`}
  </Link>
);

const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

const queries = {
  countQuery: GET_COLLECTIONS_COUNT,
  filterItemsQuery: FILTER_COLLECTIONS,
  deleteItemQuery: DELETE_COLLECTION,
};

export const CollectionList = () => {
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);
  const [updateCollection, setUpdateCollection] = useState(false);

  const [collectionId, setCollectionId] = useState();
  const [exportData, setExportData] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const groups: boolean = location.pathname.includes('group');

  const [filter, setFilter] = useState<{
    groupType: string;
  }>({ groupType: groups ? WA_GROUPS_COLLECTION : CONTACTS_COLLECTION });

  const searchQuery = groups ? GROUP_SEARCH_QUERY : SEARCH_QUERY;
  const searchVariables = groups ? GROUP_COLLECTION_SEARCH_QUERY_VARIABLES : COLLECTION_SEARCH_QUERY_VARIABLES;

  useEffect(() => {
    setFilter({ groupType: groups ? WA_GROUPS_COLLECTION : CONTACTS_COLLECTION });
  }, [location]);

  const getColumns = ({ label, contactsCount, description, waGroupsCount, id }: any) => {
    return {
      label: getLabel(label),
      description: getDescription(description),
      contacts: getContact(groups ? waGroupsCount : contactsCount, groups, id),
    };
  };

  const columnStyles = [styles.Label, styles.Description, styles.Contact, styles.Actions];

  const columnAttributes = {
    columns: getColumns,
    columnStyles,
  };

  const [exportCollectionData] = useLazyQuery(EXPORT_COLLECTION_DATA, {
    onCompleted: (data) => {
      if (data.exportCollection.errors) {
        setNotification(data.exportCollection.errors[0].message, 'warning');
      } else if (data.exportCollection.status) {
        exportCsvFile(data.exportCollection.status, 'collection');
      }
      setExportData(false);
    },
    onError: (error) => {
      setNotification('An error occured while exporting the collection', 'warning');
    },
  });

  const dialogMessage = t("You won't be able to use this collection again.");

  let dialog = null;

  const setContactsDialog = (id: any) => {
    setCollectionId(id);
    setAddContactsDialogShow(true);
  };

  const exportCollection = (id: string) => {
    setExportData(true);
    exportCollectionData({
      variables: {
        exportCollectionId: id,
      },
    });
  };

  if (addContactsDialogShow) {
    dialog = (
      <AddToCollection
        groups={groups}
        collectionId={collectionId}
        setDialog={setAddContactsDialogShow}
        afterAdd={() => {
          setUpdateCollection((updateCollection) => !updateCollection);
        }}
      />
    );
  }

  const addContactIcon = groups ? <AddGroupIcon /> : <AddContactIcon />;
  const addEntiyLabel = groups ? t('Add groups to collection') : t('Add contacts to collection');

  const addEntity = {
    label: addEntiyLabel,
    icon: addContactIcon,
    parameter: 'id',
    dialog: setContactsDialog,
  };

  const exportCollectionButton = {
    label: t('Export'),
    icon: <ExportIcon />,
    parameter: 'id',
    dialog: exportCollection,
  };

  const additionalAction = () => (groups ? [addEntity] : [addEntity, exportCollectionButton]);

  const getRestrictedAction = () => {
    const action: any = { edit: true, delete: true };
    if (getUserRole().includes('Staff')) {
      action.edit = false;
      action.delete = false;
    }
    return action;
  };

  // check if the user has access to manage collections
  const userRolePermissions = getUserRolePermissions();
  let TotalCountLabel = groups ? t('Groups') : t('Contacts');
  let title = groups ? t('Group Collections') : t('Collections');

  const refetchQueries = [
    {
      query: searchQuery,
      variables: searchVariables,
    },
  ];

  return (
    <>
      {exportData && (
        <Modal open>
          <div className={styles.ExportPopup}>
            Please wait while the data is exporting <CircularProgress size="1rem" />
          </div>
        </Modal>
      )}
      <List
        helpData={groups ? undefined : collectionInfo}
        refreshList={updateCollection}
        restrictedAction={getRestrictedAction}
        title={title}
        listItem="groups"
        columnNames={[
          { name: 'label', label: t('Title') },
          { label: t('Description') },
          { label: TotalCountLabel },
          { label: t('Actions') },
        ]}
        listItemName="collection"
        button={{
          show: userRolePermissions.manageCollections,
          label: t('Create'),
          action: () => {
            navigate(`/${groups ? 'group/' : ''}collection/add`);
          },
        }}
        filters={filter}
        pageLink={`${groups ? 'group/' : ''}collection`}
        listIcon={collectionIcon}
        dialogMessage={dialogMessage}
        additionalAction={additionalAction}
        {...queries}
        {...columnAttributes}
        refetchQueries={refetchQueries}
      />
      {dialog}
    </>
  );
};

export default CollectionList;
