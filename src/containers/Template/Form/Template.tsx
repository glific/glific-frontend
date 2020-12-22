import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { EditorState } from 'draft-js';

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
import { USER_LANGUAGES } from '../../../graphql/queries/Organization';
import { AutoComplete } from '../../../components/UI/Form/AutoComplete/AutoComplete';
import { CREATE_MEDIA_MESSAGE } from '../../../graphql/mutations/Chat';

const FormSchema = Yup.object().shape({
  label: Yup.string().required('Title is required.').max(50, 'Title is length too long.'),
  body: Yup.string()
    .transform((current, original) => {
      return original.getCurrentContent().getPlainText();
    })
    .required('Message is required.'),
  example: Yup.string()
    .transform((current, original) => {
      return original.getCurrentContent().getPlainText();
    })
    .required('Example is required.'),
  language: Yup.object().nullable().required('Language is required.'),
  category: Yup.object().nullable().required('Category is required.'),
  shortcode: Yup.string().required('Shortcode is required.'),
});

const dialogMessage = ' It will stop showing when you are drafting a customized message.';

const queries = {
  getItemQuery: GET_TEMPLATE,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

const options = MEDIA_MESSAGE_TYPES.map((option: string) => {
  return { id: option, label: option };
});

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
  },
  {
    component: Input,
    name: 'attachmentURL',
    type: 'text',
    placeholder: 'Attachment URL',
  },
];

export interface TemplateProps {
  match: any;
  listItemName: string;
  redirectionLink: string;
  icon: any;
  defaultAttribute?: any;
  formField?: any;
}

const Template: React.SFC<TemplateProps> = (props) => {
  const {
    match,
    listItemName,
    redirectionLink,
    icon,
    defaultAttribute = { isHsm: false },
    formField,
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

  const states = { language, label, body, type, attachmentURL, shortcode, example, category };

  const setStates = ({
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

    if (typeof bodyValue === 'string') {
      setBody(EditorState.createWithContent(WhatsAppToDraftEditor(bodyValue)));
    }
    if (exampleValue)
      setExample(EditorState.createWithContent(WhatsAppToDraftEditor(exampleValue)));
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
      filter: { label: filterLabel, languageId: parseInt(language.id, 10) },
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
      lang.sort((first: any, second: any) => {
        return first.label > second.label ? 1 : -1;
      });
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
  };

  const formFields = [
    {
      component: AutoComplete,
      name: 'language',
      options: languageOptions,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: 'Language',
      },
      onChange: getLanguageId,
      helperText: 'For more languages check settings or connect with your admin',
    },
    {
      component: Input,
      name: 'label',
      placeholder: 'Title',
      validate: validateTitle,
    },
    {
      component: EmojiInput,
      name: 'body',
      placeholder: 'Message',
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
    },
  ];

  const fields = defaultAttribute.isHsm
    ? [...formFields, ...formField, ...attachmentField]
    : [...formFields, ...attachmentField];

  const setPayload = (payload: any) => {
    let payloadCopy = payload;
    let translationsCopy: any = {};

    if (template) {
      if (template.sessionTemplate.sessionTemplate.language.id === language.id) {
        console.log('payloadCopy', payloadCopy);
        payloadCopy.languageId = language.id;
        payloadCopy.type = payloadCopy.type.id || 'TEXT';

        delete payloadCopy.language;
        if (payloadCopy.isHsm) {
          payloadCopy.category = payloadCopy.category.id;
          // payloadCopy.example = payloadCopy.example;
        }
        if (payloadCopy.type === 'TEXT') {
          delete payloadCopy.attachmentURL;
        }
      } else if (!defaultAttribute.isHsm) {
        let messageMedia = null;
        if (payloadCopy.type && payloadCopy.attachmentURL)
          messageMedia = {
            type: payloadCopy.type.id,
            sourceUrl: payloadCopy.attachmentURL,
          };
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
      payloadCopy.type = payloadCopy.type.id || 'TEXT';
      if (payloadCopy.isHsm) {
        payloadCopy.category = payloadCopy.category.id;
        // payloadCopy.example = convertToWhatsApp(payloadCopy.example);
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
    />
  );
};

export default Template;
