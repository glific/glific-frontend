import { t } from 'i18next';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

import { GET_TEMPLATE } from 'graphql/queries/Template';
import { CREATE_TEMPLATE, DELETE_TEMPLATE, UPDATE_TEMPLATE } from 'graphql/mutations/Template';

import { TileOption } from 'components/UI/Form/TileSelector/TileSelector';

import { getExampleFromBody, mediaOptions, removeFirstLineBreak } from '../HSM.helper';

export const queries = {
  getItemQuery: GET_TEMPLATE,
  createItemQuery: CREATE_TEMPLATE,
  updateItemQuery: UPDATE_TEMPLATE,
  deleteItemQuery: DELETE_TEMPLATE,
};

export const templateIcon = <TemplateIcon />;
export const dialogMessage = t('It will stop showing when you draft a customized message');

export interface AttachmentTileMeta {
  icon: any;
  format: string;
  maxSizeLabel: string;
  maxSizeMB: number;
  accept: string;
}

export const attachmentTileMeta: { [key: string]: AttachmentTileMeta } = {
  IMAGE: {
    icon: <ImageOutlinedIcon />,
    format: 'JPG, PNG',
    maxSizeLabel: 'Max 5 MB',
    maxSizeMB: 5,
    accept: 'image/*',
  },
  DOCUMENT: {
    icon: <InsertDriveFileOutlinedIcon />,
    format: 'PDF',
    maxSizeLabel: 'Max 16 MB',
    maxSizeMB: 16,
    accept: 'application/pdf',
  },
  VIDEO: {
    icon: <VideocamOutlinedIcon />,
    format: 'MP4',
    maxSizeLabel: 'Max 16 MB',
    maxSizeMB: 16,
    accept: 'video/*',
  },
};

export const attachmentTypeOptions: TileOption[] = mediaOptions.map((option) => ({
  ...option,
  icon: attachmentTileMeta[option.id]?.icon,
  format: attachmentTileMeta[option.id]?.format,
  maxSizeLabel: attachmentTileMeta[option.id]?.maxSizeLabel,
}));

export const categoryDescriptions: { [key: string]: string } = {
  UTILITY: t('Account updates, order confirmations, shipping notifications, alerts, and transactional messages'),
  MARKETING: t('Promotional content, offers, announcements, product launches, and sales campaigns'),
};

export interface SimulatorMessageContext {
  sampleMessages: any;
  body: string;
  variables: Array<any>;
  attachmentURL: string;
  type: any;
}

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
