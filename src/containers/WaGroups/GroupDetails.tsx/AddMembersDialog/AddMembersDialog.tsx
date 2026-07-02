import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { CsvUpload } from 'components/UI/CsvUpload/CsvUpload';
import { setNotification } from 'common/notification';
import { WA_GROUP_MEMBERS_SAMPLE } from 'config';
import { IMPORT_WA_GROUP_CONTACTS } from 'graphql/mutations/Group';

export interface AddMembersDialogProps {
  waGroupId: string;
  onClose: () => void;
}

export const AddMembersDialog = ({ waGroupId, onClose }: AddMembersDialogProps) => {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [csvContent, setCsvContent] = useState<string | ArrayBuffer | null>('');

  const [importMembers, { loading: importing }] = useMutation(IMPORT_WA_GROUP_CONTACTS);

  const handleCsvSubmit = async () => {
    try {
      const { data } = await importMembers({ variables: { waGroupId, type: 'DATA', data: csvContent } });

      const errors = data?.importWaGroupContacts?.errors;
      if (errors?.length) {
        setNotification(
          errors
            .map((error: { message?: string }) => error?.message)
            .filter(Boolean)
            .join('; '),
          'warning'
        );
        return;
      }

      setNotification(t("Member upload started in the background — you'll be notified when it's done."), 'success');
      onClose();
    } catch {
      setNotification(t('Could not upload members'), 'warning');
    }
  };

  return (
    <DialogBox
      title={t('Add members to this group')}
      titleAlign="left"
      handleOk={handleCsvSubmit}
      handleCancel={() => {
        if (!importing) onClose();
      }}
      buttonOk={t('Upload')}
      buttonOkLoading={importing}
      disableOk={!csvContent || importing}
      skipCancel={importing}
      fullWidth
    >
      <CsvUpload
        fileName={fileName}
        onFileSelect={(content, name) => {
          setCsvContent(content);
          setFileName(name);
        }}
        onClear={() => {
          setFileName('');
          setCsvContent('');
        }}
        inputId="uploadWaMembers"
        inputTestId="uploadWaMembers"
        sampleUrl={WA_GROUP_MEMBERS_SAMPLE}
        sampleFileName="wa_group_members_sample.csv"
        sampleText={t('CSV with a phone column; name optional.')}
      />
    </DialogBox>
  );
};

export default AddMembersDialog;
