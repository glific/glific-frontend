import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_GROUP, GET_GROUP_USERS } from '../../graphql/queries/Group';
import { GET_USERS } from '../../graphql/queries/User';

import {
  UPDATE_GROUP,
  CREATE_GROUP,
  DELETE_GROUP,
  UPDATE_GROUP_USERS,
} from '../../graphql/mutations/Group';

import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as GroupIcon } from '../../assets/images/icons/StaffManagement/Active.svg';
import styles from './Group.module.css';
import { ReactComponent as ContactIcon } from '../../assets/images/icons/Contact/View.svg';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';

export interface GroupProps {
  match: any;
}

const FormSchema = Yup.object().shape({
  label: Yup.string().required('Title is required.').max(50, 'Title is too long.'),
  description: Yup.string().required('Description is required.'),
});

const dialogMessage = "You won't be able to use this group again.";

const formFields = (options: any) => {
  return [
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: 'Title',
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      placeholder: 'Description',
      rows: 3,
      textArea: true,
    },
    {
      component: AutoComplete,
      name: 'users',
      additionalState: 'users',
      options: options,
      optionLabel: 'name',
      textFieldProps: {
        // required: true,
        label: 'Assign members to group',
        variant: 'outlined',
      },
      skipPayload: true,
      icon: <ContactIcon className={styles.ContactIcon} />,
    },
  ];
};

const groupIcon = <GroupIcon className={styles.GroupIcon} />;

const queries = {
  getItemQuery: GET_GROUP,
  createItemQuery: CREATE_GROUP,
  updateItemQuery: UPDATE_GROUP,
  deleteItemQuery: DELETE_GROUP,
};

export const Group: React.SFC<GroupProps> = ({ match }) => {
  const [selectedContacts, { data: groupUsers }] = useLazyQuery(GET_GROUP_USERS, {
    fetchPolicy: 'cache-and-network',
  });
  const groupId = match.params.id ? match.params.id : null;
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);

  const [updateGroupContacts] = useMutation(UPDATE_GROUP_USERS);

  const updateContacts = (groupId: any) => {
    const initialSelectedUsers = users.map((user: any) => user.id);
    const finalSelectedUsers = selected.map((user: any) => user.id);
    const selectedUsers = finalSelectedUsers.filter(
      (user: any) => !initialSelectedUsers.includes(user)
    );
    const removedUsers = initialSelectedUsers.filter(
      (contact: any) => !finalSelectedUsers.includes(contact)
    );

    if (selectedUsers.length > 0 || removedUsers.length > 0) {
      updateGroupContacts({
        variables: {
          input: {
            addUserIds: selectedUsers,
            groupId: groupId,
            deleteUserIds: removedUsers,
          },
        },
      });
    }
  };

  const { data } = useQuery(GET_USERS);
  let options = [];
  if (data) {
    options = data.users;
  }

  useEffect(() => {
    if (groupId) {
      selectedContacts({ variables: { id: groupId } });
    }
  }, []);

  useEffect(() => {
    if (groupUsers) setUsers(groupUsers.group.group.users);
  }, [groupUsers]);

  const states = { label, description, users };
  const setStates = ({ label, description }: any) => {
    setLabel(label);
    setDescription(description);
  };

  const additionalState = (user: any) => {
    setSelected(user);
  };

  return (
    <FormLayout
      additionalQuery={updateContacts}
      {...queries}
      match={match}
      states={states}
      additionalState={additionalState}
      languageSupport={false}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="group"
      dialogMessage={dialogMessage}
      formFields={formFields(options)}
      redirectionLink="group"
      listItem="group"
      icon={groupIcon}
    />
  );
};
