import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION,
} from 'graphql/mutations/Collection';
import { GET_COLLECTION } from 'graphql/queries/Collection';

export const CreateAssistant = () => {
  const queries = {
    getItemQuery: GET_COLLECTION,
    createItemQuery: CREATE_COLLECTION,
    updateItemQuery: UPDATE_COLLECTION,
    deleteItemQuery: DELETE_COLLECTION,
  };
  const formFields = [
    {
      component: AutoComplete,
      name: 'model',
      options: [],
      optionLabel: 'name',
      label: 'Model',
      skipPayload: true,
      helperText: 'Choose the best model for your needs',
    },
    {
      component: Input,
      name: 'name',
      type: 'text',
      label: 'Name',
      helpeText: 'Give a recognizable name for your assistant',
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      label: 'Description',
      rows: 3,
      textArea: true,
    },
  ];
  const states = {};
  const setStates = () => {};
  const setPayload = () => {};

  const FormSchema = {};

  return (
    <FormLayout
      formFields={formFields}
      roleAccessSupport
      {...queries}
      states={states}
      setPayload={setPayload}
      languageSupport={false}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="collection"
      dialogMessage={'dialogMessage'}
      redirectionLink={'redirectLink'}
      listItem="group"
      icon={'collectionIcon'}
      backLinkButton={`/$}`}
      noHeading
    />
  );
};
