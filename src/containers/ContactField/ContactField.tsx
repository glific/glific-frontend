import React, { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { ReactComponent as ContactVariableIcon } from 'assets/images/icons/ContactVariable.svg';
import { GET_CONTACT_FIELD_BY_ID, GET_ALL_CONTACT_FIELDS } from 'graphql/queries/ContactFields';
import {
  CREATE_CONTACT_FIELDS,
  UPDATE_CONTACT_FIELDS,
  DELETE_CONTACT_FIELDS,
} from 'graphql/mutations/ContactFields';
import styles from './ContactField.module.css';

export interface ContactFieldProps {
  setOpenDialog: any;
}

export const ContactField = ({ setOpenDialog }: ContactFieldProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [shortcode, setShortcode] = useState('');

  const states = {
    name,
    shortcode,
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('name is required.')),
    shortcode: Yup.string()
      .matches(/^[a-z_]+$/g, t('Only lowercase alphabets and underscore is allowed.'))
      .required(t('Shortcode is required.')),
  });

  const queries: any = {
    getItemQuery: GET_CONTACT_FIELD_BY_ID,
    createItemQuery: CREATE_CONTACT_FIELDS,
    updateItemQuery: UPDATE_CONTACT_FIELDS,
    deleteItemQuery: DELETE_CONTACT_FIELDS,
  };

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Name'),
      inputProp: {
        onChange: (event: any) => setName(event.target.value),
      },
    },
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      placeholder: t('Shortcode'),
      inputProp: {
        onChange: (event: any) => setShortcode(event.target.value),
      },
    },
  ];

  const dialogMessage = t('This action cannot be undone.');
  const consultHourIcon = <ContactVariableIcon className={styles.ContactFieldIcon} />;

  return (
    <div className={styles.Layout}>
      <FormLayout
        {...queries}
        title={t('Add contact fields')}
        listItem="contactsField"
        listItemName="contactsField"
        saveOnPageChange={false}
        afterSave={() => setOpenDialog(false)}
        // Todo: need to think about an effective way to refetch queries without variables
        refetchQueries={[
          {
            query: GET_ALL_CONTACT_FIELDS,
            variables: {
              filter: {},
              opts: {
                limit: 50,
                offset: 0,
                order: 'ASC',
                orderWith: 'name',
              },
            },
          },
        ]}
        cancelAction={() => setOpenDialog(false)}
        states={states}
        setStates={null}
        validationSchema={FormSchema}
        dialogMessage={dialogMessage}
        formFields={formFields}
        redirectionLink="contact-fields"
        icon={consultHourIcon}
        languageSupport={false}
        customStyles={[styles.Form]}
        type="contactsFields"
      />
    </div>
  );
};

export default ContactField;
