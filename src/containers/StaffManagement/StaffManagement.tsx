import React, { useState } from 'react';
import { Input } from '../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../components/UI/Form/EmojiInput/EmojiInput';
import { GET_USERS_QUERY } from '../../graphql/queries/StaffManagement';
import { UPDATE_USER, DELETE_USER } from '../../graphql/mutations/StaffManagement';
import { CREATE_TEMPLATE } from '../../graphql/mutations/Template';
import { ReactComponent as SpeedSendIcon } from '../../assets/images/icons/SpeedSend/Selected.svg';
import { ListItem } from '../List/ListItem/ListItem';
import styles from './StaffManagement.module.css';

export interface TemplateProps {
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

const dialogMessage = ' It will stop showing when you are drafting a customized message.';

const formFields = [
  { component: Input, name: 'name', type: 'text', placeholder: 'Full Name', query: true },
  { component: Input, name: 'phone', disabled: true, placeholder: 'Phone Number', query: false },
  { component: Input, name: 'roles', type: 'text', placeholder: 'Roles', query: true },
];

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

const queries = {
  getItemQuery: GET_USERS_QUERY,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_USER,
  deleteItemQuery: DELETE_USER,
};

export const StaffManagementTemplate: React.SFC<TemplateProps> = ({ match }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState('');

  const states = { name, phone, roles };
  const setStates = ({ name, phone, roles }: any) => {
    setName(name);
    setPhone(phone);
    setRoles(roles);
  };

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
      icon={speedSendIcon}
      showLanguage={false}
    />
  );
};
