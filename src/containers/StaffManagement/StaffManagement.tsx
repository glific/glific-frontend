import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import StaffManagementIcon from 'assets/images/icons/StaffManagement/Active.svg?react';
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
import { staffManagementInfo } from 'common/HelpData';

const staffManagementIcon = <StaffManagementIcon />;

const queries = {
  getItemQuery: GET_USERS_QUERY,
  createItemQuery: UPDATE_USER,
  updateItemQuery: UPDATE_USER,
  deleteItemQuery: DELETE_USER,
};

export const StaffManagement = () => {
  const hasDynamicRoles = organizationHasDynamicRole();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<any>(undefined);
  const [groups, setGroups] = useState(undefined);
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
    accessRoles: accessRolesValue,
    groups: groupsValue,
    isRestricted: isRestrictedValue,
  }: any) => {
    setName(nameValue);
    setPhone(phoneValue);

    // let' format the roles so that it is displayed correctly in the UI
    if (accessRolesValue) {
      if (hasDynamicRoles) {
        const userRoles = accessRolesValue.map((role: any) => ({ id: role.id, label: role.label }));
        setRoles(userRoles);
      } else if (accessRolesValue.length > 0) {
        setRoles({ id: accessRolesValue[0].id, label: accessRolesValue[0].label });
      }
    }

    if (groupsValue) {
      setGroups(groupsValue);
    }
    setIsRestricted(isRestrictedValue);
  };

  const { loading: loadingRoles, data: roleData } = useQuery(GET_ROLE_NAMES, {
    fetchPolicy: 'network-only',
  });

  const { loading, data } = useQuery(GET_COLLECTIONS, {
    variables: setVariables(),
  });

  useEffect(() => {
    let hasStaffRole = false;
    if (hasDynamicRoles) {
      hasStaffRole = roles && roles.length === 1 && roles[0].label === 'Staff';
    } else {
      hasStaffRole = roles && roles.label === 'Staff';
    }

    if (hasStaffRole) {
      setStaffRole(true);
    }
  }, [roles]);
  if (loading || loadingRoles) return <Loading />;
  if (!data.groups || !roleData.accessRoles) {
    return null;
  }

  let rolesList: any = [];
  roleData.accessRoles.forEach((role: any) => {
    if (hasDynamicRoles) {
      rolesList.push({ id: role.id, label: role.label });
    } else if (role.isReserved) {
      rolesList.push({ id: role.id, label: role.label });
    }
  });

  if (rolesList.length > 0) {
    if (isManager) {
      // should not display Admin role to manager.
      rolesList = rolesList.filter(
        (item: any) => item.label !== 'Admin' && item.label !== 'Glific admin'
      );
    }
    if (isAdmin) {
      rolesList = rolesList.filter((item: any) => item.label !== 'Glific admin');
    }
  }

  let formFields: any = [];

  const handleRolesChange = (value: any) => {
    if (!value) {
      return;
    }
    let hasStaffRole = false;

    if (hasDynamicRoles) {
      hasStaffRole = value.length === 1 && value[0].label === 'Staff';
    } else {
      hasStaffRole = value.label === 'Staff';
    }

    if (hasStaffRole) {
      setStaffRole(true);
    } else {
      setStaffRole(false);
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
      label: t('Username'),
    },
    {
      component: Input,
      name: 'phone',
      placeholder: t('Phone Number'),
      label: t('Phone Number'),
      disabled: true,
      skipPayload: true,
    },
    {
      component: AutoComplete,
      name: 'roles',
      disabled: isManager,
      placeholder: t('Roles'),
      options: rolesList,
      onChange: handleRolesChange,
      multiple: hasDynamicRoles,
      helpLink: { label: 'help?', handleClick: handleHelpClick },
      optionLabel: 'label',
      label: t('Roles'),
    },
    {
      component: AutoComplete,
      name: 'groups',
      placeholder: t('Assigned to collection(s)'),
      options: data.groups,
      optionLabel: 'label',
      label: t('Assigned to collection(s)'),
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
    let isSameRole = true;
    // let's rebuild roles, as per backend
    if (payloadCopy.roles) {
      roleIds = hasDynamicRoles
        ? payloadCopy.roles.map((role: any) => role.id)
        : [payloadCopy.roles.id];

      isSameRole = payloadCopy.roles.id === roles.id;
    }

    payloadCopy.addRoleIds = isSameRole ? [] : roleIds;
    payloadCopy.deleteRoleIds = isSameRole ? [] : [roles.id];

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
      navigate('/logout/user');
    }
  };

  const dialogMessage = t('Once deleted this action cannot be undone.');

  return (
    <>
      {dialog}
      <FormLayout
        {...queries}
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
        helpData={staffManagementInfo}
      />
    </>
  );
};

export default StaffManagement;
