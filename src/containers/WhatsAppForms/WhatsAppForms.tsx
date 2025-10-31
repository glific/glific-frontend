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

const queries = {
  getItemQuery: GET_WHATSAPP_FORM,
  createItemQuery: CREATE_FORM,
  updateItemQuery: UPDATE_FORM,
  deleteItemQuery: DELETE_FORM,
};

export const WhatsAppForms = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [flowJson, setFlowJson] = useState('');
  const [flowCategories, setFlowCategories] = useState([]);
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
    flowJson: JSON.stringify(flowJson),
    flowCategories,
    description,
  };

  const setPayload = ({ name, flowJson, flowCategories, description }: any) => {
    const payload = {
      name,
      flowJson,
      description,
      categories: flowCategories.map((category: any) => category.id),
    };

    return payload;
  };
  const setStates = ({ name, definition, description, categories }: any) => {
    setName(name);
    setDescription(description);
    setFlowJson(JSON.parse(definition));
    setFlowCategories(categories.map((c: string) => ({ id: c, name: c })));
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
      name: 'flowJson',
      type: 'text',
      label: 'Flow JSON*',
      textArea: true,
      rows: 6,
    },
    {
      component: AutoComplete,
      name: 'flowCategories',
      options: categories,
      optionLabel: 'name',
      label: 'Categories',
      helperText: 'Assigned staff members will be responsible to chat with contacts in this collection',
    },
  ];
  const FormSchema = Yup.object().shape({
    name: Yup.string().required('Title is required.').max(50, 'Title is too long.'),
    flowJson: Yup.string().required('Flow JSON is required.'),
    flowCategories: Yup.array().min(1, 'At least one category must be selected.'),
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
