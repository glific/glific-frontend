import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CONTACT_MANAGE_HELP_LINK, UPLOAD_CONTACTS_ADMIN_SAMPLE } from 'config';
import { Button } from 'components/UI/Form/Button/Button';
import FileIcon from 'assets/images/icons/Document/Light.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import { MOVE_CONTACTS } from 'graphql/mutations/Contact';
import { slicedString } from 'common/utils';
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
        const shortenedName = slicedString(mediaName, 10);
        setFileName(shortenedName);
        setCsvContent(reader.result);
      }
    };
  };

  return (
    <div className={styles.Container}>
      <div>
        <h2>Move contacts</h2>

        <div className={styles.Instructions} style={{ fontSize: '14px' }}>
          You can move contacts to collections in bulk or update their contact information. Please create csv file that
          exactly matches the sample. Here are the&nbsp;
          <a href={CONTACT_MANAGE_HELP_LINK} target="_blank" rel="noreferrer" className={styles.Link}>
          detailed instructions.
          </a>
        </div>
        <div className={styles.UploadContainer}>
          <label className={styles.UploadEnabled} htmlFor="uploadFile">
            <span>
              <FileIcon className={styles.FilexxxIcon} />
              {fileName !== '' ? (
                <>
                  <span>{fileName}</span>
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
                'UPLOAD File'
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
