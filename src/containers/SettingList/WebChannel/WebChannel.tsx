import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { FormLayout } from 'containers/Form/FormLayout';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Input } from 'components/UI/Form/Input/Input';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { ColorInput, normalizeHex } from 'components/UI/Form/ColorInput/ColorInput';
import { FileUpload } from 'components/UI/Form/FileUpload/FileUpload';
import { GET_PROVIDERS, GET_CREDENTIAL, GET_ORGANIZATION_SHORTCODE } from 'graphql/queries/Organization';
import { DELETE_ORGANIZATION, CREATE_CREDENTIAL, UPDATE_CREDENTIAL } from 'graphql/mutations/Organization';
import { copyToClipboard } from 'common/utils';
import Settingicon from 'assets/images/icons/Settings/Settings.svg?react';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';
import { contrastRatio, isHexColour, isNearWhite, readableOn } from './branding';
import styles from './WebChannel.module.css';

const SHORTCODE = 'web_channel';

const SettingIcon = <Settingicon />;

// What the backend's Flag.web_channel_enabled? turns away once the credential is inactive.
const WHAT_STOPS =
  "Contacts can't sign in to the web chat or connect to it. Anyone who opens a link to it, including links in your web flows, is told the chat is unavailable and shown your WhatsApp number instead. Your settings are kept.";

// The keys this page edits, in the order a new credential saves them. The server replaces keys
// and secrets wholesale on update, so a save merges these over whatever the saved credential
// already holds rather than dropping values this form does not show — including the
// secondary_color an earlier version of this page edited.
const FIELDS = [
  'logo_url',
  'display_name',
  'primary_color',
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

const MAX_DISPLAY_NAME = 30;
const MAX_DESCRIPTION = 140;

// The server adds https:// to a bare domain, so "example.org" is as valid here as a full URL.
const isWebsite = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return true;

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return /^[^.\s]+(\.[^.\s]+)+$/.test(url.hostname);
  } catch {
    return false;
  }
};

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
      <div className={styles.UrlLabel}>{t('Test link · internal only')}</div>
      <div className={styles.UrlRow}>
        <a href={url} target="_blank" rel="noreferrer" className={styles.Url}>
          {url}
        </a>
        <CopyIcon className={styles.CopyIcon} data-testid="copyWebChannelUrl" onClick={() => copyToClipboard(url)} />
      </div>
      <div className={styles.SectionDescription}>
        {t(
          'Use it to check how your chat looks. Contacts reach the chat through links in your web flows, not this one.'
        )}{' '}
        <Link to="/flow" className={styles.Url} data-testid="flowsLink">
          {t('Go to Flows')}
        </Link>
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

const OffNotice = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.OffNotice} data-testid="webChannelOffNotice">
      <strong>{t('The web channel is off.')}</strong> {t(WHAT_STOPS)}
    </div>
  );
};

const CountedInput = ({ maxLength, helperText, ...props }: any) => (
  <Input
    {...props}
    inputProp={{ ...props.inputProp, maxLength }}
    helperText={
      <span className={styles.Counted}>
        <span>{helperText}</span>
        <span data-testid={`${props.field.name}Count`}>
          {props.field.value?.length ?? 0}/{maxLength}
        </span>
      </span>
    }
  />
);

