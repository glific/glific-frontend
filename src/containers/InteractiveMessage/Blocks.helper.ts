/**
 * Blocks interactive message — typed payload, presets and validation.
 *
 * Implements the frozen cross-repo wire contract (`plans/web-channel/blocks-contract.md`,
 * sections 2, 5.1, 6, 7 and 9). The envelope stored in
 * `interactive_templates.interactive_content` is TYPED: every leaf a human wrote is a
 * `{ kind, value }` node, so the translation walker and the validator can find it without
 * knowing the component's schema.
 *
 * ```jsonc
 * {
 *   "type": "blocks",
 *   "version": 1,
 *   "component": "glific/carousel",
 *   "props": { "id": "product", "body": { "kind": "text", "value": "Browse" }, … },
 *   "context": { }
 * }
 * ```
 */

export const BLOCKS_ENVELOPE_TYPE = 'blocks';
/** §2 — plain scalar, integer. */
export const BLOCKS_VERSION = 1;

/** §7 — outbound envelope size, measured on the UNWRAPPED, compactly encoded envelope. */
export const BLOCKS_MAX_UNWRAPPED_BYTES = 64 * 1024;
/** §7 — separate cap on the stored TYPED payload, because typing roughly doubles the bytes. */
export const BLOCKS_MAX_TYPED_BYTES = 128 * 1024;
/** §7 — maximum JSON nesting depth, measured on the unwrapped payload. */
export const BLOCKS_MAX_DEPTH = 10;
/** §6 — DNS label syntax, two segments. No underscores. */
export const COMPONENT_NAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\/[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
/** §6 — the `glific/` namespace is reserved; only these names exist. */
export const GLIFIC_BLOCKS = ['glific/image-panel', 'glific/carousel', 'glific/form'];
/** §5.1 — flat flow results mean these ids would overwrite a reserved key. */
export const RESERVED_IDS = ['input', 'category', 'inserted_at', 'summary', 'component', 'value'];
/** §2.1 — the seven typed-node kinds. */
export const TYPED_NODE_KINDS = ['text', 'alt', 'image', 'url', 'number', 'boolean', 'list'];
/** §6/§9 — summaries and derived bodies are clamped to this. */
export const MAX_SUMMARY_LENGTH = 500;

const MAX_ITEMS = 10;
// case-insensitive scheme, and something must follow it: the backend's `~r{^https?://}` is being
// tightened to this same rule, so `HTTP://host/a.png` stays authorable and a bare `http://` stays
// rejected in both repos
const ABSOLUTE_URL_REGEX = /^https?:\/\/\S+$/i;

export interface BlocksError {
  path: string;
  message: string;
}

export interface BlocksValidationResult {
  valid: boolean;
  errors: BlocksError[];
  /** The assembled typed envelope when the JSON itself parses, otherwise null. */
  envelope: any;
}

/** Byte length of an already-serialized string. */
export const getPayloadSize = (payload: string): number => new TextEncoder().encode(payload || '').length;

const isPlainObject = (value: any) => !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * §2.2 — a typed node is a map whose keys are a subset of `{kind, value, translate}` with both
 * `kind` and `value` present. Anything else is a plain value.
 */
export const isTypedNode = (value: any): boolean => {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  if (!keys.includes('kind') || !keys.includes('value')) return false;
  return keys.every((key) => ['kind', 'value', 'translate'].includes(key));
};

/**
 * §2.2 — every typed node collapses to exactly its `value`, recursively, with no exceptions.
 * The unwrapped output is byte-identical to what the widget renders.
 */
export const unwrapNode = (value: any): any => {
  if (Array.isArray(value)) return value.map(unwrapNode);
  if (isPlainObject(value)) {
    if (isTypedNode(value)) return unwrapNode((value as any).value);
    return Object.keys(value).reduce((acc: any, key: string) => {
      acc[key] = unwrapNode((value as any)[key]);
      return acc;
    }, {});
  }
  return value;
};

/**
 * §2.2 — unwrapping is scoped to `props`: `type`, `version`, `component` and `context` pass
 * through untouched, so a `{kind, value}`-shaped map an org parked in `context` comes back
 * verbatim. This mirrors the backend's
 * `unwrap(%{"props" => props} = envelope), do: %{envelope | "props" => unwrap_node(props)}`,
 * which also keeps the client's computed unwrapped size and depth equal to the backend's.
 */
export const unwrap = (envelope: any): any => {
  if (!isPlainObject(envelope) || !Object.prototype.hasOwnProperty.call(envelope, 'props')) return envelope;
  return { ...envelope, props: unwrapNode(envelope.props) };
};

/**
 * §7 — JSON nesting depth: a **scalar is depth 0** and each enclosing object/array adds 1, so
 * `{"a": 1}` is depth 1. Measured on the unwrapped payload, and every repo uses this same base.
 */
export const getJsonDepth = (value: any): number => {
  if (!value || typeof value !== 'object') return 0;
  const children = Array.isArray(value) ? value : Object.values(value);
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map((child: any) => getJsonDepth(child)));
};

