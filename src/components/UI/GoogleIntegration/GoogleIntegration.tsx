import { FormLayout } from 'containers/Form/FormLayout';
import { DocumentNode } from 'graphql';

interface GoogleIntegrationProps {
  getItemQuery: DocumentNode;
  createItemQuery: DocumentNode;
  updateItemQuery: DocumentNode;
  deleteItemQuery: DocumentNode;
  title?: string;
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

const GoogleIntegration = ({
  states,
  title,
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
  const queries = {
    getItemQuery,
    createItemQuery,
    updateItemQuery,
    deleteItemQuery,
  };

  return (
    <FormLayout
      {...queries}
      title={title}
      states={states}
      setPayload={setPayload}
      setStates={setStates}
      validationSchema={formSchema}
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
