import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';

import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { GET_USERS_QUERY, GET_USER_ROLES } from '../../graphql/queries/User';
import { UPDATE_USER, DELETE_USER } from '../../graphql/mutations/User';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { ReactComponent as StaffManagementIcon } from '../../assets/images/icons/StaffManagement/Active.svg';
import { getUserRole, isManagerRole } from '../../context/role';
import { setVariables } from '../../common/constants';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import styles from './StaffManagement.module.css';
import { getUserSession } from '../../services/AuthService';

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
  const [roles, setRoles] = useState<Array<any>>([]);
  const [groups, setGroups] = useState([]);
  const [isRestricted, setIsRestricted] = useState(false);
  const [staffRole, setStaffRole] = useState(false);
  const [helpDialog, setHelpDialog] = useState(false);
  const [isAdmin] = useState(getUserRole().includes('Admin'));
  const history = useHistory();

  let dialog;

  if (helpDialog) {
    const rolesHelp = [
      {
        title: 'Admin',
        description: 'Complete access to all the parts of the platform.',
      },
      {
        title: 'Manager',
        description: 'Complete access to the platform except settings and staff management.',
      },
      {
        title: 'Staff',
        description: `Access only to the chat section and their groups. Access can be limited to chatting
       with all contacts or only to the ones in their assigned group.`,
      },
      {
        title: 'None',
        description: 'No access to the platform. They can’t login.',
      },
    ];
    dialog = (
      <DialogBox
        titleAlign="left"
        title="User roles"
        skipOk
        buttonCancel="Close"
        handleCancel={() => setHelpDialog(false)}
      >
        {rolesHelp.map((role: any) => {
          return (
            <div className={styles.RolesHelp}>
              <span>{role.title}: </span>
              {role.description}
            </div>
          );
        })}
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
    if (roles) {
      const defaultRoles: any = [];
      rolesValue.forEach((role: any) => {
        defaultRoles.push({ id: role, label: role });
      });
      setRoles(defaultRoles);
    }
    setGroups(groupsValue);
    setIsRestricted(isRestrictedValue);
  };

  const { loading: loadingRoles, data: roleData } = useQuery(GET_USER_ROLES);

  const { loading, data } = useQuery(GET_GROUPS, {
    variables: setVariables(),
  });

  useEffect(() => {
    if (roles.map((role: any) => role.label).includes('Staff')) {
      setStaffRole(true);
    }
  }, [roles]);

  if (loading || loadingRoles) return <Loading />;

  if (!data.groups || !roleData.roles) {
    return null;
  }

  const rolesList: any = [];
  if (roleData.roles) {
    roleData.roles.forEach((role: any) => {
      rolesList.push({ id: role, label: role });
    });
  }

  const getOptions = () => {
    let options: any = [];
    if (rolesList) {
      if (isManagerRole) {
        // should not display Admin role to manager.
        options = rolesList.filter((item: any) => item.label !== 'Admin');
      }
    }
    return options;
  };

  let formFields: any = [];

  const handleRolesChange = (value: any) => {
    const hasStaffRole = value.map((good: any) => good.label).includes('Staff');
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
      roleSelection: handleRolesChange,
      getOptions,
      helpLink: { label: 'help?', handleClick: handleHelpClick },
      optionLabel: 'label',
      textFieldProps: {
        label: 'Roles',
        variant: 'outlined',
      },
    },
    {
      component: AutoComplete,
      name: 'groups',
      placeholder: 'Assigned to group(s)',
      options: data.groups,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Assigned to group(s)',
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
        title: 'Can chat with group contacts only',
      },
    ];
  }

  const FormSchema = Yup.object().shape({
    name: Yup.string().required('Name is required.'),
    phone: Yup.string().required('Phone is required'),
  });

  const setPayload = (payload: any) => {
    const payloadCopy = payload;
    // let's build the groupIds, as backend expects the array of group ids
    const groupIds = payloadCopy.groups.map((group: any) => {
      return group.id;
    });

    // remove groups from the payload
    delete payloadCopy.groups;

    // let's rebuild roles, as per backend
    const roleIds = payloadCopy.roles.map((role: any) => {
      return role.id;
    });

    // delete current roles from the payload
    delete payloadCopy.roles;

    // return modified payload
    return {
      ...payloadCopy,
      groupIds,
      roles: roleIds,
    };
  };

  const checkAfterSave = (updatedUser: any) => {
    const { id, roles: userRoles } = updatedUser.updateUser.user;
    if (isAdmin && getUserSession('id') === id && !userRoles.includes('Admin')) {
      history.push('/logout');
    }
  };

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
