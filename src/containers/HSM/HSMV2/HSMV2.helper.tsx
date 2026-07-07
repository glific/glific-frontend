import { Field } from 'formik';
import * as Yup from 'yup';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';

import { CALL_TO_ACTION, QUICK_REPLY } from 'common/constants';
import { GET_TEMPLATE } from 'graphql/queries/Template';
import { CREATE_TEMPLATE, DELETE_TEMPLATE, UPDATE_TEMPLATE } from 'graphql/mutations/Template';

import { getExampleFromBody, removeFirstLineBreak } from '../HSM.helper';

export const queries = {
  getItemQuery: GET_TEMPLATE,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

export const templateIcon = <TemplateIcon />;
export const regexForShortcode = /^[a-z0-9_]+$/g;
export const dialogMessage = ' It will stop showing when you are drafting a customized message.';

export const buttonTypes: any = {
  QUICK_REPLY: { value: '' },
  CALL_TO_ACTION: { type: 'phone_number', title: '', value: '' },
  WHATSAPP_FORM: { type: 'whatsapp_form', form_id: '', text: '', navigate_screen: '' },
};

export const categoryDescriptions: { [key: string]: string } = {
  UTILITY: 'Account updates, order confirmations, shipping notifications, alerts, and transactional messages',
  MARKETING: 'Promotional content, offers, announcements, product launches, and sales campaigns',
};

export const titleCase = (value: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : value);

// looks up a named field descriptor out of the array FormLayout hands to renderFields.
export const getField = (fieldItems: any[], name: string) => fieldItems.find((field: any) => field.name === name);

// renders a named field through the same <Field> wrapper FormLayout's default loop uses,
// so Formik still injects `field`/`form` the way AutoComplete/Input/etc. expect.
export const renderTextField = (fieldItems: any[], name: string) => {
  const field = getField(fieldItems, name);
  return field ? <Field {...field} /> : null;
};

// splits a body string into the message and any trailing "| [button, ...]" gupshup markup.
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

// builds the buttons/example/body payload fragment for whichever button type is selected.
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

// the setPayload handed to FormLayout — turns the raw Formik values into the
// SessionTemplateInput shape the create/update mutations expect. Every HSM created
// here is a brand new template — adding a language variant to an existing HSM is a
// separate flow, so shortcode always comes from the element name the user typed.
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
  payloadCopy.shortcode = payloadCopy.newShortcode;
  if (!isEditing) {
    payloadCopy.category = category.label;
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
  delete payloadCopy.variables;
  delete payloadCopy.newShortcode;
  return payloadCopy;
};

export interface SimulatorMessageContext {
  sampleMessages: any;
  body: string;
  variables: Array<any>;
  attachmentURL: string;
  type: any;
}

// recomputes the sample message object shown in the Simulator preview.
export const buildSimulatorMessage = (
  { sampleMessages, body, variables, attachmentURL, type }: SimulatorMessageContext,
  messages: string,
  footerValue?: any
) => {
  const message = removeFirstLineBreak(messages);
  const mediaBody: any = { ...sampleMessages.media };
  mediaBody.caption = getExampleFromBody(body, variables);
  mediaBody.url = attachmentURL;
  const typeValue = type?.id || 'TEXT';
  const sampleMessage = { ...sampleMessages, body: message, media: mediaBody, type: typeValue };
  if (footerValue || footerValue === '') {
    sampleMessage.footer = footerValue;
  }
  return sampleMessage;
};

// the next templateButtons array after adding a new button row for the given type.
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

// the next templateButtons array after editing one field of one button row.
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
}

// the Yup schema used for validating the create/edit form (skipped entirely in edit mode).
export const buildValidationSchema = ({ t, isAddButtonChecked, templateType }: ValidationSchemaContext) => {
  const validation: any = {
    language: Yup.object().nullable().required('Language is required.'),
    // no Title field — the backend derives the label from shortcode + language, and
    // newShortcode (below) already carries its own required/format validation.
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
    body: Yup.string().required(t('Message is required.')).max(1024, 'Maximum 1024 characters are allowed'),
    category: Yup.object().nullable().required(t('Category is required.')),
    variables: Yup.array().of(
      Yup.object().shape({
        text: Yup.string().required('Variable is required').min(1, 'Text cannot be empty'),
      })
    ),
    newShortcode: Yup.string()
      .required(t('Element name is required.'))
      .matches(regexForShortcode, 'Only lowercase alphanumeric characters and underscores are allowed.'),
    templateButtons: Yup.array().of(
      Yup.lazy(() => {
        if (isAddButtonChecked) {
          if (templateType?.id === 'CALL_TO_ACTION') {
            return Yup.object().shape({
              type: Yup.string().required('Type is required.'),
              title: Yup.string().required('Title is required.'),
              value: Yup.string().required('Value is required.'),
            });
          } else if (templateType?.id === 'QUICK_REPLY') {
            return Yup.object().shape({
              value: Yup.string().required('Value is required.'),
            });
          } else if (templateType?.id === 'WHATSAPP_FORM') {
            return Yup.object().shape({
              form_id: Yup.string().required('Form is required.'),
              text: Yup.string().required('Button title is required.'),
              navigate_screen: Yup.string().required('Screen is required.'),
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