const ColourPreview = ({ form }: { form: { values: any } }) => {
  const { t } = useTranslation();
  const colour = normalizeHex(form.values.primary_color ?? '');

  if (!isHexColour(colour)) return null;

  if (isNearWhite(colour)) {
    return (
      <div className={styles.ColourWarning} data-testid="colourTooLight">
        {t('This colour is too close to white. The top of the chat would blend into the page.')}
      </div>
    );
  }

  const foreground = readableOn(colour);
  const ratio = contrastRatio(colour, foreground);
  const verdict = ratio >= 4.5 ? t('Text on this colour is easy to read') : t('Text on this colour is hard to read');

  return (
    <div className={styles.Preview} data-testid="colourPreview">
      <div className={styles.PreviewHeader} style={{ backgroundColor: colour, color: foreground }}>
        {form.values.display_name || t('Your organisation')}
      </div>
      <div className={styles.PreviewBody}>
        <span className={styles.PreviewButton} style={{ backgroundColor: colour, color: foreground }}>
          {t('Send')}
        </span>
        <span className={styles.PreviewVerdict} data-testid="colourVerdict">
          {`${verdict} (${ratio.toFixed(1)}:1)`}
        </span>
      </div>
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
  const [savedActive, setSavedActive] = useState(false);
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
    setSavedActive(active);
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
    logo_url: requiredWhenActive(Yup.string(), t('Add a display picture.')),
    display_name: requiredWhenActive(Yup.string(), t('Display name is required.')).max(
      MAX_DISPLAY_NAME,
      t('Use at most {{max}} characters.', { max: MAX_DISPLAY_NAME })
    ),
    primary_color: requiredWhenActive(Yup.string(), t('Brand colour is required.'))
      .matches(HEX, { message: t('Enter a colour like #4C3BCF.'), excludeEmptyString: true })
      .test(
        'not-near-white',
        t('Pick a colour that is not this close to white.'),
        (value) => !isHexColour(normalizeHex(value ?? '')) || !isNearWhite(normalizeHex(value ?? ''))
      ),
    about_description: requiredWhenActive(Yup.string(), t('Description is required.')).max(
      MAX_DESCRIPTION,
      t('Use at most {{max}} characters.', { max: MAX_DESCRIPTION })
    ),
    about_website: requiredWhenActive(Yup.string(), t('Website is required.')).test(
      'website',
      t('Enter a link like www.example.org.'),
      isWebsite
    ),
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

  const textField = (name: string, label: string, helperText: string, example: string) => ({
    component: Input,
    name,
    type: 'text',
    label,
    helperText,
    placeholder: example,
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
    { component: OffNotice, name: '__offNotice', skip: !(credentialId && !savedActive && !isActive) },
    { component: WebChannelUrl, name: '__webChannelUrl', shortcode: orgShortcode },
    {
      component: Section,
      name: '__sectionDisplayPicture',
      title: t('Display picture'),
      description: t('Your logo, shown as the avatar in the chat and on the sign-in page. A square image works best.'),
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
      description: t('The name contacts see at the top of the chat and on the sign-in page.'),
    },
    {
      ...textField(
        'display_name',
        '',
        t('Usually your organisation name, or a short form of it.'),
        t('e.g. Akshar Foundation')
      ),
      component: CountedInput,
      maxLength: MAX_DISPLAY_NAME,
    },
    {
      component: Section,
      name: '__sectionBrandColour',
      title: t('Brand colour'),
      description: t(
        'Fills the top of the chat and its buttons. Glific picks dark or light text to go on it, so it stays readable.'
      ),
    },
    {
      component: ColorInput,
      name: 'primary_color',
      fallback: keys?.primary_color?.default,
    },
    { component: ColourPreview, name: '__colourPreview' },
    {
      component: Section,
      name: '__sectionAbout',
      title: t('About the organisation'),
      description: t(
        'The business info contacts can open from the chat menu — the web equivalent of a WhatsApp business profile.'
      ),
    },
    {
      ...textField(
        'about_description',
        t('Description'),
        t('One or two lines on what your organisation does and who it helps.'),
        t('e.g. We help young people find their first job through free skills courses.')
      ),
      component: CountedInput,
      maxLength: MAX_DESCRIPTION,
      textArea: true,
      rows: 3,
    },
    textField(
      'about_website',
      t('Website'),
      t('Contacts can open it from your profile in the chat.'),
      t('e.g. www.example.org')
    ),
    textField(
      'about_address',
      t('Address'),
      t('Optional. Where contacts can find you.'),
      t('e.g. 12 MG Road, Pune, Maharashtra')
    ),
    textField(
      'about_email',
      t('Contact email'),
      t('Optional. Where contacts can write to you.'),
      t('e.g. hello@example.org')
    ),
    textField(
      'about_hours',
      t('Any other info'),
      t('Optional. Anything else contacts should know, such as when you reply.'),
      t('e.g. We reply Monday to Saturday, 9am to 6pm.')
    ),
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
  const turnsOff = savedActive && !isActive;

  // Everything except the toggle and the off notice is configuration for a channel that is off.
  const fields = formFields.map((field) =>
    ['isActive', '__offNotice'].includes(field.name) ? field : { ...field, skip: !isActive }
  );

  const confirmation = turnsOff
    ? { show: true, title: t('Turn off the web channel?'), message: t(WHAT_STOPS) }
    : {
        show: replacesSecret,
        title: t('Replace the signing secret?'),
        message: t(
          'Every web user of your organisation is signed out as soon as you save. Switch your backend to the new secret at the same time.'
        ),
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
      confirmationState={confirmation}
    />
  );
};

export default WebChannel;
