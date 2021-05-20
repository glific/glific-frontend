import React, { useState } from 'react';
import * as Yup from 'yup';

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  CREATE_EXTENSION,
  DELETE_EXTENSION,
  UPDATE_EXTENSION,
} from '../../graphql/mutations/Extensions';
import GET_EXTENSION from '../../graphql/queries/Exntesions';
import { Input } from '../../components/UI/Form/Input/Input';
import { ReactComponent as ConsultingIcon } from '../../assets/images/icons/icon-consulting.svg';

import { FormLayout } from '../Form/FormLayout';

// import styles from './Extensions.module.css';

export interface ExtensionProps {
  match: any;
}
const flowIcon = <ConsultingIcon />;
const queries = {
  getItemQuery: GET_EXTENSION,
  createItemQuery: CREATE_EXTENSION,
  deleteItemQuery: DELETE_EXTENSION,
  updateItemQuery: UPDATE_EXTENSION,
};

export const Extensions: React.SFC<ExtensionProps> = ({ match }) => {
  console.log('extensions', queries);
  const location = useLocation();
  const [name, setName] = useState('');
  const [module, setModule] = useState('');
  const { t } = useTranslation();

  const states = { name, module };

  const setStates = ({ name: nameValue, keywords: moduleValue }: any) => {
    // Override name & keywords when creating Flow Copy
    let fieldName = nameValue;
    let fieldmodule = moduleValue;
    if (location.state === 'copy') {
      fieldName = `Copy of ${nameValue}`;
      fieldmodule = '';
    }
    setName(fieldName);

    // we are receiving keywords as an array object
    if (fieldmodule.length > 0) {
      // lets display it comma separated
      setModule(fieldmodule.join(','));
    }
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
    module: Yup.string().required(t('Module is required.')),
  });
  const dialogMessage = t("You won't be able to use this flow again.");

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Name'),
    },
    {
      component: Input,
      name: 'module',
      type: 'textarea',
      placeholder: t('Module'),
    },
    {
      component: Input,
      name: 'code',
      type: 'text',
      placeholder: t('Code'),
    },
  ];

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="extensions"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="extensions"
      listItem="extensions"
      icon={flowIcon}
      languageSupport={false}
    />
  );
};

export default Extensions;
