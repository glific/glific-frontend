import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { useLazyQuery, useMutation } from '@apollo/client';

import { useTranslation } from 'react-i18next';
import { GET_ORGANIZATION_COLLECTIONS } from 'graphql/queries/Collection';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { Field, Form, Formik } from 'formik';
import UploadIcon from 'assets/images/icons/Upload.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import { UPLOAD_CONTACTS_SAMPLE } from 'config';
import { IMPORT_CONTACTS } from 'graphql/mutations/Contact';
import { slicedString } from 'common/utils';
import { setNotification } from 'common/notification';
import styles from './UploadContactsDialog.module.css';

export interface UploadContactsDialogProps {
  organizationDetails: any;
  setDialog: Function;
}

export const UploadContactsDialog = ({
  organizationDetails,
  setDialog,
}: UploadContactsDialogProps) => {
  const [error, setError] = useState<any>(false);
  const [csvContent, setCsvContent] = useState<String | null | ArrayBuffer>('');
  const [uploadingContacts, setUploadingContacts] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const { t } = useTranslation();
  const [collection] = useState();
  const [optedIn] = useState(false);

  const [getCollections, { data: collections, loading }] = useLazyQuery(
    GET_ORGANIZATION_COLLECTIONS
  );

  useEffect(() => {
    if (organizationDetails.id) {
      getCollections({
        variables: {
          organizationGroupsId: organizationDetails.id,
        },
      });
    }
  }, [organizationDetails]);

  const [importContacts] = useMutation(IMPORT_CONTACTS, {
    onCompleted: (data: any) => {
      if (data.errors) {
        setNotification(data.errors[0].message, 'warning');
      } else {
        setUploadingContacts(false);
        setNotification(t('Contacts have been uploaded'));
      }
      setDialog(false);
    },
    onError: (errors) => {
      setDialog(false);
      setNotification(errors.message, 'warning');
      setUploadingContacts(false);
    },
  });

  const addAttachment = (event: any) => {
    const media = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(media);

    reader.onload = () => {
      const mediaName = media.name;
      const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
      if (extension !== 'csv') {
        setError(true);
      } else {
        const shortenedName = slicedString(mediaName, 15);
        setFileName(shortenedName);
        setCsvContent(reader.result);
      }
    };
  };

  const uploadContacts = (details: any) => {
    importContacts({
      variables: {
        type: 'DATA',
        data: csvContent,
        groupLabel: details.collection.label,
        importContactsId: organizationDetails.id,
      },
    });
  };

  if (loading || !collections) {
    return <Loading />;
  }

  const validationSchema = Yup.object().shape({
    collection: Yup.object().nullable().required(t('Collection is required')),
  });

  const formFieldItems: any = [
    {
      component: AutoComplete,
      name: 'collection',
      placeholder: t('Select collection'),
      options: collections.organizationGroups,
      multiple: false,
      optionLabel: 'label',
      label: t('Collection'),
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
      validationSchema={validationSchema}
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
                  {fileName !== '' ? (
                    <>
                      <span>{fileName}</span>
                      <CrossIcon
                        className={styles.CrossIcon}
                        onClick={(event) => {
                          event.preventDefault();
                          setFileName('');
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <UploadIcon className={styles.UploadIcon} />
                      Select .csv
                    </>
                  )}

                  <input
                    type="file"
                    id="uploadFile"
                    disabled={fileName !== ''}
                    data-testid="uploadFile"
                    onChange={(event) => {
                      setError(false);
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
                1. Please make sure the file format matches the sample
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
