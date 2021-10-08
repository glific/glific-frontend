import axios from 'axios';
import { LIST, QUICK_REPLY } from 'common/constants';
import { getPlainTextFromEditor } from 'common/RichEditor';
import { FLOW_EDITOR_API } from 'config';
import { getAuthSession } from 'services/AuthService';
import * as Yup from 'yup';

export const validator = (templateType: any, t: any) => {
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

  return validation;
};

export const convertJSONtoStateData = (JSONData: any, interactiveType: string, label: string) => {
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
        result.type = type.toUpperCase();
        result.attachmentURL = url;
        result.body = text;
        result.title = label;
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

export const getDefaultValuesByTemplate = (templateData: any) => {
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

export const getVariableOptions = async (setContactVariables: any) => {
  const glificBase = FLOW_EDITOR_API;

  const contactFieldsprefix = '@contact.fields.';
  const contactVariablesprefix = '@contact.';
  const headers = { Authorization: getAuthSession('access_token') };
  // get fields keys
  const fieldsData = await axios.get(`${glificBase}fields`, {
    headers,
  });

  const fields = fieldsData.data.results.map((i: any) => contactFieldsprefix.concat(i.key));

  // get contact keys
  const contactData = await axios.get(`${glificBase}completion`, {
    headers,
  });

  const properties = contactData.data.context.types.find(
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

export const getPayloadByMediaType = (mediaType: string, payload: any) => {
  const result: any = {};

  switch (mediaType) {
    case 'IMAGE':
    case 'VIDEO':
      result.type = `${mediaType.toLowerCase()}`;
      result.url = payload.attachmentURL;
      result.text = getPlainTextFromEditor(payload.body);
      break;
    case 'DOCUMENT':
      result.type = 'file';
      result.url = payload.attachmentURL;
      result.filename = 'file';
      break;
    default:
      result.type = 'text';
      result.header = payload.title;
      result.text = getPlainTextFromEditor(payload.body);
      break;
  }

  return result;
};
