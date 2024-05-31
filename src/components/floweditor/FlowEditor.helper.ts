import Manifest from '@glific/flow-editor/build/asset-manifest.json';
import { FLOW_EDITOR_CONFIGURE_LINK, FLOW_EDITOR_API, CONTACT_CHAT_LINK } from 'config/index';

const glificBase = FLOW_EDITOR_API;

export const setConfig = (uuid: any) => {
  const services = JSON.parse(localStorage.getItem('organizationServices') || '{}');

  const config = {
    flow: uuid,
    flowType: 'messaging',
    localStorage: true,
    mutable: true,
    showNodeLabel: false,
    attachmentsEnabled: false,
    filters: ['whatsapp', 'classifier', 'profile', 'optins', 'ticketer'],

    excludeTypes: [
      'add_contact_urn',
      'send_email',
      'call_resthook',
      'transfer_airtime',
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
      topics: `${glificBase}labels`,
      users: `${glificBase}users`,
      recipients: `${glificBase}recipients`,
      contacts: `${glificBase}recipients`,
      completion: `${glificBase}completion`,
      activity: `${glificBase}activity`,
      sheets: `${glificBase}sheets`,
      flows: `${glificBase}flows`,
      recents: `${glificBase}recents/`,
      revisions: `${glificBase}revisions/${uuid}`,
      editor: FLOW_EDITOR_CONFIGURE_LINK,
      validateMedia: `${glificBase}validate-media`,
      interactives: `${glificBase}interactive-templates`,
      contact: CONTACT_CHAT_LINK,
      optins: `${glificBase}optins`,
    },
  };

  if (services.googleCloudStorage) {
    config.attachmentsEnabled = true;
  }
  if (!services.dialogflow) {
    config.excludeTypes.push('split_by_intent');
  }
  if (services.flowUuidDisplay) {
    config.showNodeLabel = true;
  }

  if (services.contactProfileEnabled) {
    config.filters.push('profile');
  }

  if (services.ticketingEnabled) {
    config.filters.push('ticketer');
  }

  return config;
};

export const loadfiles = (startFlowEditor: any) => {
  (window as any).static_url = '/static/';
  const files: Array<HTMLScriptElement | HTMLLinkElement> = [];
  const filesToLoad: any = Manifest.files;
  let index = 0;
  Object.keys(filesToLoad).forEach((fileName) => {
    if (filesToLoad[fileName].startsWith('/static')) {
      if (filesToLoad[fileName].endsWith('.js')) {
        index += 1;
        const script = document.createElement('script');
        if (index === 2) {
          script.onload = () => {
            startFlowEditor();
          };
        }
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

// function to suppress the error for custom registery in floweditor
export const checkElementInRegistry = (fn: any) =>
  // eslint-disable-next-line
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
