import React, { useState } from 'react';
import { Input } from '../../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../../components/UI/Form/EmojiInput/EmojiInput';
import { GET_TEMPLATE } from '../../../graphql/queries/Template';
import styles from './HSM.module.css';
import { UPDATE_TEMPLATE, CREATE_TEMPLATE } from '../../../graphql/mutations/Template';
import { ReactComponent as SpeedSendIcon } from '../../../assets/images/icons/Template/Selected.svg';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';
import { ListItem } from '../../List/ListItem/ListItem';

export interface HSMProps {
  match: any;
}

const setValidation = (values: any) => {
  const errors: Partial<any> = {};
  if (!values.label) {
    errors.label = 'Message title required';
  } else if (values.label.length > 50) {
    errors.label = 'Length of the title is too long';
  }
  if (!values.body) {
    errors.body = 'Mesaage body required';
  }
  return errors;
};

const dialogMessage = ' It will stop showing when you are drafting a customized message.';

const formFields = [
  { component: Input, name: 'label', placeholder: 'Title' },
  { component: EmojiInput, name: 'body', placeholder: 'Message', rows: 3, textArea: true },
];

const defaultAttribute = {
  type: 'TEXT',
  isHsm: true,
};

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

const queries = {
  getItemQuery: GET_TEMPLATE,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

export const HSM: React.SFC<HSMProps> = ({ match }) => {
  const [label, setLabel] = useState('');
  const [body, setBody] = useState('');

  const states = { label, body };
  const setStates = ({ label, body }: any) => {
    setLabel(label);
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
      redirectionLink="template"
      listItem="sessionTemplate"
      icon={speedSendIcon}
      defaultAttribute={defaultAttribute}
    />
  );
};
