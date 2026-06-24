import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { setNotification } from 'common/notification';
import { setVariables } from 'common/constants';
import { GET_CONTACTS_LIST } from 'graphql/queries/Contact';
import { GET_WA_GROUP, LIST_CONTACTS_WA_GROUPS } from 'graphql/queries/WaGroups';
import { IMPORT_WA_GROUP_CONTACTS, UPDATE_WA_GROUP } from 'graphql/mutations/Group';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';

import styles from './AddMembersDialog.module.css';

export interface AddMembersDialogProps {
  waGroupId: string;
  onClose: () => void;
}

type Mode = 'select' | 'csv';

export const AddMembersDialog = ({ waGroupId, onClose }: AddMembersDialogProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [csvContent, setCsvContent] = useState<string | ArrayBuffer | null>('');

  const refetchQueries = [
    { query: GET_WA_GROUP, variables: { waGroupId } },
    { query: LIST_CONTACTS_WA_GROUPS, variables: { filter: { waGroupId } } },
  ];

  const { data: searchData, loading: searchLoading } = useQuery(GET_CONTACTS_LIST, {
    variables: setVariables({ name: searchTerm, excludeWaGroups: waGroupId }, 50),
    fetchPolicy: 'cache-and-network',
    skip: mode !== 'select',
  });

  const options = searchData?.contacts?.map((c: any) => ({ ...c, name: c.name || c.phone })) || [];

  const [addMembers, { loading: adding }] = useMutation(UPDATE_WA_GROUP, {
    refetchQueries,
    onError: () => setNotification(t('Could not add contacts to the group'), 'warning'),
  });

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
      setNotification(t('Member upload started. Check notifications for the report.'), 'success');
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

  const handleSelectSubmit = async () => {
    const phones = selectedContacts.map((c: any) => c.phone).filter(Boolean);
    if (!phones.length) {
      onClose();
      return;
    }
    const { data } = await addMembers({
      variables: { input: { id: waGroupId, addPhones: phones } },
    });
    const errors = data?.updateWaGroup?.errors;
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
    if (data?.updateWaGroup?.waGroup) {
      setNotification(`${phones.length} ${phones.length === 1 ? 'contact' : 'contacts'} added`, 'success');
      onClose();
    }
  };

  const handleCsvSubmit = () => {
    importMembers({ variables: { waGroupId, type: 'DATA', data: csvContent } });
  };

  const isCsv = mode === 'csv';

  return (
    <DialogBox
      title={t('Add members to this group')}
      titleAlign="left"
      handleOk={isCsv ? handleCsvSubmit : handleSelectSubmit}
      handleCancel={onClose}
      buttonOk={isCsv ? t('Upload') : t('Save')}
      buttonOkLoading={isCsv ? importing : adding}
      disableOk={isCsv ? !csvContent : selectedContacts.length === 0}
      fullWidth
    >
      <div className={styles.Toggle}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          size="small"
          onChange={(_event, value) => value && setMode(value)}
          aria-label="add members mode"
        >
          <ToggleButton value="select" data-testid="selectMode">
            {t('Select contacts')}
          </ToggleButton>
          <ToggleButton value="csv" data-testid="csvMode">
            {t('Upload CSV')}
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {isCsv ? (
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
          <div className={styles.Sample}>{t('CSV with a phone column; name optional.')}</div>
        </div>
      ) : (
        <AutoComplete
          asyncSearch
          options={options}
          optionLabel="name"
          additionalOptionLabel="phone"
          multiple
          field={{ name: 'contacts', value: selectedContacts }}
          form={{ setFieldValue: (_name: string, value: any) => setSelectedContacts(value) }}
          asyncValues={{ value: selectedContacts, setValue: setSelectedContacts }}
          onChange={(value: any) => {
            if (typeof value === 'string') setSearchTerm(value);
          }}
          noOptionsText={searchLoading ? t('Loading...') : t('No options available')}
          placeholder={t('Search contacts')}
        />
      )}
    </DialogBox>
  );
};

export default AddMembersDialog;
