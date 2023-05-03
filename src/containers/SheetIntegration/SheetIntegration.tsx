import { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { ReactComponent as SheetIcon } from 'assets/images/icons/Sheets/Sheet.svg';
import { CREATE_SHEET, UPDATE_SHEET, DELETE_SHEET } from 'graphql/mutations/Sheet';
import { SAMPLE_SHEET_LINK } from 'config';
import { GET_SHEET } from 'graphql/queries/Sheet';
import styles from './SheetIntegration.module.css';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { SheetTypes } from './SheetIntegrationList/SheetIntegrationList';

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
  const [writable, setWritable] = useState(false);
  const [readable, setReadable] = useState(false);
  const { t } = useTranslation();
  const states = { label, url, writable, readable };
  const setStates = ({ label: labelValue, url: urlValue, type: typeValue }: any) => {
    setLabel(labelValue);
    setUrl(urlValue);
    if (typeValue === SheetTypes.Read) {
      setReadable(true);
    } else if (typeValue === SheetTypes.Write) {
      setWritable(true);
    } else if (typeValue === SheetTypes.All) {
      setReadable(true);
      setWritable(true);
    }
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
    {
      component: Checkbox,
      name: 'readable',
      title: 'Readable',
      info: {
        title: 'Read from this sheet. The sheet URL should be public',
      },
      darkCheckbox: true,
    },
    {
      component: Checkbox,
      name: 'writable',
      title: 'Writable',
      info: {
        title: 'Write to this sheet. Sheet credentials should be filled in the settings section',
      },
      darkCheckbox: true,
    },
  ];

  const setPayload = (data: any) => {
    let type = SheetTypes.Read;
    if (data.readable && data.writable) {
      type = SheetTypes.All;
    } else if (data.writable) {
      type = SheetTypes.Write;
    }

    return {
      label: data.label,
      url: data.url,
      type,
    };
  };

  return (
    <FormLayout
      {...queries}
      states={states}
      title={t('Google sheet')}
      setPayload={setPayload}
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
