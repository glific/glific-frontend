import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import Typography from '@mui/material/Typography';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { FormLayout } from 'containers/Form/FormLayout';
import { TemplateOptions } from 'containers/TemplateOptions/TemplateOptions';
import { Input } from 'components/UI/Form/Input/Input';
import { EmojiInput } from 'components/UI/Form/EmojiInput/EmojiInput';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { LanguageBar } from 'components/UI/LanguageBar/LanguageBar';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_TEMPLATE } from 'graphql/queries/Template';
import { CREATE_MEDIA_MESSAGE } from 'graphql/mutations/Chat';
import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_TAGS } from 'graphql/queries/Tags';
import { CREATE_TEMPLATE, UPDATE_TEMPLATE, DELETE_TEMPLATE } from 'graphql/mutations/Template';
import {
  MEDIA_MESSAGE_TYPES,
  CALL_TO_ACTION,
  QUICK_REPLY,
  VALID_URL_REGEX,
} from 'common/constants';
import { CreateAutoComplete } from 'components/UI/Form/CreateAutoComplete/CreateAutoComplete';
import { validateMedia } from 'common/utils';
import styles from './Template.module.css';
import { TemplateVariables } from '../TemplateVariables/TemplateVariables';

// const regexForShortcode = /^[a-z0-9_]+$/g;

const dialogMessage = ' It will stop showing when you are drafting a customized message.';

