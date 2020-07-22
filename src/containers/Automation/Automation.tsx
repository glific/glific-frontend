import React, { useState } from 'react';
import { Input } from '../../components/UI/Form/Input/Input';
import { ListItem } from '../List/ListItem/ListItem';
import { ReactComponent as AutomationIcon } from '../../assets/images/icons/Automations/Selected.svg';
import styles from './Automation.module.css';
import { CREATE_FLOW, UPDATE_FLOW, DELETE_FLOW } from '../../graphql/mutations/Automation';
import { GET_FLOW } from '../../graphql/queries/Automation';
import { Button } from '../../components/UI/Form/Button/Button';
import { Link } from 'react-router-dom';

export interface AutomationProps {
  match: any;
}

const setValidation = (values: any) => {
  const errors: Partial<any> = {};
  if (!values.shortcode) {
    errors.shortcode = 'shortcode is required';
  }

  return errors;
};

const dialogMessage = "You won't be able to use this flow again.";

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

const automationIcon = <AutomationIcon className={styles.AutomationIcon} />;

const queries = {
  getItemQuery: GET_FLOW,
  createItemQuery: CREATE_FLOW,
  updateItemQuery: UPDATE_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

export const Automation: React.SFC<AutomationProps> = ({ match }) => {
  const [shortcode, setShortcode] = useState('');
  const [name, setName] = useState('');
  const [uuid, setUuid] = useState('');

  const states = { shortcode, name };

  const setStates = ({ shortcode, name, uuid }: any) => {
    setShortcode(shortcode);
    setUuid(uuid);
    setName(name);
  };

  const configureButton = (
    <Link to={`/flow/${uuid}`}>
      <Button variant="contained" color="default">
        Save & Configure
      </Button>
    </Link>
  );

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
      icon={automationIcon}
      configureButton={configureButton}
    />
  );
};
