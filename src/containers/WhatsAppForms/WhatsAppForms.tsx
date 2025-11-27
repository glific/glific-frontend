import { useQuery } from '@apollo/client';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Update from '@mui/icons-material/Update';
import { useState } from 'react';
import { useParams } from 'react-router';
import * as Yup from 'yup';

import { whatsappFormsInfo } from 'common/HelpData';
import { setErrorMessage } from 'common/notification';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Button } from 'components/UI/Form/Button/Button';
import { Input } from 'components/UI/Form/Input/Input';
import { Heading } from 'components/UI/Heading/Heading';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import setLogs from 'config/logs';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_FORM, DELETE_FORM, UPDATE_FORM } from 'graphql/mutations/WhatsAppForm';
import { GET_WHATSAPP_FORM, LIST_FORM_CATEGORIES } from 'graphql/queries/WhatsAppForm';
import styles from './WhatsAppForm.module.css';

const queries = {
  getItemQuery: GET_WHATSAPP_FORM,
  createItemQuery: CREATE_FORM,
  updateItemQuery: UPDATE_FORM,
  deleteItemQuery: DELETE_FORM,
};

const formatError = (str: string) => {
  const replaced = str.replace(/flow/gi, 'form');
  return replaced.charAt(0).toUpperCase() + replaced.slice(1).toLowerCase();
};

export const WhatsAppForms = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formJson, setFormJson] = useState();
  const [formCategories, setFormCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [extractedVariables, setExtractedVariables] = useState<string[]>([]);
  const params = useParams();

  useQuery(GET_WHATSAPP_FORM, {
    skip: !params.id,
    variables: { id: params.id },
    onCompleted: ({ whatsappForm }) => {
      if (whatsappForm?.whatsappForm?.status === 'PUBLISHED') {
        setDisabled(true);
      }
    },
  });

  let isEditing = false;
  if (params.id) {
    isEditing = true;
  }

  const extractVariablesFromJson = (json: any) => {
    const variables = new Set<string>();

    try {
      if (json && json.screens && Array.isArray(json.screens)) {
        json.screens.forEach((screen: any) => {
          const findCompleteActions = (obj: any) => {
            if (obj && typeof obj === 'object') {
              if (obj.name === 'complete' && obj.payload) {
                Object.keys(obj.payload).forEach((key) => variables.add(key));
              }

              if (Array.isArray(obj)) {
                obj.forEach((item) => findCompleteActions(item));
              } else {
                Object.values(obj).forEach((value) => findCompleteActions(value));
              }
            }
          };

          findCompleteActions(screen);
        });
      }
    } catch (error) {
      setLogs(`Error extracting variables: ${JSON.stringify(error)}`, 'error');
    }

    return Array.from(variables);
  };

  const handleJsonChange = (value: string) => {
    try {
      const parsedJson = JSON.parse(value);
      const variables = extractVariablesFromJson(parsedJson);
      setExtractedVariables(variables);
    } catch (error) {
      setExtractedVariables([]);
    }
  };

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
    formJson,
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

      const variables = extractVariablesFromJson(parsedDefinition);
      setExtractedVariables(variables);

      parsedDefinition = JSON.stringify(parsedDefinition, null, 2);
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
      placeholder: 'Enter form title',
      disabled: disabled,
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      label: `${'Description'}`,
      textArea: true,
      rows: 2,
      placeholder: 'Enter form description',
      disabled: disabled,
    },
    {
      component: Input,
      name: 'formJson',
      type: 'text',
      label: 'Form JSON*',
      textArea: true,
      rows: 6,
      placeholder: 'Paste your form JSON here...',
      disabled: disabled,
      onChange: (value: string) => handleJsonChange(value),
    },
    {
      component: AutoComplete,
      name: 'formCategories',
      options: categories,
      optionLabel: 'name',
      label: 'Categories',
      placeholder: 'Select categories',
      helperText:
        'Choose categories that represent your form. Multiple values are possible, but at least one is required.',
      disabled: disabled,
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

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <Heading
        formTitle={isEditing ? 'Edit WhatsApp Form' : 'Create WhatsApp Form'}
        helpData={whatsappFormsInfo}
        backLink="/whatsapp-forms"
      />
      <div className={styles.FlowBuilderInfo}>
        <div className={styles.InfoContent}>
          <div className={styles.IconWrapper}>
            <OpenInNew className={styles.Icon} />
          </div>
          <div className={styles.TextContent}>
            <h3 className={styles.Title}>Go to WhatsApp Form Builder Playground</h3>
            <p className={styles.Description}>
              Design your Form in WhatsApp&apos;s Playground then copy the JSON and paste it below.
            </p>
          </div>
        </div>

        <Button
          color="primary"
          variant="contained"
          className={styles.FlowBuilderButton}
          startIcon={<OpenInNew />}
          component="a"
          onClick={() =>
            window.open(
              'https://developers.facebook.com/docs/whatsapp/flows/playground',
              '_blank',
              'noopener,noreferrer'
            )
          }
        >
          Go to Playground
        </Button>
      </div>

      <div className={styles.FormContainer}>
        <div className={styles.FormSection}>
          <FormLayout
            {...queries}
            states={states}
            setPayload={setPayload}
            languageSupport={false}
            setStates={setStates}
            validationSchema={FormSchema}
            listItemName="Whatsapp Form"
            formFields={formFields}
            redirectionLink={'whatsapp-forms'}
            listItem="whatsappForm"
            icon={<Update />}
            helpData={whatsappFormsInfo}
            backLinkButton={`/whatsapp-forms`}
            noHeading
            dialogMessage={'The form will be permanently deleted and cannot be recovered.'}
            buttonState={{
              text: 'Save Form',
              status: disabled,
            }}
            customHandler={(error: string) => {
              setErrorMessage(formatError(error), 'An error occurred');
            }}
          />
        </div>

        <div className={styles.VariablesSection}>
          <div className={styles.VariablesCard}>
            <h3 className={styles.VariablesTitle}>
              Form Variables
              {extractedVariables.length > 0 && (
                <span className={styles.VariablesCount}>{extractedVariables.length}</span>
              )}
            </h3>
            {extractedVariables.length > 0 ? (
              <ul data-testid="extractedVariables" className={styles.VariablesList}>
                {extractedVariables.map((variable, index) => (
                  <li key={index} className={styles.VariableItem}>
                    {variable}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.EmptyState}>
                <div className={styles.EmptyStateIcon}>📝</div>
                <p>Paste your form JSON to see extracted variables</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WhatsAppForms;
