import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';

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
export const dialogMessage = ' It will stop showing when you are drafting a customized message.';

export const categoryDescriptions: { [key: string]: string } = {
  UTILITY: 'Account updates, order confirmations, shipping notifications, alerts, and transactional messages',
  MARKETING: 'Promotional content, offers, announcements, product launches, and sales campaigns',
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
