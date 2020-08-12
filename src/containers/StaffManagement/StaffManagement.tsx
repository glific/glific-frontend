import React, { useState } from 'react';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_USERS_QUERY, GET_GROUPS } from '../../graphql/queries/StaffManagement';
import { UPDATE_USER, DELETE_USER } from '../../graphql/mutations/StaffManagement';
import { CREATE_TEMPLATE } from '../../graphql/mutations/Template';
import { ReactComponent as StaffManagementIcon } from '../../assets/images/icons/StaffManagement/Active.svg';
import { ListItem } from '../List/ListItem/ListItem';
import { useQuery, useMutation } from '@apollo/client';

export interface StaffManagementProps {
  match: any;
}

const setValidation = (values: any) => {
  const errors: Partial<any> = {};
  if (!values.name) {
    errors.name = 'User title required';
  } else if (values.name.length > 50) {
    errors.name = 'Length of the title is too long';
  }
  if (!values.phone) {
    errors.phone = 'User phone required';
  }
  return errors;
};

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
];

const staffManagementIcon = <StaffManagementIcon />;

const queries = {
  getItemQuery: GET_USERS_QUERY,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_USER,
  deleteItemQuery: DELETE_USER,
  additionalQuery: GET_GROUPS,
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
      setCheckItems(data);
    },
  });

  return (
    <ListItem
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setValidation={setValidation}
      listItemName="User"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="staff-management"
      listItem="user"
      icon={staffManagementIcon}
      languageSupport={false}
      checkItemsHeader="Groups"
      checkItems={checkItems}
      checkObject={'groups'}
    />
  );
};
