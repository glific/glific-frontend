import React, { useState, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { EditorState } from 'draft-js';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';
import { setNotification } from 'common/notification';
import { ReactComponent as InteractiveMessageIcon } from 'assets/images/icons/InteractiveMessage/Dark.svg';
import {
  CREATE_INTERACTIVE,
  UPDATE_INTERACTIVE,
  DELETE_INTERACTIVE,
  COPY_INTERACTIVE,
} from 'graphql/mutations/InteractiveMessage';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_INTERACTIVE_MESSAGE } from 'graphql/queries/InteractiveMessage';
import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { EmojiInput } from 'components/UI/Form/EmojiInput/EmojiInput';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Simulator } from 'components/simulator/Simulator';
import { LanguageBar } from 'components/UI/LanguageBar/LanguageBar';
import { LIST, MEDIA_MESSAGE_TYPES, QUICK_REPLY } from 'common/constants';
import { validateMedia } from 'common/utils';
import Loading from 'components/UI/Layout/Loading/Loading';
import { getPlainTextFromEditor, getEditorFromContent } from 'common/RichEditor';
import { InteractiveOptions } from './InteractiveOptions/InteractiveOptions';
import styles from './InteractiveMessage.module.css';
import {
  convertJSONtoStateData,
  getDefaultValuesByTemplate,
  getPayloadByMediaType,
  getTranslation,
  getVariableOptions,
  validator,
} from './InteractiveMessage.helper';

const interactiveMessageIcon = <InteractiveMessageIcon className={styles.Icon} />;

const queries = {
  getItemQuery: GET_INTERACTIVE_MESSAGE,
  createItemQuery: CREATE_INTERACTIVE,
  updateItemQuery: UPDATE_INTERACTIVE,
  deleteItemQuery: DELETE_INTERACTIVE,
};

