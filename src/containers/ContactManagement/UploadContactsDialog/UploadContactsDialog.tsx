import { useState } from 'react';
import * as Yup from 'yup';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { useMutation, useQuery } from '@apollo/client';

import { useTranslation } from 'react-i18next';
import { GET_COLLECTIONS_LIST } from 'graphql/queries/Collection';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { Field, Form, Formik } from 'formik';
import { UPLOAD_CONTACTS_SAMPLE } from 'config';
import { IMPORT_CONTACTS } from 'graphql/mutations/Contact';
import { setNotification } from 'common/notification';
import styles from './UploadContactsDialog.module.css';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';

export interface UploadContactsDialogProps {
  organizationDetails?: any;
  setDialog: Function;
  setShowStatus: any;
}

export const UploadContactsDialog = ({ setDialog, setShowStatus }: UploadContactsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [csvContent, setCsvContent] = useState<String | null | ArrayBuffer>('');
  const [uploadingContacts, setUploadingContacts] = useState(false);
  const [errors, setErrors] = useState<{ message: string }[]>([]);
  const { t } = useTranslation();
  const [collection] = useState();
  const [optedIn] = useState(false);

  const addAttachment = (event: any) => {
    const media = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(media);

    reader.onload = () => {
      const mediaName = media.name;
      const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
      if (extension !== 'csv') {
        setErrors([{ message: 'Please make sure the file format matches the sample' }]);
      } else {
        setFileName(mediaName);
        setCsvContent(reader.result);
      }
    };
  };

  const { data: collections, loading } = useQuery(GET_COLLECTIONS_LIST, {
    variables: {
      filter: {
        groupType: 'WABA',
        label: searchTerm,
      },
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
      },
    },
  });

  let groupOptions = [];
  if (collections && collections.groups) {
    groupOptions = collections.groups;
  }

  const [importContacts] = useMutation(IMPORT_CONTACTS, {
    onCompleted: (data: any) => {
      const { errors } = data.importContacts;
      if (errors) {
        setNotification(data.errors[0].message, 'warning');
      } else {
        setUploadingContacts(false);
        setShowStatus(true);
      }
    },
    onError: (errors) => {
      setDialog(false);
      setNotification(errors.message, 'warning');
      setUploadingContacts(false);
    },
  });

  const uploadContacts = (details: any) => {
    importContacts({
      variables: {
        type: 'DATA',
        data: csvContent,
        groupLabel: details.collection.label,
      },
    });
  };

  const validationSchema = Yup.object().shape({
    collection: Yup.object().nullable().required(t('Collection is required')),
    optedIn: Yup.boolean()
      .oneOf([true], 'Please confirm if contacts are opted in.')
      .required('Please confirm if contacts are opted in.'),
  });

  const formFieldItems: any = [
    {
      component: AutoComplete,
      name: 'collection',
      placeholder: t('Select collection'),
      options: groupOptions,
      multiple: false,
      optionLabel: 'label',
      label: t('Collection'),
      onInputChange: (event: any) => setSearchTerm(event?.target?.value),
      noOptionsText: loading ? 'Loading...' : 'No options available',
    },
    {
      component: Checkbox,
      name: 'optedIn',
      title: t('Are these contacts opted in?'),
      darkCheckbox: true,
      info: {
        title: 'Please obtain prior consent from contacts to message them on WhatsApp',
      },
    },
  ];

  return (
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
            title={t('Upload Contacts')}
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
            disableOk={!csvContent}
          >
            <>
              <div className={styles.Fields}>
                {formFieldItems.map((field: any) => (
                  <Field {...field} key={field.name} />
                ))}
              </div>

              <div className={styles.UploadContainer}>
                <label className={styles.Upload} htmlFor="uploadcontacts">
                  <span className={styles.FileInput}>
                    {fileName !== '' ? (
                      <>
                        {fileName}
                        <CrossIcon
                          data-testid="cross-icon"
                          className={styles.CrossIcon}
                          onClick={(event: any) => {
                            event.preventDefault();
                            setFileName('');
                            setCsvContent('');
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <span className={styles.UploadFile}>
                          <UploadIcon /> Upload File
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      id="uploadcontacts"
                      disabled={fileName !== ''}
                      data-testid="uploadcontacts"
                      onChange={(event) => {
                        setErrors([]);
                        addAttachment(event);
                      }}
                    />
                  </span>
                </label>
              </div>
              <div className={styles.Sample}>
                <a href={UPLOAD_CONTACTS_SAMPLE}>Download Sample</a>
              </div>
              {errors &&
                errors.length > 0 &&
                errors.map((error: any, index: number) => (
                  <div className={styles.Error} key={error.message}>
                    {index + 1}. {error.message}
                  </div>
                ))}
            </>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );
};

export default UploadContactsDialog;
