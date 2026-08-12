/**
 * Custom UI interactive message — presets and payload validation.
 *
 * Implements the frozen cross-repo wire contract
 * (`plans/web-channel/custom-ui-contract.md`, sections 2, 6 and 7).
 *
 * The envelope stored in `interactive_templates.interactive_content` is:
 *
 * ```jsonc
 * {
 *   "type": "custom_ui",   // required — existing plumbing derives the message type from this
 *   "version": "1",
 *   "component": "glific/image_panel",
 *   "props": { },
 *   "fallback": "Pick a course: …",
 *   "context": { }         // optional
 * }
 * ```
 */

export const CUSTOM_UI_ENVELOPE_TYPE = 'custom_ui';
export const CUSTOM_UI_VERSION = '1';

/** §7 — outbound envelope size limit, serialized. */
export const CUSTOM_UI_MAX_BYTES = 64 * 1024;
/** §7 — maximum JSON nesting depth. */
export const CUSTOM_UI_MAX_DEPTH = 10;
/** §6 — component names must be `namespace/name`. */
export const COMPONENT_NAME_REGEX = /^[a-z0-9_]+\/[a-z0-9_]+$/;
/** §6 — the `glific/` namespace is reserved; only these names exist. */
export const GLIFIC_BLOCKS = ['glific/image_panel', 'glific/carousel', 'glific/form'];

const MAX_ITEMS = 10;

export interface CustomUiError {
  path: string;
  message: string;
}

export interface CustomUiValidationResult {
  valid: boolean;
  errors: CustomUiError[];
  /** Parsed envelope when the JSON itself parses, otherwise null. */
  envelope: any;
}

/** Byte length of the serialized payload, used for the 64 KB counter and the limit check. */
export const getPayloadSize = (payload: string): number => new TextEncoder().encode(payload || '').length;

const isPlainObject = (value: any) => !!value && typeof value === 'object' && !Array.isArray(value);

const jsonDepth = (value: any, depth = 1): number => {
  if (!value || typeof value !== 'object') return depth;
  const children = Array.isArray(value) ? value : Object.values(value);
  if (children.length === 0) return depth;
  return Math.max(...children.map((child: any) => jsonDepth(child, depth + 1)));
};

const requireString = (
  errors: CustomUiError[],
  container: any,
  key: string,
  path: string,
  { optional = false }: { optional?: boolean } = {}
) => {
  const value = container?.[key];
  if (value === undefined || value === null) {
    if (!optional) errors.push({ path, message: `"${path}" is required` });
    return;
  }
  if (typeof value !== 'string') {
    errors.push({ path, message: `"${path}" must be a string` });
    return;
  }
  if (!optional && !value.trim()) {
    errors.push({ path, message: `"${path}" cannot be blank` });
  }
};

const validateItemList = (
  errors: CustomUiError[],
  props: any,
  key: string,
  requiredKeys: string[],
  optionalKeys: string[]
) => {
  const list = props?.[key];
  if (!Array.isArray(list)) {
    errors.push({ path: `props.${key}`, message: `"props.${key}" must be an array` });
    return;
  }
  if (list.length < 1 || list.length > MAX_ITEMS) {
    errors.push({
      path: `props.${key}`,
      message: `"props.${key}" must have between 1 and ${MAX_ITEMS} entries`,
    });
    return;
  }
  list.forEach((item: any, index: number) => {
    const itemPath = `props.${key}[${index}]`;
    if (!isPlainObject(item)) {
      errors.push({ path: itemPath, message: `"${itemPath}" must be an object` });
      return;
    }
    requiredKeys.forEach((field) => requireString(errors, item, field, `${itemPath}.${field}`));
    optionalKeys.forEach((field) => requireString(errors, item, field, `${itemPath}.${field}`, { optional: true }));
  });
};

