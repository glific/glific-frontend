import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import CertificateIcon from 'assets/images/Certificate.svg?react';
import { setErrorMessage as showError } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { CERTIFICATES_FAQ_FORMAT_LINK, CERTIFICATES_PERMISSIONS_LINK, SAMPLE_SLIDE_LINK } from 'config';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_CERTIFICATE, DELETE_CERTIFICATE, UPDATE_CERTIFICATE } from 'graphql/mutations/Certificate';
import { GET_CERTIFICATE } from 'graphql/queries/Certificate';
import styles from './Certificate.module.css';

const dialogMessage = "You won't be able to use this certificate again.";
const redirectionLink = 'certificates';
const icon = <CertificateIcon />;
const presentationRegex = /^https:\/\/docs\.google\.com\/presentation\/d\/[a-zA-Z0-9_-]+\/edit.*$/;
const idRegex = /slide=id\.g[a-zA-Z0-9_]*$/;

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
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const { t } = useTranslation();

  const states = {
    title,
    description,
    url,
  };

  const formSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').max(40, 'Title should be less than 40 characters'),
    description: Yup.string().max(150, 'Description should be less than 150 characters').nullable(),
    url: Yup.string()
      .required('URL is required')
      .test('is-valid-presentation-link', 'Invalid URL, Please add a Google Slides link.', (value) =>
        presentationRegex.test(value)
      )
      .test('has-valid-id', 'Invalid URL: URL ending with slide=id.p', (value) => idRegex.test(value)),
  });

  const formFields = [
    {
      component: Input,
      name: 'title',
      type: 'text',
      label: `${t('Title')}*`,
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
      label: `${t('URL')}*`,
      helperText: (
        <span className={styles.HelperText}>
          <>
            Add your Google Slides link here.
            <a href={SAMPLE_SLIDE_LINK} target="_blank" rel="noreferrer" className={styles.HelperTextLink}>
              View Sample
            </a>
            <br />
            For best results:
            <ul>
              <li>Landscape certificates – Use a resolution of 3300 x 2550 px.</li>
              <li> Portrait certificates– Use resolution of 816 x 1056 px.</li>
              <li> Badges – Use a square format, minimum 600 x 600 px.</li>
            </ul>
          </>
        </span>
      ),
      customFieldError: (field: any) => {
        const { value } = field;

        if (value && !idRegex.test(value)) {
          return (
            <span className={styles.ErrorText}>
              <>
                Please check{' '}
                <a
                  href={CERTIFICATES_FAQ_FORMAT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.HelperTextLink}
                >
                  here
                </a>{' '}
                to resolve
              </>
            </span>
          );
        } else {
          return null;
        }
      },
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

  const customErrorHandler = (errors: any) => {
    const { message } = errors[0];
    if (message && message.includes('Insufficient permissions')) {
      setErrorMessage(message);
    } else {
      showError(errors[0]);
    }
  };

  let errorDialog;
  if (errorMessage) {
    errorDialog = (
      <DialogBox
        title={`Permission Issues!`}
        handleOk={() => setErrorMessage(null)}
        handleCancel={() => setErrorMessage(null)}
        colorOk="warning"
        alignButtons="center"
        skipCancel
        buttonOk="Ok"
      >
        <p className={styles.DialogText}>
          {errorMessage}
          <br />
          Please check{' '}
          <a href={CERTIFICATES_PERMISSIONS_LINK} target="_blank" rel="noreferrer" className={styles.HelperTextLink}>
            here
          </a>{' '}
          to resolve
        </p>
      </DialogBox>
    );
  }

  return (
    <>
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
        customHandler={customErrorHandler}
        {...queries}
      />
      {errorDialog}
    </>
  );
};

export default Certificate;