/** Clamp without splitting a UTF-16 surrogate pair (§6). */
export const clampText = (text: string, limit = MAX_SUMMARY_LENGTH): string => {
  if (text.length <= limit) return text;
  const code = text.charCodeAt(limit - 1);
  const cut = code >= 0xd800 && code <= 0xdbff ? limit - 1 : limit;
  return text.slice(0, cut);
};

/**
 * §6 — the summary a block response carries. Clamped, and **never blank**: the summary becomes
 * the inbound message's body, so an empty one substitutes a non-empty stand-in. This mirrors
 * `clampSummary` in the widget's `src/components/chat/blocks/values.ts` — the two must agree,
 * since the backend validates whichever one produced the response.
 */
export const clampSummary = (summary: string, fallback: string): string =>
  clampText((summary || '').trim() || fallback || 'Submitted');

export interface BlocksResponse {
  values: Record<string, any>;
  summary: string;
}

/** §6 `glific/image-panel` — `{ <props.id>: <option id> }`, summary is the option's label. */
export const buildImagePanelResponse = (props: any, option: any): BlocksResponse => ({
  values: { [props?.id || 'selection']: option?.id },
  summary: clampSummary(option?.label ?? '', option?.id ?? ''),
});

/** §6 `glific/carousel` — `{ <props.id>: <card id> }`, summary is the card's title. */
export const buildCarouselResponse = (props: any, card: any): BlocksResponse => ({
  values: { [props?.id || 'selection']: card?.id },
  summary: clampSummary(card?.title ?? '', card?.id ?? ''),
});

/**
 * §6 `glific/form` — values are keyed by FIELD id (not nested under `props.id`, unlike the other
 * two blocks) and carry every field, empty string if untouched. The summary is `label: value`
 * pairs joined with `", "`, skipping the fields the contact left empty.
 */
export const buildFormResponse = (props: any, values: Record<string, string>): BlocksResponse => {
  const fields = Array.isArray(props?.fields) ? props.fields : [];
  const answer: Record<string, string> = {};
  const pairs: string[] = [];

  fields.forEach((field: any) => {
    const value = (values[field?.id] ?? '').trim();
    answer[field?.id] = value;
    if (value) pairs.push(`${field?.label || field?.id}: ${value}`);
  });

  return { values: answer, summary: clampSummary(pairs.join(', '), props?.submit_label || 'Submitted') };
};

/**
 * §9 — the derived body: walk `props` in SORTED key order — at each map level visit keys sorted
 * bytewise ascending, list elements keep array order — and concatenate the value of each
 * `kind: "text"` node joined with `" — "`, clamped to 500 chars. `kind: "alt"` nodes are
 * skipped: alt text is accessibility metadata, not body copy.
 *
 * Sorted rather than authored order because authored order cannot survive the round trip: jsonb
 * normalises object keys on write and Elixir's map decode re-sorts bytewise. Sorting here is what
 * keeps the pre-save preview equal to what the inbox shows afterwards.
 */
export const deriveBody = (envelope: any): string => {
  const props = envelope?.props;
  if (!isPlainObject(props)) return '';

  const texts: string[] = [];

  const walk = (node: any) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!isPlainObject(node)) return;
    if (isTypedNode(node)) {
      if (node.kind === 'text') {
        // blank nodes are dropped before the join, so an unfilled field cannot produce a
        // leading, trailing or doubled em dash
        if (typeof node.value === 'string' && node.value.trim()) texts.push(node.value);
        return;
      }
      if (node.kind === 'alt') return;
      walk(node.value);
      return;
    }
    Object.keys(node)
      .sort()
      .forEach((key) => walk(node[key]));
  };

  walk(props);
  return clampText(texts.join(' — '));
};

