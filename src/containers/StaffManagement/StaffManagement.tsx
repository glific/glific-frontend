import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';

import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { GET_USERS_QUERY } from '../../graphql/queries/User';
import { UPDATE_USER, DELETE_USER } from '../../graphql/mutations/User';
import { ReactComponent as StaffManagementIcon } from '../../assets/images/icons/StaffManagement/Active.svg';
import { GET_GROUPS } from '../../graphql/queries/Group';

export interface StaffManagementProps {
  match: any;
}

const dialogMessage = ' Once deleted this action cannot be undone.';

const staffManagementIcon = <StaffManagementIcon />;

const queries = {
  getItemQuery: GET_USERS_QUERY,
  createItemQuery: UPDATE_USER,
  updateItemQuery: UPDATE_USER,
  deleteItemQuery: DELETE_USER,
};

export const StaffManagement: React.SFC<StaffManagementProps> = ({ match }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState('');
  const [groups, setGroups] = useState([]);

  const states = { name, phone, roles, groups };
  const setStates = ({ name, phone, roles, groups }: any) => {
    setName(name);
    setPhone(phone);
    setRoles(roles);
    setGroups(groups);
  };

  useQuery(GET_GROUPS, {
    onCompleted: (data) => {
      setGroups(data.groups);
    },
  });

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'Full Name',
    },
    {
      component: Input,
      name: 'phone',
      placeholder: 'Phone Number',
      disabled: true,
    },
    {
      component: Dropdown,
      name: 'roles',
      placeholder: 'Roles',
      options: [
        { id: 'admin', label: 'Admin' },
        { id: 'basic', label: 'Basic' },
      ],
    },
    {
      component: AutoComplete,
      name: 'groups',
      placeholder: 'Groups',
      options: groups,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Groups',
        variant: 'outlined',
      },
    },
  ];

  const FormSchema = Yup.object().shape({
    name: Yup.string().required('Name is required.'),
    phone: Yup.string().required('Phone is required'),
  });

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="User"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="staff-management"
      listItem="user"
      icon={staffManagementIcon}
      languageSupport={false}
    />
  );
};
