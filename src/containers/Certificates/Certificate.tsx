import { Input } from 'components/UI/Form/Input/Input';
import GoogleIntegration from 'components/UI/GoogleIntegration/GoogleIntegration';
import { CREATE_SHEET, DELETE_SHEET, UPDATE_SHEET } from 'graphql/mutations/Sheet';
import { GET_SHEET } from 'graphql/queries/Sheet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import CertificateIcon from 'assets/images/Certificate.svg?react';

const regex = /^https:\/\/docs\.google\.com\/presentation\/d\/[a-zA-Z0-9_-]+(?:\/.*)?$/;
const dialogMessage = "You won't be able to use this certificate again.";
const icon = <CertificateIcon />;

const queries = {
  getItemQuery: GET_SHEET,
  createItemQuery: CREATE_SHEET,
  updateItemQuery: UPDATE_SHEET,
  deleteItemQuery: DELETE_SHEET,
};

const Certificate = () => {
  const [label, setLabel] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const { t } = useTranslation();

  const states = {
    label,
    description,
    url,
  };

  const formSchema = {
    label: Yup.string().required('Label is required').max(40, 'Label should be less than 40 characters'),
    description: Yup.string()
      .required('Description is required')
      .max(150, 'Description should be less than 150 characters'),
    url: Yup.string().required('URL is required').matches(regex, 'Invalid URL'),
  };

  const formFields = [
    {
      component: Input,
      name: 'label',
      type: 'text',
      label: t('Label'),
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      label: t('Description'),
      textArea: true,
      rows: 4,
    },
    {
      component: Input,
      name: 'url',
      type: 'text',
      label: t('URL'),
    },
  ];

  const setStates = () => {};
  const setPayload = () => {};

  return (
    <GoogleIntegration
      type="slides"
      title="Certificate"
      states={states}
      formSchema={formSchema}
      formFields={formFields}
      setPayload={setPayload}
      setStates={setStates}
      dialogMessage={dialogMessage}
      listItemName="Certificate"
      listItem="certificate"
      redirectionLink="custom-certificates"
      icon={icon}
      {...queries}
    />
  );
};

export default Certificate;
