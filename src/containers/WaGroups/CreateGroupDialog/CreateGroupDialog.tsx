import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT, GROUP_QUERY_VARIABLES } from 'common/constants';
import { WA_GROUP_MEMBERS_SAMPLE } from 'config';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { CsvUpload } from 'components/UI/CsvUpload/CsvUpload';
import { setErrorMessage, setNotification } from 'common/notification';
import { CREATE_WA_GROUP } from 'graphql/mutations/Group';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WaGroups';
import { saveGroupConversation } from 'services/GroupMessageService';
import { ManagedPhoneOption, toActivePhoneOptions } from 'containers/WaGroups/managedPhones';
import styles from './CreateGroupDialog.module.css';
import setLogs from 'config/logs';

export type { ManagedPhoneOption };

export interface CreateGroupDialogProps {
  open: boolean;
  phones: ManagedPhoneOption[];
  defaultPhone?: ManagedPhoneOption | null;
  onClose: () => void;
  onCreated?: (waGroup: { id: string; label: string; bspId: string }) => void;
}

interface FormValues {
  name: string;
  waManagedPhone: { id: string; label: string } | null;
}

export const CreateGroupDialog = ({ open, phones, defaultPhone, onClose, onCreated }: CreateGroupDialogProps) => {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [csvContent, setCsvContent] = useState<string | ArrayBuffer | null>('');

  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required(t('Group name is required')).max(100, t('Name is too long')),
    waManagedPhone: Yup.object().nullable().required(t('Pick the managed phone that will create the group')),
  });

  const phoneOptions = toActivePhoneOptions(phones);

  const activeDefaultPhone = defaultPhone?.status === 'active' ? defaultPhone : null;

  const initialValues: FormValues = {
    name: '',
    waManagedPhone: activeDefaultPhone
      ? {
          id: activeDefaultPhone.id,
          label: activeDefaultPhone.label
            ? `${activeDefaultPhone.label} — ${activeDefaultPhone.phone}`
            : activeDefaultPhone.phone,
        }
      : null,
  };

  const [createWaGroup, { loading }] = useMutation(CREATE_WA_GROUP);
  const [fetchNewGroup] = useLazyQuery(GROUP_SEARCH_QUERY, { fetchPolicy: 'network-only' });

  const resetMembers = () => {
    setFileName('');
    setCsvContent('');
  };

  const addGroupToCache = async (waGroupId: string) => {
    try {
      const { data: conversation } = await fetchNewGroup({
        variables: {
          waMessageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
          waGroupOpts: { limit: DEFAULT_ENTITY_LIMIT },
          filter: { id: waGroupId },
        },
      });

      if (conversation?.search?.length > 0) {
        saveGroupConversation(conversation, GROUP_QUERY_VARIABLES);
      }
    } catch (error: any) {
      setLogs(`Error fetching new group after creation: ${error?.message || 'Unknown error'}`, 'error');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const { data } = await createWaGroup({
        variables: {
          input: {
            name: values.name.trim(),
            waManagedPhoneId: values.waManagedPhone!.id,
            importData: csvContent,
          },
        },
      });

      const { waGroup, errors } = data?.createWaGroup || {};

      if (!waGroup) {
        const msg = (errors || [])
          .map((e: { message?: string }) => e?.message)
          .filter(Boolean)
          .join('; ');
        setNotification(msg || t('Could not create WhatsApp group'), 'warning');
        return;
      }

      setNotification(
        t("Group creation started. Members are being imported in the background — you'll be notified when it's done."),
        'success'
      );

      addGroupToCache(waGroup.id);
      resetMembers();
      onCreated?.(waGroup);
      onClose();
    } catch (error: any) {
      setErrorMessage(error?.message || t('An unknown error occurred. Please try again.'));
    }
  };

  if (!open) return null;

  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ submitForm }) => (
        <Form>
          <DialogBox
            title={t('Create WhatsApp group')}
            titleAlign="left"
            buttonOk={t('Create')}
            buttonCancel={t('Cancel')}
            alignButtons="right"
            buttonOkLoading={loading}
            disableOk={loading || !csvContent}
            skipCancel={loading}
            handleOk={() => submitForm()}
            handleCancel={() => {
              if (loading) return;
              resetMembers();
              onClose();
            }}
            fullWidth
          >
            <div className={styles.Fields}>
              <Field
                name="name"
                component={Input}
                type="text"
                placeholder={t('Group name')}
                inputLabel={t('Group name')}
                required
              />
              <Field
                name="waManagedPhone"
                component={AutoComplete}
                placeholder={t('Creator phone')}
                inputLabel={t('Creator phone')}
                options={phoneOptions}
                optionLabel="label"
                multiple={false}
                helperText={t(
                  'The managed phone that will create the group on WhatsApp; it becomes the primary phone in Glific.'
                )}
              />

              <CsvUpload
                fileName={fileName}
                onFileSelect={(content, name) => {
                  setCsvContent(content);
                  setFileName(name);
                }}
                onClear={resetMembers}
                inputId="createGroupCsv"
                inputTestId="createGroupCsv"
                sampleUrl={WA_GROUP_MEMBERS_SAMPLE}
                sampleFileName="wa_group_members_sample.csv"
                sampleText={t('CSV with a phone column; name optional.')}
              />
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );
};

export default CreateGroupDialog;
