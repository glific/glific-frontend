import React, { useState, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { EditorState } from 'draft-js';
import axios from 'axios';

import styles from './InteractiveMessage.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as InteractiveMessageIcon } from '../../assets/images/icons/InteractiveMessage/Dark.svg';
import {
  CREATE_INTERACTIVE,
  UPDATE_INTERACTIVE,
  DELETE_INTERACTIVE,
} from '../../graphql/mutations/InteractiveMessage';
import { GET_INTERACTIVE_MESSAGE } from '../../graphql/queries/InteractiveMessage';
import { EmojiInput } from '../../components/UI/Form/EmojiInput/EmojiInput';
import { InteractiveOptions } from './InteractiveOptions/InteractiveOptions';
import { LIST, MEDIA_MESSAGE_TYPES, QUICK_REPLY } from '../../common/constants';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { validateMedia } from '../../common/utils';
import { WhatsAppToDraftEditor } from '../../common/RichEditor';
import { Simulator } from '../../components/simulator/Simulator';
import { FLOW_EDITOR_API } from '../../config';
import { getAuthSession } from '../../services/AuthService';

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
    const { type, caption, url } = content;
    const result: any = {};
    result.templateButtons = options.map((option: any) => ({ value: option.title }));
    switch (type) {
      case 'image':
      case 'video':
        result.type = `${type.toUpperCase()}`;
        result.attachmentURL = url;
        result.body = caption;
        break;
      case 'file':
        result.type = 'DOCUMENT';
        result.attachmentURL = url;
        break;
      default:
        result.type = null;
        result.body = caption || '';
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

  const { t } = useTranslation();

  const states = { title, body, globalButton, templateButtons, templateType, type, attachmentURL };

  const setStates = ({
    type: typeValue,
    interactiveContent: interactiveContentValue,
    label: labelVal,
  }: any) => {
    const content = JSON.parse(interactiveContentValue);
    const data = convertJSONtoStateData(content, typeValue);
    if (typeValue === LIST) {
      setTitle(data.title);
      setBody(EditorState.createWithContent(WhatsAppToDraftEditor(data.body)));
      setTemplateType(typeValue);
      setTimeout(() => setTemplateButtons(data.templateButtons), 100);
      setGlobalButton(data.globalButton);
    }

    if (typeValue === QUICK_REPLY) {
      setTitle(labelVal);
      setBody(EditorState.createWithContent(WhatsAppToDraftEditor(data.body)));
      setTemplateType(typeValue);
      setTimeout(() => setTemplateButtons(data.templateButtons), 100);
      setType({ id: data.type, label: data.type });
      setAttachmentURL(data.attachmentURL);
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

    const template = stateToRestore || [buttonType[templateTypeVal]];
    buttons = addFromTemplate ? [...templateButtons, buttonType[templateTypeVal]] : template;

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

  const dialogMessage = t("You won't be able to use this flow again.");

  const options = MEDIA_MESSAGE_TYPES.filter(
    (msgType: string) => !['AUDIO', 'STICKER'].includes(msgType)
  ).map((option: string) => ({ id: option, label: option }));

  let timer: any = null;
  const fields = [
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
      helperText: 'You can also use variables in message enter @ to see the available list',
      inputProp: {
        onBlur: (editorState: any) => {
          setBody(editorState);
        },
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
        result.caption = payload.body.getCurrentContent().getPlainText();
        break;
      case 'DOCUMENT':
        result.type = 'file';
        result.url = payload.attachmentURL;
        result.filename = 'file';
        break;
      default:
        result.type = 'text';
        result.text = payload.title;
        result.caption = payload.body.getCurrentContent().getPlainText();
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
    const updatedPayload: any = { type: null, interactiveContent: null, label: null };

    if (templateTypeVal === QUICK_REPLY) {
      const content = getPayloadByMediaType(type?.id, payload);
      const quickReplyOptions = getTemplateButtonPayload(templateTypeVal, templateButtonVal);

      const quickReplyJSON = { type: 'quick_reply', content, options: quickReplyOptions };

      Object.assign(updatedPayload, {
        type: QUICK_REPLY,
        label: titleVal,
        interactiveContent: JSON.stringify(quickReplyJSON),
      });
    }

    if (templateTypeVal === LIST) {
      const { caption: bodyText } = getPayloadByMediaType(type?.id, payload);
      const items = getTemplateButtonPayload(templateTypeVal, templateButtonVal);
      const globalButtons = [{ type: 'text', title: globalButtonVal }];

      const listJSON = { type: 'list', title: titleVal, body: bodyText, globalButtons, items };
      Object.assign(updatedPayload, {
        type: LIST,
        label: titleVal,
        interactiveContent: JSON.stringify(listJSON),
      });
    }
    return updatedPayload;
  };

  const setPayload = (payload: any) => {
    const {
      templateType: templateTypeVal,
      templateButtons: templateButtonVal,
      title: titleVal,
      globalButton: globalButtonVal,
    } = payload;

    const payloadData = convertStateDataToJSON(
      payload,
      titleVal,
      templateTypeVal,
      templateButtonVal,
      globalButtonVal
    );
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
        label: t('Attachment Type'),
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
    title: Yup.string().required(t('Title is required.')),
    body: Yup.string()
      .transform((current, original) => original.getCurrentContent().getPlainText())
      .required(t('Message content is required.')),
  };

  if (templateType === LIST) {
    validation.templateButtons = Yup.array()
      .of(
        Yup.object().shape({
          title: Yup.string().required('Required'),
          options: Yup.array().of(
            Yup.object().shape({
              title: Yup.string().required('Title is required'),
              description: Yup.string(),
            })
          ),
        })
      )
      .min(1);

    validation.globalButton = Yup.string().required('Required');
  } else {
    validation.templateButtons = Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.string().required('Required'),
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

    if (!title || !isButtonPresent) {
      return null;
    }

    const payload = {
      title,
      body,
      attachmentURL,
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
        listItemName="interactive"
        dialogMessage={dialogMessage}
        formFields={formFields}
        redirectionLink="interactive-message"
        cancelLink="interactive-message"
        icon={interactiveMessageIcon}
        languageSupport={false}
      />
      <Simulator
        setSimulatorId={0}
        showSimulator
        isPreviewMessage
        message={{}}
        interactiveMessage={previewData}
        simulatorIcon={false}
      />
    </>
  );
};

export default InteractiveMessage;
