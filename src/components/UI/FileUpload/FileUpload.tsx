import styles from './FileUpload.module.css';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import { slicedString } from 'common/utils';
import { useState } from 'react';

interface FileUploadProps {
  setErrors: (errors: { message: string }[]) => void;
  afterImport: (content: String | null | ArrayBuffer, name: string) => void;
}

export const FileUpload = ({ setErrors, afterImport }: FileUploadProps) => {
  const [fileName, setFileName] = useState<string>('');

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
        const shortenedName = slicedString(mediaName, 30);
        setFileName(shortenedName);
        afterImport(reader.result, shortenedName);
      }
    };
  };

  return (
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
              }}
            />
          </>
        ) : (
          <span className={styles.UploadFile}>
            <UploadIcon />
            Upload File
          </span>
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
  );
};
