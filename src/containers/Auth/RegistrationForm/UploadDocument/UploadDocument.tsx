import { useState } from 'react';
import { Button, FormHelperText, Typography } from '@mui/material';

import styles from './UploadDocument.module.css';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import { slicedString } from 'common/utils';

interface UploadDocumentProps {
  inputLabel: string;
  helperText: string;
  setFile: Function;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  field: any;
}

export const UploadDocument = ({
  inputLabel,
  helperText,
  setFile,
  form,
  field,
}: UploadDocumentProps) => {
  const [fileName, setFileName] = useState<null | string>(null);
  // const [attachmentUrl, setAttachmentUrl] = useState<null | string>(null);
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(false);
  console.log(form && form.errors[field.name]);

  const addAttachment = (event: any) => {
    const media = event.target.files[0];

    if (media) {
      const mediaName = media.name;
      console.log(media);

      const shortenedName = slicedString(mediaName, 15);
      setFileName(shortenedName);
      setLoading(true);
      form.setFieldValue('registration_docs', media);
    }
  };

  return (
    <div>
      <Typography variant="caption" className={styles.Label} data-testid="inputLabel">
        {inputLabel}
      </Typography>
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
            <span className={styles.FileName}>{fileName}</span>
          ) : (
            <div className={styles.UploadContainer}>
              <UploadIcon className={styles.UploadIcon} />
              <span>Choose file</span>
              <span className={styles.helperTextP}>{helperText}</span>
            </div>
          )}
          <input
            type="file"
            id="uploadFile"
            data-testid="uploadFile"
            name="file"
            onChange={(event) => {
              setErrors('');
              addAttachment(event);
            }}
          />
        </div>
      </Button>
      {form && form.errors[field.name] && form.touched[field.name] ? (
        <FormHelperText className={styles.DangerText}>{form.errors[field.name]}</FormHelperText>
      ) : null}{' '}
    </div>
  );
};
