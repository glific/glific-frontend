import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification } from 'common/notification';
import { WA_GROUP_MEMBERS_SAMPLE } from 'config';
import { IMPORT_WA_GROUP_CONTACTS } from 'graphql/mutations/Group';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';

import styles from './AddMembersDialog.module.css';

export interface AddMembersDialogProps {
  waGroupId: string;
  onClose: () => void;
}

export const AddMembersDialog = ({ waGroupId, onClose }: AddMembersDialogProps) => {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [csvContent, setCsvContent] = useState<string | ArrayBuffer | null>('');

  const [importMembers, { loading: importing }] = useMutation(IMPORT_WA_GROUP_CONTACTS, {
    onCompleted: (data: any) => {
      const errors = data?.importWaGroupContacts?.errors;
      if (errors?.length) {
        setNotification(
          errors
            .map((e: any) => e?.message)
            .filter(Boolean)
            .join('; '),
          'warning'
        );
        return;
      }
      setNotification(t("Member upload started in the background — you'll be notified when it's done."), 'success');
      onClose();
    },
    onError: () => setNotification(t('Could not upload members'), 'warning'),
  });

  const handleFile = (event: any) => {
    const media = event.target.files?.[0];
    if (!media) return;
    const reader = new FileReader();
    reader.readAsText(media);
    reader.onload = () => {
      const extension = media.name.split('.').pop();
      if (extension !== 'csv') {
        setNotification(t('Please upload a valid CSV file'), 'warning');
        return;
      }
      setFileName(media.name);
      setCsvContent(reader.result);
    };
  };

  const handleCsvSubmit = () => {
    importMembers({ variables: { waGroupId, type: 'DATA', data: csvContent } });
  };

  return (
    <DialogBox
      title={t('Add members to this group')}
      titleAlign="left"
      handleOk={handleCsvSubmit}
      handleCancel={onClose}
      buttonOk={t('Upload')}
      buttonOkLoading={importing}
      disableOk={!csvContent}
      fullWidth
    >
      <div className={styles.UploadContainer}>
        <label className={styles.Upload} htmlFor="uploadWaMembers">
          <span className={styles.FileInput}>
            {fileName ? (
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
              <span className={styles.UploadFile}>
                <UploadIcon /> {t('Upload File')}
              </span>
            )}
            <input
              type="file"
              id="uploadWaMembers"
              disabled={!!fileName}
              data-testid="uploadWaMembers"
              onChange={handleFile}
            />
          </span>
        </label>
        <div className={styles.Sample}>
          {t('CSV with a phone column; name optional.')}{' '}
          <a href={WA_GROUP_MEMBERS_SAMPLE} download="wa_group_members_sample.csv">
            {t('Download Sample')}
          </a>
        </div>
      </div>
    </DialogBox>
  );
};

export default AddMembersDialog;
