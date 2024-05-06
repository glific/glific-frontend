import { useState } from 'react';
import { Button, Typography } from '@mui/material';

import styles from './UploadDocument.module.css';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import { useMutation } from '@apollo/client';
import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import { setNotification } from 'common/notification';
import { slicedString } from 'common/utils';

interface UploadDocumentProps {
  inputLabel: string;
  helperText: string;
}

export const UploadDocument = ({ inputLabel, helperText }: UploadDocumentProps) => {
  const [fileName, setFileName] = useState<null | string>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<null | string>(null);
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [uploadMedia] = useMutation(UPLOAD_MEDIA, {
    onCompleted: (data: any) => {
      setAttachmentUrl(data.uploadMedia);
      setLoading(false);
    },
    onError: () => {
      setFileName(null);
      setLoading(false);
      setNotification('An error occured while uploading the file', 'warning');
    },
  });

  const addAttachment = (event: any) => {
    const media = event.target.files[0];

    if (media) {
      const mediaName = media.name;
      console.log(media);

      const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
      const shortenedName = slicedString(mediaName, 15);
      setFileName(shortenedName);
      setLoading(true);
      console.log({
        variables: {
          media,
          extension,
        },
      });
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
    </div>
  );
};
