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

import { setNotification } from 'common/notification';
import { CALL_TO_ACTION, QUICK_REPLY, WHATSAPP_FORM } from 'common/constants';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { CreateAutoComplete } from 'components/UI/Form/CreateAutoComplete/CreateAutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';

import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_TAGS } from 'graphql/queries/Tags';
import { GET_HSM_CATEGORIES, GET_SHORTCODES } from 'graphql/queries/Template';
import { CREATE_TEMPLATE } from 'graphql/mutations/Template';

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

const MEDIA_OPTIONS: Array<{ id: MediaType; label: string; formats: string; maxSize: string; icon: React.ReactNode }> = [
  { id: 'IMAGE', label: 'Image', formats: 'JPG, PNG', maxSize: 'Max 5 MB', icon: <ImageIcon className={styles.MediaIcon} /> },
  { id: 'DOCUMENT', label: 'Document', formats: 'PDF', maxSize: 'Max 16 MB', icon: <InsertDriveFileIcon className={styles.MediaIcon} /> },
  { id: 'VIDEO', label: 'Video', formats: 'MP4', maxSize: 'Max 16 MB', icon: <VideocamIcon className={styles.MediaIcon} /> },
];

const regexForShortcode = /^[a-z0-9_]+$/;

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
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const { data: languagesData, loading: languageLoading } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });
  const { data: categoriesData, loading: categoryLoading } = useQuery(GET_HSM_CATEGORIES);
  const { data: tagsData, loading: tagLoading } = useQuery(GET_TAGS, { fetchPolicy: 'network-only' });
  const [checkShortcode] = useLazyQuery(GET_SHORTCODES);
  const [createTemplate, { loading: creating }] = useMutation(CREATE_TEMPLATE);

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

  const handleSubmit = async (values: any) => {
    const { body, footer, label, category, language, newShortcode, tagId } = values;

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
              {[CALL_TO_ACTION, QUICK_REPLY, WHATSAPP_FORM].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.ButtonTypeCard} ${selectedButtonType === type ? styles.ButtonTypeCardSelected : ''}`}
                  onClick={() => setSelectedButtonType(selectedButtonType === type ? '' : (type as ButtonTypeId))}
                  data-testid={`btnType-${type}`}
                >
                  {BUTTON_LABELS[type]}
                </button>
              ))}
            </div>
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
                  onClick={() => setSelectedMediaType(selectedMediaType === opt.id ? '' : opt.id)}
                  data-testid={`media-${opt.id}`}
                >
                  {opt.icon}
                  <span className={styles.MediaLabel}>{opt.label}</span>
                  <span className={styles.MediaFormats}>{opt.formats}</span>
                  <span className={styles.MediaSize}>{opt.maxSize}</span>
                </button>
              ))}
            </div>
            {selectedMediaType && (
              <div className={styles.Field} style={{ marginTop: 12 }}>
                <label className={styles.FieldLabel}>{t('Attachment URL')}</label>
                <input
                  className={styles.TextInput}
                  value={formik.values.attachmentURL}
                  placeholder={`https://example.com/file.${selectedMediaType === 'IMAGE' ? 'jpg' : selectedMediaType === 'DOCUMENT' ? 'pdf' : 'mp4'}`}
                  onChange={(e) => formik.setFieldValue('attachmentURL', e.target.value)}
                  data-testid="attachmentURL"
                />
              </div>
            )}
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
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplate;
