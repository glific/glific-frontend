import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as StaffManagementIcon } from 'assets/images/icons/StaffManagement/Active.svg';
import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { GET_USERS_QUERY } from 'graphql/queries/User';
import { UPDATE_USER, DELETE_USER } from 'graphql/mutations/User';
import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { getUserRole } from 'context/role';
import { setVariables } from 'common/constants';
import { getUserSession } from 'services/AuthService';
import { GET_ROLE_NAMES } from 'graphql/queries/Role';
import { organizationHasDynamicRole } from 'common/utils';
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

export const StaffManagement: React.SFC<StaffManagementProps> = ({ match }) => {
  const hasDynamicRoles = organizationHasDynamicRole();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<any>(hasDynamicRoles ? [] : null);
  const [groups, setGroups] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [staffRole, setStaffRole] = useState(false);
  const [helpDialog, setHelpDialog] = useState(false);
  const [isAdmin] = useState(getUserRole().includes('Admin'));
  const [isManager] = useState(getUserRole().includes('Manager'));
  const history = useHistory();
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
    accessRoles: accessRolesValue,
    groups: groupsValue,
    isRestricted: isRestrictedValue,
  }: any) => {
    setName(nameValue);
    setPhone(phoneValue);
    console.log(accessRolesValue, setRoles);
    // let' format the roles so that it is displayed correctly in the UI
    if (accessRolesValue) {
      if (hasDynamicRoles) {
        const userRoles = accessRolesValue.map((role: any) => ({ id: role.id, label: role.label }));
        setRoles(userRoles);
      } else {
        setRoles({ id: accessRolesValue[0].id, label: accessRolesValue[0].label });
      }
    }

    if (groupsValue) {
      setGroups(groupsValue);
    }
    setIsRestricted(isRestrictedValue);
  };

  const { loading: loadingRoles, data: roleData } = useQuery(GET_ROLE_NAMES);

  const { loading, data } = useQuery(GET_COLLECTIONS, {
    variables: setVariables(),
  });

  useEffect(() => {
    if (roles && roles.id === 'Staff') {
      setStaffRole(true);
    }
  }, [roles]);
  if (loading || loadingRoles) return <Loading />;
  if (!data.groups || !roleData.accessRoles) {
    return null;
  }

  const rolesList: any = [];
  roleData.accessRoles.forEach((role: any) => {
    if (hasDynamicRoles) {
      rolesList.push({ id: role.id, label: role.label });
    } else if (role.isReserved) {
      rolesList.push({ id: role.id, label: role.label });
    }
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
      multiple: hasDynamicRoles,
      helpLink: { label: 'help?', handleClick: handleHelpClick },
      optionLabel: 'label',
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
    roles: hasDynamicRoles
      ? Yup.array().nullable().required(t('Roles is required'))
      : Yup.object().nullable().required(t('Roles is required')),
  });

  const setPayload = (payload: any) => {
    const payloadCopy = payload;
    // let's build the collectionIds, as backend expects the array of collection ids
    const collectionIds = payloadCopy.groups.map((collection: any) => collection.id);

    // remove collections from the payload
    delete payloadCopy.groups;

    let roleIds: any[] = [];
    // let's rebuild roles, as per backend
    if (payloadCopy.roles)
      roleIds = hasDynamicRoles
        ? payloadCopy.roles.map((role: any) => role.id)
        : [payloadCopy.roles.id];

    payloadCopy.addRoleIds = roleIds;
    payloadCopy.deleteRoleIds = [roles.id];

    if (hasDynamicRoles) {
      const initialSelectedRoles = roles.map((role: any) => role.id);
      payloadCopy.addRoleIds = roleIds.filter(
        (selectedRoles: any) => !initialSelectedRoles.includes(selectedRoles)
      );
      payloadCopy.deleteRoleIds = [];
      payloadCopy.deleteRoleIds = initialSelectedRoles.filter(
        (roleId: any) => !roleIds.includes(roleId)
      );
    }

    console.log(payloadCopy);

    // delete current roles from the payload
    delete payloadCopy.roles;
    // return modified payload
    return {
      ...payloadCopy,
      groupIds: collectionIds,
    };
  };

  const checkAfterSave = (updatedUser: any) => {
    const { id, roles: userRoles } = updatedUser.updateUser.user;
    if (isAdmin && getUserSession('id') === id && !userRoles.includes('Admin')) {
      history.push('/logout/user');
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
