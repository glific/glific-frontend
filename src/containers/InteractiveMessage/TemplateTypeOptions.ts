import { BLOCKS, CHANNEL_WEB, CHANNEL_WHATSAPP, LIST, LOCATION_REQUEST, QUICK_REPLY } from 'common/constants';
import { GLIFIC_BLOCKS } from './Blocks.helper';

/**
 * The grouped interactive-message type selector (contract §11).
 *
 * ```
 * WhatsApp    Reply buttons  ·  List  ·  Location request
 * Web         Image panel  ·  Carousel  ·  Form  ·  Custom Block
 * ```
 *
 * All four Web entries write `type = blocks`; they differ only in
 * `interactive_content.component`. That is why an option's `id` is a selector key rather than the
 * template type — four options share `BLOCKS`, so the type alone can no longer identify one.
 * Adding a block later is a new entry here plus a jsonb value, not a migration.
 */
export interface TemplateTypeOption {
  id: string;
  label: string;
  group: string;
  templateType: string;
  /** null for Custom Block: the author supplies the component in the payload. */
  component: string | null;
}

export const CUSTOM_BLOCK_OPTION_ID = 'BLOCKS:custom';

export const TEMPLATE_TYPE_OPTIONS: TemplateTypeOption[] = [
  { id: QUICK_REPLY, label: 'Reply buttons', group: CHANNEL_WHATSAPP, templateType: QUICK_REPLY, component: null },
  { id: LIST, label: 'List', group: CHANNEL_WHATSAPP, templateType: LIST, component: null },
  {
    id: LOCATION_REQUEST,
    label: 'Location request',
    group: CHANNEL_WHATSAPP,
    templateType: LOCATION_REQUEST,
    component: null,
  },
  {
    id: 'BLOCKS:glific/image-panel',
    label: 'Image panel',
    group: CHANNEL_WEB,
    templateType: BLOCKS,
    component: 'glific/image-panel',
  },
  {
    id: 'BLOCKS:glific/carousel',
    label: 'Carousel',
    group: CHANNEL_WEB,
    templateType: BLOCKS,
    component: 'glific/carousel',
  },
  { id: 'BLOCKS:glific/form', label: 'Form', group: CHANNEL_WEB, templateType: BLOCKS, component: 'glific/form' },
  { id: CUSTOM_BLOCK_OPTION_ID, label: 'Custom Block', group: CHANNEL_WEB, templateType: BLOCKS, component: null },
];

/**
 * The inverse mapping, needed whenever an existing template is loaded for edit: the stored
 * template only knows its type and (for blocks) its component. A `glific/*` name outside the
 * catalog cannot be saved, so falling through to Custom Block is total.
 */
export const getTemplateTypeOption = (templateType: string, component?: string | null): TemplateTypeOption => {
  if (templateType === BLOCKS) {
    if (component && GLIFIC_BLOCKS.includes(component)) {
      return TEMPLATE_TYPE_OPTIONS.find((option) => option.component === component) as TemplateTypeOption;
    }
    return TEMPLATE_TYPE_OPTIONS.find((option) => option.id === CUSTOM_BLOCK_OPTION_ID) as TemplateTypeOption;
  }
  return (
    TEMPLATE_TYPE_OPTIONS.find((option) => option.id === templateType) ??
    (TEMPLATE_TYPE_OPTIONS[0] as TemplateTypeOption)
  );
};
