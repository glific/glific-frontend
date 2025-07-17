import Manifest from '@glific/flow-editor/build/asset-manifest.json';
import { FLOW_EDITOR_CONFIGURE_LINK, FLOW_EDITOR_API, CONTACT_CHAT_LINK } from 'config/index';
import '@nyaruka/temba-components/dist/temba-components.js';

import Tooltip from 'components/UI/Tooltip/Tooltip';
import styles from './FlowEditor.module.css';
import { getAuthSession } from 'services/AuthService';

const glificBase = FLOW_EDITOR_API;

const DB_NAME = 'FlowDefinitionDB';
const VERSION = 1;
const STORE_NAME = 'flowDefinitions';
let dbInstance: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'uuid' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export const getFlowDefinition = async (uuid: string): Promise<any | null> => {
  const db = dbInstance || (await initDB());
  if (!db) {
    console.warn('Database not initialized. Call initDB() first.');
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(uuid);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result : null);
    };

    request.onerror = () => {
      reject(new Error('Failed to get flow definition'));
    };
  });
};

export const fetchLatestRevision = async (uuid: string) => {
  try {
    let latestRevision = null;
    const token = getAuthSession('access_token');

    const response = await fetch(`${glificBase}revisions/${uuid}?version=13.2`, {
      headers: {
        authorization: token,
      },
    });
    const data = await response.json();

    if (data.results.length > 0) {
      latestRevision = data.results.reduce((latest: any, current: any) => {
        return new Date(latest.created_on) > new Date(current.created_on) ? latest : current;
      });
    }

    return latestRevision;
  } catch (error) {
    console.error('Error fetching latest revision:', error);
    return null;
  }
};

export const postLatestRevision = async (uuid: string, definition: any) => {
  const url = `${glificBase}revisions/${uuid}`;
  const token = getAuthSession('access_token');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
      body: JSON.stringify(definition),
    });

    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error posting latest revision:', error);
    return false;
  }
};

export const setConfig = (uuid: any, isTemplate: boolean, skipValidation: boolean) => {
  const services = JSON.parse(localStorage.getItem('organizationServices') || '{}');

  const config = {
    flow: uuid,
    flowType: 'messaging',
    localStorage: true,
    mutable: !isTemplate,
    showNodeLabel: false,
    attachmentsEnabled: false,
    filters: ['whatsapp', 'classifier'],
    skipValidation: skipValidation,

    excludeTypes: ['add_contact_urn', 'send_email', 'call_resthook', 'transfer_airtime', 'split_by_scheme'],

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
      fields: `${glificBase}fields?scope=contact`,
      waGroupFields: `${glificBase}fields?scope=wa_group`,
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

  if (services.whatsappGroupEnabled) {
    config.filters.push('groups');
  }
  return config;
};

export const loadfiles = async (startFlowEditor: any) => {
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
      if (error instanceof DOMException && error.message.includes('has already been used with this registry')) {
        return false;
      }
      throw error;
    }
  };

export const getKeywords = (keywords: any[]) => {
  let flowKeywords: any = '';
  const MAX_CHARS = 100;

  let visibleKeywords = [];
  let hiddenKeywords = [];
  let totalLength = 0;

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    const nextLength = totalLength + keyword.length + (i === 0 ? 0 : 2);

    if (nextLength <= MAX_CHARS) {
      visibleKeywords.push(keyword);
      totalLength = nextLength;
    } else {
      hiddenKeywords = keywords.slice(i);
      break;
    }
  }

  flowKeywords = (
    <span>
      {visibleKeywords.join(', ')}
      {hiddenKeywords.length > 0 && (
        <>
          ,{' '}
          <Tooltip interactive title={hiddenKeywords.join(', ')} tooltipClass={styles.Keywords} placement="top-start">
            <span className={styles.ViewMore}>...View More</span>
          </Tooltip>
        </>
      )}
    </span>
  );

  return flowKeywords;
};
