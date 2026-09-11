import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Field } from 'formik';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { FormLayout } from 'containers/Form/FormLayout';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Input } from 'components/UI/Form/Input/Input';
import { ColorInput } from 'components/UI/Form/ColorInput/ColorInput';
import { FileUpload } from 'components/UI/Form/FileUpload/FileUpload';
import { GET_PROVIDERS, GET_CREDENTIAL } from 'graphql/queries/Organization';
import { DELETE_ORGANIZATION, CREATE_CREDENTIAL, UPDATE_CREDENTIAL } from 'graphql/mutations/Organization';
import Settingicon from 'assets/images/icons/Settings/Settings.svg?react';
import styles from './WebChannel.module.css';

const SHORTCODE = 'web_channel';
const SettingIcon = <Settingicon />;

// The order the page saves, and the only keys it writes — a credential edited elsewhere keeps
// whatever else it holds rather than having it dropped by a save from this form.
const FIELDS = [
  'logo_url',
  'display_name',
  'primary_color',
  'secondary_color',
  'about_description',
  'about_address',
  'about_website',
  'about_email',
  'about_hours',
];

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const queries = {
  getItemQuery: GET_CREDENTIAL,
  createItemQuery: CREATE_CREDENTIAL,
  updateItemQuery: UPDATE_CREDENTIAL,
  deleteItemQuery: DELETE_ORGANIZATION,
};

const Section = ({ title, description }: { title: string; description?: string }) => (
  <div className={styles.Section}>
    <Typography variant="h5" className={styles.SectionTitle}>
      {title}
    </Typography>
    {description && <div className={styles.SectionDescription}>{description}</div>}
  </div>
);

const BrandColors = ({ keys }: { keys: any }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.ColorRow}>
      <div className={styles.ColorField}>
        <Typography variant="h6" className={styles.ColorLabel}>
          {t('Primary')}
        </Typography>
        <Field component={ColorInput} name="primary_color" fallback={keys?.primary_color?.default} />
      </div>
      <div className={styles.ColorField}>
        <Typography variant="h6" className={styles.ColorLabel}>
          {t('Secondary')}
        </Typography>
        <Field component={ColorInput} name="secondary_color" fallback={keys?.secondary_color?.default} />
      </div>
    </div>
  );
};

const ColorNote = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.Note}>
      {/* Restates the guarantee Branding.readable_on/1 implements. If one changes the other
          has to, or the page is promising something the widget no longer does. */}
      <strong>{t('Primary')}</strong> {t('drives the header, buttons, sent-message bubbles and links.')}{' '}
      <strong>{t('Secondary')}</strong>{' '}
      {t(
        'is decorative only — chip borders, selected rings and trust accents, never text. Header text auto-flips dark or light to stay legible on your primary colour.'
      )}
    </div>
  );
};

export const WebChannel = () => {
  const { t } = useTranslation();
  const [credentialId, setCredentialId] = useState(null);
  const [states, setStates] = useState<any>({});

  const { data: providerData, loading: providerLoading } = useQuery(GET_PROVIDERS, {
    variables: { filter: { shortcode: SHORTCODE } },
  });
  const { data: credentialData, loading: credentialLoading } = useQuery(GET_CREDENTIAL, {
    variables: { shortcode: SHORTCODE },
  });

  const keys = providerData?.providers?.[0] ? JSON.parse(providerData.providers[0].keys) : null;

  const setCredential = (item: any) => {
    const saved = item?.keys ? JSON.parse(item.keys) : {};
    setStates(Object.fromEntries(FIELDS.map((name) => [name, saved[name] ?? keys?.[name]?.default ?? ''])));
  };

  useEffect(() => {
    if (!keys) return;
    const credential = credentialData?.credential?.credential;
    setCredentialId(credential?.id ?? null);
    setCredential(credential);
  }, [providerData, credentialData]);

  if (providerLoading || credentialLoading) return <Loading whiteBackground />;

  const validationSchema = Yup.object().shape({
    display_name: Yup.string().required(t('Display name is required.')),
    primary_color: Yup.string()
      .required(t('Primary colour is required.'))
      .matches(HEX, t('Enter a colour like #4C3BCF.')),
    secondary_color: Yup.string()
      .required(t('Secondary colour is required.'))
      .matches(HEX, t('Enter a colour like #FF8A3D.')),
    about_email: Yup.string().email(t('Enter a valid email address.')).nullable(),
  });

  const textField = (name: string, label?: string) => ({
    component: Input,
    name,
    type: 'text',
    label,
    placeholder: '',
    inputProp: { 'data-testid': name },
  });

  const formFields = [
    {
      component: Section,
      name: '__sectionDisplayPicture',
      title: t('Display picture'),
      description: t('Shown as the avatar in chat and the hero logo on the OTP sign-in page.'),
    },
    {
      component: FileUpload,
      name: 'logo_url',
      maxSizeKb: keys?.logo_url?.max_size_kb,
      accept: keys?.logo_url?.accept,
      folder: keys?.logo_url?.upload_folder,
      helperText: keys?.logo_url?.helper_text,
    },
    {
      component: Section,
      name: '__sectionDisplayName',
      title: t('Display name'),
      description: t('The organisation name contacts see in the chat header and on the sign-in page.'),
    },
    textField('display_name'),
    {
      component: Section,
      name: '__sectionBrandColours',
      title: t('Brand colours'),
      description: t('Two colours theme the whole contact-facing surface.'),
    },
    { component: BrandColors, name: '__brandColours', keys },
    { component: ColorNote, name: '__colourNote' },
    {
      component: Section,
      name: '__sectionAbout',
      title: t('About the organisation'),
      description: t(
        'The read-only business info contacts can open from the chat menu — the web equivalent of a WhatsApp business profile.'
      ),
    },
    { ...textField('about_description', t('Description')), textArea: true, rows: 3 },
    textField('about_address', t('Address')),
    textField('about_website', t('Website')),
    textField('about_email', t('Contact email')),
    textField('about_hours', t('Hours')),
  ];

  const setPayload = (payload: any) => ({
    shortcode: SHORTCODE,
    isActive: true,
    keys: JSON.stringify(Object.fromEntries(FIELDS.map((name) => [name, payload[name] ?? '']))),
    secrets: JSON.stringify({}),
  });

  const afterSave = (data: any) => {
    const saved = data?.createCredential?.credential ?? data?.updateCredential?.credential;
    if (saved) setCredentialId(saved.id);
  };

  return (
    <FormLayout
      partialPage
      noHeading
      {...queries}
      title={t('Web channel')}
      states={states}
      setStates={setCredential}
      validationSchema={validationSchema}
      setPayload={setPayload}
      listItemName="Settings"
      dialogMessage=""
      formFields={formFields}
      redirectionLink="settings"
      cancelLink="settings"
      linkParameter="id"
      listItem="credential"
      icon={SettingIcon}
      languageSupport={false}
      type="settings"
      redirect={false}
      afterSave={afterSave}
      entityId={credentialId}
      credentialShortcode={SHORTCODE}
      customStyles={styles.Form}
    />
  );
};

export default WebChannel;
