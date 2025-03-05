import { FormLayout } from 'containers/Form/FormLayout';
import { DocumentNode } from 'graphql';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

interface GoogleIntegrationProps {
  type: string;
  getItemQuery: DocumentNode;
  createItemQuery: DocumentNode;
  updateItemQuery: DocumentNode;
  deleteItemQuery: DocumentNode;
  formFields: Array<any>;
  setStates: any;
  setPayload: any;
  formSchema: any;
  states: any;
  dialogMessage: string;
  icon: any;
  listItemName: string;
  listItem: string;
  redirectionLink: string;
}

const permissionOptions = [
  {
    label: 'Read',
    id: 'READ',
  },
  {
    label: 'Write',
    id: 'WRITE',
  },
  {
    label: 'Read & Write',
    id: 'ALL',
  },
];

const GoogleIntegration = ({
  states,
  icon,
  formFields,
  setStates,
  setPayload,
  formSchema,
  getItemQuery,
  createItemQuery,
  updateItemQuery,
  deleteItemQuery,
  dialogMessage,
  listItemName,
  listItem,
  redirectionLink,
}: GoogleIntegrationProps) => {
  const { t } = useTranslation();

  const queries = {
    getItemQuery,
    createItemQuery,
    updateItemQuery,
    deleteItemQuery,
  };

  const FormSchema = Yup.object().shape(formSchema);

  return (
    <FormLayout
      {...queries}
      states={states}
      setPayload={setPayload}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName={listItemName}
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={redirectionLink}
      cancelLink={redirectionLink}
      linkParameter="uuid"
      listItem={listItem}
      icon={icon}
      languageSupport={false}
      backLinkButton={`/${redirectionLink}`}
    />
  );
};

export default GoogleIntegration;
