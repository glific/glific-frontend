import { useState } from 'react';
import { CONTACT_MANAGE_HELP_LINK, UPLOAD_CONTACTS_ADMIN_SAMPLE } from 'config';
import { Heading } from 'containers/Form/FormLayout';
import { Button } from 'components/UI/Form/Button/Button';
import UploadIcon from 'assets/images/icons/UploadLight.svg?react';
import FileIcon from 'assets/images/icons/Document/Light.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { MOVE_CONTACTS } from 'graphql/mutations/Contact';
import { setNotification } from 'common/notification';
import { listIcon } from '../SuperAdminContactManagement/SuperAdminContactManagement';
import styles from './AdminContactManagement.module.css';
import { exportCsvFile, slicedString } from 'common/utils';

export const AdminContactManagement = () => {
  const [fileName, setFileName] = useState<string>('');
  const [errors, setErrors] = useState<any>([]);
  const [csvContent, setCsvContent] = useState<String | null | ArrayBuffer>('');
  const [uploadingContacts, setUploadingContacts] = useState(false);
  const { t } = useTranslation();

  const [moveContacts] = useMutation(MOVE_CONTACTS, {
    onCompleted: (data: any) => {
      if (data.errors) {
        setErrors(data.errors);
      } else {
        exportCsvFile(data.moveContacts.csvRows, 'results');
        setUploadingContacts(false);
        setNotification(t('Contacts have been updated'));
      }
      setFileName('');
    },
    onError: (error) => {
      setErrors([{ message: error.message }]);
      setFileName('');
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
        setErrors([{ message: 'Please make sure the file format matches the sample' }]);
      } else {
        const shortenedName = slicedString(mediaName, 10);
        setFileName(shortenedName);
        setCsvContent(reader.result);
      }
    };
  };

  return (
    <div>
      <Heading icon={listIcon} formTitle="Contact Management" />
      <div className={styles.Container}>
        <div className={styles.Instructions}>
          You can move contacts to collections in bulk or update their contact information. Please
          create csv file that exactly matches the sample. Here are the &nbsp;
          <a
            href={CONTACT_MANAGE_HELP_LINK}
            target="_blank"
            rel="noreferrer"
            className={styles.Link}
          >
            detailed instructions.
          </a>
        </div>
        <div className={styles.UploadContainer}>
          <label className={styles.UploadEnabled} htmlFor="uploadFile">
            <span>
              <FileIcon className={styles.FileIcon} />
              {fileName !== '' ? (
                <>
                  <span>{fileName}</span>
                  <CrossIcon
                    className={styles.CrossIcon}
                    onClick={(event: any) => {
                      event.preventDefault();
                      setFileName('');
                      setCsvContent('');
                    }}
                  />
                </>
              ) : (
                'Select file'
              )}

              <input
                type="file"
                id="uploadFile"
                disabled={fileName !== ''}
                data-testid="uploadFile"
                onChange={(event) => {
                  setErrors([]);
                  addAttachment(event);
                }}
              />
            </span>
          </label>
          <div className={styles.Sample}>
            <a href={UPLOAD_CONTACTS_ADMIN_SAMPLE}>Download Sample</a>
          </div>

          {errors &&
            errors.length > 0 &&
            errors.map((error: any, index: number) => (
              <div className={styles.Error} key={error.message}>
                {index + 1}. {error.message}
              </div>
            ))}
        </div>
        <Button
          data-testid="uploadButton"
          variant="contained"
          color="primary"
          disabled={fileName === ''}
          loading={uploadingContacts}
          onClick={() => {
            setUploadingContacts(true);
            moveContacts({
              variables: {
                type: 'DATA',
                data: csvContent,
              },
            });
          }}
        >
          <UploadIcon className={styles.FileIcon} /> Upload
        </Button>
      </div>
    </div>
  );
};

export default AdminContactManagement;