export const InteractiveMessage = () => {
  const location: any = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(EditorState.createEmpty());
  const [templateType, setTemplateType] = useState<string>(QUICK_REPLY);
  const [templateButtons, setTemplateButtons] = useState<Array<any>>([{ value: '' }]);
  const [globalButton, setGlobalButton] = useState('');
  const [isUrlValid, setIsUrlValid] = useState<any>();
  const [type, setType] = useState<any>(null);
  const [attachmentURL, setAttachmentURL] = useState<any>();
  const [contactVariables, setContactVariables] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState<any>({});
  const [sendWithTitle, setSendWithTitle] = useState<boolean>(true);

  const [language, setLanguage] = useState<any>({});
  const [languageOptions, setLanguageOptions] = useState<any>([]);

  const [translations, setTranslations] = useState<any>('{}');

  const [previousState, setPreviousState] = useState<any>({});
  const [nextLanguage, setNextLanguage] = useState<any>('');
  const [warning, setWarning] = useState<any>();
  const { t } = useTranslation();
  const params = useParams();

  // alter header & update/copy queries
  let header;

  const stateType = location.state;

  if (stateType === 'copy') {
    queries.updateItemQuery = COPY_INTERACTIVE;
    header = t('Copy Interactive Message');
  } else {
    queries.updateItemQuery = UPDATE_INTERACTIVE;
  }

  const { data: languages } = useQuery(USER_LANGUAGES);

  const [getInteractiveTemplateById, { data: template, loading: loadingTemplate }] =
    useLazyQuery<any>(GET_INTERACTIVE_MESSAGE);

  useEffect(() => {
    getVariableOptions(setContactVariables);
  }, []);

  useEffect(() => {
    if (languages) {
      const lang = languages.currentUser.user.organization.activeLanguages.slice();
      // sort languages by their name
      lang.sort((first: any, second: any) => (first.id > second.id ? 1 : -1));

      setLanguageOptions(lang);
      if (!Object.prototype.hasOwnProperty.call(params, 'id')) {
        setLanguage(lang[0]);
      }
    }
  }, [languages]);

  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(params, 'id') && params.id) {
      getInteractiveTemplateById({ variables: { id: params.id } });
    }
  }, [params]);

  const states = {
    language,
    title,
    body,
    globalButton,
    templateButtons,
    sendWithTitle,
    templateType,
    type,
    attachmentURL,
  };

  const updateStates = ({
    language: languageVal,
    type: typeValue,
    interactiveContent: interactiveContentValue,
  }: any) => {
    const content = JSON.parse(interactiveContentValue);
    const data = convertJSONtoStateData(content, typeValue, title);

    if (languageOptions.length > 0 && languageVal) {
      const selectedLangauge = languageOptions.find((lang: any) => lang.id === languageVal.id);

      setLanguage(selectedLangauge);
    }
    setTitle(data.title);
    setBody(getEditorFromContent(data.body));
    setTemplateType(typeValue);
    setTimeout(() => setTemplateButtons(data.templateButtons), 100);

    if (typeValue === LIST) {
      setGlobalButton(data.globalButton);
    }

    if (typeValue === QUICK_REPLY && data.type && data.attachmentURL) {
      setType({ id: data.type, label: data.type });
      setAttachmentURL(data.attachmentURL);
    }
  };

  const setStates = ({
    label: labelValue,
    language: languageVal,
    type: typeValue,
    interactiveContent: interactiveContentValue,
    translations: translationsVal,
    sendWithTitle: sendInteractiveTitleValue,
  }: any) => {
    let content;

    if (translationsVal) {
      const translationsCopy = JSON.parse(translationsVal);

      // restore if translations present for selected language
      if (
        Object.keys(translationsCopy).length > 0 &&
        translationsCopy[language.id || languageVal.id] &&
        !location.state?.language
      ) {
        content =
          JSON.parse(translationsVal)[language.id || languageVal.id] ||
          JSON.parse(interactiveContentValue);
      } else if (template) {
        content = getDefaultValuesByTemplate(template.interactiveTemplate.interactiveTemplate);
      }
    }

    const data = convertJSONtoStateData(content, typeValue, labelValue);
    setDefaultLanguage(languageVal);

    if (languageOptions.length > 0 && languageVal) {
      if (location.state?.language) {
        const selectedLangauge = languageOptions.find(
          (lang: any) => lang.label === location.state.language
        );
        navigate(location.pathname);
        setLanguage(selectedLangauge);
      } else if (!language.id) {
        const selectedLangauge = languageOptions.find((lang: any) => lang.id === languageVal.id);
        setLanguage(selectedLangauge);
      } else {
        setLanguage(language);
      }
    }

    let titleText = data.title;

    if (location.state === 'copy') {
      titleText = `Copy of ${data.title}`;
    }

    setTitle(titleText);
    setBody(getEditorFromContent(data.body));
    setTemplateType(typeValue);
    setTimeout(() => setTemplateButtons(data.templateButtons), 100);

    if (typeValue === LIST) {
      setGlobalButton(data.globalButton);
    }

    if (typeValue === QUICK_REPLY && data.type && data.attachmentURL) {
      setType({ id: data.type, label: data.type });
      setAttachmentURL(data.attachmentURL);
    }

    if (translationsVal) {
      setTranslations(translationsVal);
    }
    setSendWithTitle(sendInteractiveTitleValue);
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
    }
  }, [type, attachmentURL]);

  const handleAddInteractiveTemplate = (
    addFromTemplate: boolean,
    templateTypeVal: string,
    stateToRestore: any = null
  ) => {
    let buttons: any = [];
    const buttonType: any = {
      QUICK_REPLY: { value: '' },
      LIST: { title: '', options: [{ title: '', description: '' }] },
    };

    const templateResult = stateToRestore || [buttonType[templateTypeVal]];
    buttons = addFromTemplate ? [...templateButtons, buttonType[templateTypeVal]] : templateResult;

    setTemplateButtons(buttons);
  };

  const handleRemoveInteractiveTemplate = (index: number) => {
    const buttons = [...templateButtons];
    const result = buttons.filter((row, idx: number) => idx !== index);
    setTemplateButtons(result);
  };

  const handleAddListItem = (rowNo: number, oldOptions: Array<any>) => {
    const buttons = [...templateButtons];
    const newOptions = [...oldOptions, { title: '', description: '' }];

    const result = buttons.map((row: any, idx: number) =>
      rowNo === idx ? { ...row, options: newOptions } : row
    );

    setTemplateButtons(result);
  };

  const handleRemoveListItem = (rowIdx: number, idx: number) => {
    const buttons = [...templateButtons];
    const result = buttons.map((row: any, index: number) => {
      if (index === rowIdx) {
        const newOptions = row.options.filter((r: any, itemIdx: number) => itemIdx !== idx);
        return { ...row, options: newOptions };
      }
      return row;
    });

    setTemplateButtons(result);
  };

  const handleInputChange = (
    interactiveMessageType: string,
    index: number,
    value: string,
    payload: any,
    setFieldValue: any
  ) => {
    const { key, itemIndex, isOption } = payload;
    const buttons = [...templateButtons];
    let result = [];
    if (interactiveMessageType === QUICK_REPLY) {
      result = buttons.map((row: any, idx: number) => {
        if (idx === index) {
          const newRow = { ...row };
          newRow[key] = value;
          return newRow;
        }
        return row;
      });
    }

    if (interactiveMessageType === LIST) {
      result = buttons.map((row: any, idx: number) => {
        const { options }: { options: Array<any> } = row;
        if (idx === index) {
          // for options
          if (isOption) {
            const updatedOptions = options.map((option: any, optionIdx: number) => {
              if (optionIdx === itemIndex) {
                const newOption = { ...option };
                newOption[key] = value;
                return newOption;
              }
              return option;
            });

            const updatedRowWithOptions = { ...row, options: updatedOptions };
            return updatedRowWithOptions;
          }

          // for title
          const newRow = { ...row };
          newRow[key] = value;
          return newRow;
        }

        return row;
      });
    }
    setFieldValue('templateButtons', result);
    setTemplateButtons(result);
  };

  const updateTranslation = (value: any) => {
    const Id = value.id;
    // restore if selected language is same as template
    if (translations) {
      const translationsCopy = JSON.parse(translations);
      // restore if translations present for selected language
      if (Object.keys(translationsCopy).length > 0 && translationsCopy[Id]) {
        updateStates({
          language: value,
          type: template.interactiveTemplate.interactiveTemplate.type,
          interactiveContent: JSON.stringify(translationsCopy[Id]),
        });
      } else if (template) {
        const fillDataWithEmptyValues = getDefaultValuesByTemplate(
          template.interactiveTemplate.interactiveTemplate
        );

        updateStates({
          language: value,
          type: template.interactiveTemplate.interactiveTemplate.type,
          interactiveContent: JSON.stringify(fillDataWithEmptyValues),
        });
      }

      return;
    }

    updateStates({
      language: value,
      type: template.interactiveTemplate.interactiveTemplate.type,
      interactiveContent: template.interactiveTemplate.interactiveTemplate.interactiveContent,
    });
  };

  const handleLanguageChange = (value: any) => {
    const selected = languageOptions.find(({ label }: any) => label === value);
    if (selected && Object.prototype.hasOwnProperty.call(params, 'id')) {
      updateTranslation(selected);
    } else if (selected) {
      setLanguage(selected);
    }
  };

  const afterSave = (data: any, saveClick: boolean) => {
    if (!saveClick) {
      if (params.id) {
        handleLanguageChange(nextLanguage);
      } else {
        const { interactiveTemplate } = data.createInteractiveTemplate;
        location.state.language = nextLanguage;
        navigate(`/interactive-message/${interactiveTemplate.id}/edit`);
      }
    }
  };

  const displayWarning = () => {
    if (type && type.id === 'DOCUMENT') {
      setWarning(
        <div className={styles.Warning}>
          <ol>
            <li>{t('Body is not supported for document.')}</li>
          </ol>
        </div>
      );
    } else {
      setWarning(null);
    }
  };

  useEffect(() => {
    handleAddInteractiveTemplate(false, QUICK_REPLY);
  }, []);

  useEffect(() => {
    displayWarning();
  }, [type]);

  const dialogMessage = t("You won't be able to use this again.");

  const options = MEDIA_MESSAGE_TYPES.filter(
    (msgType: string) => !['AUDIO', 'STICKER'].includes(msgType)
  ).map((option: string) => ({ id: option, label: option }));

  let timer: any = null;
  const langOptions = languageOptions && languageOptions.map(({ label }: any) => label);

  const onLanguageChange = (option: string, form: any) => {
    setNextLanguage(option);
    const { values, errors } = form;
    if (values.type?.label === 'TEXT') {
      if (values.title || values.body.getCurrentContent().getPlainText()) {
        if (errors) {
          setNotification(t('Please check the errors'), 'warning');
        }
      } else {
        handleLanguageChange(option);
      }
    }
    if (values.body.getCurrentContent().getPlainText()) {
      if (Object.keys(errors).length !== 0) {
        setNotification(t('Please check the errors'), 'warning');
      }
    } else {
      handleLanguageChange(option);
    }
  };

  const hasTranslations = params?.id && defaultLanguage?.id !== language?.id;

  const fields = [
    {
      field: 'languageBar',
      component: LanguageBar,
      options: langOptions || [],
      selectedLangauge: language && language.label,
      onLanguageChange,
    },
    {
      translation:
        hasTranslations && getTranslation(templateType, 'title', translations, defaultLanguage),
      component: Input,
      name: 'title',
      type: 'text',
      placeholder: t('Title*'),
      inputProp: {
        onBlur: (event: any) => setTitle(event.target.value),
      },
      helperText: t('Only alphanumeric characters and spaces are allowed'),
    },
    // checkbox is not needed in media types
    {
      skip: type && type.label,
      component: Checkbox,
      name: 'sendWithTitle',
      title: t('Show title in message'),
      handleChange: (value: boolean) => setSendWithTitle(value),
      addLabelStyle: false,
    },
    {
      translation:
        hasTranslations && getTranslation(templateType, 'body', translations, defaultLanguage),
      component: EmojiInput,
      name: 'body',
      placeholder: t('Message*'),
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      helperText: t('You can also use variables in message enter @ to see the available list'),
      getEditorValue: (value: any) => {
        setBody(value);
      },
      inputProp: {
        suggestions: contactVariables,
      },
    },
    {
      translation:
        hasTranslations && getTranslation(templateType, 'options', translations, defaultLanguage),
      component: InteractiveOptions,
      isAddButtonChecked: true,
      templateType,
      inputFields: templateButtons,
      disabled: false,
      disabledType: params?.id !== undefined,
      onAddClick: handleAddInteractiveTemplate,
      onRemoveClick: handleRemoveInteractiveTemplate,
      onInputChange: handleInputChange,
      onListItemAddClick: handleAddListItem,
      onListItemRemoveClick: handleRemoveListItem,
      onTemplateTypeChange: (value: string) => {
        const stateToRestore = previousState[value];
        setTemplateType(value);
        setPreviousState({ [templateType]: templateButtons });
        handleAddInteractiveTemplate(false, value, stateToRestore);
      },
      onGlobalButtonInputChange: (value: string) => setGlobalButton(value),
    },
  ];

  const getTemplateButtonPayload = (typeVal: string, buttons: Array<any>) => {
    if (typeVal === QUICK_REPLY) {
      return buttons.map((button: any) => ({ type: 'text', title: button.value }));
    }

    return buttons.map((button: any) => {
      const { title: sectionTitle, options: sectionOptions } = button;
      const sectionOptionsObject = sectionOptions?.map((option: any) => ({
        type: 'text',
        title: option.title,
        description: option.description,
      }));
      return {
        title: sectionTitle,
        subtitle: sectionTitle,
        options: sectionOptionsObject,
      };
    });
  };

  const convertStateDataToJSON = (
    payload: any,
    titleVal: string,
    templateTypeVal: string,
    templateButtonVal: Array<any>,
    globalButtonVal: any
  ) => {
    const updatedPayload: any = { type: null, interactiveContent: null };

    const { language: selectedLanguage } = payload;
    Object.assign(updatedPayload);

    if (selectedLanguage) {
      Object.assign(updatedPayload, { languageId: selectedLanguage.id });
    }

    if (templateTypeVal === QUICK_REPLY) {
      const content = getPayloadByMediaType(type?.id, payload);
      const quickReplyOptions = getTemplateButtonPayload(templateTypeVal, templateButtonVal);

      const quickReplyJSON = { type: 'quick_reply', content, options: quickReplyOptions };

      Object.assign(updatedPayload, {
        type: QUICK_REPLY,
        interactiveContent: JSON.stringify(quickReplyJSON),
      });
    }

    if (templateTypeVal === LIST) {
      const bodyText = getPlainTextFromEditor(payload.body);
      const items = getTemplateButtonPayload(templateTypeVal, templateButtonVal);
      const globalButtons = [{ type: 'text', title: globalButtonVal }];

      const listJSON = { type: 'list', title: titleVal, body: bodyText, globalButtons, items };
      Object.assign(updatedPayload, {
        type: LIST,
        interactiveContent: JSON.stringify(listJSON),
      });
    }
    return updatedPayload;
  };

  const isTranslationsPresentForEnglish = (...langIds: any) => {
    const english = languageOptions.find(({ label }: { label: string }) => label === 'English');
    return !!english && langIds.includes(english.id);
  };

  const setPayload = (payload: any) => {
    const {
      templateType: templateTypeVal,
      templateButtons: templateButtonVal,
      title: titleVal,
      globalButton: globalButtonVal,
      language: selectedLanguage,
    } = payload;

    const payloadData: any = convertStateDataToJSON(
      payload,
      titleVal,
      templateTypeVal,
      templateButtonVal,
      globalButtonVal
    );

    let translationsCopy: any = {};
    if (translations) {
      translationsCopy = JSON.parse(translations);
      translationsCopy[language.id] = JSON.parse(payloadData.interactiveContent);
    }

    const langIds = Object.keys(translationsCopy);
    const isPresent = isTranslationsPresentForEnglish(...langIds);

    // Update label anyway if selected language is English
    if (selectedLanguage.label === 'English') {
      payloadData.label = titleVal;
    }

    // Update label if there is no translation present for english
    if (!isPresent) {
      payloadData.label = titleVal;
    }

    // While editing preserve original langId and content
    if (template) {
      /**
       * Restoring template if language is different
       */
      const dataToRestore = template.interactiveTemplate.interactiveTemplate;

      if (selectedLanguage.id !== dataToRestore?.language.id) {
        payloadData.languageId = dataToRestore?.language.id;
        payloadData.interactiveContent = dataToRestore?.interactiveContent;
      }
    }

    payloadData.sendWithTitle = sendWithTitle;
    payloadData.translations = JSON.stringify(translationsCopy);

    return payloadData;
  };

  const attachmentInputs = [
    {
      component: AutoComplete,
      name: 'type',
      options,
      optionLabel: 'label',
      multiple: false,
      helperText: warning,
      textFieldProps: {
        variant: 'outlined',
        label: t('Attachment type'),
      },
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

  const formFields = templateType === LIST ? [...fields] : [...fields, ...attachmentInputs];

  const validation = validator(templateType, t);
  const validationScheme = Yup.object().shape(validation, [['type', 'attachmentURL']]);

  const getPreviewData = () => {
    if (!(templateButtons && templateButtons.length)) {
      return null;
    }

    const isButtonPresent = templateButtons.some((button: any) => {
      const { value, options: opts } = button;
      return !!value || !!(opts && opts.some((o: any) => !!o.title));
    });

    if (!isButtonPresent) {
      return null;
    }

    const payload = {
      title,
      body,
      attachmentURL,
      language,
    };

    const { interactiveContent } = convertStateDataToJSON(
      payload,
      title,
      templateType,
      templateButtons,
      globalButton
    );

    const data = { templateType, interactiveContent };
    return data;
  };

  const previewData = useMemo(getPreviewData, [
    title,
    body,
    templateType,
    templateButtons,
    globalButton,
    type,
    attachmentURL,
  ]);

  if (languageOptions.length < 1 || loadingTemplate) {
    return <Loading />;
  }

  return (
    <>
      <FormLayout
        {...queries}
        states={states}
        setStates={setStates}
        setPayload={setPayload}
        title={header}
        type={stateType}
        validationSchema={validationScheme}
        listItem="interactiveTemplate"
        listItemName="interactive msg"
        dialogMessage={dialogMessage}
        formFields={formFields}
        redirectionLink="interactive-message"
        cancelLink="interactive-message"
        icon={interactiveMessageIcon}
        languageSupport={false}
        getQueryFetchPolicy="cache-and-network"
        afterSave={afterSave}
        saveOnPageChange={false}
      />
      <div className={styles.Simulator}>
        <Simulator
          setSimulatorId={0}
          showSimulator
          isPreviewMessage
          message={{}}
          showHeader={sendWithTitle}
          interactiveMessage={previewData}
          simulatorIcon={false}
        />
      </div>
    </>
  );
};

export default InteractiveMessage;
