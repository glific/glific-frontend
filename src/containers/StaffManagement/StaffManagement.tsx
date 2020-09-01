import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';

import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
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

  const states = { name, phone, roles };
  const setStates = ({ name, phone, roles }: any) => {
    setName(name);
    setPhone(phone);

    // let' format the roles so that it is displayed correctly in the UI
    if (roles) {
      let defaultRoles: any = [];
      roles.map((role: any) => {
        defaultRoles.push({ id: role, label: role });
      });
      setRoles(defaultRoles);
    }
  };

  const { loading: loadingRoles, data: roleData } = useQuery(GET_USER_ROLES);

  if (loadingRoles) return <Loading />;

  if (!roleData.roles) {
    return null;
  }

  let rolesList: any = [];
  if (roleData.roles) {
    roleData.roles.map((role: any) => {
      rolesList.push({ id: role, label: role });
    });
  }

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'Username',
    },
    {
      component: Input,
      name: 'phone',
      placeholder: 'Phone Number',
      disabled: true,
      skipPayload: true,
    },
    {
      component: AutoComplete,
      name: 'roles',
      placeholder: 'Roles',
      options: rolesList,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Roles',
        variant: 'outlined',
      },
    },
  ];

  const FormSchema = Yup.object().shape({
    name: Yup.string().required('Name is required.'),
    phone: Yup.string().required('Phone is required'),
  });

  const setPayload = (payload: any) => {
    // let's rebuild roles, as per backend
    let roleIds = payload.roles.map((role: any) => {
      return role.id;
    });

    // delete current roles from the payload
    delete payload['roles'];

    // return modified payload
    return {
      ...payload,
      roles: roleIds,
    };
  };

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
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
