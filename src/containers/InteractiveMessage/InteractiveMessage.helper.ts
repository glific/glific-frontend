import axios from 'axios';
import { LIST, QUICK_REPLY } from 'common/constants';
import { getPlainTextFromEditor } from 'common/RichEditor';
import { FLOW_EDITOR_API } from 'config';
import { getAuthSession } from 'services/AuthService';
import * as Yup from 'yup';

Yup.addMethod(Yup.array, 'unique', function uniqueMethod(message) {
  return this.test('unique', message, function test(list: any) {
    if (!list) return true;
    // create a title map
    const titleMap: Array<string> = [];

    for (let listItem = 0; listItem < list.length; listItem += 1) {
      const { options } = list[listItem];

      if (!options) return true;
      const len = options.length;

      for (let i = 0; i < len; i += 1) {
        // check if we have a duplicate
        if (titleMap.includes(options[i].title)) {
          return this.createError({
            path: `templateButtons[${listItem}].options[${i}].title`,
            message,
          });
        }
        titleMap.push(options[i].title);
      }
    }

    return true;
  });
});

export const validator = (templateType: any, t: any) => {
  const validation: any = {
    title: Yup.string()
      .required(t('Title is required'))
      .max(60, t('Title can be at most 60 characters')),
    body: Yup.string()
      .transform((_current, original) => original.getCurrentContent().getPlainText())
      .when('type', {
        is: (val: any) => val && val.id && val.id === 'DOCUMENT',
        then: Yup.string().nullable(),
        otherwise: Yup.string().required(t('Message content is required.')),
      }),
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
                .test('is-emoji', t('Sorry! Emojis are not allowed in the title'), (value) => {
                  if (value) {
                    const testEmoji =
                      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi.test(
                        value
                      );
                    return !testEmoji;
                  }
                  return true;
                })
                .required(t('Title is required'))
                .max(24, t('Title can be at most 24 characters')),
              description: Yup.string().max(72, t('Description can be at most 72 characters')),
            })
          ),
        })
      )
      // need to add this since adding a new method in yup does not add its type declarations
      // @ts-ignore
      .unique(t('Please enter unique title'))
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
        result.body = '';
        result.title = label;
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
      if (['type'].includes(key)) res[key] = content[key];
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
  const headers = { authorization: getAuthSession('access_token') };
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

export const getTranslation = (
  interactiveType: string,
  attribute: any,
  translations: any,
  defaultLanguage: any
) => {
  if (defaultLanguage.id) {
    const defaultTemplate = JSON.parse(translations)[defaultLanguage.id];

    if (!defaultTemplate) {
      return null;
    }

    if (interactiveType === QUICK_REPLY) {
      switch (attribute) {
        case 'title':
          return defaultTemplate.content.header;
        case 'body':
          return defaultTemplate.content.text;
        case 'options':
          return defaultTemplate.options.map((option: any) => option.title);
        default:
          return null;
      }
    }

    switch (attribute) {
      case 'title':
        return defaultTemplate.title;
      case 'body':
        return defaultTemplate.body;
      case 'options':
        return {
          items: defaultTemplate.items,
          globalButton: defaultTemplate.globalButtons[0].title,
        };
      default:
        return null;
    }
  }
  return null;
};
