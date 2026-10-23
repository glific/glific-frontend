import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Field } from 'formik';

import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { FormLayout } from 'containers/Form/FormLayout';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Input } from 'components/UI/Form/Input/Input';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { ColorInput } from 'components/UI/Form/ColorInput/ColorInput';
import { FileUpload } from 'components/UI/Form/FileUpload/FileUpload';
import { GET_PROVIDERS, GET_CREDENTIAL, GET_ORGANIZATION_SHORTCODE } from 'graphql/queries/Organization';
import { DELETE_ORGANIZATION, CREATE_CREDENTIAL, UPDATE_CREDENTIAL } from 'graphql/mutations/Organization';
import { copyToClipboard } from 'common/utils';
import Settingicon from 'assets/images/icons/Settings/Settings.svg?react';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';
import styles from './WebChannel.module.css';

const SHORTCODE = 'web_channel';
const SettingIcon = <Settingicon />;

// The keys this page edits, in the order a new credential saves them. The server replaces keys
// and secrets wholesale on update, so a save merges these over whatever the saved credential
// already holds rather than dropping values this form does not show.
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

const JWT_SECRETS = 'jwt_signature_secrets';

// The form edits the one secret as a plain value; the credential still stores it as a
// one-entry list under JWT_SECRETS, named as the server names the one it generates.
const SIGNING_SECRET = 'signing_secret';
const SIGNING_SECRET_NAME = 'Signing secret';

// The fixed slots an earlier version of this page saved; the server reads only the list now.
const LEGACY_JWT_KEYS = ['jwt_signature_secret_1_name', 'jwt_signature_secret_2_name'];
const LEGACY_JWT_SECRETS = ['jwt_signature_secret_1', 'jwt_signature_secret_2'];

const omit = (values: Record<string, any>, names: string[]) =>
  Object.fromEntries(Object.entries(values).filter(([name]) => !names.includes(name)));

const parseJson = (value?: string | null) => (value ? JSON.parse(value) : {});

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// HS256 needs a key of at least 32 bytes; the server ignores a shorter secret.
const MIN_SECRET_LENGTH = 32;

// Only the first entry counts: the server signs and verifies with it alone, and an earlier
// version of this page could save a second.
const signingSecretOf = (secrets: any): string => {
  const entries = secrets?.[JWT_SECRETS];
  return Array.isArray(entries) ? (entries[0]?.secret ?? '') : '';
};

const signingSecretEntries = (value?: string) => {
  const secret = value?.trim() ?? '';
  return secret ? [{ name: SIGNING_SECRET_NAME, secret }] : [];
};

const queries = {
  getItemQuery: GET_CREDENTIAL,
  createItemQuery: CREATE_CREDENTIAL,
  updateItemQuery: UPDATE_CREDENTIAL,
  deleteItemQuery: DELETE_ORGANIZATION,
};

/**
 * The address this organisation's contacts reach the widget on.
 *
 * The domain comes from the console's own host rather than a constant, because one deployment
 * of this console serves production and staging and the two are not on the same domain.
 */
export const webChannelUrl = (shortcode: string, hostname: string): string => {
  const labels = hostname.split('.');
  const domain = labels.length > 2 ? labels.slice(1).join('.') : 'glific.com';

  return `https://web.${shortcode}.${domain}`;
};

const WebChannelUrl = ({ shortcode }: { shortcode?: string }) => {
  const { t } = useTranslation();

  if (!shortcode) return null;

  const url = webChannelUrl(shortcode, window.location.hostname);

  return (
    <div className={styles.UrlPanel} data-testid="webChannelUrl">
      <div className={styles.UrlLabel}>{t('Your web channel address')}</div>
      <div className={styles.UrlRow}>
        <a href={url} target="_blank" rel="noreferrer" className={styles.Url}>
          {url}
        </a>
        <CopyIcon className={styles.CopyIcon} data-testid="copyWebChannelUrl" onClick={() => copyToClipboard(url)} />
      </div>
      <div className={styles.SectionDescription}>
        {t('Share this link with your contacts. It opens the chat in their browser.')}
      </div>
    </div>
  );
};

