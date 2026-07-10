import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';
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
import Simulator from 'components/simulator/Simulator';
import { TileSelector } from 'components/UI/Form/TileSelector/TileSelector';
import { AttachmentField } from 'components/UI/Form/AttachmentField/AttachmentField';
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
  getTemplateAndButton,
  buildTemplatePayload,
  buildTemplateButtonsList,
  buildUpdatedButtons,
  buildValidationSchema,
  CallToActionTemplate,
  QuickReplyTemplate,
  WhatsappFormTemplate,
} from '../HSM.helper';
import {
  queries,
  templateIcon,
  dialogMessage,
  categoryDescriptions,
  buildSimulatorMessage,
  attachmentTypeOptions,
} from './HSMV2.helper';
import styles from './HSMV2.module.css';

export const HSMV2 = () => {
  const location: any = useLocation();
  const [language, setLanguageId] = useState<any>(null);
  const [body, setBody] = useState<any>('');
  const [type, setType] = useState<any>(null);
  const [attachmentURL, setAttachmentURL] = useState<any>('');
  const [attachmentMethod, setAttachmentMethod] = useState<'url' | 'upload'>('url');
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
  const backButton = location.state?.tag?.label
    ? `template-v2?tag=${encodeURIComponent(location.state.tag.label)}`
    : 'template-v2';

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
  const updateItemQuery = isCopyState ? CREATE_TEMPLATE : UPDATE_TEMPLATE;
  if (isCopyState) {
    mode = 'copy';
  }
  if (params.id && !isCopyState) {
    isEditing = true;
  }

  const categoryOpn: any = [];
  if (categoryList) {
    categoryList.whatsappHsmCategories.forEach((categories: any) => {
      categoryOpn.push({ label: categories, id: categories, description: categoryDescriptions[categories] });
    });
  }

  const states = {
    language,
    body,
    footer,
    type,
    attachmentURL,
    category,
    tagId,
    templateButtons,
    templateType,
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
    language: languageIdValue,
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
        const selectedLanguage = languageOptions.find((lang: any) => lang.id === languageIdValue.id);
        setLanguageId(selectedLanguage);
      } else {
        setLanguageId(language);
      }
    }

    if (!isCopyState) {
      setNewShortcode(shortcodeValue);
    }

    setBody(bodyValue);
    setFooter(footerValue || '');
    setEditorState(bodyValue);
    setCategory(categoryValue);
    setTagId(tagIdValue);
    vars = getExampleValue(exampleValue);
    setVariables(vars);

    if (hasButtons) {
      const { buttons: buttonsVal } = getTemplateAndButtons(templateButtonType, exampleValue, buttons);
      setTemplateButtons(buttonsVal);
      setTemplateType(BUTTON_OPTIONS.find((btn: any) => btn.id === templateButtonType));
      setIsAddButtonChecked(hasButtons);
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

  const handleInputChange = (value: any, row: any, index: any, eventType: any) => {
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

  const attachmentURLField = {
    component: Input,
    name: 'attachmentURL',
    type: 'text',
    validate: () => isUrlValid,
    disabled: isEditing || uploadingFile,
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
      disabled: isEditing,
      onChange: getLanguageId,
    },
    {
      component: Input,
      name: 'newShortcode',
      label: `${t('Element name')}*`,
      placeholder: `${t('Element name')}`,
      disabled: isEditing,
      onChange: (value: any) => setNewShortcode(value),
      helperText: t('Only lowercase alphanumeric characters and underscores are allowed.'),
    },
    isEditing
      ? {
          component: Input,
          name: 'category',
          label: t('Category'),
          type: 'text',
          disabled: true,
        }
      : {
          component: TileSelector,
          name: 'category',
          options: categoryOpn,
          variant: 'radio',
          onChange: setCategory,
          label: t('Category'),
        },
    {
      component: EmojiInput,
      name: 'body',
      label: `${t('Message')}*`,
      rows: 5,
      disabled: isEditing,
      handleChange: (value: any) => setBody(value),
      defaultValue: (isEditing || isCopyState) && editorState,
    },
    {
      component: TemplateVariables,
      name: 'variables',
      message: body,
      variables,
      setVariables,
      isEditing,
    },
    {
      component: Input,
      name: 'footer',
      label: `${t('Footer')} (${t('optional')})`,
      disabled: isEditing,
      inputProp: {
        onChange: (event: any) => setFooter(event.target.value),
      },
    },
    {
      component: TileSelector,
      name: 'templateType',
      options: BUTTON_OPTIONS,
      selected: isAddButtonChecked,
      onChange: handleTemplateTypeChange,
      onClear: clearButtonSelection,
      clearLabel: t('Clear button selection'),
      disabled: isEditing,
      label: t('Button Type'),
    },
    {
      component: TemplateOptions,
      name: 'templateButtons',
      isAddButtonChecked,
      templateType,
      inputFields: templateButtons,
      disabled: isEditing,
      onAddClick: addTemplateButtons,
      onRemoveClick: removeTemplateButtons,
      onInputChange: handleInputChange,
      onTemplateTypeChange: handleTemplateTypeChange,
      onDynamicParamsChange: handleDynamicParamsChange,
      setType,
      hideTypeSelector: true,
    },
    {
      component: AttachmentField,
      name: 'type',
      options: attachmentTypeOptions,
      onChange: selectAttachmentType,
      onClear: clearAttachmentSelection,
      clearLabel: t('Clear attachment selection'),
      showUploadButton,
      uploadingFile,
      uploadedFile,
      attachmentURL,
      onFileSelect: handleFileUpload,
      onResetUpload: resetUploadState,
      urlField: attachmentURLField,
      methodToggle: {
        method: attachmentMethod,
        onSelectUrl: selectUrlMethod,
        onSelectUpload: selectUploadMethod,
      },
      disabled: isEditing,
      label: t('Attachment Type'),
    },
    {
      component: CreateAutoComplete,
      name: 'tagId',
      label: `${t('Tag')} (${t('optional')})`,
      options: tag ? tag.tags : [],
      optionLabel: 'label',
      disabled: isEditing,
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
      setLanguageOptions(lang);
      if (!isEditing) {
        const englishLang = lang.find((l: any) => l.label.toLowerCase() === 'english');
        setLanguageId(englishLang || lang[0]);
      }
    }
  }, [languages]);

  // single source of truth for the simulator preview text — recomputed whenever any
  // input that affects it changes, instead of being pieced together across several effects.
  const computeSampleText = () => {
    const { message }: any = getTemplateAndButton(getExampleFromBody(body, variables));

    if (!isAddButtonChecked || templateButtons.length === 0) {
      return message || '';
    }

    const parse = convertButtonsToTemplate(templateButtons, templateType?.id);
    const parsedText = parse.length ? `| ${parse.join(' | ')}` : '';
    return parsedText ? (message || ' ') + parsedText : message || '';
  };

  useEffect(() => {
    setSimulatorMessage(computeSampleText(), footer);
  }, [body, variables, footer, templateButtons, templateType, isAddButtonChecked, type, attachmentURL]);

  useEffect(() => {
    if (!isEditing && (type === '' || type) && attachmentURL) {
      validateURL(attachmentURL);
    }
  }, [type, attachmentURL]);

  useEffect(() => {
    if (templateType?.id && !isEditing) {
      addTemplateButtons(false);
    }
  }, [templateType]);

  useEffect(() => {
    setVariables(getVariables(body, variables));
  }, [body]);

  if (languageLoading || categoryLoading || tagLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.Page}>
      <FormLayout
        {...queries}
        updateItemQuery={updateItemQuery}
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
        helpData={templateInfo}
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
        partialPage
        customStyles={styles.CustomFormShell}
      />

      <Simulator isPreviewMessage message={sampleMessages} simulatorIcon={false} />
    </div>
  );
};

export default HSMV2;
