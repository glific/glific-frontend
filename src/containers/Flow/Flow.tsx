import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

import { useLocation } from 'react-router-dom';

import styles from './Flow.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as FlowIcon } from '../../assets/images/icons/Flow/Selected.svg';
import {
  CREATE_FLOW,
  UPDATE_FLOW,
  DELETE_FLOW,
  CREATE_FLOW_COPY,
} from '../../graphql/mutations/Flow';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { GET_FLOW } from '../../graphql/queries/Flow';

export interface FlowProps {
  match: any;
}

const regex = /^\s*[^-!$%^&*()+|~=`{}[\]:";'<>?,./ ]+\s*(,\s*[^-!$%^&*()+|~=`{}[\]:";'<>?,./ ]+\s*)*$/g;

const FormSchema = Yup.object().shape({
  name: Yup.string().required('Name is required.'),
  keywords: Yup.string().matches(regex, 'Sorry, special characters are not allowed'),
});

const dialogMessage = "You won't be able to use this flow again.";

const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  getItemQuery: GET_FLOW,
  createItemQuery: CREATE_FLOW,
  updateItemQuery: UPDATE_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

export const Flow: React.SFC<FlowProps> = ({ match }) => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ignoreKeywords, setIgnoreKeywords] = useState(false);

  const states = { name, keywords, ignoreKeywords };

  const setStates = ({
    name: nameValue,
    keywords: keywordsValue,
    ignoreKeywords: ignoreKeywordsValue,
  }: any) => {
    // Override name & keywords when creating Flow Copy
    let fieldName = nameValue;
    let fieldKeywords = keywordsValue;
    if (location.state === 'copy') {
      fieldName = `Copy of ${nameValue}`;
      fieldKeywords = '';
    }
    setName(fieldName);

    // we are receiving keywords as an array object
    if (fieldKeywords.length > 0) {
      // lets display it comma separated
      setKeywords(fieldKeywords.join(','));
    }
    setIgnoreKeywords(ignoreKeywordsValue);
  };

  const additionalAction = { label: 'Configure', link: '/flow/configure' };

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'Name',
    },
    {
      component: Input,
      name: 'keywords',
      type: 'text',
      placeholder: 'Keywords',
      helperText: 'Enter comma separated keywords that trigger this flow',
    },

    {
      component: Checkbox,
      name: 'ignoreKeywords',
      title: 'Ignore Keywords',
      info: {
        title:
          'If activated, users will not be able to change this flow by entering keyword for any other flow.',
      },
    },
  ];

  const setPayload = (payload: any) => {
    let formattedKeywords;
    if (payload.keywords) {
      // remove white spaces
      const inputKeywords = payload.keywords.replace(/[\s]+/g, '');
      // convert to array
      formattedKeywords = inputKeywords.split(',');
    }

    // return modified payload
    return {
      ...payload,
      keywords: formattedKeywords,
    };
  };

  // alter header & update/copy queries
  let title;
  let type;
  if (location.state === 'copy') {
    queries.updateItemQuery = CREATE_FLOW_COPY;
    title = 'Copy flow';
    type = 'copy';
  } else {
    queries.updateItemQuery = UPDATE_FLOW;
  }

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="flow"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="flow"
      cancelLink="flow"
      linkParameter="uuid"
      listItem="flow"
      icon={flowIcon}
      additionalAction={additionalAction}
      languageSupport={false}
      title={title}
      type={type}
    />
  );
};