const Section = ({ title, description }: { title: string; description?: string }) => (
  <div className={styles.Section}>
    <h3 className={styles.SectionTitle}>{title}</h3>
    {description && <div className={styles.SectionDescription}>{description}</div>}
  </div>
);

const SigningSecretInput = ({ hasSavedSecret, ...props }: any) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div data-testid="signingSecret">
      <Input
        {...props}
        type="password"
        togglePassword={visible}
        endAdornmentCallback={() => setVisible(!visible)}
        placeholder=""
        autoComplete="new-password"
        inputProp={{ 'data-testid': 'signingSecretValue' }}
        helperText={t(
          'At least 32 characters. It can be replaced but not removed, and replacing it signs out every web user of your organisation immediately.'
        )}
      />
      {!hasSavedSecret && (
        <div className={styles.SecretEmpty} data-testid="signingSecretEmpty">
          {t('No secret yet. Glific generates one when you save with the web channel on, or you can paste your own.')}
        </div>
      )}
    </div>
  );
};

const BrandColors = ({ keys }: { keys: any }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.ColorRow}>
      <div className={styles.ColorField}>
        <div className={styles.ColorLabel}>{t('Primary')}</div>
        <Field component={ColorInput} name="primary_color" fallback={keys?.primary_color?.default} />
      </div>
      <div className={styles.ColorField}>
        <div className={styles.ColorLabel}>{t('Secondary')}</div>
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
      <strong>{t('Primary')}</strong> {t('drives the header, buttons, sent-message bubbles and links.')} <br />
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
  // Mirrors the form's own `isActive` so the field list can be rebuilt as it is toggled;
  // formFields is computed outside Formik and cannot read its values.
  const [isActive, setIsActive] = useState(false);
  const saved = useRef<{ keys: any; secrets: any }>({ keys: {}, secrets: {} });
  const [savedSecret, setSavedSecret] = useState('');
  // Mirrors the form's secret so saving a replacement can ask for confirmation first.
  const [secretDraft, setSecretDraft] = useState('');

  const { data: providerData, loading: providerLoading } = useQuery(GET_PROVIDERS, {
    variables: { filter: { shortcode: SHORTCODE } },
  });
  const { data: credentialData, loading: credentialLoading } = useQuery(GET_CREDENTIAL, {
    variables: { shortcode: SHORTCODE },
  });
  const { data: organizationData } = useQuery(GET_ORGANIZATION_SHORTCODE);

  const orgShortcode = organizationData?.organization?.organization?.shortcode;

  const provider = providerData?.providers?.[0];
  const keys = provider ? JSON.parse(provider.keys) : null;

  const setCredential = (item: any) => {
    const savedKeys = parseJson(item?.keys);
    const savedSecrets = parseJson(item?.secrets);
    const active = !!item?.isActive;

    const secret = signingSecretOf(savedSecrets);

    saved.current = { keys: savedKeys, secrets: savedSecrets };
    setSavedSecret(secret);
    setSecretDraft(secret);
    setIsActive(active);
    setStates({
      ...Object.fromEntries(FIELDS.map((name) => [name, savedKeys[name] ?? keys?.[name]?.default ?? ''])),
      [SIGNING_SECRET]: secret,
      isActive: active,
    });
  };

  useEffect(() => {
    if (!keys) return;
    const credential = credentialData?.credential?.credential;
    setCredentialId(credential?.id ?? null);
    setCredential(credential);
  }, [providerData, credentialData]);

  if (providerLoading || credentialLoading) return <Loading whiteBackground />;

  // Nothing below the toggle is on screen while the channel is off, so requiring it would
  // reject a save the admin cannot see the reason for.
  const requiredWhenActive = (schema: Yup.StringSchema, message: string) =>
    schema.when('isActive', { is: true, then: (active) => active.required(message) });

  const validationSchema = Yup.object().shape({
    display_name: requiredWhenActive(Yup.string(), t('Display name is required.')),
    primary_color: requiredWhenActive(Yup.string(), t('Primary colour is required.')).matches(HEX, {
      message: t('Enter a colour like #4C3BCF.'),
      excludeEmptyString: true,
    }),
    secondary_color: requiredWhenActive(Yup.string(), t('Secondary colour is required.')).matches(HEX, {
      message: t('Enter a colour like #FF8A3D.'),
      excludeEmptyString: true,
    }),
    about_email: Yup.string().email(t('Enter a valid email address.')).nullable(),
    // Blank is fine only while there is no secret yet, since the server then generates one.
    [SIGNING_SECRET]: Yup.string().when('isActive', {
      is: true,
      then: (schema) =>
        schema
          .test('signing-secret-kept', t('The signing secret can be replaced but not removed.'), (value) =>
            Boolean(value?.trim() || !savedSecret)
          )
          .test('signing-secret-length', t('Use at least 32 characters.'), (value) => {
            const secret = value?.trim() ?? '';
            return !secret || secret.length >= MIN_SECRET_LENGTH;
          }),
    }),
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
      component: Checkbox,
      name: 'isActive',
      title: t('Web channel is active'),
      handleChange: (value: boolean) => setIsActive(value),
      // Says only what the switch does today. Whether the channel itself is open to contacts is
      // still the web_channel_enabled feature flag's decision, not this credential's.
      info: {
        title: t('Your branding and business profile apply to the web chat only while this is on.'),
      },
    },
    { component: WebChannelUrl, name: '__webChannelUrl', shortcode: orgShortcode },
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
    {
      component: Section,
      name: '__sectionJwtSecret',
      title: t('JWT signature secret'),
      description: t(
        "Your organisation has one secret. Give it to your backend to sign contacts' login tokens (HS256 JWT), and keep it on your server only."
      ),
    },
    {
      component: SigningSecretInput,
      name: SIGNING_SECRET,
      label: t('Signing secret'),
      hasSavedSecret: !!savedSecret,
      onChange: (value: string) => setSecretDraft(value),
    },
  ];

  const setPayload = (payload: any) => ({
    shortcode: SHORTCODE,
    isActive: !!payload.isActive,
    keys: JSON.stringify({
      ...omit(saved.current.keys, LEGACY_JWT_KEYS),
      ...Object.fromEntries(FIELDS.map((name) => [name, payload[name] ?? ''])),
    }),
    secrets: JSON.stringify({
      ...omit(saved.current.secrets, LEGACY_JWT_SECRETS),
      // Never an empty list once a secret exists: the server would generate a new one and sign
      // every web user out. Edits made before switching the channel off are not on screen, so
      // they are not saved either.
      [JWT_SECRETS]: signingSecretEntries((payload.isActive && payload[SIGNING_SECRET]?.trim()) || savedSecret),
    }),
  });

  const afterSave = (data: any) => {
    const credential = data?.createCredential?.credential ?? data?.updateCredential?.credential;
    if (!credential) return;

    setCredentialId(credential.id);
    // Reloads the form from what the server stored, which includes a secret it just generated.
    setCredential({ ...credential, isActive: credential.isActive ?? isActive });
  };

  const replacesSecret = isActive && !!savedSecret && secretDraft.trim() !== savedSecret;

  // Everything except the toggle and the address is configuration for a channel that is off.
  const fields = formFields.map((field) => (field.name === 'isActive' ? field : { ...field, skip: !isActive }));

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
      formFields={fields}
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
      confirmationState={{
        show: replacesSecret,
        title: t('Replace the signing secret?'),
        message: t(
          'Every web user of your organisation is signed out as soon as you save. Switch your backend to the new secret at the same time.'
        ),
      }}
    />
  );
};

export default WebChannel;
