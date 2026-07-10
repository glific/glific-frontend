import * as Yup from 'yup';

import { CALL_TO_ACTION, MEDIA_MESSAGE_TYPES, QUICK_REPLY, WHATSAPP_FORM } from 'common/constants';

export interface CallToActionTemplate {
  type: string;
  title: string;
  value: string;
}

export interface QuickReplyTemplate {
  value: string;
}

export interface WhatsappFormTemplate {
  form_id: string;
  text: string;
  navigate_screen: string;
}

export const mediaOptions = MEDIA_MESSAGE_TYPES.filter((media) => media !== 'AUDIO' && media !== 'STICKER').map(
  (option: string) => ({
    id: option,
    label: `${option} URL`,
  })
);

export const removeFirstLineBreak = (text: any) =>
  text?.length === 1 ? text.slice(0, 1).replace(/(\r\n|\n|\r)/, '') : text;

/**
 * Function to convert buttons to template format
 *
 * @param templateButtons buttons that need to be converted to gupshup format
 * @param templateType depending on template type convert button to gupshup format
 *
 * @return array result
 */
export const convertButtonsToTemplate = (templateButtons: Array<any>, templateType: string | null) =>
  templateButtons.reduce((result: any, temp: any) => {
    const { title, value } = temp;
    if (templateType === CALL_TO_ACTION && value && title) {
      result.push(`[${title}, ${value}]`);
    }
    if (templateType === QUICK_REPLY && value) {
      result.push(`[${value}]`);
    }
    if (templateType === WHATSAPP_FORM && temp.form_id && temp.text && temp.navigate_screen) {
      result.push(`[${temp.text}, ${temp.navigate_screen}, ${temp.form_id}]`);
    }
    return result;
  }, []);

/**
 * As messages and buttons are now separated
 * we are combining both message and buttons,
 * so that you can see preview in simulator
 *
 * @param templateType template type
 * @param message
 * @param buttons
 *
 * @return object {buttons, template}
 */
export const getTemplateAndButtons = (templateType: string, message: string, buttons: string) => {
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

  if (templateType === WHATSAPP_FORM) {
    result = templateButtons.map((button: any) => {
      const { flow_id, text, navigate_screen } = button;
      return { form_id: flow_id, text, navigate_screen };
    });
  }

  // Getting in template format of gupshup
  const templateFormat = convertButtonsToTemplate(result, templateType);
  // Pre-pending message with buttons
  const template = `${message} | ${templateFormat.join(' | ')}`;
  return { buttons: result, template };
};

export const getExampleFromBody = (body: string, variables: Array<any>) => {
  return body.replace(/{{(\d+)}}/g, (match, number) => {
    let index = parseInt(number) - 1;

    return variables[index]?.text ? (variables[index] ? `[${variables[index]?.text}]` : match) : `{{${number}}}`;
  });
};

export const getVariables = (message: string, variables: any) => {
  const regex = /{{\d+}}/g;
  const matches = message.match(regex);

  if (!matches) {
    return [];
  }

  return matches.map((match, index) => (variables[index]?.text ? variables[index] : { text: '', id: index + 1 }));
};

export const getExampleValue = (example: string) => {
  const regex = /\[([^\]]+)\]/g;
  let match;
  const variables = [];
  let id = 1;

  while ((match = regex.exec(example)) !== null) {
    variables.push({ text: match[1], id });
    id++;
  }

  return variables;
};

export const regexForShortcode = /^[a-z0-9_]+$/g;

export const buttonTypes: any = {
  QUICK_REPLY: { value: '' },
  CALL_TO_ACTION: { type: 'phone_number', title: '', value: '' },
  WHATSAPP_FORM: { type: 'whatsapp_form', form_id: '', text: '', navigate_screen: '' },
};

