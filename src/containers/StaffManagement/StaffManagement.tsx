import React, { useState } from 'react';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_USERS_QUERY, GET_GROUPS } from '../../graphql/queries/StaffManagement';
import { UPDATE_USER, DELETE_USER } from '../../graphql/mutations/StaffManagement';
import { CREATE_TEMPLATE } from '../../graphql/mutations/Template';
import { ReactComponent as StaffManagementIcon } from '../../assets/images/icons/StaffManagement/Active.svg';
import { useQuery, useMutation } from '@apollo/client';
import { FormLayout } from '../Form/FormLayout';

export interface StaffManagementProps {
  match: any;
}

const FormSchema = Yup.object().shape({
  name: Yup.string().required('Name is required.'),
  phone: Yup.string().required('Phone is required'),
});

const dialogMessage = ' Once deleted this action cannot be undone.';

const formFields = [
  {
    component: Input,
    name: 'name',
    type: 'text',
    placeholder: 'Full Name',
    query: true,
    select: false,
  },
  {
    component: Input,
    name: 'phone',
    placeholder: 'Phone Number',
    query: false,
    select: false,
  },
  {
    component: Input,
    name: 'roles',
    type: 'text',
    placeholder: 'Roles',
    query: true,
    select: true,
    fieldName: '',
    selectItems: [
      { value: 'admin', name: 'Admin' },
      { value: 'basic', name: 'Basic' },
    ],
  },
  {
    name: 'groups',
    type: 'text',
    placeholder: 'Groups',
    autocomplete: true,
    fieldName: '',
  },
];

const staffManagementIcon = <StaffManagementIcon />;

const queries = {
  getItemQuery: GET_USERS_QUERY,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_USER,
  deleteItemQuery: DELETE_USER,
};

export const StaffManagement: React.SFC<StaffManagementProps> = ({ match }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState('');
  const [checkItems, setCheckItems] = useState();

  const states = { name, phone, roles };
  const setStates = ({ name, phone, roles }: any) => {
    setName(name);
    setPhone(phone);
    setRoles(roles);
  };

  const { loading, error } = useQuery(GET_GROUPS, {
    variables: {
      opts: {
        order: 'ASC',
        limit: 100,
        offset: 0,
      },
      filter: {
        label: 'Group',
      },
    },
    onCompleted: (data) => {
      let groups = data['groups'].map((item: any) => {
        return item.label;
      });
      console.log(groups);
      setCheckItems(groups);
      console.log(data);
    },
  });
  console.log(checkItems);

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
      dropdownLabel="Roles"
      dropdownPlaceholder="Roles"
      autoCompleteLabel="Groups"
      autoCompleteOptions={checkItems}
    />
  );
};
