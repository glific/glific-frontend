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
import { setErrorMessage, setNotification } from 'common/notification';
import { CREATE_WA_GROUP } from 'graphql/mutations/Group';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WaGroups';
import { saveGroupConversation } from 'services/GroupMessageService';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import styles from './CreateGroupDialog.module.css';

export interface ManagedPhoneOption {
  id: string;
  phone: string;
  label?: string | null;
  status?: string | null;
}

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

  const phoneOptions = phones
    .filter((p) => p.status === 'active')
    .map((p) => ({
      id: p.id,
      label: p.label ? `${p.label} — ${p.phone}` : p.phone,
    }));

  const initialValues: FormValues = {
    name: '',
    waManagedPhone: defaultPhone
      ? {
          id: defaultPhone.id,
          label: defaultPhone.label ? `${defaultPhone.label} — ${defaultPhone.phone}` : defaultPhone.phone,
        }
      : null,
  };

  const [createWaGroup, { loading }] = useMutation(CREATE_WA_GROUP);
  const [fetchNewGroup] = useLazyQuery(GROUP_SEARCH_QUERY, { fetchPolicy: 'network-only' });

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

  const resetMembers = () => {
    setFileName('');
    setCsvContent('');
  };

  // Add the freshly created group to the cached conversation list so it shows
  // up in the sidebar without a manual refresh. Mirrors the missing-group
  // fetch used by GroupMessageSubscription: fetch the group's conversation and
  // prepend it to the GROUP_SEARCH_QUERY cache. Best-effort — if the list cache
  // isn't warm yet, the next refetch picks it up.
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
    } catch {
      // best-effort cache update; ignore failures
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

              <div className={styles.UploadContainer}>
                <label className={styles.Upload} htmlFor="createGroupCsv">
                  <span className={styles.FileInput}>
                    {fileName ? (
                      <>
                        {fileName}
                        <button
                          type="button"
                          data-testid="cross-icon"
                          className={styles.CrossIcon}
                          aria-label={t('Remove file')}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setFileName('');
                            setCsvContent('');
                          }}
                        >
                          <CrossIcon />
                        </button>
                      </>
                    ) : (
                      <span className={styles.UploadFile}>
                        <UploadIcon /> {t('Upload File')}
                      </span>
                    )}
                    <input
                      type="file"
                      id="createGroupCsv"
                      disabled={!!fileName}
                      data-testid="createGroupCsv"
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
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );
};

export default CreateGroupDialog;
