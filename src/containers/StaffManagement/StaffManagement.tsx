import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as StaffManagementIcon } from 'assets/images/icons/StaffManagement/Active.svg';
import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { GET_USERS_QUERY, GET_USER_ROLES } from 'graphql/queries/User';
import { UPDATE_USER, DELETE_USER } from 'graphql/mutations/User';
import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { getUserRole } from 'context/role';
import { setVariables } from 'common/constants';
import { getUserSession } from 'services/AuthService';
import styles from './StaffManagement.module.css';

export interface StaffManagementProps {
  match: any;
}

const staffManagementIcon = <StaffManagementIcon />;

const queries = {
  getItemQuery: GET_USERS_QUERY,
  createItemQuery: UPDATE_USER,
  updateItemQuery: UPDATE_USER,
  deleteItemQuery: DELETE_USER,
};

export const StaffManagement = ({ match }: StaffManagementProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<any>(null);
  const [groups, setGroups] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [staffRole, setStaffRole] = useState(false);
  const [helpDialog, setHelpDialog] = useState(false);
  const [isAdmin] = useState(getUserRole().includes('Admin'));
  const [isManager] = useState(getUserRole().includes('Manager'));
  const navigate = useNavigate();
  const { t } = useTranslation();

  let dialog;

  if (helpDialog) {
    const rolesHelp = [
      {
        key: 1,
        title: 'Admin',
        description: t('Complete access to all the parts of the platform.'),
      },
      {
        key: 2,
        title: 'Manager',
        description: t('Complete access to the platform except settings and staff management.'),
      },
      {
        key: 3,
        title: 'Staff',
        description:
          t(`Access only to the chat section and their collections. Access can be limited to chatting
        with all contacts or only to the ones in their assigned collection.`),
      },
      { key: 4, title: 'None', description: t('No access to the platform. They can’t login.') },
    ];
    dialog = (
      <DialogBox
        titleAlign="left"
        title={t('User roles')}
        skipOk
        buttonCancel={t('Close')}
        handleCancel={() => setHelpDialog(false)}
      >
        {rolesHelp.map((role: any) => (
          <div className={styles.RolesHelp} key={role.key}>
            <span>{role.title}: </span>
            {role.description}
          </div>
        ))}
      </DialogBox>
    );
  }

  const states = { name, phone, roles, groups, isRestricted };
  const setStates = ({
    name: nameValue,
    phone: phoneValue,
    roles: rolesValue,
    groups: groupsValue,
    isRestricted: isRestrictedValue,
  }: any) => {
    setName(nameValue);
    setPhone(phoneValue);

    // let' format the roles so that it is displayed correctly in the UI
    if (rolesValue) {
      setRoles({ id: rolesValue[0], label: rolesValue[0] });
    }

    if (groupsValue) {
      setGroups(groupsValue);
    }
    setIsRestricted(isRestrictedValue);
  };

  const { loading: loadingRoles, data: roleData } = useQuery(GET_USER_ROLES);

  const { loading, data } = useQuery(GET_COLLECTIONS, {
    variables: setVariables(),
  });

  useEffect(() => {
    if (roles && roles.id === 'Staff') {
      setStaffRole(true);
    }
  }, [roles]);
  if (loading || loadingRoles) return <Loading />;
  if (!data.groups || !roleData.roles) {
    return null;
  }

  const rolesList: any = [];
  roleData.roles.forEach((role: any) => {
    rolesList.push({ id: role, label: role });
  });

  const getOptions = () => {
    let options: any = [];
    if (rolesList.length > 0) {
      if (isManager) {
        // should not display Admin role to manager.
        options = rolesList.filter(
          (item: any) => item.label !== 'Admin' && item.label !== 'Glific admin'
        );
      }
      if (isAdmin) {
        options = rolesList.filter((item: any) => item.label !== 'Glific admin');
      }
    }
    return options;
  };

  let formFields: any = [];

  const handleRolesChange = (value: any) => {
    if (value) {
      const hasStaffRole = value.label === 'Staff';
      if (hasStaffRole) {
        setStaffRole(true);
      } else {
        setStaffRole(false);
      }
    }
  };

  const handleHelpClick = () => {
    setHelpDialog(true);
  };

  formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Username'),
    },
    {
      component: Input,
      name: 'phone',
      placeholder: t('Phone Number'),
      disabled: true,
      skipPayload: true,
    },
    {
      component: AutoComplete,
      name: 'roles',
      disabled: isManager,
      placeholder: t('Roles'),
      options: rolesList,
      roleSelection: handleRolesChange,
      getOptions,
      helpLink: { label: 'help?', handleClick: handleHelpClick },
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        label: t('Roles'),
        variant: 'outlined',
      },
    },
    {
      component: AutoComplete,
      name: 'groups',
      placeholder: t('Assigned to collection(s)'),
      options: data.groups,
      optionLabel: 'label',
      textFieldProps: {
        label: t('Assigned to collection(s)'),
        variant: 'outlined',
      },
    },
  ];

  if (staffRole) {
    formFields = [
      ...formFields,
      {
        component: Checkbox,
        name: 'isRestricted',
        title: t('Can chat with contacts from assigned collection only'),
      },
    ];
  }

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
    phone: Yup.string().required(t('Phone is required')),
    roles: Yup.object().nullable().required(t('Roles is required')),
  });

  const setPayload = (payload: any) => {
    const payloadCopy = payload;
    // let's build the collectionIds, as backend expects the array of collection ids
    const collectionIds = payloadCopy.groups.map((collection: any) => collection.id);

    // remove collections from the payload
    delete payloadCopy.groups;

    let roleIds: any[] = [];
    // let's rebuild roles, as per backend
    if (payloadCopy.roles) roleIds = [payloadCopy.roles.id];

    // delete current roles from the payload
    delete payloadCopy.roles;

    // return modified payload
    return {
      ...payloadCopy,
      groupIds: collectionIds,
      roles: roleIds,
    };
  };

  const checkAfterSave = (updatedUser: any) => {
    const { id, roles: userRoles } = updatedUser.updateUser.user;
    if (isAdmin && getUserSession('id') === id && !userRoles.includes('Admin')) {
      navigate('/logout/user');
    }
  };

  const dialogMessage = t('Once deleted this action cannot be undone.');

  return (
    <>
      {dialog}
      <FormLayout
        {...queries}
        match={match}
        afterSave={checkAfterSave}
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
    </>
  );
};

export default StaffManagement;
