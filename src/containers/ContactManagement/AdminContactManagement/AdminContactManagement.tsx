import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CONTACT_MANAGE_HELP_LINK, UPLOAD_CONTACTS_ADMIN_SAMPLE } from 'config';
import { Button } from 'components/UI/Form/Button/Button';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import { MOVE_CONTACTS } from 'graphql/mutations/Contact';
import styles from './AdminContactManagement.module.css';

export interface AdminContactManagementProps {
  setShowStatus: any;
}

export const AdminContactManagement = ({ setShowStatus }: AdminContactManagementProps) => {
  const [fileName, setFileName] = useState<string>('');
  const [errors, setErrors] = useState<any>([]);
  const [csvContent, setCsvContent] = useState<String | null | ArrayBuffer>('');
  const [uploadingContacts, setUploadingContacts] = useState(false);

  const [moveContacts] = useMutation(MOVE_CONTACTS, {
    onCompleted: ({ moveContacts }) => {
      const { errors } = moveContacts;
      if (errors) {
        setErrors(errors);
      } else {
        setUploadingContacts(false);
        setShowStatus(true);
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
        setFileName(mediaName);
        setCsvContent(reader.result);
      }
    };
  };

  return (
    <div className={styles.Container}>
      <div>
        <h2>Move contacts</h2>

        <div className={styles.Instructions}>
          <span>
            You can move contacts to collections in bulk or update their contact information. Please create csv file
            that exactly matches the sample.
          </span>
          <div>
            <h5>Instructions</h5>
            <ul>
              <li>
                Ensure your CSV includes the following fields: Phone Number (in E164 format, e.g., +91XXXXXXXXXX),
                Contact Name, and any other fields you want to update.
              </li>
              <li>Click Upload File to select your CSV. Only CSV files are accepted.</li>
              <li>
                After upload, check for successful imports and any errors (e.g., invalid phone numbers) in
                Notifications. Correct and re-upload if needed.
              </li>
            </ul>

            <div>
              Here are the&nbsp;
              <a href={CONTACT_MANAGE_HELP_LINK} target="_blank" rel="noreferrer" className={styles.Link}>
                detailed instructions.
              </a>
            </div>
          </div>
        </div>
        <div className={styles.UploadContainer}>
          <label className={styles.Upload} htmlFor="uploadFile">
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
      </div>

      <div className={styles.Buttons}>
        <Button
          data-testid="moveContactsBtn"
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
          Upload
        </Button>
      </div>
    </div>
  );
};

export default AdminContactManagement;
