import { t } from 'i18next';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

import { CALL_TO_ACTION, QUICK_REPLY } from 'common/constants';
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

// languages already used by some (still-existing) variant of the template
// shouldn't be offered again when adding a new language version — if a
// sibling was rejected/failed, the fix is to delete that variant first, which
// removes it from `variants` and frees the language back up here.
export const filterAvailableLanguages = (allLanguages: any[] = [], excludeLanguageIds: any[] = []) => {
  const usedIds = new Set(excludeLanguageIds);
  return allLanguages.filter((language: any) => !usedIds.has(language.id));
};

export const STATUS_TABS = ['Approved', 'In Progress', 'Rejected'] as const;
export type StatusTab = (typeof STATUS_TABS)[number];

export const statusTabFor = (status: string): StatusTab => {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'PENDING') return 'In Progress';
  if (normalized === 'REJECTED' || normalized === 'FAILED') return 'Rejected';
  return 'Approved';
};

export const groupVariantsByTab = (variants: any[] = []): Record<StatusTab, any[]> => {
  const groups: Record<StatusTab, any[]> = { Approved: [], 'In Progress': [], Rejected: [] };
  variants.forEach((variant) => {
    groups[statusTabFor(variant.status)].push(variant);
  });
  return groups;
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

// Meta's pre-approved template catalog (templateLibrary query) — a live,
// read-only, org-scoped passthrough to Gupshup's Partner API. Never persisted
// as a SessionTemplate; entries only ever prefill the Create Template draft.
export interface TemplateLibraryEntry {
  elementName?: string | null;
  category?: string | null;
  body?: string | null;
  languageCode?: string | null;
  industry?: string | null;
  topic?: string | null;
  usecase?: string | null;
  containerMeta?: Record<string, any> | string | null;
}

// The backend decodes Gupshup's raw containerMeta string into a real object
// before it reaches the `:json` scalar, so this normally already arrives as
// an object. Still accepts a JSON string too (older callers, mocks) - best
// effort either way, since its shape isn't guaranteed across Meta's catalog.
export const parseContainerMeta = (containerMeta?: Record<string, any> | string | null): any => {
  if (!containerMeta) return {};
  if (typeof containerMeta === 'object') return containerMeta;
  try {
    return JSON.parse(containerMeta) || {};
  } catch {
    return {};
  }
};

// Gupshup wire-format button types (URL/PHONE_NUMBER/QUICK_REPLY) map onto our
// two supported button groups — anything else (e.g. WhatsApp Forms) falls
// back to no buttons rather than guessing.
export const buttonTypeFromContainerButtons = (buttons: Array<any> = []): string | undefined => {
  if (!buttons.length) return undefined;
  if (buttons.some((button) => button.type === 'QUICK_REPLY')) return QUICK_REPLY;
  if (buttons.some((button) => button.type === 'URL' || button.type === 'PHONE_NUMBER')) return CALL_TO_ACTION;
  return undefined;
};

// Maps a library entry into the shape HSMV2's existing setStates already
// consumes for language-variant/copy drafts — reuses that setter pipeline
// instead of duplicating it. elementName is left out on purpose: the user
// names their own template.
export const buildLibraryDraft = (entry: TemplateLibraryEntry) => {
  const containerMeta = parseContainerMeta(entry.containerMeta);
  const containerButtons = Array.isArray(containerMeta.buttons) ? containerMeta.buttons : [];
  const buttonType = buttonTypeFromContainerButtons(containerButtons);
  const hasButtons = Boolean(buttonType);

  return {
    shortcode: '',
    body: entry.body || '',
    footer: containerMeta.footer || '',
    example: containerMeta.sampleText || '',
    category: entry.category || undefined,
    hasButtons,
    buttonType,
    buttons: hasButtons ? JSON.stringify(containerButtons) : undefined,
  };
};
