import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { EditorState } from 'draft-js';
import Typography from '@material-ui/core/Typography';

import styles from './Template.module.css';
import { Input } from '../../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../../components/UI/Form/EmojiInput/EmojiInput';
import { FormLayout } from '../../Form/FormLayout';
import { convertToWhatsApp, WhatsAppToDraftEditor } from '../../../common/RichEditor';
import { GET_TEMPLATE, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import {
  CREATE_TEMPLATE,
  UPDATE_TEMPLATE,
  DELETE_TEMPLATE,
} from '../../../graphql/mutations/Template';
import { MEDIA_MESSAGE_TYPES } from '../../../common/constants';
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

export interface TemplateProps {
  match: any;
  listItemName: string;
  redirectionLink: string;
  icon: any;
  defaultAttribute?: any;
  formField?: any;
  getSessionTemplatesCallBack?: any;
  customStyle?: any;
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
  const [category, setCategory] = useState<any>({});
  const [isActive, setIsActive] = useState<boolean>(true);
  const [warning, setWarning] = useState<any>();

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
  }: any) => {
    if (languageIdValue) {
      setLanguageId(languageIdValue);
    }

    setLabel(labelValue);
    setIsActive(isActiveValue);

    if (typeof bodyValue === 'string') {
      setBody(EditorState.createWithContent(WhatsAppToDraftEditor(bodyValue)));
    }
    if (exampleValue) {
      setExample(EditorState.createWithContent(WhatsAppToDraftEditor(exampleValue)));
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
      setShortcode(shortcodeValue);
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
      const lang = languages ? languages.currentUser.user.organization.activeLanguages.slice() : [];
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
        error = 'Title already exists.';
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
      return validateMedia(value, type.id).then((response: any) => {
        if (!response.data.is_valid) {
          return response.data.message;
        }
        return false;
      });
    }
    return false;
  };

  const displayWarning = () => {
    if (type.id === 'STICKER') {
      setWarning(
        <div className={styles.Warning}>
          <ol>
            <li>Animated stickers are not supported.</li>
            <li>Captions along with stickers are not supported.</li>
          </ol>
        </div>
      );
    } else if (type.id === 'AUDIO') {
      setWarning(
        <div className={styles.Warning}>
          <ol>
            <li>Captions along with audio are not supported.</li>
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

  const attachmentField = [
    {
      component: AutoComplete,
      name: 'type',
      options,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: 'Attachment Type',
      },
      helperText: warning,
      onChange: (event: any) => {
        if (event) {
          setType({ id: event.id, label: event.id });
        }
      },
    },
    {
      component: Input,
      name: 'attachmentURL',
      type: 'text',
      placeholder: 'Attachment URL',
      validate: validateURL,
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
        label: 'Language*',
      },
      disabled: defaultAttribute.isHsm && match.params.id,
      onChange: getLanguageId,
    },
    {
      component: Input,
      name: 'label',
      placeholder: 'Title*',
      validate: validateTitle,
      disabled: defaultAttribute.isHsm && match.params.id,
      helperText: defaultAttribute.isHsm
        ? 'Define what use case does this template serve eg. OTP, optin, activity preference'
        : null,
    },
    {
      component: EmojiInput,
      name: 'body',
      placeholder: 'Message*',
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      disabled: defaultAttribute.isHsm && match.params.id,
      helperText: defaultAttribute.isHsm
        ? 'You can also use variable and interactive actions. Variable format: {{1}}, Button format: [Button text,Value] Value can be a URL or a phone number.'
        : null,
    },
  ];

  const fields = defaultAttribute.isHsm
    ? [formIsActive, ...formFields, ...formField, ...attachmentField]
    : [...formFields, ...attachmentField];

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
        } else {
          delete payloadCopy.example;
          delete payloadCopy.isActive;
          delete payloadCopy.shortcode;
          delete payloadCopy.category;
        }
        if (payloadCopy.type === 'TEXT') {
          delete payloadCopy.attachmentURL;
        }
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
      } else {
        delete payloadCopy.example;
        delete payloadCopy.isActive;
        delete payloadCopy.shortcode;
        delete payloadCopy.category;
      }

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

  const validation = {
    language: Yup.object().nullable().required('Language is required.'),
    label: Yup.string().required('Title is required.').max(50, 'Title length is too long.'),
    body: Yup.string()
      .transform((current, original) => original.getCurrentContent().getPlainText())
      .when('type', {
        is: (val: string) => (!defaultAttribute.isHsm && !val) || defaultAttribute.isHsm,
        then: Yup.string().required('Message is required.'),
      }),
    type: Yup.object()
      .nullable()
      .when('attachmentURL', {
        is: (val: string) => val && val !== '',
        then: Yup.object().required('Type is required.'),
      }),
    attachmentURL: Yup.string()
      .nullable()
      .when('type', {
        is: (val: any) => val && val.id,
        then: Yup.string().required('Attachment URL is required.'),
      }),
  };

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
      button={defaultAttribute.isHsm && !match.params.id ? 'SUBMIT FOR APPROVAL' : 'Save'}
      customStyles={customStyle}
    />
  );
};

export default Template;
