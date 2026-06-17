import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { setVariables } from 'common/constants';
import { getDisplayName } from 'common/utils';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { setErrorMessage, setNotification } from 'common/notification';
import { CREATE_WA_GROUP } from 'graphql/mutations/Group';
import { GET_CONTACTS_LIST } from 'graphql/queries/Contact';
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

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Group name is required').max(100, 'Name is too long'),
  waManagedPhone: Yup.object().nullable().required('Pick the managed phone that will create the group'),
  contacts: Yup.array().min(1, 'Pick at least one member'),
});

export const CreateGroupDialog = ({
  open,
  phones,
  defaultPhone,
  onClose,
  onCreated,
}: CreateGroupDialogProps) => {
  const { t } = useTranslation();
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  // asyncSearch mode keeps the selected options here (independent of the
  // search-filtered `options`); AutoComplete also mirrors them into Formik.
  const [selectedContacts, setSelectedContacts] = useState<ContactOption[]>([]);

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

  const handleSubmit = async (values: FormValues) => {
    try {
      const { data } = await createWaGroup({
        variables: {
          input: {
            name: values.name.trim(),
            waManagedPhoneId: values.waManagedPhone!.id,
            numbers: values.contacts.map((c) => c.phone),
          },
        },
      });

      const { waGroup, errors } = data?.createWaGroup || {};

      if (errors && errors.length > 0) {
        const msg = errors.map((e: any) => e?.message).filter(Boolean).join('; ');
        setNotification(msg || t('Could not create WhatsApp group'), 'warning');
        return;
      }

      if (!waGroup) {
        setNotification(t('Could not create WhatsApp group'), 'warning');
        return;
      }

      setNotification(t('WhatsApp group created'), 'success');
      setSelectedContacts([]);
      setContactSearchTerm('');
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
            disableOk={loading}
            skipCancel={loading}
            handleOk={() => submitForm()}
            handleCancel={() => {
              if (loading) return;
              setSelectedContacts([]);
              setContactSearchTerm('');
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
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );
};

export default CreateGroupDialog;
