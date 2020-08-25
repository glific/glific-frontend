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
      name: 'contacts',
      additionalState: 'contacts',
      options: options,
      optionLabel: 'name',
      textFieldProps: {
        // required: true,
        label: 'Add contact to group',
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
  const [selectedContacts, { data: groupContacts }] = useLazyQuery(GET_GROUP_USERS, {
    fetchPolicy: 'cache-and-network',
  });
  const groupId = match.params.id ? match.params.id : null;
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState([]);

  const [updateGroupContacts] = useMutation(UPDATE_GROUP_USERS);

  const updateContacts = (groupId: any) => {
    const initialSelectedContacts = contacts.map((contact: any) => contact.id);
    const finalSelectedContacts = selected.map((contact: any) => contact.id);
    const selectedContacts = finalSelectedContacts.filter(
      (contact: any) => !initialSelectedContacts.includes(contact)
    );
    const removedContacts = initialSelectedContacts.filter(
      (contact: any) => !finalSelectedContacts.includes(contact)
    );

    if (selectedContacts.length > 0 || removedContacts.length > 0) {
      updateGroupContacts({
        variables: {
          input: {
            addUserIds: selectedContacts,
            groupId: groupId,
            deleteUserIds: removedContacts,
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
    if (groupContacts) setContacts(groupContacts.group.group.users);
  }, [groupContacts]);

  const states = { label, description, contacts };
  const setStates = ({ label, description, ...props }: any) => {
    setLabel(label);
    setDescription(description);
  };

  const additionalState = (contact: any) => {
    setSelected(contact);
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
