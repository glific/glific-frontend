import React, { useState } from 'react';
import * as Yup from 'yup';
import { Input } from '../../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../../components/UI/Form/EmojiInput/EmojiInput';
import { FormLayout } from '../../Form/FormLayout';
import { GET_TEMPLATE } from '../../../graphql/queries/Template';
import {
  CREATE_TEMPLATE,
  UPDATE_TEMPLATE,
  DELETE_TEMPLATE,
} from '../../../graphql/mutations/Template';
import { EditorState, ContentState } from 'draft-js';
const FormSchema = Yup.object().shape({
  label: Yup.string().required('Title is required.').max(50, 'Title is length too long.'),
  // Removing validation for now until we find how to make proper Schema
});

const dialogMessage = ' It will stop showing when you are drafting a customized message.';

const formFields = [
  { component: Input, name: 'label', placeholder: 'Title' },
  {
    component: EmojiInput,
    name: 'body',
    placeholder: 'Message',
    rows: 5,
    convertToWhatsApp: true,
    textArea: true,
  },
];

const defaultAttribute = {
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
  const [label, setLabel] = useState('');
  const [body, setBody] = useState(EditorState.createEmpty());

  const states = { label, body };
  const setStates = ({ label, body }: any) => {
    setLabel(label);
    setBody(EditorState.createWithContent(ContentState.createFromText(body)));
  };

  let attributesObject = defaultAttribute;
  if (props.defaultAttribute) {
    attributesObject = { ...attributesObject, ...props.defaultAttribute };
  }

  return (
    <FormLayout
      {...queries}
      match={props.match}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName={props.listItemName}
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={props.redirectionLink}
      listItem="sessionTemplate"
      icon={props.icon}
      defaultAttribute={attributesObject}
    />
  );
};

export default Template;