const queries = {
  getItemQuery: GET_TEMPLATE,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

const options = MEDIA_MESSAGE_TYPES.map((option: string) => ({ id: option, label: option }));

const formIsActive = {
  component: Checkbox,
  name: 'isActive',
  title: (
    <Typography variant="h6" className={styles.IsActive}>
      Active?
    </Typography>
  ),
  darkCheckbox: true,
};

/**
 *
 * @param templateButtons buttons that need to be converted to gupshup format
 * @param templateType depending on template type convert button to gupshup format
 */
const convertButtonsToTemplate = (templateButtons: Array<any>, templateType: string | null) =>
  templateButtons.reduce((result: any, temp: any) => {
    const { title, value } = temp;
    if (templateType === CALL_TO_ACTION && value && title) {
      result.push(`[${title}, ${value}]`);
    }
    if (templateType === QUICK_REPLY && value) {
      result.push(`[${value}]`);
    }
    return result;
  }, []);

/**
 *
 * @param templateType template type
 * @param message
 * @param buttons
 * Since messages and buttons are now separated
 * we are combining both message and buttons,
 * so that you can see preview in simulator
 */
const getTemplateAndButtons = (templateType: string, message: string, buttons: string) => {
  const templateButtons = JSON.parse(buttons);
  let result: any;
  if (templateType === CALL_TO_ACTION) {
    result = templateButtons.map((button: any) => {
      const { phone_number: phoneNo, url, type, text } = button;
      return { type, value: url || phoneNo, title: text };
    });
  }

  if (templateType === QUICK_REPLY) {
    result = templateButtons.map((button: any) => {
      const { text, type } = button;
      return { type, value: text };
    });
  }

  // Getting in template format of gupshup
  const templateFormat = convertButtonsToTemplate(result, templateType);
  // Pre-pending message with buttons
  const template = `${message} | ${templateFormat.join(' | ')}`;
  return { buttons: result, template };
};

const getExampleFromBody = (body: string, variables: Array<any>) => {
  return body.replace(/{{(\d+)}}/g, (match, number) => {
    let index = parseInt(number) - 1;
    console.log(variables);

    return variables[index]?.text
      ? variables[index]
        ? `[${variables[index]?.text}]`
        : match
      : `{{${number}}}`;
  });
};

export interface TemplateProps {
  listItemName: string;
  redirectionLink: string;
  icon: any;
  defaultAttribute?: any;
  formField?: any;
  customStyle?: any;
  getUrlAttachmentAndType?: any;
  getShortcode?: any;
  getExample?: any;
  setCategory?: any;
  category?: any;
  onExampleChange?: any;
  languageStyle?: string;
  getSimulatorMessage?: any;
  languageVariant?: boolean;
  newShortCode?: any;
  existingShortCode?: any;
}

interface CallToActionTemplate {
  type: string;
  title: string;
  value: string;
}

interface QuickReplyTemplate {
  value: string;
}

const Template = ({
  listItemName,
  redirectionLink,
  icon,
  defaultAttribute = { isHsm: false },
  formField,
  customStyle,
  getUrlAttachmentAndType,
  getShortcode,
  getExample,
  setCategory,
  category,
  onExampleChange = () => {},
  languageStyle = 'dropdown',
  getSimulatorMessage,
  languageVariant,
  newShortCode,
  existingShortCode,
}: TemplateProps) => {
  // "Audio" option is removed in case of HSM Template
  const mediaTypes =
    listItemName === 'HSM Template'
      ? options.filter(({ label }) => label !== 'AUDIO' && label !== 'STICKER')
      : options;

  const [tagId, setTagId] = useState<any>(null);
  const [label, setLabel] = useState('');
  const [body, setBody] = useState<any>();
  const [example, setExample] = useState<any>('');
  const [shortcode, setShortcode] = useState('');
  const [language, setLanguageId] = useState<any>(null);
  const [type, setType] = useState<any>(null);
  const [translations, setTranslations] = useState<any>();
  const [attachmentURL, setAttachmentURL] = useState<any>('');
  const [languageOptions, setLanguageOptions] = useState<any>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [validatingURL, setValidatingURL] = useState<boolean>(false);
  const [warning, setWarning] = useState<any>();
  const [isUrlValid, setIsUrlValid] = useState<any>();
  const [templateType, setTemplateType] = useState<string | null>(null);
  const [templateButtons, setTemplateButtons] = useState<
    Array<CallToActionTemplate | QuickReplyTemplate>
  >([]);
  const [isAddButtonChecked, setIsAddButtonChecked] = useState(false);
  const [nextLanguage, setNextLanguage] = useState<any>('');
  const [editorValue, setEditorValue] = useState('');
  const [variables, setVariables] = useState<any>([]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location: any = useLocation();
  const params = useParams();

  let isEditing = false;
  let mode;

  const isCopyState = location.state === 'copy';
  if (isCopyState) {
    queries.updateItemQuery = CREATE_TEMPLATE;
    mode = 'copy';
  } else {
    queries.updateItemQuery = UPDATE_TEMPLATE;
  }

  // disable fields in edit mode for hsm template
  if (params.id && !isCopyState && defaultAttribute.isHsm) {
    isEditing = true;
  }

  const { data: tag, loading: tagLoading } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const { data: languages, loading: languageLoading } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });

  const [getSessionTemplate, { data: template, loading: templateLoading }] =
    useLazyQuery<any>(GET_TEMPLATE);

  // create media for attachment
  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE);

  const states = {
    language,
    label,
    body,
    type,
    attachmentURL,
    category,
    example,
    tagId,
    isActive,
    templateButtons,
    isAddButtonChecked,
    languageVariant,
    variables,
  };

  const setStates = ({
    isActive: isActiveValue,
    language: languageIdValue,
    label: labelValue,
    body: bodyValue,
    example: exampleValue,
    type: typeValue,
    translations: translationsValue,
    MessageMedia: MessageMediaValue,
    shortcode: shortcodeValue,
    category: categoryValue,
    tag: tagIdValue,
    buttonType: templateButtonType,
    buttons,
    hasButtons,
  }: any) => {
    if (languageOptions.length > 0 && languageIdValue) {
      if (location.state && location.state !== 'copy') {
        const selectedLangauge = languageOptions.find(
          (lang: any) => lang.label === location.state.language
        );
        navigate(location.pathname);
        setLanguageId(selectedLangauge);
      } else if (!language?.id) {
        const selectedLangauge = languageOptions.find(
          (lang: any) => lang.id === languageIdValue.id
        );
        setLanguageId(selectedLangauge);
      } else {
        setLanguageId(language);
      }
    }

    setLabel(labelValue);
    setIsActive(isActiveValue);

    if (typeof bodyValue === 'string') {
      setBody(bodyValue || '');
    }

    if (exampleValue) {
      let exampleBody: any;
      if (hasButtons) {
        setTemplateType(templateButtonType);
        const { buttons: buttonsVal, template } = getTemplateAndButtons(
          templateButtonType,
          exampleValue,
          buttons
        );
        exampleBody = template;
        setTemplateButtons(buttonsVal);
      } else {
        exampleBody = exampleValue;
      }

      setExample(exampleValue);
      onExampleChange(exampleBody);
    }

    if (hasButtons) {
      setIsAddButtonChecked(hasButtons);
    }
    if (typeValue && typeValue !== 'TEXT') {
      setType({ id: typeValue, label: typeValue });
    } else {
      setType(null);
    }
    if (translationsValue) {
      const translationsCopy = JSON.parse(translationsValue);
      const currentLanguage = language?.id || languageIdValue.id;
      if (
        Object.keys(translationsCopy).length > 0 &&
        translationsCopy[currentLanguage] &&
        !location.state
      ) {
        const content = translationsCopy[currentLanguage];
        setLabel(content.label);
        setBody(content.body || '');
      }
      setTranslations(translationsValue);
    }
    if (MessageMediaValue) {
      setAttachmentURL(MessageMediaValue.sourceUrl);
    } else {
      setAttachmentURL('');
    }
    if (shortcodeValue) {
      setTimeout(() => setShortcode(shortcodeValue), 0);
    }

    if (categoryValue) {
      setTimeout(() => setCategory({ label: categoryValue, id: categoryValue }), 0);
    }
    if (tagIdValue) {
      setTagId(tagIdValue);
    }
  };

  const updateStates = ({
    language: languageIdValue,
    label: labelValue,
    body: bodyValue,
    type: typeValue,
    MessageMedia: MessageMediaValue,
  }: any) => {
    if (languageIdValue) {
      setLanguageId(languageIdValue);
    }

    setLabel(labelValue);

    if (typeof bodyValue === 'string') {
      setBody(bodyValue || '');
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

  const displayWarning = () => {
    if (type && type.id === 'STICKER') {
      setWarning(
        <div className={styles.Warning}>
          <ol>
            <li>{t('Animated stickers are not supported.')}</li>
            <li>{t('Captions along with stickers are not supported.')}</li>
          </ol>
        </div>
      );
    } else if (type && type.id === 'AUDIO') {
      setWarning(
        <div className={styles.Warning}>
          <ol>
            <li>{t('Captions along with audio are not supported.')}</li>
          </ol>
        </div>
      );
    } else {
      setWarning(null);
    }
  };

  const HSMValidation = {
    category: Yup.object().nullable().required(t('Category is required.')),
    variables: Yup.array().of(
      Yup.object().shape({
        text: Yup.string().required('Variable is required').min(1, 'Text cannot be empty'),
      })
    ),
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
    const buttonType: any = {
      QUICK_REPLY: { value: '' },
      CALL_TO_ACTION: { type: '', title: '', value: '' },
    };

    if (templateType) {
      buttons = addFromTemplate
        ? [...templateButtons, buttonType[templateType]]
        : [buttonType[templateType]];
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

  useEffect(() => {
    if (params.id) {
      getSessionTemplate({ variables: { id: params.id } });
    }
  }, []);

  useEffect(() => {
    if (languages) {
      const lang = languages.currentUser.user.organization.activeLanguages.slice();
      // sort languages by thaeir name
      lang.sort((first: any, second: any) => (first.label > second.label ? 1 : -1));

      setLanguageOptions(lang);
      if (!isEditing) setLanguageId(lang[0]);
    }
  }, [languages]);

  useEffect(() => {
    setShortcode(getShortcode);
  }, [getShortcode]);

  useEffect(() => {
    if (getExample) {
      setExample(getExample);
    }
  }, [getExample]);

  useEffect(() => {
    if ((type === '' || type) && attachmentURL) {
      validateURL(attachmentURL);
      if (getUrlAttachmentAndType) {
        getUrlAttachmentAndType(type.id || 'TEXT', { url: attachmentURL });
      }
    }
  }, [type, attachmentURL]);

  useEffect(() => {
    displayWarning();
  }, [type]);

  useEffect(() => {
    if (templateType) {
      addTemplateButtons(false);
    }
  }, [templateType]);

  // Removing buttons when checkbox is checked or unchecked
  useEffect(() => {
    if (getExample) {
      const { message }: any = getTemplateAndButton(getExample);
      onExampleChange(message || '');
    }
  }, [isAddButtonChecked]);

  // Converting buttons to template and vice-versa to show realtime update on simulator
  useEffect(() => {
    if (templateButtons.length > 0) {
      const parse = convertButtonsToTemplate(templateButtons, templateType);

      const parsedText = parse.length ? `| ${parse.join(' | ')}` : null;

      const { message }: any = getTemplateAndButton(example);

      const sampleText: any = parsedText && message + parsedText;
      console.log(parse, parsedText, message, sampleText);

      if (sampleText) {
        onExampleChange(sampleText);
      }
    }
  }, [templateButtons]);

  useEffect(() => {
    if (getSimulatorMessage) {
      getSimulatorMessage(getExampleFromBody(editorValue, variables));
    }
  }, [editorValue, variables]);

  if (languageLoading || templateLoading || tagLoading) {
    return <Loading />;
  }

  const updateTranslation = (value: any) => {
    const translationId = value.id;
    // restore if selected language is same as template
    if (template && template.sessionTemplate.sessionTemplate.language.id === value.id) {
      updateStates({
        language: value,
        label: template.sessionTemplate.sessionTemplate.label,
        body: template.sessionTemplate.sessionTemplate.body,
        type: template.sessionTemplate.sessionTemplate.type,
        MessageMedia: template.sessionTemplate.sessionTemplate.MessageMedia,
      });
    } else if (translations && !defaultAttribute.isHsm) {
      const translationsCopy = JSON.parse(translations);
      // restore if translations present for selected language
      if (translationsCopy[translationId]) {
        updateStates({
          language: value,
          label: translationsCopy[translationId].label,
          body: translationsCopy[translationId].body,
          type: translationsCopy[translationId].MessageMedia
            ? translationsCopy[translationId].MessageMedia.type
            : null,
          MessageMedia: translationsCopy[translationId].MessageMedia,
        });
      } else {
        updateStates({
          language: value,
          label: '',
          body: '',
          type: null,
          MessageMedia: null,
        });
      }
    }
  };

  const handleLanguageChange = (value: any) => {
    const selected = languageOptions.find(
      ({ label: languageLabel }: any) => languageLabel === value
    );
    if (selected && isEditing) {
      updateTranslation(selected);
    } else if (selected) {
      setLanguageId(selected);
    }
  };

  const getLanguageId = (value: any) => {
    let result = value;
    if (languageStyle !== 'dropdown') {
      const selected = languageOptions.find((option: any) => option.label === value);
      result = selected;
    }

    // create translations only while updating
    if (result && isEditing) {
      updateTranslation(result);
    }
    if (result) setLanguageId(result);
  };

  let timer: any = null;
  const attachmentField = [
    {
      component: AutoComplete,
      name: 'type',
      options: mediaTypes,
      optionLabel: 'label',
      multiple: false,
      label: t('Attachment Type'),
      disabled: isEditing,
      helperText: warning,
      onChange: (event: any) => {
        const val = event;
        if (!event) {
          setIsUrlValid(val);
        }
        setType(val);
      },
    },
    {
      component: Input,
      name: 'attachmentURL',
      type: 'text',
      label: t('Attachment URL'),
      validate: () => isUrlValid,
      disabled: isEditing,
      helperText: t(
        'Please provide a sample attachment for approval purpose. You may send a similar but different attachment when sending the HSM to users.'
      ),
      inputProp: {
        onBlur: (event: any) => {
          setAttachmentURL(event.target.value);
        },
        onChange: (event: any) => {
          clearTimeout(timer);
          timer = setTimeout(() => setAttachmentURL(event.target.value), 1000);
        },
      },
    },
  ];

  const langOptions = languageOptions && languageOptions.map((val: any) => val.label);

  const onLanguageChange = (option: string, form: any) => {
    setNextLanguage(option);
    const { values } = form;
    if (values.label || values.body) {
      return;
    }
    handleLanguageChange(option);
  };

  const languageComponent =
    languageStyle === 'dropdown'
      ? {
          component: AutoComplete,
          name: 'language',
          options: languageOptions,
          optionLabel: 'label',
          multiple: false,
          label: `${t('Language')}*`,
          disabled: isEditing,
          onChange: getLanguageId,
        }
      : {
          component: LanguageBar,
          options: langOptions || [],
          selectedLangauge: language && language.label,
          onLanguageChange,
        };

  const handeInputChange = (event: any, row: any, index: any, eventType: any) => {
    const { value } = event.target;
    const obj = { ...row };
    obj[eventType] = value;

    const result = templateButtons.map((val: any, idx: number) => {
      if (idx === index) return obj;
      return val;
    });

    setTemplateButtons(result);
  };

  const formFields = [
    languageComponent,
    {
      component: Input,
      name: 'label',
      label: t('Title'),
      disabled: isEditing,
      helperText: defaultAttribute.isHsm
        ? t('Define what use case does this template serve eg. OTP, optin, activity preference')
        : null,
      inputProp: {
        onBlur: (event: any) => setLabel(event.target.value),
      },
    },
    formIsActive,
    {
      component: EmojiInput,
      name: 'body',
      label: t('Message'),
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      disabled: isEditing,
      helperText: defaultAttribute.isHsm
        ? 'You can provide variable values in your HSM templates to personalize the message. To add: click on the variable button and provide an example value for the variable in the field provided below'
        : null,
      handleChange: (value: any) => {
        setEditorValue(value);
      },
      isEditing: isEditing,
    },
  ];

  const templateRadioOptions = [
    {
      component: Checkbox,
      title: (
        <Typography variant="h6" className={styles.IsActive}>
          Add buttons
        </Typography>
      ),
      name: 'isAddButtonChecked',
      disabled: !!(defaultAttribute.isHsm && params.id && !isCopyState),
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
      onTemplateTypeChange: (value: string) => setTemplateType(value),
    },
  ];

  const tags = {
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
  };

  const templateVariables = [
    {
      component: TemplateVariables,
      editorValue: editorValue,
      variables: variables,
      setVariables: setVariables,
    },
  ];

  const hsmFields = formField && [
    ...formFields.slice(0, 1),
    ...formField.slice(0, 1),
    ...formField.slice(1, 3),
    ...formFields.slice(1),
    ...templateVariables,
    ...templateRadioOptions,
    ...formField.slice(3),
    ...attachmentField,
    tags,
  ];

  const fields = defaultAttribute.isHsm ? hsmFields : [...formFields, ...attachmentField];

  // Creating payload for button template
  const getButtonTemplatePayload = () => {
    const buttons = templateButtons.reduce((result: any, button) => {
      const { type: buttonType, value, title }: any = button;
      if (templateType === CALL_TO_ACTION) {
        const typeObj: any = {
          phone_number: 'PHONE_NUMBER',
          url: 'URL',
        };
        const obj: any = { type: typeObj[buttonType], text: title, [buttonType]: value };
        result.push(obj);
      }

      if (templateType === QUICK_REPLY) {
        const obj: any = { type: QUICK_REPLY, text: value };
        result.push(obj);
      }
      return result;
    }, []);

    // get template body
    const templateBody = getTemplateAndButton(body);
    const templateExample = getTemplateAndButton(example);

    return {
      hasButtons: true,
      buttons: JSON.stringify(buttons),
      buttonType: templateType,
      body: templateBody.message,
      example: templateExample.message,
    };
  };

  const setPayload = (payload: any) => {
    let payloadCopy = payload;
    payloadCopy.body = editorValue;

    let translationsCopy: any = {};
    if (template) {
      if (template.sessionTemplate.sessionTemplate.language.id === language.id) {
        payloadCopy.languageId = language.id;
        if (payloadCopy.type) {
          payloadCopy.type = payloadCopy.type.id;
          // STICKER is a type of IMAGE
          if (payloadCopy.type.id === 'STICKER') {
            payloadCopy.type = 'IMAGE';
          }
        } else {
          payloadCopy.type = 'TEXT';
        }

        delete payloadCopy.language;
        if (payloadCopy.isHsm) {
          if (isAddButtonChecked && templateType) {
            const templateButtonData = getButtonTemplatePayload();
            Object.assign(payloadCopy, { ...templateButtonData });
          }
        } else {
          delete payloadCopy.example;
          delete payloadCopy.isActive;
          delete payloadCopy.shortcode;
          delete payloadCopy.category;
        }
        if (payloadCopy.type === 'TEXT') {
          delete payloadCopy.attachmentURL;
        }

        // Removing unnecessary fields
        delete payloadCopy.isAddButtonChecked;
        delete payloadCopy.templateButtons;
      } else if (!defaultAttribute.isHsm) {
        let messageMedia = null;
        if (payloadCopy.type && payloadCopy.attachmentURL) {
          messageMedia = {
            type: payloadCopy.type.id,
            sourceUrl: payloadCopy.attachmentURL,
          };
        }
        // Update template translation
        if (translations) {
          translationsCopy = JSON.parse(translations);
          translationsCopy[language.id] = {
            status: 'approved',
            languageId: language,
            label: payloadCopy.label,
            body: editorValue,
            MessageMedia: messageMedia,
            ...defaultAttribute,
          };
        }
        payloadCopy = {
          translations: JSON.stringify(translationsCopy),
        };
      }
    } else {
      // Create template
      payloadCopy.languageId = payload.language.id;
      if (payloadCopy.type) {
        payloadCopy.type = payloadCopy.type.id;
        // STICKER is a type of IMAGE
        if (payloadCopy.type.id === 'STICKER') {
          payloadCopy.type = 'IMAGE';
        }
      } else {
        payloadCopy.type = 'TEXT';
      }
      if (payloadCopy.isHsm) {
        payloadCopy.category = category.label;
        if (editorValue) {
          payloadCopy.example = getExampleFromBody(editorValue, variables);
        }
        if (languageVariant) {
          payloadCopy.shortcode = existingShortCode.label;
        } else {
          payloadCopy.shortcode = newShortCode;
        }
        if (isAddButtonChecked && templateType) {
          const templateButtonData = getButtonTemplatePayload();
          Object.assign(payloadCopy, { ...templateButtonData });
        }
      } else {
        delete payloadCopy.example;
        delete payloadCopy.isActive;
        delete payloadCopy.shortcode;
        delete payloadCopy.category;
      }
      delete payloadCopy.languageVariant;
      delete payloadCopy.getShortcode;
      delete payloadCopy.isAddButtonChecked;
      delete payloadCopy.templateButtons;
      delete payloadCopy.language;
      delete payloadCopy.variables;

      if (payloadCopy.type === 'TEXT') {
        delete payloadCopy.attachmentURL;
      }
      payloadCopy.translations = JSON.stringify(translationsCopy);
    }

    if (tagId) {
      payloadCopy.tagId = payload.tagId.id;
    }
    return payloadCopy;
  };

  // create media for attachment
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
  };

  if (defaultAttribute.isHsm && isAddButtonChecked) {
    if (templateType === CALL_TO_ACTION) {
      validation.templateButtons = Yup.array()
        .of(
          Yup.object().shape({
            type: Yup.string().required(t('Required')),
            title: Yup.string().required(t('Required')),
            value: Yup.string()
              .required('Required')
              .when('type', {
                is: (val: any) => val === 'phone_number',
                then: (schema) =>
                  schema.matches(/^\d{10,12}$/, t('Please enter valid phone number.')),
              })
              .when('type', {
                is: (val: any) => val === 'url',
                then: (schema) =>
                  schema.matches(new RegExp(VALID_URL_REGEX, 'gi'), t('Please enter valid url.')),
              }),
          })
        )
        .min(1)
        .max(2);
    } else {
      validation.templateButtons = Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().max(25, 'Only 25 characters are allowed.').required(t('Required')),
          })
        )
        .min(1)
        .max(3);
    }
  }

  const validationObj = defaultAttribute.isHsm ? { ...validation, ...HSMValidation } : validation;
  const FormSchema = Yup.object().shape(validationObj, [['type', 'attachmentURL']]);

  const afterSave = (data: any, saveClick: boolean) => {
    if (saveClick) {
      return;
    }
    if (params.id) {
      handleLanguageChange(nextLanguage);
    } else {
      const { sessionTemplate } = data.createSessionTemplate;
      location.language = nextLanguage;
      navigate(`/speed-send/${sessionTemplate.id}/edit`);
    }
  };

  let copyMessage = t('Copy of the speed send has been created!');
  if (defaultAttribute.isHsm) {
    copyMessage = t('Copy of the template has been created!');
  }

  return (
    <FormLayout
      {...queries}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={isEditing ? Yup.object() : FormSchema}
      listItemName={listItemName}
      dialogMessage={dialogMessage}
      formFields={fields}
      redirectionLink={redirectionLink}
      listItem="sessionTemplate"
      icon={icon}
      defaultAttribute={defaultAttribute}
      getLanguageId={getLanguageId}
      languageSupport={false}
      isAttachment
      getMediaId={defaultAttribute.isHsm && params.id ? () => {} : getMediaId}
      getQueryFetchPolicy="cache-and-network"
      button={defaultAttribute.isHsm && !params.id ? t('Submit for Approval') : t('Save')}
      buttonState={{ text: t('Validating URL'), status: validatingURL }}
      customStyles={customStyle}
      saveOnPageChange={false}
      afterSave={!defaultAttribute.isHsm ? afterSave : undefined}
      type={mode}
      copyNotification={copyMessage}
      backLinkButton={`/${redirectionLink}`}
    />
  );
};

export default Template;
