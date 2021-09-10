import React, { useState, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { EditorState } from 'draft-js';
import axios from 'axios';
import { useLazyQuery, useQuery } from '@apollo/client';

import { ReactComponent as InteractiveMessageIcon } from 'assets/images/icons/InteractiveMessage/Dark.svg';
import {
  CREATE_INTERACTIVE,
  UPDATE_INTERACTIVE,
  DELETE_INTERACTIVE,
} from 'graphql/mutations/InteractiveMessage';
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
import { WhatsAppToDraftEditor } from 'common/RichEditor';
import { FLOW_EDITOR_API } from 'config';
import { getAuthSession } from 'services/AuthService';
import { InteractiveOptions } from './InteractiveOptions/InteractiveOptions';
import styles from './InteractiveMessage.module.css';

export interface FlowProps {
  match: any;
}

const interactiveMessageIcon = <InteractiveMessageIcon className={styles.Icon} />;

const queries = {
  getItemQuery: GET_INTERACTIVE_MESSAGE,
  createItemQuery: CREATE_INTERACTIVE,
  updateItemQuery: UPDATE_INTERACTIVE,
  deleteItemQuery: DELETE_INTERACTIVE,
};

const convertJSONtoStateData = (JSONData: any, interactiveType: string) => {
  const data = { ...JSONData };
  const { title, body, items, content, options, globalButtons } = data;

  if (interactiveType === QUICK_REPLY) {
    const { type, header, url, text } = content;
    const result: any = {};
    result.templateButtons = options.map((option: any) => ({ value: option.title }));
    result.title = header || '';
    switch (type) {
      case 'image':
      case 'video':
        result.type = `${type.toUpperCase()}`;
        result.attachmentURL = url;
        result.body = text;
        break;
      case 'file':
        result.type = 'DOCUMENT';
        result.attachmentURL = url;
        break;
      default:
        result.type = null;
        result.body = text || '';
    }
    return result;
  }

  const result: any = {};
  result.templateButtons = items.map((item: any) => {
    const itemOptions = item.options.map((option: any) => ({
      title: option.title,
      description: option.description,
    }));
    return {
      title: item.title,
      options: itemOptions,
    };
  });
  result.body = body;
  result.title = title;
  result.globalButton = globalButtons[0].title;
  return result;
};

const getDefaultValuesByTemplate = (templateData: any) => {
  const { type: templateType, interactiveContent } = templateData;
  const data = JSON.parse(interactiveContent);

  let result: any = {};
  if (templateType === QUICK_REPLY) {
    const { type, content, options } = data;
    const updatedOptions = options.map(() => ({ type: 'text', title: '' }));
    const updatedContent = Object.keys(content).reduce((res: any, key: string) => {
      if (['type', 'url'].includes(key)) res[key] = content[key];
      else res[key] = '';
      return res;
    }, {});

    result.type = type;
    result.content = updatedContent;
    result.options = updatedOptions;
  }

  if (templateType === LIST) {
    result = Object.keys(data).reduce((res: any, key: string) => {
      const dataVal = data[key];
      if (typeof dataVal === 'string') {
        res[key] = '';
      }

      if (key === 'items') {
        const items: any = dataVal.map((item: any) => {
          const optionVal = { type: 'text', title: '', description: '' };
          const { options } = item;
          const updatedOptions = options.map(() => optionVal);
          return { title: '', subtitle: '', options: updatedOptions };
        });
        res[key] = items;
      }

      if (key === 'globalButtons') {
        res[key] = dataVal.map(() => ({ type: 'text', title: '' }));
      }

      return res;
    }, {});
  }
  return result;
};

export const InteractiveMessage: React.SFC<FlowProps> = ({ match }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(EditorState.createEmpty());
  const [templateType, setTemplateType] = useState<string>('QUICK_REPLY');
  const [templateButtons, setTemplateButtons] = useState<Array<any>>([{ value: '' }]);
  const [globalButton, setGlobalButton] = useState('');
  const [isUrlValid, setIsUrlValid] = useState<any>();
  const [type, setType] = useState<any>(null);
  const [attachmentURL, setAttachmentURL] = useState<any>();
  const [contactVariables, setContactVariables] = useState([]);

  const [language, setLanguage] = useState<any>(null);
  const [languageOptions, setLanguageOptions] = useState<any>([]);

  const [translations, setTranslations] = useState<any>('{}');

  const [previousState, setPreviousState] = useState<any>({});
  const [warning, setWarning] = useState<any>();

  useEffect(() => {
    const glificBase = FLOW_EDITOR_API;
    const contactFieldsprefix = '@contact.fields.';
    const contactVariablesprefix = '@contact.';
    const headers = { Authorization: getAuthSession('access_token') };

    const getVariableOptions = async () => {
      // get fields keys
      const fieldsData = await axios.get(`${glificBase}fields`, {
        headers,
      });

      const fields = fieldsData.data.results.map((i: any) => contactFieldsprefix.concat(i.key));

      // get contact keys
      const contactData = await axios.get(`${glificBase}completion`, {
        headers,
      });

      const properties = contactData.data.types.find(
        ({ name }: { name: string }) => name === 'contact'
      );

      const contacts =
        properties &&
        properties.properties
          .map((i: any) => contactVariablesprefix.concat(i.key))
          .concat(fields)
          .map((val: string) => ({ name: val }))
          .slice(1);

      setContactVariables(contacts);
    };

    getVariableOptions();
  }, []);

  const { data: languages } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });

  const [getInteractiveTemplateById, { data: template }] =
    useLazyQuery<any>(GET_INTERACTIVE_MESSAGE);

  useEffect(() => {
    if (languages) {
      const lang = languages.currentUser.user.organization.activeLanguages.slice();
      // sort languages by their name
      lang.sort((first: any, second: any) => (first.label > second.label ? 1 : -1));

      setLanguageOptions(lang);
      if (!Object.prototype.hasOwnProperty.call(match.params, 'id')) setLanguage(lang[0]);
    }
  }, [languages]);

  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(match.params, 'id') && match.params.id) {
      getInteractiveTemplateById({ variables: { id: match.params.id } });
    }
  }, [match.params]);

  const { t } = useTranslation();

  const states = {
    language,
    title,
    body,
    globalButton,
    templateButtons,
    templateType,
    type,
    attachmentURL,
  };

  const setStates = ({
    label: labelValue,
    language: languageVal,
    type: typeValue,
    interactiveContent: interactiveContentValue,
    translations: translationsVal,
  }: any) => {
    const content = JSON.parse(interactiveContentValue);
    const data = convertJSONtoStateData(content, typeValue);

    if (languageOptions.length > 0 && languageVal) {
      const selectedLangauge = languageOptions.find((lang: any) => lang.id === languageVal.id);
      setTimeout(() => setLanguage(selectedLangauge), 150);
    }

    setTitle(data.title || labelValue);
    setBody(EditorState.createWithContent(WhatsAppToDraftEditor(data.body)));
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
    addFromTemplate: boolean = true,
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
    payload: any
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

    setTemplateButtons(result);
  };

  const updateTranslation = (value: any) => {
    const Id = value.id;
    // restore if selected language is same as template
    if (translations) {
      const translationsCopy = JSON.parse(translations);
      // restore if translations present for selected language
      if (Object.keys(translationsCopy).length > 0 && translationsCopy[Id]) {
        setStates({
          language: value,
          type: template.interactiveTemplate.interactiveTemplate.type,
          interactiveContent: JSON.stringify(translationsCopy[Id]),
        });
      } else if (template) {
        const fillDataWithEmptyValues = getDefaultValuesByTemplate(
          template.interactiveTemplate.interactiveTemplate
        );

        setStates({
          language: value,
          type: template.interactiveTemplate.interactiveTemplate.type,
          interactiveContent: JSON.stringify(fillDataWithEmptyValues),
        });
      }

      return;
    }

    setStates({
      language: value,
      type: template.interactiveTemplate.interactiveTemplate.type,
      interactiveContent: template.interactiveTemplate.interactiveTemplate.interactiveContent,
    });
  };

  const handleLanguageChange = (value: any) => {
    const selected = languageOptions.find(({ label }: any) => label === value);
    if (selected && Object.prototype.hasOwnProperty.call(match.params, 'id')) {
      updateTranslation(selected);
    }
    if (selected) setLanguage(selected);
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

  const fields = [
    {
      component: LanguageBar,
      options: langOptions || [],
      selectedLangauge: language && language.label,
      onLanguageChange: handleLanguageChange,
    },
    {
      component: Input,
      name: 'title',
      type: 'text',
      placeholder: t('Title*'),
      inputProp: {
        onBlur: (event: any) => setTitle(event.target.value),
      },
    },
    {
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
      component: InteractiveOptions,
      isAddButtonChecked: true,
      templateType,
      inputFields: templateButtons,
      disabled: false,
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

  const getPayloadByMediaType = (mediaType: string, payload: any) => {
    const result: any = {};

    switch (mediaType) {
      case 'IMAGE':
      case 'VIDEO':
        result.type = `${mediaType.toLowerCase()}`;
        result.url = payload.attachmentURL;
        result.text = payload.body.getCurrentContent().getPlainText();
        break;
      case 'DOCUMENT':
        result.type = 'file';
        result.url = payload.attachmentURL;
        result.filename = 'file';
        break;
      default:
        result.type = 'text';
        result.header = payload.title;
        result.text = payload.body.getCurrentContent().getPlainText();
        break;
    }

    return result;
  };

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
      const bodyText = payload.body.getCurrentContent().getPlainText();
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

    // Update label anyway if selected langauge is English
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

  const validation: any = {
    title: Yup.string()
      .required(t('Title is required'))
      .max(60, t('Title can be at most 60 characters')),
    body: Yup.string()
      .transform((current, original) => original.getCurrentContent().getPlainText())
      .required(t('Message content is required.')),
  };

  if (templateType === LIST) {
    validation.templateButtons = Yup.array()
      .of(
        Yup.object().shape({
          title: Yup.string()
            .required(t('Required'))
            .max(24, t('Section title can be at most 24 characters')),
          options: Yup.array().of(
            Yup.object().shape({
              title: Yup.string()
                .required(t('Title is required'))
                .max(24, t('Title can be at most 24 characters')),
              description: Yup.string().max(72, t('Description can be at most 72 characters')),
            })
          ),
        })
      )
      .min(1);

    validation.globalButton = Yup.string()
      .required(t('Required'))
      .max(20, t('Button value can be at most 20 characters'));
  } else {
    validation.templateButtons = Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.string()
            .required(t('Required'))
            .max(20, t('Button value can be at most 20 characters')),
        })
      )
      .min(1)
      .max(3);

    validation.type = Yup.object()
      .nullable()
      .when('attachmentURL', {
        is: (val: string) => val && val !== '',
        then: Yup.object().nullable().required(t('Type is required.')),
      });

    validation.attachmentURL = Yup.string()
      .nullable()
      .when('type', {
        is: (val: any) => val && val.id,
        then: Yup.string().required(t('Attachment URL is required.')),
      });
  }

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

  if (languageOptions.length < 1) {
    return <Loading />;
  }

  return (
    <>
      <FormLayout
        {...queries}
        match={match}
        states={states}
        setStates={setStates}
        setPayload={setPayload}
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
      />
      <div className={styles.Simulator}>
        <Simulator
          setSimulatorId={0}
          showSimulator
          isPreviewMessage
          message={{}}
          interactiveMessage={previewData}
          simulatorIcon={false}
        />
      </div>
    </>
  );
};

export default InteractiveMessage;
