import Button from '@mui/material/Button';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import styles from './UploadFile.module.css';
import { slicedString } from 'common/utils';
import { useState } from 'react';
import { Formik, Form } from 'formik';

export const UploadFile = ({ setFile }: any) => {
  const [errors, setErrors] = useState<string>('');
  const [fileName, setFileName] = useState<null | string>(null);

  const addAttachment = (event: any) => {
    const media = event.target.files[0];
    if (media) {
      if (media.size / 1000000 > 10) {
        setErrors('File size should be less than 10MB');
        return;
      } else if (media.type !== 'application/pdf') {
        setErrors('File type should be PDF');
        return;
      }

      const mediaName = media.name;
      const slicedName = slicedString(mediaName, 25);
      setFileName(slicedName);
      setFile(media);
    }
  };

  return (
    <Formik
      initialValues={{
        files: '',
      }}
      onSubmit={() => {}}
    >
      <Form className={styles.Form} data-testid="formLayout" encType="multipart/form-data">
        <Button
          className="Container"
          fullWidth={true}
          component="label"
          role={undefined}
          variant="text"
          tabIndex={-1}
        >
          <div className={styles.Container}>
            {fileName !== null ? (
              fileName
            ) : (
              <div>
                <UploadIcon className={styles.UploadIcon} />
                <span>Upload File</span>
              </div>
            )}
            <input
              type="file"
              id="uploadFile"
              accept=".pdf"
              data-testid="uploadFile"
              name="file"
              onChange={(event) => {
                addAttachment(event);
              }}
            />
          </div>
        </Button>
        <p className={styles.HelperText}>Upload PDF files less than 10 MB.</p>
        <p className={styles.FormError}> {errors}</p>
      </Form>
    </Formik>
  );
};
