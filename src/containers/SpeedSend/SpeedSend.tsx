import { MEDIA_MESSAGE_TYPES } from 'common/constants';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_TEMPLATE, DELETE_TEMPLATE, UPDATE_TEMPLATE } from 'graphql/mutations/Template';
import { GET_SPEED_SEND } from 'graphql/queries/Template';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import * as Yup from 'yup';
import SpeedSendIcon from 'assets/images/icons/SpeedSend/Selected.svg?react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { CREATE_MEDIA_MESSAGE } from 'graphql/mutations/Chat';
import styles from './SpeedSend.module.css';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { Typography } from '@mui/material';
import { Input } from 'components/UI/Form/Input/Input';
import { EmojiInput } from 'components/UI/Form/EmojiInput/EmojiInput';
import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { validateMedia } from 'common/utils';
import { LanguageBar } from 'components/UI/LanguageBar/LanguageBar';
import { setNotification } from 'common/notification';

const queries = {
  getItemQuery: GET_SPEED_SEND,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

const redirectionLink = 'speed-send';

const dialogMessage = 'It will stop showing when you are drafting a customized message.';
const mediaTypes = MEDIA_MESSAGE_TYPES.map((option: string) => ({
  id: option,
  label: `${option} URL`,
}));
const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

export const getTranslation = (attribute: any, translations: any, defaultLanguage: any) => {
  const defaultTemplate = JSON.parse(translations)[defaultLanguage.id];

  if (!defaultTemplate) {
    return null;
  }

  return defaultTemplate[attribute] || null;
};

export const SpeedSend = () => {
  const [label, setLabel] = useState('');
  const [body, setBody] = useState<any>('');
  const [language, setLanguageId] = useState<any>(null);
  const [type, setType] = useState<any>(null);
  const [translations, setTranslations] = useState<any>('{}');
  const [attachmentURL, setAttachmentURL] = useState<any>('');
  const [languageOptions, setLanguageOptions] = useState<any>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [validatingURL, setValidatingURL] = useState<boolean>(false);
  const [warning, setWarning] = useState<any>();
  const [isUrlValid, setIsUrlValid] = useState<any>();
  const [nextLanguage, setNextLanguage] = useState<any>('');
  const [editorState, setEditorState] = useState<any>('');
  const [defaultLanguage, setDefaultLanguage] = useState<any>({});

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location: any = useLocation();
  const params = useParams();
  let isEditing = false;
  let mode;

  if (params.id) {
    isEditing = true;
  }

  const hasTranslations = params.id && defaultLanguage?.id !== language?.id;

  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE);

  const { data: languages, loading: languageLoading } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });

  const [getSessionTemplate, { data: template, loading: templateLoading }] = useLazyQuery<any>(GET_SPEED_SEND);

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
    if (params.id) {
      getSessionTemplate({ variables: { id: params.id } });
    }
  }, [params]);

  useEffect(() => {
    if ((type === '' || type) && attachmentURL) {
      validateURL(attachmentURL);
    }
  }, [type, attachmentURL]);

  useEffect(() => {
    displayWarning();
  }, [type]);

  const states = {
    language,
    label,
    body,
    type,
    attachmentURL,
    isActive,
  };

  const setStates = ({
    isActive: isActiveValue,
    language: languageIdValue,
    label: labelValue,
    body: bodyValue,
    type: typeValue,
    translations: translationsValue,
    messageMedia: MessageMediaValue,
  }: any) => {
    let title = labelValue;
    let body = bodyValue;

    if (translationsValue) {
      const translationsCopy = JSON.parse(translationsValue);
      const currentLanguage = language?.id || languageIdValue.id;

      if (Object.keys(translationsCopy).length > 0 && translationsCopy[currentLanguage] && !location.state?.language) {
        let content = translationsCopy[currentLanguage];
        title = content.label;
        body = content.body || '';
      } else if (template) {
        // translations for current language doesn't exist
        title = '';
        body = '';
      }

      setTranslations(translationsValue);
    }

    if (languageOptions.length > 0 && languageIdValue) {
      if (location.state && location.state !== 'copy') {
        const selectedLangauge = languageOptions.find((lang: any) => lang.label === location.state.language);
        navigate(location.pathname);

        setLanguageId(selectedLangauge);
      } else if (!language?.id) {
        const selectedLangauge = languageOptions.find((lang: any) => lang.id === languageIdValue.id);
        setLanguageId(selectedLangauge);
      } else {
        setLanguageId(language);
      }
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

    setDefaultLanguage(languageIdValue);
    setLabel(title);
    setIsActive(isActiveValue);
    setBody(body || '');
    setEditorState(body || '');
  };

  const setPayload = (payload: any) => {
    let payloadCopy = payload;
    let translationsCopy: any = {};

    // Create template
    payloadCopy.languageId = payload.language?.id;
    if (payloadCopy.type) {
      // STICKER is a type of IMAGE
      if (payloadCopy.type.id === 'STICKER') {
        payloadCopy.type = 'IMAGE';
      } else {
        payloadCopy.type = payloadCopy.type.id;
      }
    } else {
      payloadCopy.type = 'TEXT';
    }

    if (payloadCopy.type === 'TEXT') {
      delete payloadCopy.attachmentURL;
    }

    // Update template translation
    if (translations) {
      translationsCopy = JSON.parse(translations);
      translationsCopy[language?.id] = payloadCopy;
      setTranslations(JSON.stringify(translationsCopy));
    }

    payloadCopy.translations = JSON.stringify(translationsCopy);

    delete payloadCopy.isAddButtonChecked;
    delete payloadCopy.templateButtons;
    delete payloadCopy.language;
    delete payloadCopy.languageVariant;
    delete payloadCopy.variables;
    delete payloadCopy.exisitingShortCode;

    delete payloadCopy.newShortcode;

    return payloadCopy;
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
    setBody(bodyValue || '');
    setEditorState(bodyValue || '');

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
    } else if (translations) {
      const translationsCopy = JSON.parse(translations);
      // restore if translations present for selected language
      if (translationsCopy[translationId]) {
        updateStates({
          language: value,
          label: translationsCopy[translationId].label,
          body: translationsCopy[translationId].body,
          type: translationsCopy[translationId].MessageMedia ? translationsCopy[translationId].MessageMedia.type : null,
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
    const selected = languageOptions.find(({ label: languageLabel }: any) => languageLabel === value);
    if (selected && isEditing) {
      updateTranslation(selected);
    } else if (selected) {
      setLanguageId(selected);
    }
  };

  const onLanguageChange = (option: string, form: any) => {
    setNextLanguage(option);
    const { values, errors } = form;

    if (values.type) {
      if (values.label || values.body) {
        if (errors) {
          setNotification(t('Please check the errors'), 'warning');
        }
      } else {
        handleLanguageChange(option);
      }
    }
    if (values.body) {
      if (Object.keys(errors).length !== 0) {
        setNotification(t('Please check the errors'), 'warning');
      }
    } else {
      handleLanguageChange(option);
    }
  };

  const displayWarning = () => {
    if (type && type.id === 'STICKER') {
      setWarning(
        <span className={styles.Warning}>
          <span>{t('Animated stickers are not supported.')}</span>
          <br />
          <span>{t('Captions along with stickers are not supported.')}</span>
          <span></span>
        </span>
      );
    } else if (type && type.id === 'AUDIO') {
      setWarning(<span className={styles.Warning}>{t('Captions along with audio are not supported.')}</span>);
    } else {
      setWarning(null);
    }
  };

  const FormSchema = Yup.object().shape(
    {
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
      body: Yup.string().required(t('Message is required.')).max(1024, 'Maximum 1024 characters are allowed'),
    },
    [['type', 'attachmentURL']]
  );

  const attachmentField = [
    {
      component: AutoComplete,
      name: 'type',
      options: mediaTypes,
      optionLabel: 'label',
      multiple: false,
      label: t('Attachment Type'),
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
      helperText: t(
        'Please provide a sample attachment for approval purpose. You may send a similar but different attachment when sending the HSM to users.'
      ),
      inputProp: {
        onBlur: (event: any) => {
          setAttachmentURL(event.target.value.trim());
        },
      },
    },
  ];

  const langOptions = languageOptions && languageOptions.map((val: any) => val.label);

  const formFields = [
    {
      field: 'languageBar',
      component: LanguageBar,
      options: langOptions || [],
      selectedLangauge: language && language.label,
      onLanguageChange,
    },
    {
      component: Input,
      name: 'label',
      label: t('Title'),
      inputProp: {
        onChange: (event: any) => setLabel(event.target.value),
      },
      translation: hasTranslations && getTranslation('label', translations, defaultLanguage),
    },
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
      component: EmojiInput,
      name: 'body',
      label: t('Message'),
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      handleChange: (value: any) => {
        setBody(value);
      },
      defaultValue: isEditing && editorState,
      translation: hasTranslations && getTranslation('body', translations, defaultLanguage),
    },
    ...attachmentField,
  ];

  const afterSave = (data: any, saveClick: boolean) => {
    if (!saveClick) {
      if (params.id) {
        handleLanguageChange(nextLanguage);
      } else {
        const { sessionTemplate } = data.createSessionTemplate;
        navigate(`/speed-send/${sessionTemplate.id}/edit`, {
          state: { language: nextLanguage },
        });
      }
    }
  };

  if (languageLoading || templateLoading) {
    return <Loading />;
  }

  return (
    <FormLayout
      {...queries}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="Speed send"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={redirectionLink}
      listItem="sessionTemplate"
      icon={speedSendIcon}
      languageSupport={false}
      isAttachment
      getMediaId={getMediaId}
      getQueryFetchPolicy="cache-and-network"
      button={t('Save')}
      buttonState={{ text: t('Validating URL'), status: validatingURL, show: true }}
      saveOnPageChange={false}
      type={mode}
      copyNotification={t('Copy of the template has been created!')}
      backLinkButton={`/${redirectionLink}`}
      customStyles={styles.AttachmentFields}
      afterSave={afterSave}
    />
  );
};

export default SpeedSend;
