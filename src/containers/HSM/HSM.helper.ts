import { CALL_TO_ACTION, MEDIA_MESSAGE_TYPES, QUICK_REPLY } from 'common/constants';

export interface CallToActionTemplate {
  type: string;
  title: string;
  value: string;
}

export interface QuickReplyTemplate {
  value: string;
}

export const mediaOptions = MEDIA_MESSAGE_TYPES.map((option: string) => ({ id: option, label: option })).filter(
  ({ label }) => label !== 'AUDIO' && label !== 'STICKER'
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
