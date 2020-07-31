import React, { useState } from 'react';
import { Input } from '../../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../../components/UI/Form/EmojiInput/EmojiInput';
import { GET_TEMPLATE } from '../../../graphql/queries/Template';
import styles from './SpeedSend.module.css';
import { UPDATE_TEMPLATE, CREATE_TEMPLATE } from '../../../graphql/mutations/Template';
import { ReactComponent as SpeedSendIcon } from '../../../assets/images/icons/SpeedSend/Selected.svg';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';
import { ListItem } from '../../List/ListItem/ListItem';
import WhatsAppEditor from '../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';

export interface SpeedSendProps {
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
  // { component: WhatsAppEditor, name: 'body', placeholder: 'Message', rows: 3, textArea: true },
];

const defaultAttribute = {
  type: 'TEXT',
};

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

const queries = {
  getItemQuery: GET_TEMPLATE,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

export const SpeedSend: React.SFC<SpeedSendProps> = ({ match }) => {
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
      listItemName="speed send"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="speed-send"
      listItem="sessionTemplate"
      icon={speedSendIcon}
      defaultAttribute={defaultAttribute}
    />
  );
};