export const getTemplateAndButton = (text: string) => {
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

export interface ButtonTemplatePayloadArgs {
  templateButtons: Array<any>;
  templateType: any;
  body: string;
  variables: Array<any>;
}

export const getButtonTemplatePayload = ({
  templateButtons,
  templateType,
  body,
  variables,
}: ButtonTemplatePayloadArgs) => {
  const buttons = templateButtons.reduce((result: any, button: any) => {
    const {
      type: buttonType,
      value,
      title,
      text,
      form_id,
      navigate_screen,
      urlType: buttonUrlType,
      sampleSuffix: buttonSampleSuffix,
    }: any = button;

    const urlType = buttonUrlType || 'Static';
    const sampleSuffix = buttonSampleSuffix || '';

    if (templateType?.id === CALL_TO_ACTION) {
      const typeObj: any = {
        phone_number: 'PHONE_NUMBER',
        url: 'URL',
      };
      let obj: any = { type: typeObj[buttonType], text: title, [buttonType]: value };

      if (buttonType === 'url' && urlType === 'Dynamic') {
        obj = {
          type: typeObj[buttonType],
          text: title,
          [buttonType]: `${value}{{1}}`,
          example: [`${value}${sampleSuffix}`],
        };
      }
      result.push(obj);
    }

    if (templateType?.id === QUICK_REPLY) {
      const obj: any = { type: QUICK_REPLY, text: value };
      result.push(obj);
    }

    if (templateType?.id === 'WHATSAPP_FORM') {
      const obj = { type: 'FLOW', navigate_screen, text, flow_id: form_id, flow_action: 'NAVIGATE' };
      result.push(obj);
    }
    return result;
  }, []);

  const templateBody = getTemplateAndButton(body);
  const templateExample = getTemplateAndButton(getExampleFromBody(body, variables));

  return {
    hasButtons: true,
    buttons: JSON.stringify(buttons),
    buttonType: templateType?.id,
    body: templateBody.message,
    example: templateExample.message,
  };
};

export interface BuildTemplatePayloadContext {
  isEditing: boolean;
  category: any;
  variables: Array<any>;
  isAddButtonChecked: boolean;
  templateType: any;
  templateButtons: Array<any>;
  body: string;
  footer: string;
  tagId: any;
}

export const buildTemplatePayload = (
  payload: any,
  {
    isEditing,
    category,
    variables,
    isAddButtonChecked,
    templateType,
    templateButtons,
    body,
    footer,
    tagId,
  }: BuildTemplatePayloadContext
) => {
  let payloadCopy = { ...payload, isHsm: true };
  if (isEditing) {
    payloadCopy.shortcode = payloadCopy.newShortcode;
  } else if (payload.languageVariant) {
    // HSM.tsx "translate existing HSM" flow: reuse an existing shortcode instead of a new one
    payloadCopy.category = category.label;
    payloadCopy.shortcode = payloadCopy.existingShortcode.label;
  } else {
    payloadCopy.category = category.label;
    payloadCopy.shortcode = payloadCopy.newShortcode;
  }
  payloadCopy.languageId = payload.language.id;
  payloadCopy.example = getExampleFromBody(payloadCopy.body, variables);
  if (isAddButtonChecked && templateType?.id) {
    const templateButtonData = getButtonTemplatePayload({ templateButtons, templateType, body, variables });
    Object.assign(payloadCopy, { ...templateButtonData });
  }

  if (payloadCopy.type) {
    payloadCopy.type = payloadCopy.type.id;
    // STICKER is a type of IMAGE
    if (payloadCopy.type.id === 'STICKER') {
      payloadCopy.type = 'IMAGE';
    }
  } else {
    payloadCopy.type = 'TEXT';
  }

  if (payloadCopy.type === 'TEXT' || isEditing) {
    delete payloadCopy.attachmentURL;
  }
  if (footer?.trim()) {
    payloadCopy.footer = footer.trim();
  }

  if (tagId) {
    payloadCopy.tagId = payload.tagId.id;
  }

  delete payloadCopy.isAddButtonChecked;
  delete payloadCopy.templateButtons;
  delete payloadCopy.language;
  delete payloadCopy.languageVariant;
  delete payloadCopy.variables;
  delete payloadCopy.existingShortcode;
  delete payloadCopy.newShortcode;
  return payloadCopy;
};

export const buildTemplateButtonsList = (
  templateButtons: Array<any>,
  templateType: any,
  addFromTemplate: boolean = true
) => {
  let buttons: any = [];
  const hasPhoneNumber = templateButtons.some((btn: any) => btn.type === 'phone_number');
  const urlCount = templateButtons.filter((btn: any) => btn?.type === 'url').length;
  let newButton = { ...buttonTypes[templateType?.id] };
  if (templateType?.id === CALL_TO_ACTION) {
    if (hasPhoneNumber && urlCount < 2) {
      newButton.type = 'url';
      newButton.value = '';
      newButton.title = '';
    }
  }
  if (templateType?.id) {
    buttons = addFromTemplate ? [...templateButtons, newButton] : [newButton];
  }
  return buttons;
};

export const buildUpdatedButtons = (templateButtons: Array<any>, value: any, row: any, index: any, eventType: any) => {
  let obj = { ...row };

  if (eventType === 'type') {
    obj = { type: value, title: '', value: '' };
  } else {
    obj[eventType] = value;
  }

  return templateButtons.map((val: any, idx: number) => (idx === index ? obj : val));
};

export interface ValidationSchemaContext {
  t: any;
  isAddButtonChecked: boolean;
  templateType: any;
  hasTitleField?: boolean;
  hasLanguageVariant?: boolean;
}

export const buildValidationSchema = ({
  t,
  isAddButtonChecked,
  templateType,
  hasTitleField,
  hasLanguageVariant,
}: ValidationSchemaContext) => {
  const validation: any = {
    language: Yup.object().nullable().required(t('Language is required.')),
    ...(hasTitleField
      ? { label: Yup.string().required(t('Title is required.')).max(50, t('Title length is too long.')) }
      : {}),
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
    footer: Yup.string().max(60, t('Footer value can be at most 60 characters')),
    body: Yup.string().required(t('Message is required.')).max(1024, t('Maximum 1024 characters are allowed')),
    category: Yup.object().nullable().required(t('Category is required.')),
    variables: Yup.array().of(
      Yup.object().shape({
        text: Yup.string().required(t('Variable is required')).min(1, t('Text cannot be empty')),
      })
    ),
    ...(hasLanguageVariant
      ? {
          newShortcode: Yup.string().when('languageVariant', {
            is: (val: any) => val === true,
            then: (schema) => schema.nullable(),
            otherwise: (schema) =>
              schema
                .required(t('Element name is required.'))
                .matches(regexForShortcode, t('Only lowercase alphanumeric characters and underscores are allowed.')),
          }),
          existingShortcode: Yup.object().when('languageVariant', {
            is: (val: any) => val === true,
            then: (schema) => schema.nullable().required(t('Element name is required.')),
            otherwise: (schema) => schema.nullable(),
          }),
        }
      : {
          newShortcode: Yup.string()
            .required(t('Element name is required.'))
            .matches(regexForShortcode, t('Only lowercase alphanumeric characters and underscores are allowed.')),
        }),
    templateButtons: Yup.array().of(
      Yup.lazy(() => {
        if (isAddButtonChecked) {
          if (templateType?.id === 'CALL_TO_ACTION') {
            return Yup.object().shape({
              type: Yup.string().required(t('Type is required.')),
              title: Yup.string().required(t('Title is required.')),
              value: Yup.string().required(t('Value is required.')),
            });
          } else if (templateType?.id === 'QUICK_REPLY') {
            return Yup.object().shape({
              value: Yup.string().required(t('Value is required.')),
            });
          } else if (templateType?.id === 'WHATSAPP_FORM') {
            return Yup.object().shape({
              form_id: Yup.string().required(t('Form is required.')),
              text: Yup.string().required(t('Button title is required.')),
              navigate_screen: Yup.string().required(t('Screen is required.')),
            });
          }
          return Yup.object().shape({});
        }
        return Yup.object().shape({});
      })
    ),
  };

  return Yup.object().shape(validation, [['type', 'attachmentURL']]);
};