const typedNodeValueError = (kind: string, path: string): string | null => {
  switch (kind) {
    case 'text':
    case 'alt':
      return `"${path}.value" must be a string`;
    case 'image':
    case 'url':
      return `"${path}.value" must be an absolute http(s) URL`;
    case 'number':
      return `"${path}.value" must be a number`;
    case 'boolean':
      return `"${path}.value" must be true or false`;
    case 'list':
      return `"${path}.value" must be an array`;
    default:
      return null;
  }
};

const isValidTypedValue = (kind: string, value: any): boolean => {
  switch (kind) {
    case 'text':
    case 'alt':
      return typeof value === 'string';
    case 'image':
    case 'url':
      return typeof value === 'string' && ABSOLUTE_URL_REGEX.test(value);
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'list':
      return Array.isArray(value);
    default:
      return false;
  }
};

/**
 * §2.1/§7 — every typed node anywhere in `props`: `kind` in the set, `value` matching the kind,
 * no keys beyond `kind`/`value`/`translate`.
 *
 * A map that carries `kind` but is not a valid typed node is flagged rather than silently
 * treated as a plain value — `{"kind":"text","val":"x"}` would otherwise reach the widget as a
 * raw object.
 */
const validateTypedNodes = (errors: BlocksError[], node: any, path: string) => {
  if (Array.isArray(node)) {
    node.forEach((child, index) => validateTypedNodes(errors, child, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(node)) return;

  if (Object.prototype.hasOwnProperty.call(node, 'kind')) {
    const extraKeys = Object.keys(node).filter((key) => !['kind', 'value', 'translate'].includes(key));
    if (extraKeys.length > 0) {
      errors.push({
        path,
        message: `"${path}" carries "kind" so it must be a typed node — remove ${extraKeys
          .map((key) => `"${key}"`)
          .join(', ')}`,
      });
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(node, 'value')) {
      errors.push({ path, message: `"${path}" carries "kind" so it must also have "value"` });
      return;
    }
    if (typeof node.kind !== 'string' || !TYPED_NODE_KINDS.includes(node.kind)) {
      errors.push({
        path: `${path}.kind`,
        message: `"${path}.kind" must be one of ${TYPED_NODE_KINDS.join(', ')}`,
      });
      return;
    }
    if (node.translate !== undefined && typeof node.translate !== 'boolean') {
      errors.push({ path: `${path}.translate`, message: `"${path}.translate" must be true or false` });
    }
    if (!isValidTypedValue(node.kind, node.value)) {
      errors.push({ path: `${path}.value`, message: typedNodeValueError(node.kind, path) as string });
      return;
    }
    if (node.kind === 'list') {
      node.value.forEach((child: any, index: number) => validateTypedNodes(errors, child, `${path}[${index}]`));
    }
    return;
  }

  Object.keys(node).forEach((key) => validateTypedNodes(errors, node[key], `${path}.${key}`));
};

/** Shape rules for an id the schema demands; the reserved-id rule is a separate whole-tree walk. */
const validateId = (errors: BlocksError[], value: any, path: string, { optional = false } = {}) => {
  if (value === undefined || value === null) {
    if (!optional) errors.push({ path, message: `"${path}" is required` });
    return;
  }
  if (typeof value !== 'string') {
    errors.push({ path, message: `"${path}" must be a string` });
    return;
  }
  if (!value.trim()) {
    errors.push({ path, message: `"${path}" cannot be blank` });
  }
};

/**
 * §5.1 — an author-chosen id that collides with a reserved flow-result key silently overwrites
 * it. The backend's `collect_ids/1` walks the WHOLE `props` tree for any map carrying a string
 * `id`, whatever the component and whatever the nesting, so this walk does the same — a Custom
 * Block's `props: { detail: { id: "input" } }` is rejected in both places.
 *
 * Only string ids are considered, again matching `collect_ids/1`: a non-string `id` falls through
 * the backend's clause and is ignored, so flagging it here would trade one divergence for another.
 * Presence, type and blankness of the ids a schema demands are `validateId`'s job.
 */
const validateReservedIds = (errors: BlocksError[], node: any, path: string) => {
  if (Array.isArray(node)) {
    node.forEach((child, index) => validateReservedIds(errors, child, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(node)) return;

  if (isTypedNode(node)) {
    validateReservedIds(errors, node.value, path);
    return;
  }

  if (typeof node.id === 'string' && RESERVED_IDS.includes(node.id)) {
    errors.push({
      path: `${path}.id`,
      message: `"${node.id}" is a reserved id — flow results use it. Reserved: ${RESERVED_IDS.join(', ')}`,
    });
  }

  Object.keys(node).forEach((key) => validateReservedIds(errors, node[key], `${path}.${key}`));
};

/** §6 — unknown keys are rejected, in `props` and in every list item. */
const validateKnownKeys = (errors: BlocksError[], container: any, allowedKeys: string[], path: string) => {
  Object.keys(container)
    .filter((key) => !allowedKeys.includes(key))
    .forEach((key) => errors.push({ path: `${path}.${key}`, message: `"${path}.${key}" is not a known key` }));
};

const requireNode = (
  errors: BlocksError[],
  container: any,
  key: string,
  kind: string,
  path: string,
  { optional = false } = {}
) => {
  const value = container?.[key];
  if (value === undefined || value === null) {
    if (!optional) errors.push({ path, message: `"${path}" is required` });
    return;
  }
  if (!isTypedNode(value) || value.kind !== kind) {
    errors.push({ path, message: `"${path}" must be a { "kind": "${kind}", "value": … } node` });
    return;
  }
  if (kind === 'text' && !optional && !String(value.value).trim()) {
    errors.push({ path, message: `"${path}" cannot be blank` });
  }
};

interface ItemSpec {
  /** key -> typed-node kind */
  required: Record<string, string>;
  optional: Record<string, string>;
}

const validateItemList = (errors: BlocksError[], props: any, key: string, spec: ItemSpec) => {
  const node = props?.[key];
  if (!isTypedNode(node) || node.kind !== 'list') {
    errors.push({ path: `props.${key}`, message: `"props.${key}" must be a { "kind": "list", "value": [ … ] } node` });
    return;
  }
  const list = node.value;
  if (!Array.isArray(list)) {
    errors.push({ path: `props.${key}`, message: `"props.${key}.value" must be an array` });
    return;
  }
  if (list.length < 1 || list.length > MAX_ITEMS) {
    errors.push({ path: `props.${key}`, message: `"props.${key}" must have between 1 and ${MAX_ITEMS} entries` });
    return;
  }

  // §6 — uniqueness is per list and only for the glific schemas, exactly where the backend runs
  // it (`validate_unique_item_ids/1`, reachable only from `validate_item_list/2`). The
  // reserved-id rule has the wider scope of the two: every id anywhere under props.
  const seen = new Set<string>();

  list.forEach((item: any, index: number) => {
    const itemPath = `props.${key}[${index}]`;
    if (!isPlainObject(item)) {
      errors.push({ path: itemPath, message: `"${itemPath}" must be an object` });
      return;
    }
    if (item.id === undefined || item.id === null) {
      errors.push({ path: `${itemPath}.id`, message: `"${itemPath}.id" is required` });
    }
    if (typeof item.id === 'string' && item.id) {
      if (seen.has(item.id)) {
        errors.push({ path: `${itemPath}.id`, message: `"${itemPath}.id" must be unique within "props.${key}"` });
      }
      seen.add(item.id);
    }
    Object.keys(spec.required).forEach((field) =>
      requireNode(errors, item, field, spec.required[field], `${itemPath}.${field}`)
    );
    Object.keys(spec.optional).forEach((field) =>
      requireNode(errors, item, field, spec.optional[field], `${itemPath}.${field}`, { optional: true })
    );
    validateKnownKeys(errors, item, ['id', ...Object.keys(spec.required), ...Object.keys(spec.optional)], itemPath);
  });
};

/** §6 — per-block props schemas for the reserved `glific/` namespace. */
const validateGlificProps = (errors: BlocksError[], component: string, props: any) => {
  switch (component) {
    case 'glific/image-panel':
      validateId(errors, props?.id, 'props.id');
      requireNode(errors, props, 'body', 'text', 'props.body', { optional: true });
      validateItemList(errors, props, 'options', {
        required: { image: 'image', label: 'text' },
        optional: { image_alt: 'alt' },
      });
      validateKnownKeys(errors, props, ['id', 'body', 'options'], 'props');
      break;
    case 'glific/carousel':
      validateId(errors, props?.id, 'props.id');
      requireNode(errors, props, 'body', 'text', 'props.body', { optional: true });
      validateItemList(errors, props, 'cards', {
        required: { image: 'image', title: 'text' },
        optional: { image_alt: 'alt', description: 'text' },
      });
      validateKnownKeys(errors, props, ['id', 'body', 'cards'], 'props');
      break;
    case 'glific/form':
      validateId(errors, props?.id, 'props.id', { optional: true });
      requireNode(errors, props, 'body', 'text', 'props.body', { optional: true });
      requireNode(errors, props, 'submit_label', 'text', 'props.submit_label', { optional: true });
      validateItemList(errors, props, 'fields', {
        required: { label: 'text' },
        optional: { placeholder: 'text', required: 'boolean' },
      });
      validateKnownKeys(errors, props, ['id', 'body', 'submit_label', 'fields'], 'props');
      break;
    default:
      break;
  }
};

/**
 * Assemble the typed envelope that gets stored. `type` and `version` are always injected — never
 * taken on trust from the editor — and keys are emitted in contract §2 order.
 *
 * `component` comes from the type selector for the built-in blocks; a Custom Block supplies its
 * own in the editor payload.
 */
export const buildBlocksEnvelope = (payload: string | any, component: string | null = null): any => {
  let parsed: any = {};
  if (typeof payload === 'string') {
    try {
      parsed = JSON.parse(payload) || {};
    } catch (error) {
      parsed = {};
    }
  } else {
    parsed = payload || {};
  }

  const envelope: any = {
    type: BLOCKS_ENVELOPE_TYPE,
    version: BLOCKS_VERSION,
    component: component ?? parsed?.component ?? '',
    props: parsed?.props ?? {},
  };

  if (parsed?.context !== undefined) {
    envelope.context = parsed.context;
  }

  return envelope;
};

/** §7 — what the 64 KB cap is spent on: the UNWRAPPED envelope, compactly encoded. */
export const getUnwrappedSize = (envelope: any): number => getPayloadSize(JSON.stringify(unwrap(envelope)));

/** §7 — what the 128 KB cap is spent on: the stored TYPED envelope, compactly encoded. */
export const getTypedSize = (envelope: any): number => getPayloadSize(JSON.stringify(envelope));

/**
 * Validate a Blocks payload as typed into the JSON editor.
 *
 * Envelope and typed-node rules apply to every component; the props schema and unknown-key
 * rejection apply to the reserved `glific/` namespace only — other namespaces are opaque (§6).
 */
export const validateBlocksPayload = (payload: string, component: string | null = null): BlocksValidationResult => {
  const errors: BlocksError[] = [];

  let parsed: any = null;
  try {
    parsed = JSON.parse(payload);
  } catch (error: any) {
    return { valid: false, envelope: null, errors: [{ path: 'payload', message: `Invalid JSON: ${error.message}` }] };
  }

  if (!isPlainObject(parsed)) {
    return { valid: false, envelope: null, errors: [{ path: 'payload', message: 'Payload must be a JSON object' }] };
  }

  const envelope = buildBlocksEnvelope(parsed, component);
  const { component: effectiveComponent } = envelope;

  if (typeof effectiveComponent !== 'string' || !effectiveComponent.trim()) {
    errors.push({ path: 'component', message: '"component" is required' });
  } else if (!COMPONENT_NAME_REGEX.test(effectiveComponent)) {
    errors.push({
      path: 'component',
      message: '"component" must look like namespace/name, using lowercase letters, digits and hyphens',
    });
  } else if (effectiveComponent.startsWith('glific/') && !GLIFIC_BLOCKS.includes(effectiveComponent)) {
    errors.push({
      path: 'component',
      message: `"${effectiveComponent}" is not a built-in block. The glific/ namespace is reserved — use one of ${GLIFIC_BLOCKS.join(
        ', '
      )}, or your own namespace.`,
    });
  } else if (component === null && effectiveComponent.startsWith('glific/')) {
    errors.push({
      path: 'component',
      message: 'A Custom Block must use your own namespace — the glific/ namespace is reserved.',
    });
  }

  if (!isPlainObject(envelope.props)) {
    errors.push({ path: 'props', message: '"props" must be an object' });
  } else {
    validateTypedNodes(errors, envelope.props, 'props');
    validateReservedIds(errors, envelope.props, 'props');
    if (GLIFIC_BLOCKS.includes(effectiveComponent)) {
      validateGlificProps(errors, effectiveComponent, envelope.props);
    } else {
      // the glific schemas run their own props.id check with the right required/optional rule
      validateId(errors, envelope.props.id, 'props.id', { optional: true });
    }
  }

  if (envelope.context !== undefined && !isPlainObject(envelope.context)) {
    errors.push({ path: 'context', message: '"context" must be an object' });
  }

  // §7 — two separate caps over two different forms of the same envelope.
  const typedSize = getTypedSize(envelope);
  if (typedSize > BLOCKS_MAX_TYPED_BYTES) {
    errors.push({
      path: 'payload',
      message: `The stored payload is ${(typedSize / 1024).toFixed(1)} KB — the limit is 128 KB`,
    });
  }

  const unwrapped = unwrap(envelope);
  const unwrappedSize = getPayloadSize(JSON.stringify(unwrapped));
  if (unwrappedSize > BLOCKS_MAX_UNWRAPPED_BYTES) {
    errors.push({
      path: 'payload',
      message: `The message is ${(unwrappedSize / 1024).toFixed(1)} KB — the limit is 64 KB`,
    });
  }

  if (getJsonDepth(unwrapped) > BLOCKS_MAX_DEPTH) {
    errors.push({ path: 'payload', message: `Payload is nested deeper than ${BLOCKS_MAX_DEPTH} levels` });
  }

  return { valid: errors.length === 0, errors, envelope };
};

/** The editor shows props (and, for a Custom Block, the component) — never type/version. */
export const envelopeToEditorPayload = (envelope: any, includeComponent = false): string => {
  const editable: any = {};
  if (includeComponent) {
    editable.component = envelope?.component ?? '';
  }
  editable.props = envelope?.props ?? {};
  if (envelope?.context !== undefined) {
    editable.context = envelope.context;
  }
  return JSON.stringify(editable, null, 2);
};

const T = (value: string) => ({ kind: 'text', value });
const A = (value: string) => ({ kind: 'alt', value });
const I = (value: string) => ({ kind: 'image', value });
const L = (value: any[]) => ({ kind: 'list', value });
const B = (value: boolean) => ({ kind: 'boolean', value });

/**
 * Typed starting payloads, one per Web type in the grouped type selector (§11). Picking a Web
 * type seeds the matching preset, so the template is saveable without further editing.
 */
export const BLOCKS_PRESETS: Record<string, any> = {
  'glific/image-panel': {
    props: {
      id: 'course',
      body: T('Pick a course'),
      options: L([
        {
          id: 'c1',
          image: I('https://picsum.photos/seed/english/300/200'),
          image_alt: A('Adult English class'),
          label: T('Spoken English'),
        },
        {
          id: 'c2',
          image: I('https://picsum.photos/seed/digital/300/200'),
          image_alt: A('Learners at laptops'),
          label: T('Digital skills'),
        },
      ]),
    },
  },
  'glific/carousel': {
    props: {
      id: 'product',
      body: T('Browse our courses'),
      cards: L([
        {
          id: 'p1',
          image: I('https://picsum.photos/seed/coursea/300/200'),
          image_alt: A('Students at desks'),
          title: T('Course A'),
          description: T('Six weeks, evenings'),
        },
        {
          id: 'p2',
          image: I('https://picsum.photos/seed/courseb/300/200'),
          image_alt: A('A tutor with a small group'),
          title: T('Course B'),
          description: T('Four weeks, weekends'),
        },
      ]),
    },
  },
  'glific/form': {
    props: {
      id: 'signup',
      body: T('Tell us about yourself'),
      fields: L([
        { id: 'name', label: T('Your name'), placeholder: T('e.g. Asha'), required: B(true) },
        { id: 'city', label: T('Your city'), placeholder: T('e.g. Pune'), required: B(false) },
      ]),
      submit_label: T('Submit'),
    },
  },
};

const CUSTOM_BLOCK_PRESET = {
  component: 'org/my-block',
  props: {
    id: 'answer',
    body: T('Rendered by your own registered component.'),
  },
};

/** The editor text a freshly selected Web type starts from. */
export const getPresetPayload = (component: string | null): string => {
  if (component && BLOCKS_PRESETS[component]) {
    return JSON.stringify(BLOCKS_PRESETS[component], null, 2);
  }
  return JSON.stringify(CUSTOM_BLOCK_PRESET, null, 2);
};

/** §11 — the list page derives its type label from `interactive_content.component`. */
export const getComponentLabel = (component: string | undefined | null): string => {
  switch (component) {
    case 'glific/image-panel':
      return 'Image panel';
    case 'glific/carousel':
      return 'Carousel';
    case 'glific/form':
      return 'Form';
    default:
      return 'Custom Block';
  }
};
