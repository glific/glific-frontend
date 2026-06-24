import { useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT, GROUP_QUERY_VARIABLES, setVariables } from 'common/constants';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { setErrorMessage, setNotification } from 'common/notification';
import { CREATE_WA_GROUP } from 'graphql/mutations/Group';
import { GET_CONTACTS_LIST } from 'graphql/queries/Contact';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WaGroups';
import { saveGroupConversation } from 'services/GroupMessageService';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import styles from './CreateGroupDialog.module.css';

export interface ManagedPhoneOption {
  id: string;
  phone: string;
  label?: string | null;
}

export interface CreateGroupDialogProps {
  open: boolean;
  phones: ManagedPhoneOption[];
  defaultPhone?: ManagedPhoneOption | null;
  onClose: () => void;
  onCreated?: (waGroup: { id: string; label: string; bspId: string }) => void;
}

interface ContactOption {
  id: string;
  name: string;
  phone: string;
}

interface FormValues {
  name: string;
  waManagedPhone: { id: string; label: string } | null;
  contacts: ContactOption[];
}

type MemberMode = 'select' | 'csv';

export const CreateGroupDialog = ({ open, phones, defaultPhone, onClose, onCreated }: CreateGroupDialogProps) => {
  const { t } = useTranslation();
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  // asyncSearch mode keeps the selected options here (independent of the
  // search-filtered `options`); AutoComplete also mirrors them into Formik.
  const [selectedContacts, setSelectedContacts] = useState<ContactOption[]>([]);
  const [memberMode, setMemberMode] = useState<MemberMode>('select');
  const [fileName, setFileName] = useState('');
  const [csvContent, setCsvContent] = useState<string | ArrayBuffer | null>('');

  // Members are required only in the dropdown mode; in CSV mode the file (guarded
  // by disableOk) supplies them, so `contacts` stays empty.
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Group name is required').max(100, 'Name is too long'),
    waManagedPhone: Yup.object().nullable().required('Pick the managed phone that will create the group'),
    contacts: memberMode === 'select' ? Yup.array().min(1, 'Pick at least one member') : Yup.array(),
  });

  const phoneOptions = phones.map((p) => ({
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
    contacts: [],
  };

  const { data: contactsData, loading: contactsLoading } = useQuery(GET_CONTACTS_LIST, {
    variables: setVariables({ name: contactSearchTerm }, 50),
    fetchPolicy: 'cache-and-network',
    skip: !open,
  });

  const contactOptions: ContactOption[] =
    contactsData?.contacts?.map((c: any) => ({
      id: c.id,
      name: c.name || c.phone,
      phone: c.phone,
    })) || [];

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
    setSelectedContacts([]);
    setContactSearchTerm('');
    setFileName('');
    setCsvContent('');
    setMemberMode('select');
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
      const isCsv = memberMode === 'csv';
      const { data } = await createWaGroup({
        variables: {
          input: {
            name: values.name.trim(),
            waManagedPhoneId: values.waManagedPhone!.id,
            // dropdown sends the picked members' phones; CSV sends the file —
            // the backend seeds the group with its phones and enriches the
            // contacts (name/fields/collection) in a background job.
            ...(isCsv ? { importData: csvContent } : { numbers: values.contacts.map((c) => c.phone) }),
          },
        },
      });

      const { waGroup, errors } = data?.createWaGroup || {};

      if (errors && errors.length > 0) {
        const msg = errors
          .map((e: any) => e?.message)
          .filter(Boolean)
          .join('; ');
        setNotification(msg || t('Could not create WhatsApp group'), 'warning');
        return;
      }

      if (!waGroup) {
        setNotification(t('Could not create WhatsApp group'), 'warning');
        return;
      }

      setNotification(
        isCsv
          ? t('WhatsApp group created. Members are being imported — check notifications for the report.')
          : t('WhatsApp group created'),
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
            disableOk={loading || (memberMode === 'csv' && !csvContent)}
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

              <div className={styles.Toggle}>
                <ToggleButtonGroup
                  value={memberMode}
                  exclusive
                  size="small"
                  onChange={(_event, value) => value && setMemberMode(value)}
                  aria-label="member mode"
                >
                  <ToggleButton value="select" data-testid="selectMode">
                    {t('Select contacts')}
                  </ToggleButton>
                  <ToggleButton value="csv" data-testid="csvMode">
                    {t('Upload CSV')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>

              {memberMode === 'csv' ? (
                <div className={styles.UploadContainer}>
                  <label className={styles.Upload} htmlFor="createGroupCsv">
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
                        id="createGroupCsv"
                        disabled={!!fileName}
                        data-testid="createGroupCsv"
                        onChange={handleFile}
                      />
                    </span>
                  </label>
                  <div className={styles.Sample}>{t('CSV with a phone column; name optional.')}</div>
                </div>
              ) : (
                <Field
                  name="contacts"
                  component={AutoComplete}
                  placeholder={t('Search contacts')}
                  inputLabel={t('Members')}
                  options={contactOptions}
                  optionLabel="name"
                  additionalOptionLabel="phone"
                  multiple
                  asyncSearch
                  asyncValues={{ value: selectedContacts, setValue: setSelectedContacts }}
                  disableClearable={false}
                  onChange={(value: any) => {
                    if (typeof value === 'string') {
                      setContactSearchTerm(value);
                    }
                  }}
                  noOptionsText={contactsLoading ? t('Loading...') : t('No options available')}
                  helperText={t('Pick the contacts to invite. Type to search by name.')}
                />
              )}
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );
};

export default CreateGroupDialog;
