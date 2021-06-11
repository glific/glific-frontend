import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { EditorState } from 'draft-js';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';

import styles from './Template.module.css';
import { Input } from '../../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../../components/UI/Form/EmojiInput/EmojiInput';
import { FormLayout } from '../../Form/FormLayout';
import { TemplateOptions } from '../../TemplateOptions/TemplateOptions';
import { convertToWhatsApp, WhatsAppToDraftEditor } from '../../../common/RichEditor';
import { GET_TEMPLATE, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import {
  CREATE_TEMPLATE,
  UPDATE_TEMPLATE,
  DELETE_TEMPLATE,
} from '../../../graphql/mutations/Template';
import { MEDIA_MESSAGE_TYPES, CALL_TO_ACTION, QUICK_REPLY } from '../../../common/constants';
import { AutoComplete } from '../../../components/UI/Form/AutoComplete/AutoComplete';
import { CREATE_MEDIA_MESSAGE } from '../../../graphql/mutations/Chat';
import { Checkbox } from '../../../components/UI/Form/Checkbox/Checkbox';
import { USER_LANGUAGES } from '../../../graphql/queries/Organization';
import { validateMedia } from '../../../common/utils';

const regexForShortcode = /^[a-z0-9_]+$/g;

const HSMValidation = {
  example: Yup.string()
    .transform((current, original) => original.getCurrentContent().getPlainText())
    .required('Example is required.'),
  category: Yup.object().nullable().required('Category is required.'),
  shortcode: Yup.string()
    .required('Element name is required.')
    .matches(
      regexForShortcode,
      'Only lowercase alphanumeric characters and underscores are allowed.'
    ),
};

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
    <Typography variant="h6" style={{ color: '#073f24' }}>
      Is active?
    </Typography>
  ),
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

export interface TemplateProps {
  match: any;
  listItemName: string;
  redirectionLink: string;
  icon: any;
  defaultAttribute?: any;
  formField?: any;
  getSessionTemplatesCallBack?: any;
  customStyle?: any;
  getUrlAttachmentAndType?: any;
  getShortcode?: any;
  getExample?: any;
  getCategory?: any;
  onExampleChange?: any;
}

interface CallToActionTemplate {
  type: string;
  title: string;
  value: string;
}

interface QuickReplyTemplate {
  value: string;
}

