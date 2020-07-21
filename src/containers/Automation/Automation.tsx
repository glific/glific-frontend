import React, { useState } from 'react';
import { Input } from '../../components/UI/Form/Input/Input';
import { ListItem } from '../List/ListItem/ListItem';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Automation.module.css';
import { CREATE_FLOW, UPDATE_FLOW, DELETE_FLOW } from '../../graphql/mutations/Automation';
import { GET_FLOW } from '../../graphql/queries/Automation';

export interface AutomationProps {
  match: any;
}

const setValidation = (values: any) => {
  const errors: Partial<any> = {};
  if (!values.label) {
    errors.label = 'Tag title is required';
  } else if (values.label.length > 50) {
    errors.label = 'Title length too long';
  }
  if (!values.description) {
    errors.description = 'Tag description is required';
  }
  return errors;
};

const dialogMessage = "You won't be able to use this for tagging messages.";

const formFields = [
  {
    component: Input,
    name: 'shortcode',
    type: 'text',
    placeholder: 'Shortcode',
  },
  {
    component: Input,
    name: 'name',
    type: 'text',
    placeholder: 'Name',
  },
];

const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  getItemQuery: GET_FLOW,
  createItemQuery: CREATE_FLOW,
  updateItemQuery: UPDATE_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

export const Automation: React.SFC<AutomationProps> = ({ match }) => {
  const [shortcode, setShortcode] = useState('');
  const [name, setName] = useState('');

  const states = { shortcode, name };
  const setStates = ({ shortcode, name }: any) => {
    setShortcode(shortcode);
    setName(name);
  };

  return (
    <ListItem
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setValidation={setValidation}
      listItemName="flow"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="automation"
      listItem="flow"
      icon={tagIcon}
    />
  );
};
