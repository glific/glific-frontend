/* eslint-disable */
import React, { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { EditorState } from 'draft-js';

import styles from './InteractiveMessage.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as InteractiveMessageIcon } from '../../assets/images/icons/InteractiveMessage/Dark.svg';

import { CREATE_FLOW, UPDATE_FLOW, DELETE_FLOW } from '../../graphql/mutations/Flow';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { GET_FLOW } from '../../graphql/queries/Flow';
import { EmojiInput } from '../../components/UI/Form/EmojiInput/EmojiInput';

export interface FlowProps {
  match: any;
}

const interactiveMessageIcon = <InteractiveMessageIcon className={styles.FlowIcon} />;

const queries = {
  getItemQuery: GET_FLOW,
  createItemQuery: CREATE_FLOW,
  updateItemQuery: UPDATE_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

export const InteractiveMessage: React.SFC<FlowProps> = ({ match }) => {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [body, setBody] = useState(EditorState.createEmpty());
  const [isActive, setIsActive] = useState(true);
  const [ignoreKeywords, setIgnoreKeywords] = useState(false);
  const { t } = useTranslation();

  const states = { isActive, name, keywords, ignoreKeywords, body };

  const setStates = ({
    name: nameValue,
    keywords: keywordsValue,
    isActive: isActiveValue,
    ignoreKeywords: ignoreKeywordsValue,
  }: any) => {
    // Override name & keywords when creating Flow Copy

    const fieldKeywords = keywordsValue;

    setName(nameValue);
    setIsActive(isActiveValue);

    // we are receiving keywords as an array object
    if (fieldKeywords.length > 0) {
      // lets display it comma separated
      setKeywords(fieldKeywords.join(','));
    }
    setIgnoreKeywords(ignoreKeywordsValue);
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
  });

  const dialogMessage = t("You won't be able to use this flow again.");

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Title*'),
    },
    {
      component: EmojiInput,
      name: 'body',
      placeholder: t('Message*'),
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      helperText: 'You can also use variables in message enter @ to see the available list',
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

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="interactive msg"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="flow"
      cancelLink="flow"
      linkParameter="uuid"
      listItem="flow"
      icon={interactiveMessageIcon}
      languageSupport={false}
    />
  );
};

export default InteractiveMessage;
