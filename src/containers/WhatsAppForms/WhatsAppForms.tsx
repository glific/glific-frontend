import { useQuery } from '@apollo/client';
import Update from '@mui/icons-material/Update';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import * as Yup from 'yup';

import { whatsappFormsInfo } from 'common/HelpData';
import { setErrorMessage } from 'common/notification';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { Heading } from 'components/UI/Heading/Heading';
import { Loading } from 'components/UI/Layout/Loading/Loading';
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

const GoogleSheetUrlComponent = ({ field, disabled }: any) => {
  return (
    <div className={styles.GoogleSheetContainer}>
      <h3>Data Storage (Optional)</h3>
      <Input field={field} placeholder="Add your google sheet link here" disabled={disabled} />

      <p>
        Responses will get saved in your Big Query project by default. Add a writable Google Sheet if you'd like to see
        and share responses more easily.
      </p>
    </div>
  );
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
      label: 'Title *',
      placeholder: 'Enter form title',
      disabled: disabled,
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      label: 'Description',
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
      label: 'Categories *',
      placeholder: 'Select categories',
      helperText:
        'Choose categories that represent your form. Multiple values are possible, but at least one is required.',
      disabled: disabled,
    },
    {
      component: GoogleSheetUrlComponent,
      name: 'googleSheetUrl',
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
        formTitle={isEditing ? (disabled ? 'WhatsApp Form' : 'Edit WhatsApp Form') : 'Create WhatsApp Form'}
        helpData={whatsappFormsInfo}
        backLink="/whatsapp-forms"
        headerHelp={disabled ? 'Please view below details' : 'Please enter below details.'}
      />
      <div className={styles.FormSection}>
        <FormLayout
          {...queries}
          states={states}
          setPayload={setPayload}
          languageSupport={false}
          setStates={setStates}
          isView={disabled}
          validationSchema={FormSchema}
          listItemName="Whatsapp Form"
          formFields={formFields}
          errorButtonState={{ text: disabled ? 'Go Back' : 'Cancel', show: true }}
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
            show: !disabled,
          }}
          customHandler={(error: any) => {
            if (typeof error === 'string') setErrorMessage(formatError(error), 'An error occurred');
            else setErrorMessage(error[0]);
          }}
          afterSave={(result: any) => {
            let formId = '';
            if (result.createWhatsappForm) {
              formId = result.createWhatsappForm.whatsappForm.id;
            } else {
              formId = result.updateWhatsappForm.whatsappForm.id;
            }
            navigate(`/whatsapp-forms/${formId}/edit`);
          }}
        />
      </div>
    </>
  );
};

export default WhatsAppForms;
