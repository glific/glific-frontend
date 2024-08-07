import { useEffect, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import AddContactIcon from 'assets/images/icons/Contact/Add.svg?react';
import AddGroupIcon from 'assets/images/icons/AddGroupIcon.svg?react';
import ExportIcon from 'assets/images/icons/Flow/Export.svg?react';
import {
  DELETE_COLLECTION,
  UPDATE_COLLECTION_CONTACTS,
  UPDATE_COLLECTION_WA_GROUP,
} from 'graphql/mutations/Collection';
import {
  GET_COLLECTIONS_COUNT,
  FILTER_COLLECTIONS,
  EXPORT_COLLECTION_DATA,
} from 'graphql/queries/Collection';
import { GET_CONTACTS_LIST } from 'graphql/queries/Contact';
import { List } from 'containers/List/List';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { getUserRolePermissions, getUserRole } from 'context/role';
import { setNotification } from 'common/notification';
import {
  COLLECTION_SEARCH_QUERY_VARIABLES,
  CONTACTS_COLLECTION,
  GROUP_COLLECTION_SEARCH_QUERY_VARIABLES,
  WA_GROUPS_COLLECTION,
  setVariables,
} from 'common/constants';
import { CircularProgress, Modal } from '@mui/material';
import styles from './CollectionList.module.css';
import { exportCsvFile } from 'common/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { collectionInfo } from 'common/HelpData';
import { GET_WA_GROUPS, GROUP_SEARCH_QUERY } from 'graphql/queries/WaGroups';
import { SEARCH_QUERY } from 'graphql/queries/Search';

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getDescription = (description: string) => (
  <div className={styles.DescriptionText}>{description}</div>
);

const getContact = (totalCount: number, groups: boolean, id: any) => (
  <Link
    data-testid="view"
    to={`/collection/${id}/${groups ? 'groups' : 'contacts'}`}
    className={styles.UserCount}
  >
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
  const navigate = useNavigate();
  const [updateCollection, setUpdateCollection] = useState(false);
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);

  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [collectionId, setCollectionId] = useState();
  const [exportData, setExportData] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const groups: boolean = location.pathname.includes('group');

  const [filter, setFilter] = useState<{
    groupType: string;
  }>({ groupType: groups ? WA_GROUPS_COLLECTION : CONTACTS_COLLECTION });

  const entity = groups ? 'waGroups' : 'contacts';
  const entityQuery = groups ? GET_WA_GROUPS : GET_CONTACTS_LIST;

  const searchQuery = groups ? GROUP_SEARCH_QUERY : SEARCH_QUERY;
  const searchVariables = groups
    ? GROUP_COLLECTION_SEARCH_QUERY_VARIABLES
    : COLLECTION_SEARCH_QUERY_VARIABLES;
  const updateMutation = groups ? UPDATE_COLLECTION_WA_GROUP : UPDATE_COLLECTION_CONTACTS;

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

  const [getContacts, { data: entityData }] = useLazyQuery(entityQuery, {
    fetchPolicy: 'cache-and-network',
  });
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

  const [updateCollectionContacts] = useMutation(updateMutation, {
    onCompleted: (data) => {
      let updateVariable = groups ? 'updateCollectionWaGroup' : 'updateGroupContacts';
      const { groupContacts } = data[updateVariable];
      const numberAdded = groupContacts.length;
      if (numberAdded > 0) {
        setNotification(
          `${numberAdded} ${groups ? 'group' : 'contact'}${numberAdded === 1 ? '' : 's  were'} added`
        );
      }
      setUpdateCollection((updateCollection) => !updateCollection);
      setAddContactsDialogShow(false);
    },
  });

  const dialogMessage = t("You won't be able to use this collection again.");

  let contactOptions: any = [];

  if (entityData) {
    contactOptions = entityData[entity];
  }

  let dialog = null;

  const setContactsDialog = (id: any) => {
    getContacts({
      variables: groups
        ? setVariables({ label: contactSearchTerm, excludeGroups: id }, 50)
        : setVariables({ name: contactSearchTerm, excludeGroups: id }, 50),
    });
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

  const handleCollectionAdd = (selectedContacts: any) => {
    if (selectedContacts.length === 0) {
      setAddContactsDialogShow(false);
    } else {
      const addvariable = groups ? 'addWaGroupIds' : 'addContactIds';
      const deletevariable = groups ? 'deleteWaGroupIds' : 'deleteContactIds';
      updateCollectionContacts({
        variables: {
          input: {
            [addvariable]: selectedContacts,
            groupId: collectionId,
            [deletevariable]: [],
          },
        },
      });
    }
  };

  let searchDialogTitle = t('Add contacts to the collection');
  let selectPlaceHolder = t('Select contacts');

  if (groups) {
    searchDialogTitle = t('Add groups to the collection');
    selectPlaceHolder = t('Select groups');
  }

  if (addContactsDialogShow) {
    dialog = (
      <SearchDialogBox
        title={searchDialogTitle}
        handleOk={handleCollectionAdd}
        handleCancel={() => setAddContactsDialogShow(false)}
        options={contactOptions}
        optionLabel="name"
        additionalOptionLabel="phone"
        asyncSearch
        disableClearable
        selectedOptions={[]}
        renderTags={false}
        searchLabel="Search contacts"
        textFieldPlaceholder="Type here"
        onChange={(value: any) => {
          if (typeof value === 'string') {
            setContactSearchTerm(value);
          }
        }}
        fullWidth={true}
        showTags={false}
        placeholder={selectPlaceHolder}
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
    insideMore: true,
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
