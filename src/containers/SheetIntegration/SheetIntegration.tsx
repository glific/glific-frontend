import { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import SheetIcon from 'assets/images/icons/Sheets/Sheet.svg?react';
import { CREATE_SHEET, UPDATE_SHEET, DELETE_SHEET } from 'graphql/mutations/Sheet';
import { SAMPLE_SHEET_LINK } from 'config';
import { GET_SHEET } from 'graphql/queries/Sheet';
import styles from './SheetIntegration.module.css';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';

const sheetIcon = <SheetIcon className={styles.DarkIcon} />;
const typeOptions = [
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

const queries = {
  getItemQuery: GET_SHEET,
  createItemQuery: CREATE_SHEET,
  updateItemQuery: UPDATE_SHEET,
  deleteItemQuery: DELETE_SHEET,
};

export const SheetIntegration = () => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [type, setType] = useState<any>(typeOptions[0]);
  const { t } = useTranslation();
  const states = { label, url, type, autoSync };
  const setStates = ({
    label: labelValue,
    url: urlValue,
    type: typeValue,
    autoSync: autoSyncValue,
  }: any) => {
    setLabel(labelValue);
    setUrl(urlValue);
    const selectedOption = typeOptions.find((option) => option.id === typeValue);
    setType(selectedOption);
    setAutoSync(autoSyncValue);
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
      label: t('URL'),
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
      label: t('Name'),
    },
    {
      component: AutoComplete,
      name: 'type',
      options: typeOptions,
      optionLabel: 'label',
      multiple: false,
      label: t('Allowed operations'),
      helperText: t('What operations are allowed to be performed in the sheet?'),
    },
    {
      component: Checkbox,
      name: 'autoSync',
      title: 'Auto sync',
      info: {
        title: 'Data will be synced from the sheet on a daily basis',
      },
      darkCheckbox: true,
    },
  ];

  const setPayload = (data: any) => {
    return {
      ...data,
      type: data.type?.id,
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
      backLinkButton="/sheet-integration"
    />
  );
};

export default SheetIntegration;
