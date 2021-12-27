import * as Manifest from '@glific/flow-editor/build/asset-manifest.json';
import { FLOW_EDITOR_CONFIGURE_LINK, FLOW_EDITOR_API } from 'config/index';

const glificBase = FLOW_EDITOR_API;
declare function showFlowEditor(node: any, config: any): void;
// function to suppress the error for custom registery in floweditor
export const safeDecorator = (fn: any) =>
  function (...args: any) {
    try {
      // @ts-ignore
      return fn.apply(this, args);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.message.includes('has already been used with this registry')
      ) {
        return false;
      }
      throw error;
    }
  };

export const loadfiles = (startFlowEditor: any) => {
  const files: Array<HTMLScriptElement | HTMLLinkElement> = [];
  const filesToLoad: any = Manifest.files;
  let counter = 0;
  let index = 0;
  Object.keys(filesToLoad).forEach((fileName) => {
    if (filesToLoad[fileName].startsWith('/static')) {
      if (filesToLoad[fileName].endsWith('.js')) {
        const script = document.createElement('script');
        index += 1;
        script.onload = () => {
          counter += 1;
          console.log(counter);
          if (counter === 4) {
            startFlowEditor();
          }
        };

        script.src = filesToLoad[fileName];
        script.id = `flowEditorScript${index}`;
        script.async = false;
        files.push(script);
      }

      if (filesToLoad[fileName].endsWith('.css')) {
        const link = document.createElement('link');
        link.href = filesToLoad[fileName];
        link.id = `flowEditorfile${index}`;
        link.rel = 'stylesheet';
        document.body.appendChild(link);
      }
    }
  });

  // loading the largest file first
  document.body.appendChild(files[3]);
  document.body.appendChild(files[0]);
  document.body.appendChild(files[2]);
  document.body.appendChild(files[1]);

  return files;
};

export const setConfig = (uuid: any) => ({
  flow: uuid,
  flowType: 'messaging',
  localStorage: true,
  mutable: true,
  attachmentsEnabled: false,
  filters: ['whatsapp', 'classifier'],

  excludeTypes: [
    'add_contact_urn',
    'send_email',
    'set_run_result',
    'call_resthook',
    'start_session',
    'open_ticket',
    'transfer_airtime',
    'split_by_contact_field',
    'split_by_random',
    'split_by_scheme',
  ],

  excludeOperators: [
    'has_text',
    'has_number_lt',
    'has_number_lte',
    'has_number_gte',
    'has_number_gt',
    'has_date',
    'has_date_category',
    'has_date_lt',
    'has_number_lte',
    'has_number_gte',
    'has_number_gt',
    'has_date',
    'has_date_category',
    'has_date_lt',
    'has_date_eq',
    'has_date_gt',
    'has_time',
    'has_group',
    'has_category',
    'has_state',
    'has_state_category',
    'has_district',
    'has_ward',
    'has_error',
    'has_value',
  ],
  help: {
    legacy_extra: 'help.html',
    missing_dependency: 'help.html',
    invalid_regex: 'help.html',
  },
  endpoints: {
    simulateStart: false,
    simulateResume: false,
    globals: `${glificBase}globals`,
    groups: `${glificBase}groups`,
    fields: `${glificBase}fields`,
    labels: `${glificBase}labels`,
    channels: `${glificBase}channels`,
    classifiers: `${glificBase}classifiers`,
    ticketers: `${glificBase}ticketers`,
    resthooks: `${glificBase}resthooks`,
    templates: `${glificBase}templates`,
    languages: `${glificBase}languages`,
    attachments: `${glificBase}flow-attachment`,
    environment: `${glificBase}environment`,
    recipients: `${glificBase}recipients`,
    completion: `${glificBase}completion`,
    activity: `${glificBase}activity`,
    flows: `${glificBase}flows`,
    revisions: `${glificBase}revisions/${uuid}`,
    editor: FLOW_EDITOR_CONFIGURE_LINK,
    validateMedia: `${glificBase}validate-media`,
    interactives: `${glificBase}interactive-templates`,
  },
});

export const checkServices = (organizationServices: any, config: any) => {
  const { dialogflow, googleCloudStorage } = organizationServices;

  const updatedConfig = { ...config };
  if (googleCloudStorage) {
    updatedConfig.attachmentsEnabled = true;
  }
  if (!dialogflow) {
    updatedConfig.excludeTypes.push('split_by_intent');
  }
  showFlowEditor(document.getElementById('flow'), updatedConfig);
};