const Template: React.SFC<TemplateProps> = (props) => {
  const {
    match,
    listItemName,
    redirectionLink,
    icon,
    defaultAttribute = { isHsm: false },
    formField,
    getSessionTemplatesCallBack,
    customStyle,
    getUrlAttachmentAndType,
    getShortcode,
    getExample,
    getCategory,
    onExampleChange,
  } = props;

  const [label, setLabel] = useState('');
  const [body, setBody] = useState(EditorState.createEmpty());
  const [example, setExample] = useState(EditorState.createEmpty());
  const [filterLabel, setFilterLabel] = useState('');
  const [shortcode, setShortcode] = useState('');
  const [language, setLanguageId] = useState<any>({});
  const [type, setType] = useState<any>('');
  const [translations, setTranslations] = useState<any>();
  const [attachmentURL, setAttachmentURL] = useState<any>();
  const [languageOptions, setLanguageOptions] = useState<any>([]);
  const [category, setCategory] = useState<any>();
  const [isActive, setIsActive] = useState<boolean>(true);
  const [warning, setWarning] = useState<any>();
  const [isUrlValid, setIsUrlValid] = useState<any>();
  const [templateType, setTemplateType] = useState<string | null>(null);
  const [templateButtons, setTemplateButtons] = useState<
    Array<CallToActionTemplate | QuickReplyTemplate>
  >([]);
  const [isAddButtonChecked, setIsAddButtonChecked] = useState(false);
  const { t } = useTranslation();

  const states = {
    language,
    label,
    body,
    type,
    attachmentURL,
    shortcode,
    example,
    category,
    isActive,
    templateButtons,
    isAddButtonChecked,
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
    buttonType: templateButtonType,
    buttons,
    hasButtons,
  }: any) => {
    if (languageIdValue) {
      setLanguageId(languageIdValue);
    }

    setLabel(labelValue);
    setIsActive(isActiveValue);

    if (typeof bodyValue === 'string') {
      let bodyVal;
      if (hasButtons) {
        const { buttons: buttonsVal, template } = getTemplateAndButtons(
          templateButtonType,
          bodyValue,
          buttons
        );
        setTemplateButtons(buttonsVal);
        bodyVal = template;
      } else {
        bodyVal = bodyValue;
      }
      setBody(EditorState.createWithContent(WhatsAppToDraftEditor(bodyVal)));
    }

    if (exampleValue) {
      let exampleBody;
      if (hasButtons) {
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
      const editorStateBody = EditorState.createWithContent(WhatsAppToDraftEditor(exampleBody));
      setTimeout(() => onExampleChange(editorStateBody), 0);
    }

    if (typeValue && typeValue !== 'TEXT') {
      setType({ id: typeValue, label: typeValue });
    } else {
      setType('');
    }
    if (translationsValue) setTranslations(translationsValue);
    if (MessageMediaValue) {
      setAttachmentURL(MessageMediaValue.sourceUrl);
    } else {
      setAttachmentURL('');
    }
    if (shortcodeValue) {
      setTimeout(() => setShortcode(shortcodeValue), 0);
    }
    if (categoryValue) {
      setCategory({ label: categoryValue, id: categoryValue });
    }
  };
  const { data: languages } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });

  const [getSessionTemplates, { data: sessionTemplates }] = useLazyQuery<any>(FILTER_TEMPLATES, {
    variables: {
      filter: { languageId: parseInt(language.id, 10) },
      opts: {
        order: 'ASC',
        limit: null,
        offset: 0,
      },
    },
  });

  const [getSessionTemplate, { data: template }] = useLazyQuery<any>(GET_TEMPLATE);

  // create media for attachment
  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE);

  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(match.params, 'id') && match.params.id) {
      getSessionTemplate({ variables: { id: match.params.id } });
    }
  }, [match.params]);

  useEffect(() => {
    if (languages) {
      const lang = languages.currentUser.user.organization.activeLanguages.slice();
      // sort languages by their name
      lang.sort((first: any, second: any) => (first.label > second.label ? 1 : -1));

      setLanguageOptions(lang);
      if (!Object.prototype.hasOwnProperty.call(match.params, 'id')) setLanguageId(lang[0]);
    }
  }, [languages]);

  useEffect(() => {
    if (filterLabel && language && language.id) {
      getSessionTemplates();
    }
  }, [filterLabel, language, getSessionTemplates]);

  useEffect(() => {
    setShortcode(getShortcode);
  }, [getShortcode]);

  useEffect(() => {
    if (getExample) {
      setExample(getExample);
    }
  }, [getExample]);

  useEffect(() => {
    if (getCategory) {
      setCategory(getCategory);
    }
  }, [getCategory]);

  const validateTitle = (value: any) => {
    let error;
    if (value) {
      setFilterLabel(value);
      let found = [];
      if (sessionTemplates) {
        if (getSessionTemplatesCallBack) {
          getSessionTemplatesCallBack(sessionTemplates);
        }
        // need to check exact title
        found = sessionTemplates.sessionTemplates.filter((search: any) => search.label === value);
        if (props.match.params.id && found.length > 0) {
          found = found.filter((search: any) => search.id !== props.match.params.id);
        }
      }
      if (found.length > 0) {
        error = t('Title already exists.');
      }
    }
    return error;
  };

  const UpdateTranslation = (value: any) => {
    const Id = value.id;
    // restore if selected language is same as template
    if (template && template.sessionTemplate.sessionTemplate.language.id === value.id) {
      setStates({
        language: value,
        label: template.sessionTemplate.sessionTemplate.label,
        body: template.sessionTemplate.sessionTemplate.body,
        type: template.sessionTemplate.sessionTemplate.type,
        MessageMedia: template.sessionTemplate.sessionTemplate.MessageMedia,
      });
    } else if (translations && !defaultAttribute.isHsm) {
      const translationsCopy = JSON.parse(translations);
      // restore if translations present for selected language
      if (translationsCopy[Id]) {
        setStates({
          language: value,
          label: translationsCopy[Id].label,
          body: translationsCopy[Id].body,
          type: translationsCopy[Id].MessageMedia ? translationsCopy[Id].MessageMedia.type : null,
          MessageMedia: translationsCopy[Id].MessageMedia,
        });
      } else {
        setStates({
          language: value,
          label: '',
          body: '',
          type: null,
          MessageMedia: null,
        });
      }
    }
  };

  const getLanguageId = (value: any) => {
    // create translations only while updating
    if (value && Object.prototype.hasOwnProperty.call(match.params, 'id')) {
      UpdateTranslation(value);
    }
    if (value) setLanguageId(value);
  };

  const validateURL = (value: string) => {
    if (value && type) {
      validateMedia(value, type.id).then((response: any) => {
        if (!response.data.is_valid) {
          setIsUrlValid(response.data.message);
        } else {
          setIsUrlValid('');
        }
      });
    }
  };

  useEffect(() => {
    if ((type === '' || type) && attachmentURL) {
      validateURL(attachmentURL);
      if (getUrlAttachmentAndType) {
        getUrlAttachmentAndType(type.id || 'TEXT', { url: attachmentURL });
      }
    }
  }, [type, attachmentURL]);

  const displayWarning = () => {
    if (type.id === 'STICKER') {
      setWarning(
        <div className={styles.Warning}>
          <ol>
            <li>{t('Animated stickers are not supported.')}</li>
            <li>{t('Captions along with stickers are not supported.')}</li>
          </ol>
        </div>
      );
    } else if (type.id === 'AUDIO') {
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

  useEffect(() => {
    displayWarning();
  }, [type]);

  let timer: any = null;
  const attachmentField = [
    {
      component: AutoComplete,
      name: 'type',
      options,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: t('Attachment Type'),
      },
      helperText: warning,
      onChange: (event: any) => {
        const val = event || '';
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
      placeholder: t('Attachment URL'),
      validate: () => isUrlValid,
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

  const formFields = [
    {
      component: AutoComplete,
      name: 'language',
      options: languageOptions,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: t('Language*'),
      },
      disabled: defaultAttribute.isHsm && match.params.id,
      onChange: getLanguageId,
    },
    {
      component: Input,
      name: 'label',
      placeholder: t('Title*'),
      validate: validateTitle,
      disabled: defaultAttribute.isHsm && match.params.id,
      helperText: defaultAttribute.isHsm
        ? t('Define what use case does this template serve eg. OTP, optin, activity preference')
        : null,
      inputProp: {
        onBlur: (event: any) => setLabel(event.target.value),
      },
    },
    {
      component: EmojiInput,
      name: 'body',
      placeholder: t('Message*'),
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      disabled: defaultAttribute.isHsm && match.params.id,
      helperText: defaultAttribute.isHsm
        ? 'You can also use variable and interactive actions. Variable format: {{1}}, Button format: [Button text,Value] Value can be a URL or a phone number.'
        : null,
      inputProp: {
        onBlur: (editorState: any) => {
          setBody(editorState);
        },
      },
    },
  ];

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

  useEffect(() => {
    if (templateType) {
      addTemplateButtons(false);
    }
  }, [templateType]);

  const getTemplateAndButton = (text: string) => {
    if (!text) return null;

    const areButtonsPresent = text.indexOf('|');

    let message: any = text;
    let buttons: any = null;

    if (areButtonsPresent !== -1) {
      buttons = text.substr(areButtonsPresent);
      message = text.substr(0, areButtonsPresent);
    }

    return { message, buttons };
  };

  // Converting buttons to template and vice-versa to show realtime update on simulator
  useEffect(() => {
    if (templateButtons.length > 0) {
      const parse = convertButtonsToTemplate(templateButtons, templateType);

      const parsedText = parse.length ? `| ${parse.join(' | ')}` : null;

      const { message }: any = getTemplateAndButton(convertToWhatsApp(example));

      const sampleText: any = parsedText && message + parsedText;

      if (sampleText) {
        onExampleChange(EditorState.createWithContent(WhatsAppToDraftEditor(sampleText)));
      }
    }
  }, [templateButtons]);

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

  const templateRadioOptions = [
    {
      component: Checkbox,
      title: <Typography variant="h6">Add buttons</Typography>,
      name: 'isAddButtonChecked',
      disabled: !!(defaultAttribute.isHsm && match.params.id),
      handleChange: (value: boolean) => setIsAddButtonChecked(value),
    },
    {
      component: TemplateOptions,
      isAddButtonChecked,
      templateType,
      inputFields: templateButtons,
      onAddClick: addTemplateButtons,
      onRemoveClick: removeTemplateButtons,
      onInputChange: handeInputChange,
      onTemplateTypeChange: (value: string) => setTemplateType(value),
    },
  ];

  const hsmFields = formField && [
    ...formField.slice(0, 1),
    ...templateRadioOptions,
    ...formField.slice(1),
  ];

  const fields = defaultAttribute.isHsm
    ? [formIsActive, ...formFields, ...hsmFields, ...attachmentField]
    : [...formFields, ...attachmentField];

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
    const templateBody = getTemplateAndButton(convertToWhatsApp(body));
    const templateExample = getTemplateAndButton(convertToWhatsApp(example));

    return {
      hasButtons: true,
      buttons: JSON.stringify(buttons),
      buttonType: templateType,
      body: EditorState.createWithContent(WhatsAppToDraftEditor(templateBody?.message)),
      example: EditorState.createWithContent(WhatsAppToDraftEditor(templateExample?.message)),
    };
  };

  const setPayload = (payload: any) => {
    let payloadCopy = payload;
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
          payloadCopy.category = payloadCopy.category.id;
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
            body: convertToWhatsApp(payloadCopy.body),
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
        payloadCopy.category = payloadCopy.category.id;

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

      delete payloadCopy.isAddButtonChecked;
      delete payloadCopy.templateButtons;
      delete payloadCopy.language;

      if (payloadCopy.type === 'TEXT') {
        delete payloadCopy.attachmentURL;
      }
      payloadCopy.translations = JSON.stringify(translationsCopy);
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
    body: Yup.string()
      .transform((current, original) => original.getCurrentContent().getPlainText())
      .required(t('Message is required.')),
    type: Yup.object()
      .nullable()
      .when('attachmentURL', {
        is: (val: string) => val && val !== '',
        then: Yup.object().nullable().required(t('Type is required.')),
      }),
    attachmentURL: Yup.string()
      .nullable()
      .when('type', {
        is: (val: any) => val && val.id,
        then: Yup.string().required(t('Attachment URL is required.')),
      }),
  };

  if (defaultAttribute.isHsm && isAddButtonChecked) {
    if (templateType === CALL_TO_ACTION) {
      validation.templateButtons = Yup.array()
        .of(
          Yup.object().shape({
            type: Yup.string().required('Required'),
            title: Yup.string().required('Required'),
            value: Yup.string()
              .required('Required')
              .when('type', {
                is: (val: any) => val === 'phone_number',
                then: Yup.string().matches(
                  /^(\+)\d{12}(\d{2})?$/gm,
                  'Enter phone no is correct format'
                ),
              })
              .when('type', {
                is: (val: any) => val === 'url',
                then: Yup.string().matches(
                  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi,
                  'Enter correct url'
                ),
              }),
          })
        )
        .min(1)
        .max(2);
    } else {
      validation.templateButtons = Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required('Required'),
          })
        )
        .min(1)
        .max(3);
    }
  }

  const validationObj = defaultAttribute.isHsm ? { ...validation, ...HSMValidation } : validation;
  const FormSchema = Yup.object().shape(validationObj, [['type', 'attachmentURL']]);

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
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
      getMediaId={getMediaId}
      button={defaultAttribute.isHsm && !match.params.id ? t('Submit for Approval') : t('Save')}
      customStyles={customStyle}
    />
  );
};

export default Template;
