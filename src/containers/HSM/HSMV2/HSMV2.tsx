import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
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
import { Heading } from 'components/UI/Heading/Heading';
import Simulator from 'components/simulator/Simulator';
import { ButtonTypeSelector } from 'components/UI/Form/ButtonTypeSelector/ButtonTypeSelector';
import { AttachmentTypeSelector } from 'components/UI/Form/AttachmentTypeSelector/AttachmentTypeSelector';
import { AttachmentUploadField } from 'components/UI/Form/AttachmentUploadField/AttachmentUploadField';
import { CategorySelector } from 'components/UI/Form/CategorySelector/CategorySelector';
import { FormLayout } from 'containers/Form/FormLayout';
import { TemplateOptions } from 'containers/TemplateOptions/TemplateOptions';
import { getOrganizationServices } from 'services/AuthService';

import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_TAGS } from 'graphql/queries/Tags';
import { GET_HSM_CATEGORIES, GET_TEMPLATE } from 'graphql/queries/Template';
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
  getTemplateAndButton,
  buildTemplatePayload,
  buildSimulatorMessage,
  buildTemplateButtonsList,
  buildUpdatedButtons,
  buildValidationSchema,
  buildLanguageDraft,
  filterAvailableLanguages,
  groupVariantsByTab,
  statusTabFor,
  STATUS_TABS,
} from './HSMV2.helper';
import type { StatusTab } from './HSMV2.helper';
import { languageCode, categoryLabel } from '../HSMListV2/HSMListV2.helper';
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
  const [languageDraftReady, setLanguageDraftReady] = useState(false);
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

  let mode;
  const copyMessage = t('Copy of the template has been created!');

  const isCopyState = location.state === 'copy';
  if (isCopyState) {
    queries.updateItemQuery = CREATE_TEMPLATE;
    mode = 'copy';
  } else {
    queries.updateItemQuery = UPDATE_TEMPLATE;
  }

  // /template-v2/:id/view is its own route (read-only, id in the URL so a
  // reload doesn't lose it) — distinct from /template-v2/:id/edit, which
  // shares the same :id param shape but means isEditing instead.
  const isViewRoute = location.pathname.endsWith('/view');
  const isEditing = Boolean(params.id && !isCopyState && !isViewRoute);

  // "View" (its own route, anchor id in the URL) and "Add new language" (the
  // create route, anchor id in state) both render a "language versions"
  // summary card above the form — "variants" (carried through on the row, see
  // HSMListV2.helper's getColumns) lets it render immediately, no extra fetch.
  const languageAnchorId = isViewRoute ? params.id : location.state?.languageAnchorId;
  const excludeLanguageIds = location.state?.excludeLanguageIds || [];
  const familyVariants: any[] = location.state?.variants || [];
  const isLanguageMode = Boolean(languageAnchorId) && !isEditing && !isCopyState;
  // /template-v2/add with a languageAnchorId is the "Add new language" route —
  // landing here shows the anchor read-only first (a reference for what
  // you're translating), and only switches to the editable draft once
  // "+ Add new language" is clicked (see addPagePanel below). Switching
  // between sibling variants here (its own "View" links) stays on this same
  // URL too — unlike the list page's View icon, which goes to its own
  // /:id/view route instead.
  const isAddRoute = isLanguageMode && !isViewRoute;
  const [addPagePanel, setAddPagePanel] = useState<'view' | 'add'>('view');
  const [addPagePreviewId, setAddPagePreviewId] = useState<string | null>(null);

  const isAddingLanguage = isAddRoute && addPagePanel === 'add';
  const isViewingVariant = (isLanguageMode && isViewRoute) || (isAddRoute && addPagePanel === 'view');
  // fields that stay locked once a template/variant already exists — either
  // editing your own record, or looking at a sibling language read-only.
  const fieldsLocked = isEditing || isViewingVariant;

  // default to whichever tab the variant you arrived on belongs to, so "View"
  // from the list doesn't land you looking at an empty tab.
  const [activeTab, setActiveTab] = useState<StatusTab>(() => {
    const initialVariant = familyVariants.find((variant: any) => variant.id === languageAnchorId);
    return initialVariant ? statusTabFor(initialVariant.status) : 'Approved';
  });

  const { data: languageAnchorData, loading: languageAnchorLoading } = useQuery(GET_TEMPLATE, {
    variables: { id: languageAnchorId },
    skip: !isLanguageMode,
  });
  const languageAnchor = languageAnchorData?.sessionTemplate?.sessionTemplate;

  const variantsByTab = groupVariantsByTab(familyVariants);
  const entityId = isEditing
    ? params.id
    : isLanguageMode && isViewRoute
      ? languageAnchorId
      : isAddRoute && addPagePanel === 'view'
        ? addPagePreviewId || languageAnchorId
        : undefined;

  // Resolve the Language field straight from our own anchor/preview fetch
  // instead of FormLayout's setStates callback: setStates only sets it once
  // languageOptions is already populated, and since that query races
  // independently against the template fetch, it can resolve first and leave
  // the field blank. This sidesteps that race, and re-runs correctly when
  // switching between sibling variants (dedicated /view route, or the "View"
  // links within the add route's own Language versions card).
  const { data: previewData } = useQuery(GET_TEMPLATE, {
    variables: { id: addPagePreviewId },
    skip: !(isAddRoute && addPagePanel === 'view' && addPagePreviewId),
  });
  const viewingLanguage =
    isAddRoute && addPagePanel === 'view' && addPagePreviewId
      ? previewData?.sessionTemplate?.sessionTemplate?.language
      : languageAnchor?.language;
  useEffect(() => {
    if (isViewingVariant) {
      if (viewingLanguage && languageOptions.length > 0) {
        const matched = languageOptions.find((option: any) => option.id === viewingLanguage.id);
        setLanguageId(matched || null);
      } else {
        setLanguageId(null);
      }
    }
  }, [isViewingVariant, viewingLanguage, languageOptions]);

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

    // View mode's Language field is owned by the languageAnchor/preview-driven
    // effect above instead — this block's `else { setLanguageId(language) }` is
    // a stale no-op keyed off a render-time closure, which races that effect
    // and can clobber it back to the previously viewed variant's language.
    if (languageOptions.length > 0 && languageIdValue && !isViewingVariant) {
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
    resetUploadState();
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

  // the field descriptor FormLayout's default renderer uses for the attachment URL —
  // shared between its own slot (skipped, since AttachmentUploadField renders it inline
  // once a type is picked) and the urlField it hands to AttachmentUploadField.
  const attachmentURLField = {
    component: Input,
    name: 'attachmentURL',
    type: 'text',
    validate: () => isUrlValid,
    disabled: fieldsLocked || uploadingFile,
    helperText: uploadedFile ? `File uploaded: ${uploadedFile.name}` : undefined,
    inputProp: {
      onBlur: (event: any) => setAttachmentURL(event.target.value.trim()),
    },
  };

  const fields = [
    {
      component: AutoComplete,
      name: 'language',
      label: `${t('Language')}*`,
      options: languageOptions,
      optionLabel: 'label',
      multiple: false,
      disabled: fieldsLocked,
      onChange: getLanguageId,
    },
    {
      component: Input,
      name: 'newShortcode',
      label: `${t('Element name')}*`,
      placeholder: `${t('Element name')}`,
      // locked when adding OR viewing a language too — every variant of a
      // template shares the same shortcode, only the language/content differs.
      disabled: isEditing || isLanguageMode,
      // the backend derives the template's title (label) from shortcode + language when
      // label is blank — there's no separate Title field for the user to fill in, so we
      // send label as-is (empty in create mode) and let the backend name it.
      onChange: (value: any) => setNewShortcode(value),
      helperText: t('Only lowercase alphanumeric characters and underscores are allowed.'),
    },
    fieldsLocked
      ? {
          component: Input,
          name: 'category',
          label: t('Category'),
          type: 'text',
          disabled: true,
        }
      : {
          component: CategorySelector,
          name: 'category',
          options: categoryOpn,
          value: category,
          descriptions: categoryDescriptions,
          onChange: setCategory,
        },
    {
      component: EmojiInput,
      name: 'body',
      label: `${t('Message')}*`,
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      disabled: fieldsLocked,
      handleChange: (value: any) => setBody(value),
      defaultValue: (fieldsLocked || isCopyState || isAddingLanguage) && editorState,
    },
    {
      component: TemplateVariables,
      name: 'variables',
      message: body,
      variables,
      setVariables,
      isEditing: fieldsLocked,
    },
    {
      component: Input,
      name: 'footer',
      label: `${t('Footer')} (${t('optional')})`,
      disabled: fieldsLocked,
      inputProp: {
        onChange: (event: any) => setFooter(event.target.value),
      },
    },
    {
      component: ButtonTypeSelector,
      name: 'templateType',
      options: BUTTON_OPTIONS.filter(
        (option: any) => option.id !== 'WHATSAPP_FORM' || getOrganizationServices('whatsappFormsEnabled')
      ),
      value: templateType,
      selected: isAddButtonChecked,
      onChange: handleTemplateTypeChange,
      onClear: clearButtonSelection,
      disabled: fieldsLocked,
    },
    {
      component: TemplateOptions,
      name: 'templateButtons',
      isAddButtonChecked,
      templateType,
      inputFields: templateButtons,
      disabled: fieldsLocked,
      onAddClick: addTemplateButtons,
      onRemoveClick: removeTemplateButtons,
      onInputChange: handeInputChange,
      onTemplateTypeChange: handleTemplateTypeChange,
      onDynamicParamsChange: handleDynamicParamsChange,
      setType,
      hideTypeSelector: true,
    },
    {
      component: AttachmentTypeSelector,
      name: 'type',
      options: mediaOptions,
      value: type,
      onChange: selectAttachmentType,
      onClear: clearAttachmentSelection,
      method: attachmentMethod,
      onSelectUrlMethod: selectUrlMethod,
      onSelectUploadMethod: selectUploadMethod,
      disabled: fieldsLocked,
    },
    {
      component: AttachmentUploadField,
      name: 'attachmentUpload',
      type,
      showUploadButton,
      uploadingFile,
      uploadedFile,
      attachmentURL,
      onFileSelect: handleFileUpload,
      onResetUpload: resetUploadState,
      urlField: attachmentURLField,
    },
    { ...attachmentURLField, skip: true },
    {
      component: CreateAutoComplete,
      name: 'tagId',
      label: `${t('Tag')} (${t('optional')})`,
      options: tag ? tag.tags : [],
      optionLabel: 'label',
      disabled: fieldsLocked,
      hasCreateOption: true,
      multiple: false,
      onChange: (value: any) => setTagId(value),
      placeholder: t('Search or create a tag...'),
      helperText: t('Pick a suggestion or type your own — tags help you filter and organise templates later.'),
    },
  ];

  const FormSchema = buildValidationSchema({ t, isAddButtonChecked, templateType });

  useEffect(() => {
    if (languages) {
      const lang = languages.currentUser.user.organization.activeLanguages.slice();
      lang.sort((first: any, second: any) => (first.label > second.label ? 1 : -1));
      setLanguageOptions(isAddingLanguage ? filterAvailableLanguages(lang, excludeLanguageIds) : lang);
      // Adding a language means picking one that isn't taken yet — don't
      // auto-select a default (it may well be one of the excluded ones).
      // Viewing a variant shows its actual language instead (see the
      // languageAnchor/preview-driven effect above), not a default.
      if (!isEditing && !isAddingLanguage && !isViewingVariant) {
        const englishLang = lang.find((l: any) => l.label.toLowerCase() === 'english');
        setLanguageId(englishLang || lang[0]);
      }
    }
    // re-run when switching between the read-only preview and the editable
    // draft on the add route (isAddingLanguage) — languageOptions must be
    // re-filtered, not left as whichever list was computed on first load.
    // (excludeLanguageIds itself never changes during a page visit, and
    // `|| []` makes it an unstable dependency, so it's deliberately omitted.)
  }, [languages, isAddingLanguage]);

  // seed the form from the anchor template once it's loaded, so adding a
  // language only requires changing the wording, not rebuilding the structure.
  useEffect(() => {
    if (isAddingLanguage && languageAnchor && !languageDraftReady) {
      const draft = buildLanguageDraft(languageAnchor);
      setNewShortcode(draft.newShortcode);
      setBody(draft.body);
      setEditorState(draft.body);
      setFooter(draft.footer);
      setCategory(draft.category);
      setVariables(draft.variables);
      setType(draft.type);
      setAttachmentURL(draft.attachmentURL);
      setTemplateType(draft.templateType);
      setTemplateButtons(draft.templateButtons);
      setIsAddButtonChecked(draft.isAddButtonChecked);
      setTagId(draft.tagId);
      setLanguageDraftReady(true);
    }
  }, [isAddingLanguage, languageAnchor, languageDraftReady]);

  useEffect(() => {
    setSimulatorMessage(getExampleFromBody(body, variables));

    if ((type === '' || type) && attachmentURL && !fieldsLocked) {
      validateURL(attachmentURL);
    }
  }, [type, attachmentURL]);

  useEffect(() => {
    // guarded against isAddingLanguage/isViewingVariant too — both prefill
    // templateType together with the matching templateButtons already loaded
    // from the source template, so this must not reset them to a blank button.
    if (templateType?.id && !isEditing && !isAddingLanguage && !isViewingVariant) {
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

  if (
    languageLoading ||
    categoryLoading ||
    tagLoading ||
    (isLanguageMode && languageAnchorLoading && !languageAnchor)
  ) {
    return <Loading />;
  }

  const languageModeTitle = isAddingLanguage
    ? `${t('Add Language')} — ${languageAnchor?.shortcode}`
    : languageAnchor?.shortcode || t('HSM Template');
  const languageModeHelp = isAddingLanguage
    ? t('Select a new language and fill in the translated content, buttons, and media for this version.')
    : t('View the content and language versions for this template.');

  return (
    <div className={styles.Page}>
      {isLanguageMode && (
        <Heading
          backLink={`/${backButton}`}
          formTitle={languageModeTitle}
          headerHelp={languageModeHelp}
          helpData={templateInfo}
        />
      )}
      {isLanguageMode && (
        <div className={styles.TemplateDetailsCard}>
          {/* the form below already has its own "Element name" field (locked
              to the same shortcode) — showing it here too was a duplicate. */}
          <p className={styles.LanguageVersionsTitle}>{t('Language versions')}</p>
          <div className={styles.LanguageVersionsContainer}>
            <div className={styles.StatusTabsRow} data-testid="status-tabs">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.StatusTab} ${activeTab === tab ? styles.StatusTabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                  data-testid={`status-tab-${tab}`}
                >
                  <span className={`${styles.StatusDot} ${styles[`StatusDot${tab.replace(' ', '')}`]}`} />
                  {t(tab)}
                  <span className={styles.StatusTabCount}>{variantsByTab[tab].length}</span>
                </button>
              ))}
            </div>
            <div className={styles.LanguageVersionsList} data-testid="language-versions-list">
              {variantsByTab[activeTab].length === 0 ? (
                <p className={styles.EmptyTabText}>{t('No languages in this status.')}</p>
              ) : (
                variantsByTab[activeTab].map((variant: any) => (
                  <div key={variant.id} className={styles.LanguageVersionRow} data-testid="language-version-row">
                    <span className={styles.LangName}>
                      {variant.language?.label}
                      <span className={styles.LangCode}>{languageCode(variant.language?.locale)}</span>
                    </span>
                    <span className={styles.CategoryChip}>{categoryLabel(variant.category)}</span>
                    <span className={styles.RowSpacer} />
                    <button
                      type="button"
                      className={styles.ViewLink}
                      onClick={() => {
                        // on the add route, "View" previews a variant in place
                        // (same URL) — the list page's own View icon is the only
                        // thing that goes to the dedicated /:id/view route.
                        if (isAddRoute) {
                          setAddPagePanel('view');
                          setAddPagePreviewId(variant.id);
                        } else {
                          navigate(`/template-v2/${variant.id}/view`, { state: { variants: familyVariants } });
                        }
                      }}
                      data-testid={`view-language-${variant.id}`}
                    >
                      {t('View')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          {isAddRoute && (
            <button
              type="button"
              className={styles.AddLanguageLink}
              onClick={() => {
                setAddPagePanel('add');
                setAddPagePreviewId(null);
              }}
              data-testid="add-language-link"
            >
              + {t('Add new language')}
            </button>
          )}
        </div>
      )}
      <FormLayout
        {...queries}
        states={states}
        isView={fieldsLocked}
        setStates={setStates}
        setPayload={setPayload}
        validationSchema={fieldsLocked ? Yup.object() : FormSchema}
        listItemName="HSM Template"
        dialogMessage={dialogMessage}
        formFields={fields}
        redirectionLink={backButton}
        listItem="sessionTemplate"
        icon={templateIcon}
        helpData={templateInfo}
        // language mode renders its own Heading above the Template Details
        // card instead — FormLayout's own heading would otherwise land
        // between that card and the form fields.
        noHeading={isLanguageMode}
        getLanguageId={getLanguageId}
        languageSupport={false}
        errorButtonState={{ text: fieldsLocked ? t('Go Back') : t('Cancel'), show: true }}
        isAttachment
        getQueryFetchPolicy="cache-and-network"
        button={!fieldsLocked ? t('Submit for Approval') : t('Save')}
        buttonState={{
          text: t('Validating URL'),
          status: validatingURL,
          // hidden entirely while viewing a sibling variant read-only — since
          // isEditing is false here (no :id in the URL), submitting would
          // otherwise create a duplicate template instead of doing nothing.
          show: !fieldsLocked,
          styles: styles.Buttons,
        }}
        saveOnPageChange={false}
        type={mode}
        copyNotification={copyMessage}
        backLinkButton={`/${backButton}`}
        cancelLink={backButton}
        getMediaId={getMediaId}
        entityId={entityId}
        partialPage
        customStyles={styles.CustomFormShell}
      />

      <Simulator isPreviewMessage message={sampleMessages} simulatorIcon={false} />
    </div>
  );
};

export default HSMV2;
