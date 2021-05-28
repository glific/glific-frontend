import React, { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import styles from './ContactField.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as ContactVariableIcon } from '../../assets/images/icons/ContactVariable.svg';
import {
  GET_CONTACT_FIELD_BY_ID,
  GET_ALL_CONTACT_FIELDS,
} from '../../graphql/queries/ContactFields';
import {
  CREATE_CONTACT_FIELDS,
  UPDATE_CONTACT_FIELDS,
  DELETE_CONTACT_FIELDS,
} from '../../graphql/mutations/ContactFields';
import { setVariables } from '../../common/constants';

export interface ConsultingProps {
  match: any;
}

export const ContactField: React.SFC<ConsultingProps> = ({ match }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [shortcode, setShortcode] = useState('');

  const states = {
    name,
    shortcode,
  };

  const setStates = ({ shortcode: _shortcode, name: _name }: any) => {
    setName(_name);
    setShortcode(_shortcode);
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('name is required.')),
    shortcode: Yup.string()
      .matches(/^[a-z_]+$/g, 'Only lowercase alphabets and underscore is allowed.')
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

  const dialogMessage = 'This action cannot be undone.';
  const consultHourIcon = <ContactVariableIcon className={styles.ContactFieldIcon} />;

  return (
    <div className={`${styles.Layout} ${match.params.id ? styles.Edit : ''}`}>
      <FormLayout
        {...queries}
        title={t('Add contact fields')}
        listItem="contactsField"
        listItemName="contactsField"
        match={match}
        refetchQueries={[
          {
            query: GET_ALL_CONTACT_FIELDS,
            variables: setVariables(),
          },
        ]}
        states={states}
        setStates={setStates}
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
