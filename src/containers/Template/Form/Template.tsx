import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useLazyQuery } from '@apollo/client';
import { EditorState } from 'draft-js';

import { Input } from '../../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../../components/UI/Form/EmojiInput/EmojiInput';
import { FormLayout } from '../../Form/FormLayout';
import { WhatsAppToDraftEditor } from '../../../common/RichEditor';
import { GET_TEMPLATE, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import {
  CREATE_TEMPLATE,
  UPDATE_TEMPLATE,
  DELETE_TEMPLATE,
} from '../../../graphql/mutations/Template';

const FormSchema = Yup.object().shape({
  label: Yup.string().required('Title is required.').max(50, 'Title is length too long.'),
  body: Yup.string()
    .transform((current, original) => {
      return original.getCurrentContent().getPlainText();
    })
    .required('Message is required.'),
});

const dialogMessage = ' It will stop showing when you are drafting a customized message.';

const defaultTypeAttribute = {
  type: 'TEXT',
};

const queries = {
  getItemQuery: GET_TEMPLATE,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

export interface TemplateProps {
  match: any;
  listItemName: string;
  redirectionLink: string;
  icon: any;
  defaultAttribute?: any;
}

const Template: React.SFC<TemplateProps> = (props) => {
  const { match, listItemName, redirectionLink, icon, defaultAttribute } = props;

  const [label, setLabel] = useState('');
  const [body, setBody] = useState(EditorState.createEmpty());
  const [filterLabel, setFilterLabel] = useState('');
  const [languageId, setLanguageId] = useState('');

  const states = { label, body };
  const setStates = ({ label, body }: any) => {

    setLabel(label);
    setBody(EditorState.createWithContent(WhatsAppToDraftEditor(body)));
  };

  let attributesObject = defaultTypeAttribute;
  if (defaultAttribute) {
    attributesObject = { ...attributesObject, ...defaultAttribute };
  }

  const [getSessionTemplates, { data: sessionTemplates }] = useLazyQuery<any>(FILTER_TEMPLATES, {
    variables: {
      filter: { label: filterLabel, languageId: parseInt(languageId) },
      opts: {
        order: 'ASC',
        limit: null,
        offset: 0,
      },
    },
  });

  useEffect(() => {
    if (filterLabel && languageId) getSessionTemplates();
  }, [filterLabel, languageId, getSessionTemplates]);

  const validateTitle = (value: any) => {
    if (value) {
      setFilterLabel(value);
      let found = [];
      let error;
      if (sessionTemplates) {
        // need to check exact title
        found = sessionTemplates.sessionTemplates.filter((search: any) => search.label === value);
        if (props.match.params.id && found.length > 0) {
          found = found.filter((search: any) => search.id !== props.match.params.id);
        }
      }
      if (found.length > 0) {
        error = 'Title already exists.';
      }
      return error;
    }
  };

  const getLanguageId = (value: any) => {
    setLanguageId(value);
  };

  const formFields = [
    {
      component: Input,
      name: 'label',
      placeholder: 'Title',
      validate: validateTitle,
    },
    {
      component: EmojiInput,
      name: 'body',
      placeholder: 'Message',
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
    },
  ];

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName={listItemName}
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={redirectionLink}
      listItem="sessionTemplate"
      icon={icon}
      defaultAttribute={attributesObject}
      getLanguageId={getLanguageId}
    />
  );
};

export default Template;
