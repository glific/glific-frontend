import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION,
} from 'graphql/mutations/Collection';
import { GET_COLLECTION } from 'graphql/queries/Collection';
import { AssistantOptions } from '../AssistantOptions/AssistantOptions';
import { useState } from 'react';
import { FormLayout } from '../FormLayout/FormLayout';

const queries = {
  getItemQuery: GET_COLLECTION,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  deleteItemQuery: DELETE_COLLECTION,
};

export const CreateAssistant = () => {
  const [name, setName] = useState('');
  const [model, setModel] = useState();
  const [prompt, setPrompt] = useState('');
  const [fileSearch, setFileSearch] = useState(true);
  const [options, setOptions] = useState({ fileSearch: true, temperature: 1 });

  const models = [
    { id: '1', name: 'gpt-4o ' },
    { id: '2', name: 'GPT-4' },
    { id: '3', name: 'GPT-5' },
  ];

  const formFields = [
    {
      component: AutoComplete,
      name: 'model',
      options: models,
      optionLabel: 'name',
      label: 'Model',
      skipPayload: true,
      helperText: 'Choose the best model for your needs',
      multiple: false,
    },
    {
      component: Input,
      name: 'name',
      type: 'text',
      label: 'Name',
      helperText: 'Give a recognizable name for your assistant',
    },
    {
      component: Input,
      name: 'prompt',
      type: 'text',
      label: 'Instructions',
      rows: 3,
      textArea: true,
      helperText: 'Set the instructions according to your requirements.',
    },
    {
      component: AssistantOptions,
      name: 'options',
      fileSearch,
      options,
    },
  ];

  const states = {
    name,
    model,
    prompt,
    fileSearch,
    options,
  };

  const setStates = ({ name: nameValue, prompt: promptValue, model: modelValue }: any) => {
    setName(nameValue);
    setModel(modelValue);
    setPrompt(promptValue);
  };

  const setPayload = (payload: any) => {
    console.log(payload);
  };

  const FormSchema = {};

  return (
    <FormLayout initialValues={states} validationSchema={FormSchema} formFieldItems={formFields} />
  );
};