/** §6 — per-block props schemas for the reserved `glific/` namespace. */
const validateGlificProps = (errors: CustomUiError[], component: string, props: any) => {
  switch (component) {
    case 'glific/image_panel':
      requireString(errors, props, 'id', 'props.id');
      requireString(errors, props, 'body', 'props.body', { optional: true });
      validateItemList(errors, props, 'options', ['id', 'image', 'label'], []);
      break;
    case 'glific/carousel':
      requireString(errors, props, 'id', 'props.id');
      requireString(errors, props, 'body', 'props.body', { optional: true });
      validateItemList(errors, props, 'cards', ['id', 'image', 'title'], ['description']);
      break;
    case 'glific/form': {
      requireString(errors, props, 'id', 'props.id', { optional: true });
      requireString(errors, props, 'body', 'props.body', { optional: true });
      requireString(errors, props, 'submit_label', 'props.submit_label', { optional: true });
      validateItemList(errors, props, 'fields', ['id', 'label'], ['placeholder']);
      const fields = props?.fields;
      if (Array.isArray(fields)) {
        fields.forEach((field: any, index: number) => {
          if (isPlainObject(field) && field.required !== undefined && typeof field.required !== 'boolean') {
            errors.push({
              path: `props.fields[${index}].required`,
              message: `"props.fields[${index}].required" must be true or false`,
            });
          }
        });
      }
      break;
    }
    default:
      break;
  }
};

/**
 * Validate a Custom UI payload as typed into the JSON editor.
 *
 * Envelope rules apply to every component; full block-schema validation applies to the
 * reserved `glific/` namespace only. Other namespaces are opaque (contract §6).
 */
export const validateCustomUiPayload = (payload: string): CustomUiValidationResult => {
  const errors: CustomUiError[] = [];

  let envelope: any = null;
  try {
    envelope = JSON.parse(payload);
  } catch (error: any) {
    return { valid: false, envelope: null, errors: [{ path: 'payload', message: `Invalid JSON: ${error.message}` }] };
  }

  if (!isPlainObject(envelope)) {
    return { valid: false, envelope: null, errors: [{ path: 'payload', message: 'Payload must be a JSON object' }] };
  }

  const size = getPayloadSize(payload);
  if (size > CUSTOM_UI_MAX_BYTES) {
    errors.push({
      path: 'payload',
      message: `Payload is ${(size / 1024).toFixed(1)} KB — the limit is 64 KB`,
    });
  }

  if (jsonDepth(envelope) > CUSTOM_UI_MAX_DEPTH) {
    errors.push({ path: 'payload', message: `Payload is nested deeper than ${CUSTOM_UI_MAX_DEPTH} levels` });
  }

  if (envelope.type !== undefined && envelope.type !== CUSTOM_UI_ENVELOPE_TYPE) {
    errors.push({ path: 'type', message: `"type" must be "${CUSTOM_UI_ENVELOPE_TYPE}"` });
  }

  if (envelope.version !== undefined && envelope.version !== CUSTOM_UI_VERSION) {
    errors.push({ path: 'version', message: `"version" must be "${CUSTOM_UI_VERSION}"` });
  }

  const { component } = envelope;
  if (typeof component !== 'string' || !component.trim()) {
    errors.push({ path: 'component', message: '"component" is required' });
  } else if (!COMPONENT_NAME_REGEX.test(component)) {
    errors.push({
      path: 'component',
      message: `"component" must look like namespace/name, using lowercase letters, digits and underscores`,
    });
  } else if (component.startsWith('glific/') && !GLIFIC_BLOCKS.includes(component)) {
    errors.push({
      path: 'component',
      message: `"${component}" is not a built-in block. The glific/ namespace is reserved — use one of ${GLIFIC_BLOCKS.join(
        ', '
      )}, or your own namespace.`,
    });
  }

  if (!isPlainObject(envelope.props)) {
    errors.push({ path: 'props', message: '"props" must be an object' });
  } else if (typeof component === 'string' && GLIFIC_BLOCKS.includes(component)) {
    validateGlificProps(errors, component, envelope.props);
  }

  if (envelope.context !== undefined && !isPlainObject(envelope.context)) {
    errors.push({ path: 'context', message: '"context" must be an object' });
  }

  return { valid: errors.length === 0, errors, envelope };
};

