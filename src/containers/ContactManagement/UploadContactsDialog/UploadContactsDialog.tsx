// @ts-ignore
/* eslint-disable */
import React, { useState } from 'react';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';

import { setVariables } from 'common/constants';
import { useTranslation } from 'react-i18next';
import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import Loading from 'components/UI/Layout/Loading/Loading';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { Field, Form, Formik } from 'formik';
import styles from './UploadContactsDialog.module.css';
import { ReactComponent as UploadIcon } from 'assets/images/icons/Upload.svg';
import { UPLOAD_CONTACTS_SAMPLE } from 'config';
import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import { IMPORT_CONTACTS } from 'graphql/mutations/Contact';
import { setNotification } from 'common/notification';

export interface UploadContactsDialogProps {
  organizationDetails: any;
  setDialog: Function;
}

export const UploadContactsDialog: React.FC<UploadContactsDialogProps> = ({
  organizationDetails,
  setDialog,
}) => {
  const client = useApolloClient();
  const [error, setError] = useState<any>(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingContacts, setUploadingContacts] = useState(false);
  const [uploadedURL, setUploadedURL] = useState('');
  const [fileName, setFileName] = useState<null | string>(null);

  const { t } = useTranslation();
  const [collection] = useState();
  const [optedIn] = useState(false);

  const { data: collections, loading } = useQuery(GET_COLLECTIONS, {
    variables: setVariables(),
  });

  const [uploadMedia] = useMutation(UPLOAD_MEDIA, {
    onCompleted: (data: any) => {
      if (data.uploadMedia) {
        setUploadedURL(data.uploadMedia);
      }
      setUploadingFile(false);
    },
    onError: () => {
      setUploadingFile(false);
    },
  });
  const [importContacts] = useMutation(IMPORT_CONTACTS, {
    onCompleted: (data: any) => {
      setUploadingContacts(false);
      setDialog(false);
      setNotification(client, 'Contacts have been uploaded');
    },
    onError: () => {
      setUploadingContacts(false);
    },
  });

  const addAttachment = (event: any) => {
    const media = event.target.files[0];

    if (media) {
      const mediaName = media.name;
      const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
      if (extension !== 'csv') {
        setError(true);
      } else {
        const shortenedName = mediaName.length > 15 ? `${mediaName.slice(0, 15)}...` : mediaName;
        setFileName(shortenedName);
        setUploadingFile(true);
        uploadMedia({
          variables: {
            media,
            extension,
          },
        });
      }
    }
  };

  const uploadContacts = (details: any) => {
    importContacts({
      variables: {
        type: 'URL',
        data: uploadedURL,
        groupLabel: details.collection.label,
        importContactsId: parseInt(organizationDetails.id),
      },
    });
  };

  if (loading || !organizationDetails) {
    return <Loading />;
  }

  const formFieldItems: any = [
    {
      component: AutoComplete,
      name: 'collection',
      placeholder: t('Select collection'),
      options: collections.groups,
      multiple: false,
      optionLabel: 'label',
      textFieldProps: {
        label: t('Collection'),
        variant: 'outlined',
      },
    },
    {
      component: Checkbox,
      name: 'optedIn',
      title: t('Are these contacts opted in?'),
      darkCheckbox: true,
    },
  ];

  const form = (
    <Formik
      enableReinitialize
      initialValues={{ collection, optedIn }}
      onSubmit={(itemData) => {
        uploadContacts(itemData);
        setUploadingContacts(true);
      }}
    >
      {({ submitForm }) => (
        <Form data-testid="formLayout">
          <DialogBox
            titleAlign="left"
            title={`${t('Upload contacts')}: ${organizationDetails.name}`}
            handleOk={() => {
              submitForm();
            }}
            handleCancel={() => {
              setDialog(false);
            }}
            skipCancel
            buttonOkLoading={uploadingContacts}
            buttonOk={t('Upload')}
            alignButtons="left"
          >
            <div className={styles.Fields}>
              {formFieldItems.map((field: any) => (
                <Field {...field} key={field.name} />
              ))}
            </div>

            <div className={styles.UploadContainer}>
              <label
                className={`${styles.UploadEnabled} ${fileName ? styles.Uploaded : ''}`}
                htmlFor="uploadFile"
              >
                <span>
                  {fileName !== null ? (
                    fileName
                  ) : (
                    <>
                      <UploadIcon className={styles.UploadIcon} /> Select .csv
                    </>
                  )}

                  <input
                    type="file"
                    id="uploadFile"
                    data-testid="uploadFile"
                    onChange={(event) => {
                      addAttachment(event);
                    }}
                  />
                </span>
              </label>
            </div>
            <div className={styles.Sample}>
              <a href={UPLOAD_CONTACTS_SAMPLE}>Download Sample</a>
            </div>

            {error && (
              <div className={styles.Error}>
                Please make sure the file format matches the sample
              </div>
            )}
          </DialogBox>
        </Form>
      )}
    </Formik>
  );

  return form;
};

export default UploadContactsDialog;
