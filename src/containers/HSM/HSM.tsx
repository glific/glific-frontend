import { useMutation, useQuery } from '@apollo/client';
import { Typography } from '@mui/material';
import { Upload } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';
import * as Yup from 'yup';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';

import { CALL_TO_ACTION, QUICK_REPLY } from 'common/constants';
import { validateMedia } from 'common/utils';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { CreateAutoComplete } from 'components/UI/Form/CreateAutoComplete/CreateAutoComplete';
import { EmojiInput } from 'components/UI/Form/EmojiInput/EmojiInput';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import Simulator from 'components/simulator/Simulator';
import { FormLayout } from 'containers/Form/FormLayout';
import { TemplateOptions } from 'containers/TemplateOptions/TemplateOptions';
import { setNotification } from 'common/notification';
import { getOrganizationServices } from 'services/AuthService';

import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_TAGS } from 'graphql/queries/Tags';
import { GET_HSM_CATEGORIES, GET_SHORTCODES, GET_TEMPLATE } from 'graphql/queries/Template';
import { CREATE_MEDIA_MESSAGE, UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import { CREATE_TEMPLATE, DELETE_TEMPLATE, UPDATE_TEMPLATE } from 'graphql/mutations/Template';

import { TemplateVariables } from './TemplateVariables/TemplateVariables';
import styles from './HSM.module.css';
import {
  convertButtonsToTemplate,
  getExampleFromBody,
  getVariables,
  getExampleValue,
  getTemplateAndButtons,
  removeFirstLineBreak,
  CallToActionTemplate,
  QuickReplyTemplate,
  mediaOptions,
  WhatsappFormTemplate,
} from './HSM.helper';

const queries = {
  getItemQuery: GET_TEMPLATE,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;
const regexForShortcode = /^[a-z0-9_]+$/g;
const dialogMessage = ' It will stop showing when you are drafting a customized message.';
const UPLOAD_ATTACHMENT_ID = 'UPLOAD_ATTACHMENT';
const buttonTypes: any = {
  QUICK_REPLY: { value: '' },
  CALL_TO_ACTION: { type: 'phone_number', title: '', value: '' },
  WHATSAPP_FORM: { type: 'whatsapp_form', form_id: '', text: '', navigate_screen: '' },
};

export const buttonOptions: any = [
  { id: 'CALL_TO_ACTION', label: 'Call to Action' },
  { id: 'QUICK_REPLY', label: 'Quick Reply' },
  { id: 'WHATSAPP_FORM', label: 'WhatsApp Form' },
];

export const HSM = () => {
  const location: any = useLocation();
  const [language, setLanguageId] = useState<any>(null);
  const [label, setLabel] = useState('');
  const [body, setBody] = useState<any>('');
  const [type, setType] = useState<any>(null);
  const [attachmentURL, setAttachmentURL] = useState<any>('');
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
  const [languageVariant, setLanguageVariant] = useState<boolean>(false);
  const [existingShortcode, setExistingShortcode] = useState('');
  const [newShortcode, setNewShortcode] = useState('');
  const [languageOptions, setLanguageOptions] = useState<any>([]);
  const [validatingURL, setValidatingURL] = useState<boolean>(false);
  const [isUrlValid, setIsUrlValid] = useState<any>();
  const [templateType, setTemplateType] = useState<any>(buttonOptions[0]);
  const [dynamicUrlParams, setDynamicUrlParams] = useState<any>({
    urlType: 'Static',
    sampleSuffix: '',
  });
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
  let timer: any = null;
  let backButton = location.state?.tag?.label ? `template?tag=${location.state?.tag?.label}` : 'template';

  const { data: categoryList, loading: categoryLoading } = useQuery(GET_HSM_CATEGORIES);
  const {
    data: shortCodes,
    loading: shortcodesLoading,
    refetch: refetchShortcodes,
  } = useQuery(GET_SHORTCODES, {
    variables: {
      filter: {
        isHsm: true,
      },
    },
  });

  const { data: tag, loading: tagLoading } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const { data: languages, loading: languageLoading } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });
  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE);

  const resetUploadState = (): void => {
    setUploadingFile(false);
    setUploadedFile(null);
  };

  const [uploadMedia] = useMutation(UPLOAD_MEDIA, {
    onCompleted: (data: { uploadMedia: string }) => {
      setAttachmentURL(data.uploadMedia);
      setNotification('File uploaded successfully');
      setUploadingFile(false);
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      setNotification('File upload failed. Please try again.');
      resetUploadState();
    },
  });

  const handleFileUpload = (file: File): void => {
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

    uploadMedia({
      variables: {
        media: file,
        extension,
      },
    });
  };

  let attachmentOptions = mediaOptions;
  if (getOrganizationServices('googleCloudStorage')) {
    attachmentOptions = [{ id: UPLOAD_ATTACHMENT_ID, label: 'UPLOAD ATTACHMENT' }, ...attachmentOptions];
  }

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

  const shortCodeOptions: any = [];
  if (shortCodes?.sessionTemplates) {
    const visitedShortCodes = new Set<string>();
    shortCodes.sessionTemplates.forEach((value: any, index: number) => {
      const shortCode = (value?.shortcode || '').toString();
      if (!shortCode || visitedShortCodes.has(shortCode)) return;
      visitedShortCodes.add(shortCode);
      shortCodeOptions.push({ label: shortCode, id: index });
    });
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
    languageVariant,
    variables,
    newShortcode,
    existingShortcode,
  };

  const getLanguageId = (value: any) => {
    if (!value.label) {
      return;
    }

    const selected = languageOptions.find((option: any) => option.label === value.label);
    setLanguageId(selected);
  };

  // Creating payload for button template
  const getButtonTemplatePayload = (urlType: string, sampleSuffix: string) => {
    const buttons = templateButtons.reduce((result: any, button: any) => {
      const { type: buttonType, value, title, text, form_id, navigate_screen }: any = button;

      if (templateType?.id === CALL_TO_ACTION) {
        const typeObj: any = {
          phone_number: 'PHONE_NUMBER',
          url: 'URL',
        };
        let obj: any = { type: typeObj[buttonType], text: title, [buttonType]: value };

        if (buttonType === 'url' && urlType === 'Dynamic') {
          obj = {
            type: typeObj[buttonType],
            text: title,
            [buttonType]: `${value}{{1}}`,
            example: [`${value}${sampleSuffix}`],
          };
        }
        result.push(obj);
      }

      if (templateType?.id === QUICK_REPLY) {
        const obj: any = { type: QUICK_REPLY, text: value };
        result.push(obj);
      }

      if (templateType?.id === 'WHATSAPP_FORM') {
        const obj = { type: 'FLOW', navigate_screen, text, flow_id: form_id, flow_action: 'NAVIGATE' };
        result.push(obj);
      }
      return result;
    }, []);

    // get template body
    const templateBody = getTemplateAndButton(body);
    const templateExample = getTemplateAndButton(getExampleFromBody(body, variables));

    return {
      hasButtons: true,
      buttons: JSON.stringify(buttons),
      buttonType: templateType?.id,
      body: templateBody.message,
      example: templateExample.message,
    };
  };

  const handleDynamicParamsChange = (value: any) => {
    setDynamicUrlParams(value);
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
    let variables: any = [];

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
    variables = getExampleValue(exampleValue);
    setVariables(variables);
    addButtonsToSampleMessage(getExampleFromBody(bodyValue, variables));

    if (hasButtons) {
      const { buttons: buttonsVal } = getTemplateAndButtons(templateButtonType, exampleValue, buttons);
      setTemplateButtons(buttonsVal);
      setTemplateType(buttonOptions.find((btn: any) => btn.id === templateButtonType));
      setIsAddButtonChecked(hasButtons);
      const parse = convertButtonsToTemplate(buttonsVal, templateButtonType);
      const parsedText = parse.length ? `| ${parse.join(' | ')}` : null;
      const { message }: any = getTemplateAndButton(getExampleFromBody(bodyValue, variables));
      const sampleText: any = parsedText && message + parsedText;
      setSimulatorMessage(sampleText, footerValue || '');
    } else {
      setSimulatorMessage(getExampleFromBody(bodyValue, variables), footerValue || '');
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

  const setPayload = (payload: any) => {
    let payloadCopy = { ...payload, isHsm: true };
    const { urlType, sampleSuffix } = dynamicUrlParams;
    if (isEditing) {
      payloadCopy.shortcode = payloadCopy.newShortcode;
    } else {
      payloadCopy.category = category.label;
      payloadCopy.shortcode = languageVariant ? payloadCopy.existingShortcode.label : payloadCopy.newShortcode;
    }
    payloadCopy.languageId = payload.language.id;
    payloadCopy.example = getExampleFromBody(payloadCopy.body, variables);
    if (isAddButtonChecked && templateType?.id) {
      const templateButtonData = getButtonTemplatePayload(urlType, sampleSuffix);
      Object.assign(payloadCopy, { ...templateButtonData });
    }

    if (payloadCopy.type) {
      payloadCopy.type = payloadCopy.type.id;
      // STICKER is a type of IMAGE
      if (payloadCopy.type.id === 'STICKER') {
        payloadCopy.type = 'IMAGE';
      }
    } else {
      payloadCopy.type = 'TEXT';
    }

    if (payloadCopy.type === 'TEXT' || isEditing) {
      delete payloadCopy.attachmentURL;
    }
    if (footer?.trim()) {
      payloadCopy.footer = footer.trim();
    }

    if (tagId) {
      payloadCopy.tagId = payload.tagId.id;
    }

    delete payloadCopy.isAddButtonChecked;
    delete payloadCopy.templateButtons;
    delete payloadCopy.language;
    delete payloadCopy.languageVariant;
    delete payloadCopy.variables;
    delete payloadCopy.existingShortcode;
    delete payloadCopy.newShortcode;
    return payloadCopy;
  };

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
    let buttons: any = [];

    if (templateType?.id) {
      buttons = addFromTemplate ? [...templateButtons, buttonTypes[templateType?.id]] : [buttonTypes[templateType?.id]];
    }

    setTemplateButtons(buttons);
  };

  const removeTemplateButtons = (index: number) => {
    const result = templateButtons.filter((val, idx) => idx !== index);
    setTemplateButtons(result);
  };

  const getTemplateAndButton = (text: string) => {
    const exp = /(\|\s\[)|(\|\[)/;
    const areButtonsPresent = text.search(exp);

    let message: any = text;
    let buttons: any = null;

    if (areButtonsPresent !== -1) {
      buttons = text.substr(areButtonsPresent);
      message = text.substr(0, areButtonsPresent);
    }

    return { message, buttons };
  };

  const addButtonsToSampleMessage = (buttonTemplate: string) => {
    const message: any = { ...sampleMessages };
    message.body = buttonTemplate;
    setSampleMessages(message);
  };

  const handeInputChange = (value: any, row: any, index: any, eventType: any) => {
    let obj = { ...row };

    if (eventType === 'type') {
      obj = { type: value, title: '', value: '' };
    } else {
      obj[eventType] = value;
    }

    const result = templateButtons.map((val: any, idx: number) => {
      if (idx === index) return obj;
      return val;
    });

    setTemplateButtons(result);
  };

  const handleTemplateTypeChange = (value: any) => {
    if (value) {
      setTemplateButtons([buttonTypes[value.id]]);
      setTemplateType(value);
    }
  };

  const getMediaId = async (payload: any) => {
    const data = await createMediaMessage({
      variables: {
        input: {
          caption: payload.body,
          sourceUrl: payload.attachmentURL,
          url: payload.attachmentURL,
        },
      },
    });
    return data;
  };

  const setSimulatorMessage = (messages: any, footer?: any) => {
    const message = removeFirstLineBreak(messages);
    const mediaBody: any = { ...sampleMessages.media };
    let typeValue;
    mediaBody.caption = getExampleFromBody(body, variables);
    mediaBody.url = attachmentURL;
    typeValue = type?.id || 'TEXT';
    let text = message;
    let sampleMessage = { ...sampleMessages, body: text, media: mediaBody, type: typeValue };
    if (footer || footer === '') {
      sampleMessage.footer = footer;
    }
    setSampleMessages(sampleMessage);
  };

  const fields = [
    {
      component: Checkbox,
      name: 'isActive',
      title: (
        <Typography variant="h6" className={styles.IsActive}>
          Active?
        </Typography>
      ),
      darkCheckbox: true,
    },
    {
      component: AutoComplete,
      name: 'language',
      options: languageOptions,
      optionLabel: 'label',
      multiple: false,
      label: `${t('Language')}*`,
      disabled: isEditing,
      onChange: getLanguageId,
    },
    {
      component: Checkbox,
      name: 'languageVariant',
      title: (
        <Typography variant="h6" className={styles.Checkbox}>
          Translate existing HSM?
        </Typography>
      ),
      handleChange: (value: any) => setLanguageVariant(value),
      skip: isEditing,
    },
    {
      component: Input,
      name: 'newShortcode',
      placeholder: `${t('Element name')}`,
      label: `${t('Element name')}*`,
      disabled: isEditing,
      skip: languageVariant ? true : false,
      onChange: (value: any) => {
        setNewShortcode(value);
      },
      helperText: t('Only lowercase alphanumeric characters and underscores are allowed.'),
    },
    {
      component: AutoComplete,
      name: 'existingShortcode',
      options: shortCodeOptions,
      optionLabel: 'label',
      multiple: false,
      label: `${t('Element name')}*`,
      placeholder: `${t('Element name')}`,
      disabled: isEditing,
      onChange: (event: any) => {
        setExistingShortcode(event);
      },
      skip: languageVariant ? false : true,
    },
    {
      component: Input,
      name: 'label',
      disabled: isEditing,
      label: `${t('Title')}*`,
      placeholder: `${t('Title')}`,
      helperText: t('Define what use case does this template serve eg. OTP, optin, activity preference'),
      inputProp: {
        onBlur: (event: any) => setLabel(event.target.value),
      },
    },

    {
      component: EmojiInput,
      name: 'body',
      label: `${t('Message')}*`,
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      disabled: isEditing,
      helperText:
        'You can provide variable values in your HSM templates to personalize the message. To add: click on the variable button and provide an example value for the variable in the field provided below',
      handleChange: (value: any) => {
        setBody(value);
      },
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
      label: `${t('Footer')} (optional)`,
      disabled: isEditing,
      inputProp: {
        onChange: (event: any) => setFooter(event.target.value),
      },
    },
    {
      component: Checkbox,
      title: (
        <Typography variant="h6" className={styles.IsActive}>
          Add buttons
        </Typography>
      ),
      name: 'isAddButtonChecked',
      disabled: !!(isEditing && !isCopyState),
      handleChange: (value: boolean) => setIsAddButtonChecked(value),
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
      dynamicUrlParams,
      onDynamicParamsChange: handleDynamicParamsChange,
      setType,
    },
    {
      component: AutoComplete,
      name: 'category',
      options: categoryOpn,
      optionLabel: 'label',
      multiple: false,
      label: `${t('Category')}*`,
      placeholder: `${t('Category')}`,
      disabled: isEditing,
      helperText: t('Select the most relevant category'),
      onChange: (event: any) => {
        setCategory(event);
      },
      skip: isEditing,
    },
    {
      component: Input,
      name: 'category',
      type: 'text',
      label: `${t('Category')}*`,
      placeholder: `${t('Category')}`,
      disabled: isEditing,
      helperText: t('Select the most relevant category'),
      skip: !isEditing,
    },
    {
      component: AutoComplete,
      name: 'type',
      options: attachmentOptions,
      optionLabel: 'label',
      multiple: false,
      label: t('Attachment Type'),
      disabled: isEditing,
      onChange: (event: any) => {
        const val = event;
        if (!event) {
          setIsUrlValid(val);
          setType(null);
          setShowUploadButton(false);
          return;
        }

        if (val.id === UPLOAD_ATTACHMENT_ID) {
          setShowUploadButton(true);
          setType(val);
        } else {
          setType(val);
          setShowUploadButton(false);
          resetUploadState();
        }
      },
    },
    {
      skip: !showUploadButton || (!uploadingFile && uploadedFile && attachmentURL),
      field: 'customUploadButton',
      component: () => (
        <div className={styles.UploadButtonContainer}>
          <label className={styles.UploadLabel} data-uploading={uploadingFile}>
            <div className={styles.UploadButton}>
              {uploadingFile ? (
                <div className={styles.UploadContent}>
                  <div className={styles.UploadSpinner} />
                  <span className={styles.UploadText}>Uploading...</span>
                </div>
              ) : (
                <div className={styles.UploadContent}>
                  <Upload className={styles.UploadIcon} />
                  <span className={styles.UploadText}>Choose File</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*,video/*,application/pdf"
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
      ),
    },
    {
      component: Input,
      name: 'attachmentURL',
      type: 'text',
      label: t('Attachment URL'),
      validate: () => isUrlValid,
      disabled: isEditing || uploadingFile,
      helperText: uploadedFile
        ? `File uploaded: ${uploadedFile.name}`
        : t(
            'Please provide a sample attachment for approval purpose. You may send a similar but different attachment when sending the HSM to users.'
          ),
      inputProp: {
        onBlur: (event: any) => {
          setAttachmentURL(event.target.value.trim());
        },
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
      onChange: (value: any) => {
        setTagId(value);
      },
      label: t('Tag'),
      helperText: t('Use this to categorize your templates.'),
    },
  ];

  const validation: any = {
    language: Yup.object().nullable().required('Language is required.'),
    label: Yup.string().required(t('Title is required.')).max(50, t('Title length is too long.')),
    type: Yup.object()
      .nullable()
      .when('attachmentURL', {
        is: (val: string) => val && val !== '',
        then: (schema) => schema.nullable().required(t('Type is required.')),
      }),
    attachmentURL: Yup.string()
      .nullable()
      .when('type', {
        is: (val: any) => val && val.id,
        then: (schema) => schema.required(t('Attachment URL is required.')),
      }),
    footer: Yup.string().max(60, t('Footer value can be at most 60 characters')),
    body: Yup.string().required(t('Message is required.')).max(1024, 'Maximum 1024 characters are allowed'),
    category: Yup.object().nullable().required(t('Category is required.')),
    variables: Yup.array().of(
      Yup.object().shape({
        text: Yup.string().required('Variable is required').min(1, 'Text cannot be empty'),
      })
    ),
    newShortcode: Yup.string().when('languageVariant', {
      is: (val: any) => val === true,
      then: (schema) => schema.nullable(),
      otherwise: (schema) =>
        schema
          .required(t('Element name is required.'))
          .matches(regexForShortcode, 'Only lowercase alphanumeric characters and underscores are allowed.'),
    }),
    existingShortcode: Yup.object().when('languageVariant', {
      is: (val: any) => val === true,
      then: (schema) => schema.nullable().required(t('Element name is required.')),
      otherwise: (schema) => schema.nullable(),
    }),
    templateButtons: Yup.array().of(
      Yup.lazy(() => {
        if (isAddButtonChecked) {
          if (templateType?.id === 'CALL_TO_ACTION') {
            return Yup.object().shape({
              type: Yup.string().required('Type is required.'),
              title: Yup.string().required('Title is required.'),
              value: Yup.string().required('Value is required.'),
            });
          } else if (templateType?.id === 'QUICK_REPLY') {
            return Yup.object().shape({
              value: Yup.string().required('Value is required.'),
            });
          } else if (templateType?.id === 'WHATSAPP_FORM') {
            return Yup.object().shape({
              form_id: Yup.string().required('Form is required.'),
              text: Yup.string().required('Button title is required.'),
              navigate_screen: Yup.string().required('Screen is required.'),
            });
          }
          return Yup.object().shape({});
        } else {
          return Yup.object().shape({});
        }
      })
    ),
  };

  const FormSchema = Yup.object().shape(validation, [['type', 'attachmentURL']]);

  useEffect(() => {
    if (languages) {
      const lang = languages.currentUser.user.organization.activeLanguages.slice();
      // sort languages by their name
      lang.sort((first: any, second: any) => (first.label > second.label ? 1 : -1));
      setLanguageOptions(lang);
      if (!isEditing) {
        // Try to find English
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

  if (languageLoading || categoryLoading || tagLoading || shortcodesLoading) {
    return <Loading />;
  }

  return (
    <>
      <FormLayout
        {...queries}
        states={states}
        isView={true}
        setStates={setStates}
        subHead={isEditing ? 'view' : 'edit'}
        setPayload={setPayload}
        validationSchema={isEditing ? Yup.object() : FormSchema}
        listItemName="HSM Template"
        dialogMessage={dialogMessage}
        backButtonLabel={isEditing ? 'Go Back' : 'Cancel'}
        formFields={fields}
        redirectionLink={backButton}
        listItem="sessionTemplate"
        icon={templateIcon}
        getLanguageId={getLanguageId}
        languageSupport={false}
        skipCancel={isEditing ? t('Go Back') : false}
        isAttachment
        getQueryFetchPolicy="cache-and-network"
        button={!isEditing ? t('Submit for Approval') : false}
        buttonState={{ text: t('Validating URL'), status: validatingURL }}
        saveOnPageChange={false}
        type={mode}
        copyNotification={copyMessage}
        backLinkButton={`/${backButton}`}
        cancelLink={backButton}
        getMediaId={getMediaId}
        entityId={params.id}
        afterSave={() => refetchShortcodes()}
      />
      <Simulator isPreviewMessage message={sampleMessages} simulatorIcon={false} />
    </>
  );
};

export default HSM;