/**
 * Build the envelope that gets saved. `type` and `version` are always injected — never
 * taken on trust from the editor — and keys are emitted in contract §2 order.
 */
export const buildCustomUiEnvelope = (payload: string, fallback: string): any => {
  let parsed: any = {};
  try {
    parsed = JSON.parse(payload) || {};
  } catch (error) {
    parsed = {};
  }

  const envelope: any = {
    type: CUSTOM_UI_ENVELOPE_TYPE,
    version: CUSTOM_UI_VERSION,
    component: parsed.component ?? '',
    props: parsed.props ?? {},
    fallback: fallback ?? '',
  };

  if (parsed.context !== undefined) {
    envelope.context = parsed.context;
  }

  return envelope;
};

/** The editor only ever shows component/props/context — fallback lives on the language tabs. */
export const envelopeToEditorPayload = (envelope: any): string => {
  const editable: any = {
    component: envelope?.component ?? '',
    props: envelope?.props ?? {},
  };
  if (envelope?.context !== undefined) {
    editable.context = envelope.context;
  }
  return JSON.stringify(editable, null, 2);
};

export const BLANK_PRESET_ID = 'BLANK';

export interface CustomUiPreset {
  id: string;
  label: string;
  description: string;
  /** Suggested fallback text, pre-filled for the built-in blocks. */
  fallback: string;
  payload: any;
}

/**
 * "Start from" gallery. The three block presets are valid `glific/*` payloads out of the box —
 * pick one, save, and you have a working template. Blank starts in the org namespace.
 */
export const CUSTOM_UI_PRESETS: CustomUiPreset[] = [
  {
    id: 'glific/image_panel',
    label: 'Image panel',
    description: 'A grid of tappable images with labels. Single select.',
    fallback: 'Pick a course: Spoken English or Digital skills',
    payload: {
      component: 'glific/image_panel',
      props: {
        id: 'course',
        body: 'Pick a course',
        options: [
          { id: 'c1', image: 'https://picsum.photos/seed/english/300/200', label: 'Spoken English' },
          { id: 'c2', image: 'https://picsum.photos/seed/digital/300/200', label: 'Digital skills' },
        ],
      },
    },
  },
  {
    id: 'glific/carousel',
    label: 'Carousel',
    description: 'Horizontally swipeable cards with an image, title and description.',
    fallback: 'Browse our courses: Course A or Course B',
    payload: {
      component: 'glific/carousel',
      props: {
        id: 'product',
        body: 'Browse our courses',
        cards: [
          {
            id: 'p1',
            image: 'https://picsum.photos/seed/coursea/300/200',
            title: 'Course A',
            description: 'Six weeks, evenings',
          },
          {
            id: 'p2',
            image: 'https://picsum.photos/seed/courseb/300/200',
            title: 'Course B',
            description: 'Four weeks, weekends',
          },
        ],
      },
    },
  },
  {
    id: 'glific/form',
    label: 'Form',
    description: 'Inline labelled text fields with a submit button.',
    fallback: 'Tell us about yourself — reply with your name and city',
    payload: {
      component: 'glific/form',
      props: {
        id: 'signup',
        body: 'Tell us about yourself',
        fields: [
          { id: 'name', label: 'Your name', placeholder: 'Asha', required: true },
          { id: 'city', label: 'Your city', placeholder: 'Pune', required: false },
        ],
        submit_label: 'Submit',
      },
    },
  },
  {
    id: BLANK_PRESET_ID,
    label: 'Blank',
    description: 'Start from an empty payload in your own namespace.',
    fallback: '',
    payload: {
      component: 'org/my_component',
      props: {},
    },
  },
];

export const getCustomUiPreset = (id: string): CustomUiPreset | undefined =>
  CUSTOM_UI_PRESETS.find((preset) => preset.id === id);

export const getPresetPayload = (id: string): string => {
  const preset = getCustomUiPreset(id);
  return JSON.stringify(preset ? preset.payload : CUSTOM_UI_PRESETS[CUSTOM_UI_PRESETS.length - 1].payload, null, 2);
};
