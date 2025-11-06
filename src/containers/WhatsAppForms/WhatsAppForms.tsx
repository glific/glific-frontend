import { useQuery } from '@apollo/client';
import { Update } from '@mui/icons-material';
import { useState } from 'react';
import * as Yup from 'yup';

import { whatsappFormsInfo } from 'common/HelpData';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_FORM, DELETE_FORM, UPDATE_FORM } from 'graphql/mutations/WhatsAppForm';
import { GET_WHATSAPP_FORM, LIST_FORM_CATEGORIES } from 'graphql/queries/WhatsAppForm';
import setLogs from 'config/logs';

const queries = {
  getItemQuery: GET_WHATSAPP_FORM,
  createItemQuery: CREATE_FORM,
  updateItemQuery: UPDATE_FORM,
  deleteItemQuery: DELETE_FORM,
};

export const WhatsAppForms = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formJson, setFormJson] = useState();
  const [formCategories, setFormCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const { loading } = useQuery(LIST_FORM_CATEGORIES, {
    onCompleted: ({ whatsappFormCategories }) => {
      setCategories(
        whatsappFormCategories.map((category: string) => ({
          id: category,
          name: category
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        }))
      );
    },
  });

  const states = {
    name,
    formJson: JSON.stringify(formJson),
    formCategories,
    description,
  };

  const setPayload = ({ name, formJson, formCategories, description }: any) => {
    const payload = {
      name,
      formJson,
      description,
      categories: formCategories.map((category: any) => category.id),
    };

    return payload;
  };
  const setStates = ({ name, definition, description, categories }: any) => {
    setName(name);
    setDescription(description);

    setFormCategories(categories.map((c: string) => ({ id: c, name: c })));

    let parsedDefinition;
    try {
      parsedDefinition = JSON.parse(definition);
    } catch (e) {
      setLogs('Error parsing whatsapp form definition JSON:', 'error');
      parsedDefinition = definition;
    }
    setFormJson(parsedDefinition);
  };
  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      label: `${'Title'}*`,
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      label: `${'Description'}*`,
      textArea: true,
      rows: 2,
    },
    {
      component: Input,
      name: 'formJson',
      type: 'text',
      label: 'Form JSON*',
      textArea: true,
      rows: 6,
    },
    {
      component: AutoComplete,
      name: 'formCategories',
      options: categories,
      optionLabel: 'name',
      label: 'Categories',
      helperText: 'Assigned staff members will be responsible to chat with contacts in this collection',
    },
  ];
  const FormSchema = Yup.object().shape({
    name: Yup.string().required('Title is required.').max(50, 'Title is too long.'),

    formJson: Yup.string()
      .required('Form JSON is required.')
      .test('is-json', 'Must be valid JSON', (value) => {
        if (!value) return false;
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          return false;
        }
      }),

    formCategories: Yup.array().min(1, 'At least one category must be selected.'),
  });

  let dialogMessage = '';

  if (loading) {
    return <Loading />;
  }
  return (
    <FormLayout
      {...queries}
      states={states}
      setPayload={setPayload}
      languageSupport={false}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="Whatsapp Form"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={'whatsapp-forms'}
      listItem="whatsappForm"
      icon={<Update />}
      helpData={whatsappFormsInfo}
      backLinkButton={`/whatsapp-forms`}
    />
  );
};

export default WhatsAppForms;
