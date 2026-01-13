import { useQuery } from '@apollo/client';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Update from '@mui/icons-material/Update';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
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

export const formatError = (str: string) => {
  const replaced = str.replace(/flow/gi, 'form');
  return replaced.charAt(0).toUpperCase() + replaced.slice(1).toLowerCase();
};

export const WhatsAppForms = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formCategories, setFormCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const params = useParams();
  const navigate = useNavigate();

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
    formCategories,
    description,

    googleSheetUrl,
  };

  const setPayload = ({ name, formCategories, description, googleSheetUrl }: any) => {
    const payload = {
      name,
      description,
      categories: formCategories.map((category: any) => category.id),
      googleSheetUrl,
    };

    return payload;
  };

  const setStates = ({ name, description, categories, sheet }: any) => {
    setName(name);
    setDescription(description);

    setFormCategories(categories.map((c: string) => ({ id: c, name: c })));

    if (sheet?.url) {
      setGoogleSheetUrl(sheet.url);
    }
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
    {
      component: Input,
      name: 'googleSheetUrl',
      label: 'Google Sheet URL',
      placeholder: 'Enter Google Sheet URL',
      helperText: 'Provide a Google Sheet URL to store form responses automatically.',
      disabled: disabled,
    },
  ];

  const FormSchema = Yup.object().shape({
    name: Yup.string().required('Title is required.').max(50, 'Title is too long.'),
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
          redirect={false}
          buttonState={{
            text: 'Save Form',
            status: disabled,
            show: true,
          }}
          customHandler={(error: any) => {
            if (typeof error === 'string') setErrorMessage(formatError(error), 'An error occurred');
            else setErrorMessage(error[0]);
          }}
          afterSave={({ createWhatsappForm }: any) => {
            navigate(`/whatsapp-forms/${createWhatsappForm?.whatsappForm?.id}/configure`);
          }}
        />
      </div>
    </>
  );
};

export default WhatsAppForms;
