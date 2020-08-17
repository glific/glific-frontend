import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';

import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { GET_USERS_QUERY, GET_USER_ROLES } from '../../graphql/queries/User';
import { UPDATE_USER, DELETE_USER } from '../../graphql/mutations/User';
import { ReactComponent as StaffManagementIcon } from '../../assets/images/icons/StaffManagement/Active.svg';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { Loading } from '../../components/UI/Layout/Loading/Loading';

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
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);

  const states = { name, phone, roles, groups };
  const setStates = ({ name, phone, roles, groups }: any) => {
    setName(name);
    setPhone(phone);
    // TODO: fix this once backend fixes the endpoint
    //setRoles(roles);
    setGroups(groups);
  };

  useQuery(GET_USER_ROLES, {
    onCompleted: (data) => {
      // TODO: fix this once backend fixes the endpoint
      let rolesList: any = [];
      data.roles.map((role: any) => {
        rolesList.push({ id: role, label: role });
      });
      setRoles(rolesList);
    },
  });

  const { loading, data } = useQuery(GET_GROUPS);
  if (loading) return <Loading />;

  if (!data.groups) {
    return null;
  }

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
      options: roles,
    },
    {
      component: AutoComplete,
      name: 'groups',
      placeholder: 'Groups',
      options: data.groups,
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
