import React, { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { ReactComponent as SheetIcon } from 'assets/images/icons/Sheets/Sheet.svg';
import { CREATE_SHEET, UPDATE_SHEET, DELETE_SHEET } from 'graphql/mutations/Sheet';
import { SAMPLE_SHEET_LINK } from 'config';
import { GET_SHEET } from 'graphql/queries/Sheet';
import styles from './SheetIntegration.module.css';

const sheetIcon = <SheetIcon className={styles.DarkIcon} />;

const queries = {
  getItemQuery: GET_SHEET,
  createItemQuery: CREATE_SHEET,
  updateItemQuery: UPDATE_SHEET,
  deleteItemQuery: DELETE_SHEET,
};

export const SheetIntegration = () => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const { t } = useTranslation();
  const states = { label, url };
  const setStates = ({ label: labelValue, url: urlValue }: any) => {
    // Override name & keywords when creating Flow Copy
    setLabel(labelValue);
    setUrl(urlValue);
  };
  const FormSchema = Yup.object().shape({
    url: Yup.string().required(t('URL is required.')),
    label: Yup.string().required(t('Sheet name is required.')),
  });

  const dialogMessage = t("You won't be able to use this sheet again.");

  const formFields = [
    {
      component: Input,
      name: 'url',
      type: 'text',
      placeholder: t('Sheet URL'),
      helperText: (
        <a href={SAMPLE_SHEET_LINK} target="_blank" rel="noreferrer" className={styles.HelperText}>
          View Sample
        </a>
      ),
    },
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: t('Sheet name'),
    },
  ];

  return (
    <FormLayout
      {...queries}
      states={states}
      title={t('Sheet integration')}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="Sheet"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="sheet-integration"
      cancelLink="sheet-integration"
      linkParameter="uuid"
      listItem="sheet"
      icon={sheetIcon}
      languageSupport={false}
    />
  );
};

export default SheetIntegration;
