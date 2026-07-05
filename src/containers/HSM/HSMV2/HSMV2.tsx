import { useMutation, useQuery } from '@apollo/client';
import { FormHelperText } from '@mui/material';
import Upload from '@mui/icons-material/Upload';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Field } from 'formik';
import * as Yup from 'yup';

import { BUTTON_OPTIONS } from 'common/constants';
import { validateMedia } from 'common/utils';
import { setNotification } from 'common/notification';
import { templateInfo } from 'common/HelpData';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { CreateAutoComplete } from 'components/UI/Form/CreateAutoComplete/CreateAutoComplete';
import { EmojiInput } from 'components/UI/Form/EmojiInput/EmojiInput';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';
import Simulator from 'components/simulator/Simulator';
import { FormLayout } from 'containers/Form/FormLayout';
import { TemplateOptions } from 'containers/TemplateOptions/TemplateOptions';
import { getOrganizationServices } from 'services/AuthService';

import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_TAGS } from 'graphql/queries/Tags';
import { GET_HSM_CATEGORIES } from 'graphql/queries/Template';
import { CREATE_MEDIA_MESSAGE, UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import { CREATE_TEMPLATE, UPDATE_TEMPLATE } from 'graphql/mutations/Template';

import { TemplateVariables } from '../TemplateVariables/TemplateVariables';
import {
  convertButtonsToTemplate,
  getExampleFromBody,
  getVariables,
  getExampleValue,
  getTemplateAndButtons,
  mediaOptions,
  CallToActionTemplate,
  QuickReplyTemplate,
  WhatsappFormTemplate,
} from '../HSM.helper';
import {
  queries,
  templateIcon,
  dialogMessage,
  categoryDescriptions,
  titleCase,
  attachmentTileMeta,
  getField,
  renderTextField,
  getTemplateAndButton,
  buildTemplatePayload,
  buildSimulatorMessage,
  buildTemplateButtonsList,
  buildUpdatedButtons,
  buildValidationSchema,
} from './HSMV2.helper';
import styles from './HSMV2.module.css';

export const HSMV2 = () => {
  const location: any = useLocation();
  const navigate = useNavigate();
  const [language, setLanguageId] = useState<any>(null);
  const [label, setLabel] = useState('');
  const [body, setBody] = useState<any>('');
  const [type, setType] = useState<any>(null);
  const [attachmentURL, setAttachmentURL] = useState<any>('');
  const [attachmentMethod, setAttachmentMethod] = useState<'url' | 'upload'>('url');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [category, setCategory] = useState<any>([]);
  const [footer, setFooter] = useState('');
  const [tagId, setTagId] = useState<any>(location.state?.tag || null);
  const [variables, setVariables] = useState<any>([]);
  const [editorState, setEditorState] = useState<any>('');
  const [templateButtons, setTemplateButtons] = useState<
    Array<CallToActionTemplate | QuickReplyTemplate | WhatsappFormTemplate>
  >([]);
  const [isAddButtonChecked, setIsAddButtonChecked] = useState(false);
  const [newShortcode, setNewShortcode] = useState('');
  const [languageOptions, setLanguageOptions] = useState<any>([]);
  const [validatingURL, setValidatingURL] = useState<boolean>(false);
  const [isUrlValid, setIsUrlValid] = useState<any>();
  const [templateType, setTemplateType] = useState<any>(BUTTON_OPTIONS[0]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [showUploadButton, setShowUploadButton] = useState<boolean>(false);
  const [sampleMessages, setSampleMessages] = useState({
    type: 'TEXT',
    location: null,
    media: {},
    body: '',
    footer: '',
  });
  const { t } = useTranslation();
  const params = useParams();
  let backButton = location.state?.tag?.label ? `template-v2?tag=${location.state?.tag?.label}` : 'template-v2';

  const { data: categoryList, loading: categoryLoading } = useQuery(GET_HSM_CATEGORIES);

  const { data: tag, loading: tagLoading } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const { data: languages, loading: languageLoading } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });
  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE);
  const [uploadMedia] = useMutation(UPLOAD_MEDIA);

  const resetUploadState = (): void => {
    setUploadingFile(false);
    setUploadedFile(null);
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    if (!file) return;

    const mediaName = file.name;
    const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);

    setUploadedFile(file);
    setUploadingFile(true);

    const fileType = file.type.split('/')[0].toUpperCase();
    if (['IMAGE', 'VIDEO'].includes(fileType)) {
      setType({ id: fileType, label: fileType });
    } else if (file.type === 'application/pdf') {
      setType({ id: 'DOCUMENT', label: 'DOCUMENT' });
    }

    try {
      const result = await uploadMedia({ variables: { media: file, extension } });
      setAttachmentURL(result.data.uploadMedia);
      setNotification('File uploaded successfully');
      setUploadingFile(false);
    } catch (error) {
      console.error('Upload error:', error);
      setNotification('File upload failed. Please try again.', 'error');
      resetUploadState();
    }
  };

  let isEditing = false;
  let mode;
  const copyMessage = t('Copy of the template has been created!');

  const isCopyState = location.state === 'copy';
  if (isCopyState) {
    queries.updateItemQuery = CREATE_TEMPLATE;
    mode = 'copy';
  } else {
    queries.updateItemQuery = UPDATE_TEMPLATE;
  }
  if (params.id && !isCopyState) {
    isEditing = true;
  }

  const categoryOpn: any = [];
  if (categoryList) {
    categoryList.whatsappHsmCategories.forEach((categories: any, index: number) => {
      categoryOpn.push({ label: categories, id: index });
    });
  }

  const states = {
    language,
    label,
    body,
    footer,
    type,
    attachmentURL,
    category,
    tagId,
    isActive,
    templateButtons,
    isAddButtonChecked,
    variables,
    newShortcode,
  };

  const getLanguageId = (value: any) => {
    if (!value.label) {
      return;
    }
    const selected = languageOptions.find((option: any) => option.label === value.label);
    setLanguageId(selected);
  };

  const handleDynamicParamsChange = (value: any, index: number) => {
    setTemplateButtons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...value };
      return updated;
    });
  };

  const setStates = ({
    isActive: isActiveValue,
    language: languageIdValue,
    label: labelValue,
    body: bodyValue,
    footer: footerValue,
    example: exampleValue,
    type: typeValue,
    MessageMedia: MessageMediaValue,
    shortcode: shortcodeValue,
    category: categoryValue,
    tag: tagIdValue,
    buttonType: templateButtonType,
    buttons,
    hasButtons,
  }: any) => {
    let vars: any = [];

    if (languageOptions.length > 0 && languageIdValue) {
      if (!language?.id) {
        const selectedLangauge = languageOptions.find((lang: any) => lang.id === languageIdValue.id);
        setLanguageId(selectedLangauge);
      } else {
        setLanguageId(language);
      }
    }

    if (isCopyState) {
      setLabel(`Copy of ${labelValue}`);
    } else {
      setLabel(labelValue);
      setNewShortcode(shortcodeValue);
      setIsActive(isActiveValue);
    }

    setBody(bodyValue);
    setFooter(footerValue || '');
    setEditorState(bodyValue);
    setCategory(categoryValue);
    setTagId(tagIdValue);
    vars = getExampleValue(exampleValue);
    setVariables(vars);
    setSampleMessages((prev) => ({ ...prev, body: getExampleFromBody(bodyValue, vars) }));

    if (hasButtons) {
      const { buttons: buttonsVal } = getTemplateAndButtons(templateButtonType, exampleValue, buttons);
      setTemplateButtons(buttonsVal);
      setTemplateType(BUTTON_OPTIONS.find((btn: any) => btn.id === templateButtonType));
      setIsAddButtonChecked(hasButtons);
      const parse = convertButtonsToTemplate(buttonsVal, templateButtonType);
      const parsedText = parse.length ? `| ${parse.join(' | ')}` : null;
      const { message }: any = getTemplateAndButton(getExampleFromBody(bodyValue, vars));
      const sampleText: any = parsedText && message + parsedText;
      setSimulatorMessage(sampleText, footerValue || '');
    } else {
      setSimulatorMessage(getExampleFromBody(bodyValue, vars), footerValue || '');
    }

    if (typeValue && typeValue !== 'TEXT') {
      setType({ id: typeValue, label: typeValue });
    } else {
      setType(null);
    }

    if (MessageMediaValue) {
      setAttachmentURL(MessageMediaValue.sourceUrl);
    } else {
      setAttachmentURL('');
    }
  };

  const setPayload = (payload: any) =>
    buildTemplatePayload(payload, {
      isEditing,
      category,
      variables,
      isAddButtonChecked,
      templateType,
      templateButtons,
      body,
      footer,
      tagId,
    });

  const validateURL = (value: string) => {
    if (value && type) {
      setValidatingURL(true);
      validateMedia(value, type.id, false).then((response: any) => {
        if (!response.data.is_valid) {
          setIsUrlValid(response.data.message);
        } else {
          setIsUrlValid('');
        }
        setValidatingURL(false);
      });
    }
  };

  const addTemplateButtons = (addFromTemplate: boolean = true) => {
    setTemplateButtons(buildTemplateButtonsList(templateButtons, templateType, addFromTemplate));
  };

  const removeTemplateButtons = (index: number) => {
    setTemplateButtons(templateButtons.filter((_val, idx) => idx !== index));
  };

  const handeInputChange = (value: any, row: any, index: any, eventType: any) => {
    setTemplateButtons(buildUpdatedButtons(templateButtons, value, row, index, eventType));
  };

  const handleTemplateTypeChange = (value: any) => {
    if (value) {
      setTemplateButtons(buildTemplateButtonsList([], value, false));
      setTemplateType(value);
      setIsAddButtonChecked(true);
    }
  };

  const clearButtonSelection = () => {
    setIsAddButtonChecked(false);
  };

  const getMediaId = async (payload: any) =>
    createMediaMessage({
      variables: {
        input: {
          caption: payload.body,
          sourceUrl: payload.attachmentURL,
          url: payload.attachmentURL,
        },
      },
    });

  const setSimulatorMessage = (messages: any, footerValue?: any) => {
    setSampleMessages((prev) =>
      buildSimulatorMessage({ sampleMessages: prev, body, variables, attachmentURL, type }, messages, footerValue)
    );
  };

  const selectAttachmentType = (option: any) => {
    setType(option);
    setShowUploadButton(false);
    setAttachmentMethod('url');
  };

  const clearAttachmentSelection = () => {
    setIsUrlValid(undefined);
    setType(null);
    setShowUploadButton(false);
    setAttachmentMethod('url');
    resetUploadState();
  };

  const selectUploadMethod = () => {
    // uploadMedia needs Google Cloud Storage configured for the org to have anywhere
    // to store the file — without it every upload fails, so tell the user up front
    // instead of letting them hit a generic "File upload failed" error later.
    if (!getOrganizationServices('googleCloudStorage')) {
      setNotification(
        t(
          'File upload is not available for your organization. Please use "Provide URL" instead, or ask your admin to enable Google Cloud Storage.'
        ),
        'warning'
      );
      return;
    }
    setAttachmentMethod('upload');
    setShowUploadButton(true);
  };

  const selectUrlMethod = () => {
    setAttachmentMethod('url');
    setShowUploadButton(false);
    resetUploadState();
  };

  // Same field descriptors HSM.tsx feeds to FormLayout — Category, Attachment Type,
  // and the "Add buttons" checkbox are intentionally left out here since renderFields
  // (below) renders those as tiles bound to the same state instead of via <Field>.
  const fields = [
    {
      component: AutoComplete,
      name: 'language',
      options: languageOptions,
      optionLabel: 'label',
      multiple: false,
      disabled: isEditing,
      onChange: getLanguageId,
    },
    {
      component: Input,
      name: 'newShortcode',
      placeholder: `${t('Element name')}`,
      disabled: isEditing,
      // the element name doubles as the template's title — there's no separate Title field.
      onChange: (value: any) => {
        setNewShortcode(value);
        setLabel(value);
      },
      helperText: t('Only lowercase alphanumeric characters and underscores are allowed.'),
    },
    {
      component: EmojiInput,
      name: 'body',
      label: `${t('Message')}*`,
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      disabled: isEditing,
      handleChange: (value: any) => setBody(value),
      defaultValue: (isEditing || isCopyState) && editorState,
    },
    {
      component: TemplateVariables,
      message: body,
      variables: variables,
      setVariables: setVariables,
      isEditing: isEditing,
    },
    {
      component: Input,
      name: 'footer',
      disabled: isEditing,
      inputProp: {
        onChange: (event: any) => setFooter(event.target.value),
      },
    },
    {
      component: TemplateOptions,
      isAddButtonChecked,
      templateType,
      inputFields: templateButtons,
      disabled: isEditing,
      onAddClick: addTemplateButtons,
      onRemoveClick: removeTemplateButtons,
      onInputChange: handeInputChange,
      onTemplateTypeChange: handleTemplateTypeChange,
      onDynamicParamsChange: handleDynamicParamsChange,
      setType,
      hideTypeSelector: true,
    },
    {
      component: Input,
      name: 'category',
      type: 'text',
      disabled: true,
      skip: !isEditing,
    },
    {
      component: Input,
      name: 'attachmentURL',
      type: 'text',
      validate: () => isUrlValid,
      disabled: isEditing || uploadingFile,
      helperText: uploadedFile ? `File uploaded: ${uploadedFile.name}` : undefined,
      inputProp: {
        onBlur: (event: any) => setAttachmentURL(event.target.value.trim()),
      },
    },
    {
      component: CreateAutoComplete,
      name: 'tagId',
      options: tag ? tag.tags : [],
      optionLabel: 'label',
      disabled: isEditing,
      hasCreateOption: true,
      multiple: false,
      onChange: (value: any) => setTagId(value),
    },
  ];

  const FormSchema = buildValidationSchema({ t, isAddButtonChecked, templateType });

  useEffect(() => {
    if (languages) {
      const lang = languages.currentUser.user.organization.activeLanguages.slice();
      lang.sort((first: any, second: any) => (first.label > second.label ? 1 : -1));
      setLanguageOptions(lang);
      if (!isEditing) {
        const englishLang = lang.find((l: any) => l.label.toLowerCase() === 'english');
        setLanguageId(englishLang || lang[0]);
      }
    }
  }, [languages]);

  useEffect(() => {
    setSimulatorMessage(getExampleFromBody(body, variables));

    if ((type === '' || type) && attachmentURL && !isEditing) {
      validateURL(attachmentURL);
    }
  }, [type, attachmentURL]);

  useEffect(() => {
    if (templateType?.id && !isEditing) {
      addTemplateButtons(false);
    }
  }, [templateType]);

  useEffect(() => {
    if (!isEditing) {
      const { message }: any = getTemplateAndButton(getExampleFromBody(body, variables));
      setSimulatorMessage(message || '');
    }
  }, [isAddButtonChecked]);

  useEffect(() => {
    const { message }: any = getTemplateAndButton(getExampleFromBody(body, variables));

    if (!isEditing) {
      let parse: any = [];
      if (templateButtons.length > 0) {
        parse = convertButtonsToTemplate(templateButtons, templateType?.id);
      }

      const parsedText = parse.length ? `| ${parse.join(' | ')}` : '';

      let sampleText: any = message;
      if (parsedText) {
        sampleText = (message || ' ') + parsedText;
      }

      if (sampleText) {
        setSimulatorMessage(sampleText, footer);
      }
    }
  }, [templateButtons, body, variables, footer]);

  useEffect(() => {
    setVariables(getVariables(body, variables));
  }, [body]);

  const disabled = isEditing;

  const renderFields = (formFieldItems: any[], formik: any) => (
    <>
      <section className={styles.Card}>
        <h2 className={styles.CardTitle}>{t('Template Details')}</h2>

        <div className={styles.FieldGroup}>
          <p className={styles.FieldLabel}>
            {t('Language')}
            <span className={styles.Required}>*</span>
          </p>
          {renderTextField(formFieldItems, 'language')}
        </div>

        <div className={styles.FieldGroup}>
          <p className={styles.FieldLabel}>
            {t('Element name')}
            <span className={styles.Required}>*</span>
          </p>
          {renderTextField(formFieldItems, 'newShortcode')}
        </div>

        <div className={styles.FieldGroup}>
          <p className={styles.FieldLabel}>
            {t('Category')}
            <span className={styles.Required}>*</span>
          </p>
          {!isEditing ? (
            <>
              <div className={styles.TileGrid}>
                {categoryOpn.map((option: any) => (
                  <button
                    type="button"
                    key={option.id}
                    className={`${styles.CategoryTile} ${
                      category?.label === option.label ? styles.TileSelectedGreen : ''
                    }`}
                    onClick={() => setCategory(option)}
                  >
                    <span className={styles.TileRadio} />
                    <span className={styles.TileBody}>
                      <span className={styles.TileTitle}>{titleCase(option.label)}</span>
                      {categoryDescriptions[option.label] && (
                        <span className={styles.TileDescription}>{categoryDescriptions[option.label]}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
              {formik.touched.category && formik.errors.category ? (
                <FormHelperText className={styles.DangerText}>{formik.errors.category as string}</FormHelperText>
              ) : null}
            </>
          ) : (
            renderTextField(formFieldItems, 'category')
          )}
        </div>
      </section>

      <section className={styles.Card}>
        <h2 className={styles.CardTitle}>{t('Message Content')}</h2>

        <div className={styles.FieldGroup}>
          <p className={styles.FieldLabel}>
            {t('Message Body')}
            <span className={styles.Required}>*</span>
          </p>
          {renderTextField(formFieldItems, 'body')}
          <div className={styles.MessageToolbarRow}>
            <Field
              component={TemplateVariables}
              message={body}
              variables={variables}
              setVariables={setVariables}
              isEditing={isEditing}
            />
            <span className={styles.CharCount}>{(body || '').length} / 1024</span>
          </div>
          <div className={styles.HelperText}>
            You can provide variable values in your HSM templates to personalize the message. To add: click on the
            variable button and provide an example value for the variable in the field provided below
          </div>
        </div>

        <div className={styles.FieldGroup}>
          <p className={styles.FieldLabel}>
            {t('Footer')} <span className={styles.OptionalLabel}>({t('optional')})</span>
          </p>
          {renderTextField(formFieldItems, 'footer')}
        </div>
      </section>

      <section className={styles.Card}>
        <h2 className={styles.CardTitle}>{t('Interactive Buttons')}</h2>
        <p className={styles.FieldLabel}>{t('Button Type')}</p>
        <div className={styles.ButtonTypeTileRow}>
          {BUTTON_OPTIONS.filter(
            (option: any) => option.id !== 'WHATSAPP_FORM' || getOrganizationServices('whatsappFormsEnabled')
          ).map((option: any) => (
            <button
              type="button"
              key={option.id}
              disabled={disabled}
              className={`${styles.ButtonTypeTile} ${
                isAddButtonChecked && templateType?.id === option.id ? styles.TileSelectedBlue : ''
              }`}
              onClick={() => handleTemplateTypeChange(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {isAddButtonChecked && (
          <button type="button" className={styles.ClearSelectionLink} onClick={clearButtonSelection}>
            {t('Clear button selection')}
          </button>
        )}

        <Field
          component={TemplateOptions}
          isAddButtonChecked={isAddButtonChecked}
          templateType={templateType}
          inputFields={templateButtons}
          disabled={disabled}
          onAddClick={addTemplateButtons}
          onRemoveClick={removeTemplateButtons}
          onInputChange={handeInputChange}
          onTemplateTypeChange={handleTemplateTypeChange}
          onDynamicParamsChange={handleDynamicParamsChange}
          setType={setType}
          hideTypeSelector
        />
      </section>

      <section className={styles.Card}>
        <h2 className={styles.CardTitle}>{t('Media Attachment')}</h2>
        <p className={styles.CardSubtitle}>
          {t('Supported formats: Image (JPG, PNG), Document (PDF), Video (MP4)')} ·{' '}
          {t('Not supported: Audio, Stickers')}
        </p>

        <p className={styles.FieldLabel}>{t('Attachment Type')}</p>
        <div className={styles.AttachmentTileRow}>
          {mediaOptions.map((option: any) => {
            const meta = attachmentTileMeta[option.id];
            return (
              <button
                type="button"
                key={option.id}
                disabled={disabled}
                className={`${styles.AttachmentTile} ${type?.id === option.id ? styles.TileSelectedGreen : ''}`}
                onClick={() => selectAttachmentType(option)}
              >
                {meta?.icon && <span className={styles.AttachmentTileIcon}>{meta.icon}</span>}
                <span className={styles.TileTitle}>{titleCase(option.id)}</span>
                {meta?.format && <span className={styles.AttachmentTileMeta}>{meta.format}</span>}
                {meta?.maxSizeLabel && <span className={styles.AttachmentTileMeta}>{meta.maxSizeLabel}</span>}
              </button>
            );
          })}
        </div>
        {type ? (
          <button type="button" className={styles.ClearSelectionLink} onClick={clearAttachmentSelection}>
            {t('Clear attachment selection')}
          </button>
        ) : null}

        {type ? (
          <>
            <p className={styles.FieldLabel}>{t('How would you like to provide the attachment?')}</p>
            <div className={styles.MethodToggleRow}>
              <button
                type="button"
                disabled={disabled}
                className={`${styles.MethodToggle} ${attachmentMethod === 'url' ? styles.TileSelectedGreen : ''}`}
                onClick={selectUrlMethod}
              >
                {t('Provide URL')}
              </button>
              <button
                type="button"
                disabled={disabled}
                className={`${styles.MethodToggle} ${attachmentMethod === 'upload' ? styles.TileSelectedGreen : ''}`}
                onClick={selectUploadMethod}
              >
                {t('Upload File')}
              </button>
            </div>
          </>
        ) : null}

        {showUploadButton && (!uploadingFile ? !(uploadedFile && attachmentURL) : true) && (
          <div className={styles.FieldGroup}>
            <p className={styles.FieldLabel}>
              {t('Upload File')}
              <span className={styles.Required}>*</span>
            </p>
            <div className={styles.UploadButtonContainer}>
              <label className={styles.UploadLabel} data-uploading={uploadingFile}>
                <div className={styles.UploadButton}>
                  {uploadingFile ? (
                    <div className={styles.UploadContent}>
                      <div className={styles.UploadSpinner} />
                      <span className={styles.UploadText}>{t('Uploading...')}</span>
                    </div>
                  ) : (
                    <div className={styles.UploadContent}>
                      {attachmentTileMeta[type?.id]?.icon ? (
                        <span className={styles.UploadTypeIcon}>{attachmentTileMeta[type?.id].icon}</span>
                      ) : (
                        <Upload className={styles.UploadIcon} />
                      )}
                      <span className={styles.UploadText}>{t('Click to upload or drag and drop')}</span>
                      {attachmentTileMeta[type?.id] && (
                        <span className={styles.UploadHint}>
                          {attachmentTileMeta[type.id].format.replace(', ', ' or ')} (max{' '}
                          {attachmentTileMeta[type.id].maxSizeMB}MB)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept={attachmentTileMeta[type?.id]?.accept || 'image/*,video/*,application/pdf'}
                  onChange={(e: any) => {
                    const file = e.target.files?.[0];
                    if (file && !uploadingFile) {
                      handleFileUpload(file);
                    }
                  }}
                  className={styles.HiddenFileInput}
                  disabled={uploadingFile}
                />
              </label>
            </div>
            <div className={styles.HelperText}>
              {t('Upload a sample file for approval. You can send different content when using the template.')}
            </div>
          </div>
        )}

        {type && !showUploadButton && (
          <div className={styles.FieldGroup}>
            <p className={styles.FieldLabel}>
              {t('Attachment URL')}
              <span className={styles.Required}>*</span>
            </p>
            <Field
              {...getField(formFieldItems, 'attachmentURL')}
              placeholder={t('https://example.com/image.jpg')}
              helperText={
                uploadedFile ? (
                  `File uploaded: ${uploadedFile.name}`
                ) : (
                  <>
                    {t(
                      'Provide a sample attachment URL for approval. You can send different content when using the template.'
                    )}{' '}
                    <strong>
                      {t('Max file size:')} {attachmentTileMeta[type?.id]?.maxSizeMB ?? 16} MB
                    </strong>
                  </>
                )
              }
            />
          </div>
        )}
      </section>

      <section className={`${styles.Card} ${styles.LastCard}`}>
        <h2 className={styles.CardTitle}>{t('Organization & Tags')}</h2>
        <div className={styles.FieldGroup}>
          <p className={styles.FieldLabel}>
            {t('Tag')} <span className={styles.OptionalLabel}>({t('optional')})</span>
          </p>
          <Field
            {...getField(formFieldItems, 'tagId')}
            placeholder={t('Search or create a tag...')}
            helperText={t('Pick a suggestion or type your own — tags help you filter and organise templates later.')}
          />
        </div>
      </section>
    </>
  );

  if (languageLoading || categoryLoading || tagLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.Page}>
      <button type="button" className={styles.BackLink} onClick={() => navigate(`/${backButton}`)}>
        <ChevronLeftIcon fontSize="small" />
        {t('Back to templates')}
      </button>

      <div className={styles.PageTitleRow}>
        <h1 className={styles.PageTitle}>
          {isEditing ? t('Edit HSM Template') : isCopyState ? `${t('Copy')} HSM Template` : t('Create HSM Template')}
        </h1>
        <HelpIcon helpData={templateInfo} />
      </div>
      <p className={styles.PageSubtitle}>
        {isEditing
          ? t('Please view/edit the details below.')
          : t('Fill in the details below to create a new template for WhatsApp Business messaging')}
      </p>

      <div className={styles.FormColumn}>
        <FormLayout
          {...queries}
          states={states}
          isView={isEditing}
          setStates={setStates}
          setPayload={setPayload}
          validationSchema={isEditing ? Yup.object() : FormSchema}
          listItemName="HSM Template"
          dialogMessage={dialogMessage}
          formFields={fields}
          redirectionLink={backButton}
          listItem="sessionTemplate"
          icon={templateIcon}
          getLanguageId={getLanguageId}
          languageSupport={false}
          errorButtonState={{ text: isEditing ? t('Go Back') : t('Cancel'), show: true }}
          isAttachment
          getQueryFetchPolicy="cache-and-network"
          button={!isEditing ? t('Submit for Approval') : t('Save')}
          buttonState={{
            text: t('Validating URL'),
            status: validatingURL,
            show: !isEditing,
            styles: styles.Buttons,
          }}
          saveOnPageChange={false}
          type={mode}
          copyNotification={copyMessage}
          backLinkButton={`/${backButton}`}
          cancelLink={backButton}
          getMediaId={getMediaId}
          entityId={params.id}
          noHeading
          partialPage
          customStyles={styles.CustomFormShell}
          renderFields={renderFields}
        />
      </div>

      <Simulator isPreviewMessage message={sampleMessages} simulatorIcon={false} />
    </div>
  );
};

export default HSMV2;
