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
  if (!values.label) {
    errors.label = 'User title required';
  } else if (values.label.length > 50) {
    errors.label = 'Length of the title is too long';
  }
  if (!values.body) {
    errors.body = 'User body required';
  }
  return errors;
};

const dialogMessage = ' It will stop showing when you are drafting a customized message.';

const formFields = [
  { component: Input, name: 'name', placeholder: 'Title' },
  { component: EmojiInput, name: 'body', placeholder: 'Message', rows: 3, textArea: true },
];

const defaultAttribute = {
  type: 'TEXT',
  isHsm: true,
};

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

const queries = {
  getItemQuery: GET_USERS_QUERY,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_USER,
  deleteItemQuery: DELETE_USER,
};

export const StaffManagementTemplate: React.SFC<TemplateProps> = ({ match }) => {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');

  const states = { name, body };
  const setStates = ({ name, body }: any) => {
    setName(name);
    setBody(body);
  };

  return (
    <ListItem
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setValidation={setValidation}
      listItemName="HSM Template"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="staff-management"
      listItem="users"
      icon={speedSendIcon}
      defaultAttribute={defaultAttribute}
    />
  );
};
