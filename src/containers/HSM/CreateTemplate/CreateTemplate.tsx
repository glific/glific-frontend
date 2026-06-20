import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { t } from 'i18next';
import { CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VideocamIcon from '@mui/icons-material/Videocam';
import AppsIcon from '@mui/icons-material/Apps';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { setNotification } from 'common/notification';
import { CALL_TO_ACTION, QUICK_REPLY, WHATSAPP_FORM } from 'common/constants';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { CreateAutoComplete } from 'components/UI/Form/CreateAutoComplete/CreateAutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { getOrganizationServices } from 'services/AuthService';

import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_TAGS } from 'graphql/queries/Tags';
import { GET_HSM_CATEGORIES, GET_SHORTCODES } from 'graphql/queries/Template';
import { GET_WHATSAPP_FORM_DEFINITIONS } from 'graphql/queries/WhatsAppForm';
import { CREATE_TEMPLATE } from 'graphql/mutations/Template';
import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';

import styles from './CreateTemplate.module.css';

type ShortcodeStatus = 'idle' | 'checking' | 'available' | 'taken';
type ButtonTypeId = typeof CALL_TO_ACTION | typeof QUICK_REPLY | typeof WHATSAPP_FORM | '';
type MediaType = 'IMAGE' | 'DOCUMENT' | 'VIDEO' | '';

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  UTILITY: 'Account updates, order confirmations, shipping notifications, alerts, and transactional messages',
  MARKETING: 'Promotional content, offers, announcements, product launches, and sales campaigns',
  AUTHENTICATION: 'One-time passwords and verification codes for account security',
};

const BUTTON_LABELS: Record<string, string> = {
  [CALL_TO_ACTION]: 'Call to Action',
  [QUICK_REPLY]: 'Quick Reply',
  [WHATSAPP_FORM]: 'WhatsApp Form',
};

// Default shape for a freshly added button, per type (mirrors old HSM `buttonTypes`)
const BUTTON_DEFAULTS: Record<string, any> = {
  [QUICK_REPLY]: { value: '' },
  [CALL_TO_ACTION]: { type: 'phone_number', title: '', value: '' },
  [WHATSAPP_FORM]: { type: 'whatsapp_form', form_id: '', text: '', navigate_screen: '' },
};

// Maximum number of buttons allowed per type
const BUTTON_LIMITS: Record<string, number> = {
  [QUICK_REPLY]: 10,
  [CALL_TO_ACTION]: 3,
  [WHATSAPP_FORM]: 1,
};

const MEDIA_OPTIONS: Array<{
  id: MediaType;
  label: string;
  formats: string;
  maxSize: string;
  accept: string;
  uploadHint: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'IMAGE',
    label: 'Image',
    formats: 'JPG, PNG',
    maxSize: 'Max 5 MB',
    accept: 'image/*',
    uploadHint: 'JPG or PNG (max 5MB)',
    icon: <ImageIcon className={styles.MediaIcon} />,
  },
  {
    id: 'DOCUMENT',
    label: 'Document',
    formats: 'PDF',
    maxSize: 'Max 16 MB',
    accept: 'application/pdf',
    uploadHint: 'PDF (max 16MB)',
    icon: <InsertDriveFileIcon className={styles.MediaIcon} />,
  },
  {
    id: 'VIDEO',
    label: 'Video',
    formats: 'MP4',
    maxSize: 'Max 16 MB',
    accept: 'video/*',
    uploadHint: 'MP4 (max 16MB)',
    icon: <VideocamIcon className={styles.MediaIcon} />,
  },
];

const regexForShortcode = /^[a-z0-9_]+$/;

// AutoComplete expects a Formik-like form; these button rows are managed in local
// state, so we pass a stable no-op form and drive updates through `onChange`.
const emptyAutoCompleteForm = { touched: {}, errors: {}, setFieldValue: () => {} };

interface LocationState {
  mode?: 'add-language' | 'resubmit' | 'copy';
  shortcode?: string;
  templateBody?: string;
  templateCategory?: string;
  templateFooter?: string;
}

const CreateTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [shortcodeStatus, setShortcodeStatus] = useState<ShortcodeStatus>('idle');
  const [languageOptions, setLanguageOptions] = useState<any[]>([]);
  const [selectedButtonType, setSelectedButtonType] = useState<ButtonTypeId>('');
  const [templateButtons, setTemplateButtons] = useState<any[]>([]);
  const [whatsappForms, setWhatsappForms] = useState<any[]>([]);
  const [formScreens, setFormScreens] = useState<Record<string, any[]>>({});
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>('');
  const [attachmentMethod, setAttachmentMethod] = useState<'url' | 'upload'>('url');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isWhatsAppFormEnabled = getOrganizationServices('whatsappFormsEnabled');

  const { data: languagesData, loading: languageLoading } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });
  const { data: categoriesData, loading: categoryLoading } = useQuery(GET_HSM_CATEGORIES);
  const { data: tagsData, loading: tagLoading } = useQuery(GET_TAGS, { fetchPolicy: 'network-only' });
  const [checkShortcode] = useLazyQuery(GET_SHORTCODES);
  const [createTemplate, { loading: creating }] = useMutation(CREATE_TEMPLATE);
  const [uploadMedia] = useMutation(UPLOAD_MEDIA);

  useQuery(GET_WHATSAPP_FORM_DEFINITIONS, {
    variables: { filter: { status: 'PUBLISHED' } },
    fetchPolicy: 'network-only',
    skip: !isWhatsAppFormEnabled,
    onCompleted: (data) => {
      setWhatsappForms(
        (data?.listWhatsappForms ?? []).map((form: any) => ({
          label: form?.name,
          id: form?.metaFlowId,
          definition: form?.revision?.definition,
        }))
      );
    },
  });

  useEffect(() => {
    if (languagesData) {
      const langs = languagesData.currentUser.user.organization.activeLanguages.slice();
      langs.sort((a: any, b: any) => (a.label > b.label ? 1 : -1));
      setLanguageOptions(langs);
    }
  }, [languagesData]);

  const categories: string[] = categoriesData?.whatsappHsmCategories ?? [];

  const handleShortcodeCheck = (value: string) => {
    clearTimeout(debounceRef.current);
    if (!value) { setShortcodeStatus('idle'); return; }
    setShortcodeStatus('checking');
    debounceRef.current = setTimeout(async () => {
      const { data } = await checkShortcode({ variables: { filter: { isHsm: true } } });
      const taken = data?.sessionTemplates?.some((tmpl: any) => tmpl.shortcode === value);
      setShortcodeStatus(taken ? 'taken' : 'available');
    }, 300);
  };

  const insertVariable = () => {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const matches = formik.values.body.match(/{{\d+}}/g) ?? [];
    const nextNum = matches.length + 1;
    const varText = `{{${nextNum}}}`;
    const start = textarea.selectionStart ?? formik.values.body.length;
    const newBody = formik.values.body.slice(0, start) + varText + formik.values.body.slice(start);
    formik.setFieldValue('body', newBody);
    setTimeout(() => {
      const pos = start + varText.length;
      textarea.setSelectionRange(pos, pos);
      textarea.focus();
    }, 0);
  };

  // ── Media attachment handling ──
  const handleSelectMediaType = (id: MediaType) => {
    if (selectedMediaType === id) {
      clearAttachment();
      return;
    }
    setSelectedMediaType(id);
    setAttachmentMethod('url');
    setUploadedFile(null);
    formik.setFieldValue('attachmentURL', '');
  };

  const clearAttachment = () => {
    setSelectedMediaType('');
    setAttachmentMethod('url');
    setUploadedFile(null);
    setUploadingFile(false);
    formik.setFieldValue('attachmentURL', '');
  };

  const handleFileUpload = async (file: File | undefined | null) => {
    if (!file) return;
    const mediaName = file.name;
    const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
    setUploadedFile(file);
    setUploadingFile(true);
    try {
      const result = await uploadMedia({ variables: { media: file, extension } });
      formik.setFieldValue('attachmentURL', result.data.uploadMedia);
      setNotification(t('File uploaded successfully'));
    } catch {
      setUploadedFile(null);
      setNotification(t('Failed to upload file.'), 'warning');
    } finally {
      setUploadingFile(false);
    }
  };

  // ── Interactive button management (mirrors old HSM behaviour) ──
  const handleSelectButtonType = (type: ButtonTypeId) => {
    if (selectedButtonType === type) {
      // toggle off
      setSelectedButtonType('');
      setTemplateButtons([]);
      return;
    }
    setSelectedButtonType(type);
    setTemplateButtons([{ ...BUTTON_DEFAULTS[type] }]);
  };

  const addTemplateButton = () => {
    if (!selectedButtonType) return;
    if (templateButtons.length >= BUTTON_LIMITS[selectedButtonType]) return;

    const newButton = { ...BUTTON_DEFAULTS[selectedButtonType] };
    if (selectedButtonType === CALL_TO_ACTION) {
      // Only one phone number is allowed, up to two URLs — default the next button to url
      const hasPhoneNumber = templateButtons.some((btn: any) => btn.type === 'phone_number');
      const urlCount = templateButtons.filter((btn: any) => btn.type === 'url').length;
      if (hasPhoneNumber && urlCount < 2) {
        newButton.type = 'url';
      }
    }
    setTemplateButtons([...templateButtons, newButton]);
  };

  const removeTemplateButton = (index: number) => {
    setTemplateButtons(templateButtons.filter((_, idx) => idx !== index));
  };

  const updateTemplateButton = (index: number, field: string, value: string) => {
    setTemplateButtons(
      templateButtons.map((btn: any, idx: number) => {
        if (idx !== index) return btn;
        // Switching the call-to-action type resets title/value (matches old UI)
        if (field === 'type') return { type: value, title: '', value: '' };
        return { ...btn, [field]: value };
      })
    );
  };

  const handleSelectForm = (index: number, form: any) => {
    if (!form) return;
    let screens: any[] = [];
    try {
      const definition = JSON.parse(form.definition);
      screens = (definition?.screens ?? []).map((screen: any) => ({ label: screen.id, id: screen.id }));
    } catch {
      screens = [];
    }
    setFormScreens((prev) => ({ ...prev, [index]: screens }));
    setTemplateButtons(
      templateButtons.map((btn: any, idx: number) =>
        idx === index ? { ...btn, form_id: form.id, navigate_screen: '' } : btn
      )
    );
  };

  // Build the gupshup-format button payload (mirrors old HSM `getButtonTemplatePayload`)
  const buildButtonsPayload = () =>
    templateButtons.reduce((result: any[], button: any) => {
      const { type, value, title, text, form_id, navigate_screen } = button;
      if (selectedButtonType === CALL_TO_ACTION) {
        const typeMap: Record<string, string> = { phone_number: 'PHONE_NUMBER', url: 'URL' };
        result.push({ type: typeMap[type], text: title, [type]: value });
      }
      if (selectedButtonType === QUICK_REPLY) {
        result.push({ type: QUICK_REPLY, text: value });
      }
      if (selectedButtonType === WHATSAPP_FORM) {
        result.push({ type: 'FLOW', navigate_screen, text, flow_id: form_id, flow_action: 'NAVIGATE' });
      }
      return result;
    }, []);

  // Validate that every button row has its required fields filled
  const getButtonValidationError = (): string | null => {
    if (!selectedButtonType || templateButtons.length === 0) return null;
    if (selectedButtonType === CALL_TO_ACTION) {
      const incomplete = templateButtons.some((b: any) => !b.title?.trim() || !b.value?.trim());
      if (incomplete) return 'Please fill in the title and value for every Call to Action button.';
    }
    if (selectedButtonType === QUICK_REPLY) {
      const incomplete = templateButtons.some((b: any) => !b.value?.trim());
      if (incomplete) return 'Please enter text for every Quick Reply button.';
    }
    if (selectedButtonType === WHATSAPP_FORM) {
      const incomplete = templateButtons.some(
        (b: any) => !b.form_id || !b.navigate_screen || !b.text?.trim()
      );
      if (incomplete) return 'Please complete the form, screen and button title for the WhatsApp Form button.';
    }
    return null;
  };

  const handleSubmit = async (values: any) => {
    const { body, footer, label, category, language, newShortcode, tagId } = values;

    const buttonError = getButtonValidationError();
    if (buttonError) {
      setNotification(buttonError, 'warning');
      return;
    }

    if (selectedMediaType && !values.attachmentURL) {
      setNotification('Please provide an attachment URL or upload a file.', 'warning');
      return;
    }
    if (uploadingFile) {
      setNotification('Please wait for the file upload to finish.', 'warning');
      return;
    }

    const buildExample = (text: string) =>
      text.replace(/{{\d+}}/g, (m) => {
        const n = parseInt(m.replace(/[{}]/g, '')) - 1;
        return variableValues[n] ? `[${variableValues[n]}]` : m;
      });

    const input: any = {
      label,
      body,
      languageId: language?.id,
      category,
      shortcode: newShortcode,
      isHsm: true,
      example: buildExample(body),
      type: selectedMediaType || 'TEXT',
      isActive: true,
    };

    if (footer?.trim()) input.footer = footer.trim();
    if (tagId?.id) input.tagId = tagId.id;
    if (selectedMediaType && values.attachmentURL) {
      input.attachmentURL = values.attachmentURL;
    }

    if (selectedButtonType && templateButtons.length > 0) {
      input.hasButtons = true;
      input.buttonType = selectedButtonType;
      input.buttons = JSON.stringify(buildButtonsPayload());
    }

    try {
      const { data } = await createTemplate({ variables: { input } });
      if (data?.createSessionTemplate?.errors?.length) {
        setNotification(t('Failed to create template. Please check your input.'), 'warning');
        return;
      }
      setNotification(t('Template submitted for approval.'));
      navigate('/template-v2');
    } catch {
      setNotification(t('Failed to create template.'), 'warning');
    }
  };

  const formik = useFormik({
    initialValues: {
      language: null as any,
      newShortcode: locationState?.shortcode ?? '',
      label: '',
      category: locationState?.templateCategory ?? '',
      body: locationState?.templateBody ?? '',
      footer: locationState?.templateFooter ?? '',
      tagId: null as any,
      attachmentURL: '',
    },
    validationSchema: Yup.object({
      language: Yup.object().nullable().required('Language is required.'),
      newShortcode: Yup.string()
        .required('Element name is required.')
        .matches(regexForShortcode, 'Only lowercase alphanumeric characters and underscores are allowed.'),
      label: Yup.string().required('Title is required.').max(50, 'Title length is too long.'),
      category: Yup.string().required('Category is required.'),
      body: Yup.string().required('Message is required.').max(1024, 'Maximum 1024 characters are allowed'),
      footer: Yup.string().max(60, 'Footer value can be at most 60 characters'),
    }),
    onSubmit: handleSubmit,
  });

  // Extract variable placeholders from body
  const variableCount = useMemo(() => {
    const matches = formik.values.body.match(/{{\d+}}/g) ?? [];
    return matches.length;
  }, [formik.values.body]);

  const [variableValues, setVariableValues] = useState<string[]>([]);
  useEffect(() => {
    setVariableValues((prev) => {
      const next = [...prev];
      while (next.length < variableCount) next.push('');
      return next.slice(0, variableCount);
    });
  }, [variableCount]);

  // Labels shown for the buttons in the live preview
  const previewButtonLabels = useMemo(() => {
    return templateButtons
      .map((btn: any) => {
        if (selectedButtonType === CALL_TO_ACTION) return btn.title;
        if (selectedButtonType === QUICK_REPLY) return btn.value;
        if (selectedButtonType === WHATSAPP_FORM) return btn.text;
        return '';
      })
      .filter((label: string) => label && label.trim());
  }, [templateButtons, selectedButtonType]);

  // Live preview body
  const previewBody = useMemo(() => {
    let text = formik.values.body;
    variableValues.forEach((val, i) => {
      text = text.replace(`{{${i + 1}}}`, val ? `[${val}]` : `{{${i + 1}}}`);
    });
    return text;
  }, [formik.values.body, variableValues]);

  if (languageLoading || categoryLoading || tagLoading) return <Loading />;

  const isSubmitDisabled =
    creating || shortcodeStatus === 'taken' || shortcodeStatus === 'checking';

  return (
    <div className={styles.Page}>
      {/* Page header */}
      <button className={styles.BackLink} type="button" onClick={() => navigate('/template-v2')} data-testid="backBtn">
        <ArrowBackIcon fontSize="small" />
        {t('Back to templates')}
      </button>

      <div className={styles.TitleRow}>
        <h1 className={styles.PageTitle}>{t('Create HSM Template')}</h1>
        <InfoOutlinedIcon className={styles.InfoIcon} fontSize="small" />
      </div>
      <p className={styles.PageSubtitle}>
        {t('Fill in the details below to create a new template for WhatsApp Business messaging')}
      </p>

      <form onSubmit={formik.handleSubmit} className={styles.ContentGrid}>
        {/* ── Left column ── */}
        <div className={styles.FormColumn}>

          {/* Card: Template Details */}
          <div className={styles.Card}>
            <div className={styles.CardHeaderRow}>
              <h2 className={styles.CardTitle}>{t('Template Details')}</h2>
              <button
                type="button"
                className={styles.LibraryBtn}
                onClick={() => {}}
                data-testid="templateLibraryBtn"
              >
                <AppsIcon fontSize="small" />
                {t('Template library')}
              </button>
            </div>

            {/* Language */}
            <div className={styles.Field}>
              <label className={styles.FieldLabel}>
                {t('Language')} <span className={styles.Required}>*</span>
              </label>
              <AutoComplete
                field={{ name: 'language', value: formik.values.language }}
                form={formik}
                options={languageOptions}
                optionLabel="label"
                multiple={false}
                placeholder="Select language..."
              />
              {formik.touched.language && formik.errors.language && (
                <span className={styles.FieldError}>{formik.errors.language as string}</span>
              )}
              <span className={styles.FieldHint}>
                {t('Choose the primary language for this template. You can add more languages after creating it.')}
              </span>
            </div>

            {/* Element Name */}
            <div className={styles.Field}>
              <label className={styles.FieldLabel}>
                {t('Element Name')} <span className={styles.Required}>*</span>
              </label>
              <input
                className={`${styles.TextInput} ${formik.touched.newShortcode && formik.errors.newShortcode ? styles.InputError : ''}`}
                name="newShortcode"
                value={formik.values.newShortcode}
                onBlur={formik.handleBlur}
                placeholder="e.g., order_confirmation"
                onChange={(e) => {
                  formik.setFieldValue('newShortcode', e.target.value);
                  handleShortcodeCheck(e.target.value);
                }}
                data-testid="shortcodeInput"
              />
              {shortcodeStatus !== 'idle' && (
                <div className={`${styles.ShortcodeStatus} ${styles[`Status_${shortcodeStatus}`]}`} data-testid="shortcodeStatus">
                  {shortcodeStatus === 'checking' && <><CircularProgress size={11} /><span>{t('Checking availability…')}</span></>}
                  {shortcodeStatus === 'available' && <><CheckCircleIcon className={styles.StatusIcon} /><span>{t('Template ID is available')}</span></>}
                  {shortcodeStatus === 'taken' && <><CancelIcon className={styles.StatusIcon} /><span>{t('Template ID already taken')}</span></>}
                </div>
              )}
              {formik.touched.newShortcode && formik.errors.newShortcode && (
                <span className={styles.FieldError}>{formik.errors.newShortcode}</span>
              )}
              <span className={styles.FieldHint}>
                {t('Only lowercase letters, numbers, and underscores allowed — e.g., order_confirmation')}
              </span>
            </div>

            {/* Category */}
            <div className={styles.Field}>
              <label className={styles.FieldLabel}>
                {t('Category')} <span className={styles.Required}>*</span>
              </label>
              <div className={styles.CategoryGrid}>
                {(categories.length > 0 ? categories : ['UTILITY', 'MARKETING']).map((cat) => (
                  <label
                    key={cat}
                    className={`${styles.CategoryCard} ${formik.values.category === cat ? styles.CategoryCardSelected : ''}`}
                    data-testid={`category-${cat}`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={formik.values.category === cat}
                      onChange={() => formik.setFieldValue('category', cat)}
                      className={styles.RadioHidden}
                    />
                    <span className={`${styles.RadioCircle} ${formik.values.category === cat ? styles.RadioCircleSelected : ''}`} />
                    <div>
                      <div className={styles.CategoryName}>
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </div>
                      {CATEGORY_DESCRIPTIONS[cat] && (
                        <div className={styles.CategoryDesc}>{CATEGORY_DESCRIPTIONS[cat]}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {formik.touched.category && formik.errors.category && (
                <span className={styles.FieldError}>{formik.errors.category}</span>
              )}
            </div>

            {/* Title / Label */}
            <div className={styles.Field}>
              <label className={styles.FieldLabel}>
                {t('Title')} <span className={styles.Required}>*</span>
              </label>
              <input
                className={`${styles.TextInput} ${formik.touched.label && formik.errors.label ? styles.InputError : ''}`}
                name="label"
                value={formik.values.label}
                onBlur={formik.handleBlur}
                placeholder="e.g., Welcome message"
                onChange={(e) => formik.setFieldValue('label', e.target.value)}
                data-testid="labelInput"
              />
              {formik.touched.label && formik.errors.label && (
                <span className={styles.FieldError}>{formik.errors.label}</span>
              )}
              <span className={styles.FieldHint}>
                {t('Define what use case does this template serve eg. OTP, optin, activity preference')}
              </span>
            </div>
          </div>

          {/* Card: Message Content */}
          <div className={styles.Card}>
            <h2 className={styles.CardTitle}>{t('Message Content')}</h2>

            {/* Body */}
            <div className={styles.Field}>
              <label className={styles.FieldLabel}>
                {t('Message Body')} <span className={styles.Required}>*</span>
              </label>
              <div className={`${styles.BodyBox} ${formik.touched.body && formik.errors.body ? styles.BodyBoxError : ''}`}>
                <textarea
                  ref={bodyRef}
                  className={styles.BodyTextarea}
                  name="body"
                  value={formik.values.body}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your message template here..."
                  onChange={(e) => formik.setFieldValue('body', e.target.value)}
                  rows={5}
                  data-testid="bodyInput"
                />
                <div className={styles.BodyToolbar}>
                  <div className={styles.BodyFormats}>
                    <button type="button" className={styles.FormatBtn} title="Bold"><FormatBoldIcon fontSize="small" /></button>
                    <button type="button" className={styles.FormatBtn} title="Italic"><FormatItalicIcon fontSize="small" /></button>
                    <button type="button" className={styles.FormatBtn} title="Strikethrough"><StrikethroughSIcon fontSize="small" /></button>
                    <button type="button" className={styles.AddVarBtn} onClick={insertVariable} data-testid="addVariableBtn">
                      <AddIcon fontSize="small" /> {t('Add Variable')}
                    </button>
                    <button type="button" className={styles.AiAssistBtn} data-testid="aiAssistBtn">
                      <AutoFixHighIcon fontSize="small" /> {t('AI Assist')}
                    </button>
                  </div>
                  <span className={`${styles.CharCount} ${formik.values.body.length > 1024 ? styles.CharCountOver : ''}`}>
                    {formik.values.body.length} / 1024
                  </span>
                </div>
              </div>
              {formik.touched.body && formik.errors.body && (
                <span className={styles.FieldError}>{formik.errors.body}</span>
              )}

              {/* Variable example values */}
              {variableCount > 0 && (
                <div className={styles.VariableSection}>
                  {variableValues.map((val, i) => (
                    <div key={i} className={styles.VariableRow}>
                      <span className={styles.VariableLabel}>{`{{${i + 1}}}`}</span>
                      <input
                        className={styles.VariableInput}
                        placeholder={`Example value for {{${i + 1}}}`}
                        value={val}
                        onChange={(e) => {
                          const next = [...variableValues];
                          next[i] = e.target.value;
                          setVariableValues(next);
                        }}
                        data-testid={`variable-${i + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.Field}>
              <label className={styles.FieldLabel}>
                {t('Footer')} <HelpOutlineIcon fontSize="inherit" className={styles.HelpIcon} />
              </label>
              <input
                className={styles.TextInput}
                name="footer"
                value={formik.values.footer}
                onBlur={formik.handleBlur}
                placeholder="e.g., Powered by YourCompany | Reply STOP to unsubscribe"
                onChange={(e) => formik.setFieldValue('footer', e.target.value)}
                data-testid="footerInput"
              />
              <div className={styles.FooterMeta}>
                <span className={styles.FieldHint}>{t('Common uses: company name, opt-out instructions, or legal disclaimers')}</span>
                <span className={`${styles.CharCount} ${formik.values.footer.length > 60 ? styles.CharCountOver : ''}`}>
                  {formik.values.footer.length} / 60
                </span>
              </div>
              {formik.touched.footer && formik.errors.footer && (
                <span className={styles.FieldError}>{formik.errors.footer}</span>
              )}
            </div>
          </div>

          {/* Card: Interactive Buttons */}
          <div className={styles.Card}>
            <div className={styles.CardHeaderRow}>
              <h2 className={styles.CardTitle}>{t('Interactive Buttons')}</h2>
              <HelpOutlineIcon fontSize="small" className={styles.HelpIcon} />
            </div>
            <label className={styles.FieldLabel}>{t('Button Type')}</label>
            <div className={styles.ButtonTypeRow}>
              {[CALL_TO_ACTION, QUICK_REPLY, ...(isWhatsAppFormEnabled ? [WHATSAPP_FORM] : [])].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.ButtonTypeCard} ${selectedButtonType === type ? styles.ButtonTypeCardSelected : ''}`}
                  onClick={() => handleSelectButtonType(type as ButtonTypeId)}
                  data-testid={`btnType-${type}`}
                >
                  {BUTTON_LABELS[type]}
                </button>
              ))}
            </div>

            {/* Button rows for the selected type */}
            {selectedButtonType && (
              <div className={styles.ButtonRows} data-testid="buttonRows">
                {templateButtons.map((btn, index) => {
                  const phoneNumberCount = templateButtons.filter((b: any) => b.type === 'phone_number').length;
                  const urlCount = templateButtons.filter((b: any) => b.type === 'url').length;

                  if (selectedButtonType === CALL_TO_ACTION) {
                    return (
                      <div key={index} className={styles.ButtonRow} data-testid="callToActionRow">
                        <div className={styles.ButtonRowHeader}>
                          <div className={styles.ButtonRowRadios}>
                            <label className={styles.RadioOption}>
                              <input
                                type="radio"
                                name={`cta-type-${index}`}
                                checked={btn.type === 'phone_number'}
                                disabled={btn.type !== 'phone_number' && phoneNumberCount >= 1}
                                onChange={() => updateTemplateButton(index, 'type', 'phone_number')}
                              />
                              {t('Phone number')}
                            </label>
                            <label className={styles.RadioOption}>
                              <input
                                type="radio"
                                name={`cta-type-${index}`}
                                checked={btn.type === 'url'}
                                disabled={btn.type !== 'url' && urlCount >= 2}
                                onChange={() => updateTemplateButton(index, 'type', 'url')}
                              />
                              {t('URL')}
                            </label>
                          </div>
                          {templateButtons.length > 1 && (
                            <button
                              type="button"
                              className={styles.RemoveRowBtn}
                              onClick={() => removeTemplateButton(index)}
                              data-testid={`removeButton-${index}`}
                              title={t('Remove')}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </button>
                          )}
                        </div>
                        <input
                          className={styles.TextInput}
                          placeholder={t('Button Title')}
                          value={btn.title}
                          onChange={(e) => updateTemplateButton(index, 'title', e.target.value)}
                          data-testid={`buttonTitle-${index}`}
                        />
                        <input
                          className={styles.TextInput}
                          placeholder={btn.type === 'phone_number' ? t('Phone number') : t('Website URL')}
                          value={btn.value}
                          onChange={(e) => updateTemplateButton(index, 'value', e.target.value)}
                          data-testid={`buttonValue-${index}`}
                        />
                      </div>
                    );
                  }

                  if (selectedButtonType === QUICK_REPLY) {
                    return (
                      <div key={index} className={styles.QuickReplyRow} data-testid="quickReplyRow">
                        <input
                          className={styles.TextInput}
                          placeholder={`${t('Quick reply')} ${index + 1}`}
                          value={btn.value}
                          onChange={(e) => updateTemplateButton(index, 'value', e.target.value)}
                          data-testid={`quickReply-${index}`}
                        />
                        {templateButtons.length > 1 && (
                          <button
                            type="button"
                            className={styles.RemoveRowBtn}
                            onClick={() => removeTemplateButton(index)}
                            data-testid={`removeButton-${index}`}
                            title={t('Remove')}
                          >
                            <CloseIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    );
                  }

                  // WHATSAPP_FORM
                  return (
                    <div key={index} className={styles.ButtonRow} data-testid="whatsappFormRow">
                      <div data-testid={`formSelect-${index}`}>
                        <AutoComplete
                          field={{ name: 'form', value: whatsappForms.find((f) => f.id === btn.form_id) || null }}
                          form={emptyAutoCompleteForm}
                          options={whatsappForms}
                          optionLabel="label"
                          multiple={false}
                          placeholder="Select form..."
                          onChange={(value: any) => handleSelectForm(index, value)}
                        />
                      </div>
                      <div data-testid={`screenSelect-${index}`}>
                        <AutoComplete
                          field={{
                            name: 'screen',
                            value: (formScreens[index] ?? []).find((s) => s.id === btn.navigate_screen) || null,
                          }}
                          form={emptyAutoCompleteForm}
                          options={formScreens[index] ?? []}
                          optionLabel="label"
                          multiple={false}
                          disabled={!btn.form_id}
                          placeholder="Select screen..."
                          onChange={(value: any) =>
                            updateTemplateButton(index, 'navigate_screen', value?.id ?? '')
                          }
                        />
                      </div>
                      <input
                        className={styles.TextInput}
                        placeholder={t('Button Title')}
                        value={btn.text}
                        onChange={(e) => updateTemplateButton(index, 'text', e.target.value)}
                        data-testid={`formButtonTitle-${index}`}
                      />
                    </div>
                  );
                })}

                {templateButtons.length < BUTTON_LIMITS[selectedButtonType] && (
                  <button
                    type="button"
                    className={styles.AddButtonBtn}
                    onClick={addTemplateButton}
                    data-testid="addButton"
                  >
                    <AddIcon fontSize="small" /> {t('Add button')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card: Media Attachment */}
          <div className={styles.Card}>
            <h2 className={styles.CardTitle}>{t('Media Attachment')}</h2>
            <p className={styles.FieldHint}>
              {t('Supported formats: Image (JPG, PNG), Document (PDF), Video (MP4)')} · {t('Not supported: Audio, Stickers')}
            </p>
            <label className={styles.FieldLabel}>{t('Attachment Type')}</label>
            <div className={styles.MediaGrid}>
              {MEDIA_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.MediaCard} ${selectedMediaType === opt.id ? styles.MediaCardSelected : ''}`}
                  onClick={() => handleSelectMediaType(opt.id)}
                  data-testid={`media-${opt.id}`}
                >
                  {opt.icon}
                  <span className={styles.MediaLabel}>{opt.label}</span>
                  <span className={styles.MediaFormats}>{opt.formats}</span>
                  <span className={styles.MediaSize}>{opt.maxSize}</span>
                </button>
              ))}
            </div>

            {selectedMediaType &&
              (() => {
                const activeOption = MEDIA_OPTIONS.find((opt) => opt.id === selectedMediaType)!;
                return (
                  <>
                    <button
                      type="button"
                      className={styles.ClearAttachmentBtn}
                      onClick={clearAttachment}
                      data-testid="clearAttachment"
                    >
                      {t('Clear attachment selection')}
                    </button>

                    <label className={styles.FieldLabel} style={{ marginTop: 16 }}>
                      {t('How would you like to provide the attachment?')}
                    </label>
                    <div className={styles.AttachmentMethodRow}>
                      <button
                        type="button"
                        className={`${styles.AttachmentMethodBtn} ${attachmentMethod === 'url' ? styles.AttachmentMethodBtnSelected : ''}`}
                        onClick={() => setAttachmentMethod('url')}
                        data-testid="methodUrl"
                      >
                        {t('Provide URL')}
                      </button>
                      <button
                        type="button"
                        className={`${styles.AttachmentMethodBtn} ${attachmentMethod === 'upload' ? styles.AttachmentMethodBtnSelected : ''}`}
                        onClick={() => setAttachmentMethod('upload')}
                        data-testid="methodUpload"
                      >
                        {t('Upload File')}
                      </button>
                    </div>

                    {attachmentMethod === 'url' ? (
                      <div className={styles.Field} style={{ marginTop: 16 }}>
                        <label className={styles.FieldLabel}>
                          {t('Attachment URL')} <span className={styles.Required}>*</span>
                        </label>
                        <input
                          className={styles.TextInput}
                          value={formik.values.attachmentURL}
                          placeholder={`https://example.com/file.${selectedMediaType === 'IMAGE' ? 'jpg' : selectedMediaType === 'DOCUMENT' ? 'pdf' : 'mp4'}`}
                          onChange={(e) => formik.setFieldValue('attachmentURL', e.target.value)}
                          data-testid="attachmentURL"
                        />
                        <span className={styles.FieldHint}>
                          {t(
                            'Provide a sample attachment URL for approval. You can send different content when using the template.'
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className={styles.Field} style={{ marginTop: 16 }}>
                        <label className={styles.FieldLabel}>
                          {t('Upload File')} <span className={styles.Required}>*</span>
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={activeOption.accept}
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(e.target.files?.[0])}
                          data-testid="fileInput"
                        />
                        <div
                          className={styles.Dropzone}
                          role="button"
                          tabIndex={0}
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleFileUpload(e.dataTransfer.files?.[0]);
                          }}
                          data-testid="dropzone"
                        >
                          {uploadingFile ? (
                            <>
                              <CircularProgress size={28} />
                              <span className={styles.DropzoneTitle}>{t('Uploading…')}</span>
                            </>
                          ) : uploadedFile && formik.values.attachmentURL ? (
                            <>
                              <CheckCircleOutlineIcon className={styles.DropzoneSuccessIcon} />
                              <span className={styles.DropzoneTitle}>{uploadedFile.name}</span>
                              <span className={styles.DropzoneHint}>{t('Click to replace')}</span>
                            </>
                          ) : (
                            <>
                              {activeOption.icon}
                              <span className={styles.DropzoneTitle}>{t('Click to upload or drag and drop')}</span>
                              <span className={styles.DropzoneHint}>{activeOption.uploadHint}</span>
                            </>
                          )}
                        </div>
                        <span className={styles.FieldHint}>
                          {t(
                            'Upload a sample file for approval. You can send different content when using the template.'
                          )}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
          </div>

          {/* Card: Organization & Tags */}
          <div className={styles.Card}>
            <h2 className={styles.CardTitle}>{t('Organization & Tags')}</h2>
            <div className={styles.Field}>
              <label className={styles.FieldLabel}>
                {t('Tag')} <span className={styles.Optional}>({t('optional')})</span>
              </label>
              <CreateAutoComplete
                field={{ name: 'tagId', value: formik.values.tagId }}
                form={formik}
                options={tagsData?.tags ?? []}
                optionLabel="label"
                multiple={false}
                placeholder="Search or create a tag..."
                hasCreateOption
              />
              <span className={styles.FieldHint}>
                {t('Pick a suggestion or type your own — tags help you filter and organise templates later.')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.Actions}>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`${styles.SubmitBtn} ${isSubmitDisabled ? styles.SubmitBtnDisabled : styles.SubmitBtnActive}`}
              data-testid="submitBtn"
            >
              {creating ? <CircularProgress size={16} color="inherit" /> : t('Submit for Approval')}
            </button>
            <button
              type="button"
              className={styles.CancelBtn}
              onClick={() => navigate('/template-v2')}
              data-testid="cancelBtn"
            >
              {t('Cancel')}
            </button>
          </div>
        </div>

        {/* ── Right column: Live Preview ── */}
        <div className={styles.PreviewColumn}>
          <div className={styles.PreviewCard}>
            <div className={styles.PreviewHeader}>
              <span className={styles.PreviewTitle}>{t('Live Preview')}</span>
              <span className={styles.PreviewEmoji}>😊</span>
            </div>
            <div className={styles.PhoneScreen}>
              <div className={`${styles.MessageBubble} ${!previewBody ? styles.MessageBubblePlaceholder : ''}`}>
                {previewBody || t('Your message will appear here...')}
                {formik.values.footer && (
                  <div className={styles.PreviewFooter}>{formik.values.footer}</div>
                )}
              </div>
              {selectedButtonType && previewButtonLabels.length > 0 && (
                <div className={styles.PreviewButtons}>
                  {previewButtonLabels.map((labelText, i) => (
                    <div key={i} className={styles.PreviewButton}>
                      {labelText}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplate;
