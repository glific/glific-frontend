import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import CertificateIcon from 'assets/images/Certificate.svg?react';
import { Input } from 'components/UI/Form/Input/Input';
import { SAMPLE_SLIDE_LINK } from 'config';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_CERTIFICATE, DELETE_CERTIFICATE, UPDATE_CERTIFICATE } from 'graphql/mutations/Certificate';
import { GET_CERTIFICATE } from 'graphql/queries/Certificate';
import styles from './Certificate.module.css';

const regex = /^https:\/\/docs\.google\.com\/presentation\/d\/[a-zA-Z0-9_-]+(?:\/.*)?$/;
const dialogMessage = "You won't be able to use this certificate again.";
const redirectionLink = 'certificates';
const icon = <CertificateIcon />;

const queries = {
  getItemQuery: GET_CERTIFICATE,
  createItemQuery: CREATE_CERTIFICATE,
  updateItemQuery: UPDATE_CERTIFICATE,
  deleteItemQuery: DELETE_CERTIFICATE,
};

const Certificate = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const { t } = useTranslation();

  const states = {
    title,
    description,
    url,
  };

  const formSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').max(40, 'Title should be less than 40 characters'),
    description: Yup.string().max(150, 'Description should be less than 150 characters'),
    url: Yup.string().required('URL is required').matches(regex, 'Invalid URL, Please add a Google Slides link.'),
  });

  const formFields = [
    {
      component: Input,
      name: 'title',
      type: 'text',
      label: t('Title'),
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
      helperText: (
        <span>
          Please add a Google Slides link. Allowed dimensions are 16x9
          <br />
          <a href={SAMPLE_SLIDE_LINK} target="_blank" rel="noreferrer" className={styles.HelperText}>
            View Sample
          </a>
        </span>
      ),
    },
  ];

  const setStates = ({ label: labelvalue, description: descriptionValue, url: urlValue }: any) => {
    setTitle(labelvalue);
    setDescription(descriptionValue);
    setUrl(urlValue);
  };
  const setPayload = ({ title: labelvalue, description: descriptionValue, url: urlValue }: any) => {
    const payload = {
      label: labelvalue,
      description: descriptionValue,
      url: urlValue,
    };

    return payload;
  };

  return (
    <FormLayout
      states={states}
      validationSchema={formSchema}
      formFields={formFields}
      setPayload={setPayload}
      setStates={setStates}
      dialogMessage={dialogMessage}
      listItemName="Certificate"
      listItem="certificateTemplate"
      redirectionLink={redirectionLink}
      cancelLink={redirectionLink}
      backLinkButton={`/${redirectionLink}`}
      languageSupport={false}
      linkParameter="uuid"
      icon={icon}
      {...queries}
    />
  );
};

export default Certificate;
