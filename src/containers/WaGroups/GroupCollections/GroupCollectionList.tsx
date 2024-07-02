import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { GET_GROUP_COUNT, GET_WA_GROUPS } from 'graphql/queries/WaGroups';
import {
  UPDATE_COLLECTION_WA_GROUP,
  UPDATE_WA_GROUP_COLLECTION,
} from 'graphql/mutations/Collection';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import { List } from 'containers/List/List';
import styles from './GroupCollectionList.module.css';

import { GET_COLLECTION, GROUP_GET_COLLECTION } from 'graphql/queries/Collection';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { setVariables } from 'common/constants';
import { setNotification } from 'common/notification';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';

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
  deleteItemQuery: UPDATE_WA_GROUP_COLLECTION,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles,
};

export const GroupCollectionList = () => {
  const [addGroupsDialogShow, setAddGroupsDialogShow] = useState(false);
  const [removeGroupsDialogShow, setRemoveGroupsDialogShow] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroup] = useState<any>([]);
  const [groupsToRemove, setGroupsToRemove] = useState<any>([]);
  const { t } = useTranslation();
  const params = useParams();

  const collectionId: any = params.id;
  const collection = useQuery(GET_COLLECTION, {
    variables: { id: collectionId },
    fetchPolicy: 'cache-and-network',
  });

  const [getGroups, { data: groupsData }] = useLazyQuery(GET_WA_GROUPS, {
    fetchPolicy: 'cache-and-network',
  });

  const [updateCollectionGroups] = useMutation(UPDATE_COLLECTION_WA_GROUP);

  const handleCollectionAdd = (selectedGroups: any) => {
    if (selectedGroups.length === 0) {
      setAddGroupsDialogShow(false);
    } else {
      updateCollectionGroups({
        variables: {
          input: {
            addWaGroupIds: selectedGroups,
            groupId: collectionId,
            deleteWaGroupIds: [],
          },
        },
        onCompleted: () => {
          setNotification('Group added successfully', 'success');
        },
      });
    }
    setAddGroupsDialogShow(false);
  };

  const handleCollectionRemove = () => {
    const idsToRemove = selectedGroups.map((collection: any) => collection.id);
    updateCollectionGroups({
      variables: {
        input: {
          groupId: collectionId,
          addWaGroupIds: [],
          deleteWaGroupIds: idsToRemove,
        },
      },
      onCompleted: () => {
        setNotification('Group deleted successfully', 'success');
      },
    });
    setRemoveGroupsDialogShow(false);
    setGroupsToRemove([]);
  };

  const setDialogBox = (selectedGroups: any) => {
    setRemoveGroupsDialogShow(true);
    setSelectedGroup(selectedGroups);
  };

  let dialog;

  if (addGroupsDialogShow) {
    let groupsOptions: any = [];
    if (groupsData) {
      groupsOptions = groupsData.waGroups;
    }

    dialog = (
      <SearchDialogBox
        title={t('Add groups to collection')}
        handleOk={handleCollectionAdd}
        handleCancel={() => setAddGroupsDialogShow(false)}
        options={groupsOptions}
        optionLabel="name"
        additionalOptionLabel="phone"
        asyncSearch
        colorOk="primary"
        buttonOk="Add"
        disableClearable={true}
        searchLabel="Search groups"
        textFieldPlaceholder="Type here"
        onChange={(value: any) => {
          if (typeof value === 'string') {
            setGroupSearchTerm(value);
          }
        }}
        selectedOptions={[]}
        fullWidth={true}
        showTags={false}
        placeholder="Select groups"
      />
    );
  }

  const addGroupsButton = (
    <Button
      variant="contained"
      color="primary"
      data-testid="addBtn"
      onClick={() => {
        getGroups({
          variables: setVariables({ excludeGroups: collectionId }, 50),
        });
        setAddGroupsDialogShow(true);
      }}
    >
      Add groups
    </Button>
  );

  const removeDialogBox = (
    <DialogBox
      title={'Are you sure you want to remove group from this collection?'}
      handleCancel={() => setRemoveGroupsDialogShow(false)}
      colorOk="warning"
      alignButtons="center"
      handleOk={handleCollectionRemove}
    >
      <div className={styles.DialogText}>
        <p>{'The group will no longer receive messages sent to this collection'}</p>
      </div>
    </DialogBox>
  );

  const title = collection.data ? collection.data.group.group.label : t('Collection');

  const columnNames = [{ name: 'label', label: 'Group' }, { label: t('Actions') }];

  const additionalAction = () => [
    {
      icon: <ArrowForwardIcon className={styles.RedirectArrow} />,
      label: t('View contacts'),
      link: '/group-details',
      parameter: 'id',
    },
  ];

  const getRestrictedAction = () => {
    const action: any = { edit: false, delete: false };
    return action;
  };

  return (
    <>
      {dialog}
      {removeGroupsDialogShow && removeDialogBox}
      <List
        backLink="/group/collection"
        columnNames={columnNames}
        title={title}
        additionalAction={additionalAction}
        listItem="waGroups"
        listItemName="waGroups"
        searchParameter={['term']}
        secondaryButton={addGroupsButton}
        filters={{ includeGroups: collectionId }}
        button={{ show: false, label: '' }}
        pageLink="group"
        listIcon={collectionIcon}
        editSupport={false}
        restrictedAction={getRestrictedAction}
        checkbox={{
          show: true,
          action: setDialogBox,
          selectedItems: groupsToRemove,
          setSelectedItems: setGroupsToRemove,
          icon: <DeleteIcon data-testid="deleteBtn" />,
        }}
        {...queries}
        {...columnAttributes}
      />
    </>
  );
};
