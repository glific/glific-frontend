import React, { useState } from 'react';
import { GET_GROUPS_COUNT, FILTER_GROUPS, GET_GROUPS } from '../../../graphql/queries/Group';
import { DELETE_GROUP } from '../../../graphql/mutations/Group';
import styles from './GroupList.module.css';
import { ReactComponent as GroupIcon } from '../../../assets/images/icons/Groups/Dark.svg';
import { ReactComponent as AutomationIcon } from '../../../assets/images/icons/Automations/Selected.svg';
import { List } from '../../List/List';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_AUTOMATIONS } from '../../../graphql/queries/Automation';
import { DropdownDialog } from '../../../components/UI/DropdownDialog/DropdownDialog';
import { ADD_AUTOMATION_TO_GROUP } from '../../../graphql/mutations/Automation';
import { setNotification } from '../../../common/notification';
import { displayUserGroups } from '../../../context/role';
import { ReactComponent as AddContactIcon } from '../../../assets/images/icons/Contact/Add.svg';
import { SearchDialogBox } from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import { CONTACT_SEARCH_QUERY } from '../../../graphql/queries/Contact';
import { setVariables } from '../../../common/constants';

export interface GroupListProps {}

const getColumns = ({ id, label, description }: any) => ({
  id: id,
  label: getLabel(label),
  description: getDescription(description),
});

const getLabel = (label: string) => <p className={styles.LabelText}>{label}</p>;

const getDescription = (text: string) => <p className={styles.GroupDescription}>{text}</p>;

const dialogMessage = "You won't be able to use this group again.";
const columnStyles = [styles.Label, styles.Description, styles.Actions];
const groupIcon = <GroupIcon className={styles.GroupIcon} />;

const queries = {
  countQuery: GET_GROUPS_COUNT,
  filterItemsQuery: FILTER_GROUPS,
  deleteItemQuery: DELETE_GROUP,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles: columnStyles,
};

export const GroupList: React.SFC<GroupListProps> = (props) => {
  const client = useApolloClient();
  const [addAutomationDialogShow, setAddAutomationDialogShow] = useState(false);
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);
  const [groupId, setGroupId] = useState();

  const [getAutomations, { data: automationData }] = useLazyQuery(GET_AUTOMATIONS);
  const [getContacts, { data: contactsData }] = useLazyQuery(CONTACT_SEARCH_QUERY, {
    variables: setVariables({}, 30),
  });

  const [addAutomationToGroup] = useMutation(ADD_AUTOMATION_TO_GROUP, {
    onCompleted: (data: any) => {
      setAddAutomationDialogShow(false);
      setNotification(client, 'Automation started successfully');
    },
  });
  let automationOptions = [];
  let contactOptions = [];
  if (automationData) {
    automationOptions = automationData.flows;
  }
  if (contactsData) {
    contactOptions = contactsData.contacts;
  }

  let dialog = null;

  const closeAutomationDialogBox = () => {
    setAddAutomationDialogShow(false);
  };

  const setAutomationDialog = (id: any) => {
    getAutomations();
    setGroupId(id);
    setAddAutomationDialogShow(true);
  };

  const setContactsDialog = (id: any) => {
    getContacts();
    setGroupId(id);
    setAddContactsDialogShow(true);
  };

  const handleAutomationSubmit = (value: any) => {
    addAutomationToGroup({
      variables: {
        flowId: value,
        groupId: groupId,
      },
    });
  };

  if (addAutomationDialogShow) {
    dialog = (
      <DropdownDialog
        title="Select automation flow"
        handleOk={handleAutomationSubmit}
        handleCancel={closeAutomationDialogBox}
        options={automationOptions}
        placeholder="Select flow"
        description="The contact will be responded as per the messages planned in the automation."
      />
    );
  }

  if (addContactsDialogShow) {
    dialog = (
      <SearchDialogBox
        title="Add contacts to the group"
        handleOk={handleAutomationSubmit}
        handleCancel={() => setAddContactsDialogShow(false)}
        options={contactOptions}
        optionLabel="name"
        selectedOptions={[]}
        onChange={(value: any) => console.log(value)}
      />
    );
  }
  const addContactIcon = <AddContactIcon />;
  const automationIcon = <AutomationIcon />;
  const additionalAction = [
    {
      label: 'Add contacts to group',
      icon: addContactIcon,
      parameter: 'id',
      dialog: setContactsDialog,
    },
    {
      label: 'Start automation flow',
      icon: automationIcon,
      parameter: 'id',
      dialog: setAutomationDialog,
    },
  ];

  const refetchQueries = {
    onDelete: GET_GROUPS,
  };
  const cardLink = { start: 'group', end: 'contacts' };
  return (
    <>
      <List
        refetchQueries={refetchQueries}
        title="Groups"
        listItem="groups"
        listItemName="group"
        displayListType="card"
        button={{ show: displayUserGroups, label: '+ CREATE GROUP' }}
        pageLink="group"
        listIcon={groupIcon}
        dialogMessage={dialogMessage}
        additionalAction={additionalAction}
        cardLink={cardLink}
        {...queries}
        {...columnAttributes}
      />
      {dialog}
    </>
  );
};
