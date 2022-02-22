import axios from 'axios';
import { FLOW_EDITOR_API } from 'config';
import setLogs from 'config/logs';
import { getAuthSession } from 'services/AuthService';
import { SIMULATOR_NUMBER_START } from './constants';
import { setNotification } from './notification';

export const getObject = (arr: any, data: any) => {
  const result: any = [];
  if (arr && data) {
    arr.forEach((obj: any) => {
      data.forEach((ID: any) => {
        if (obj.id === ID) result.push(obj);
      });
    });
  }
  return result;
};

export const parseText = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (ex) {
    return {};
  }
};

export { parseText as parseTextMethod };

const validateMediaMethod = (URL: string, attachmentType: string) =>
  new Promise((resolve) => {
    axios
      .get(`${FLOW_EDITOR_API}validate-media?url=${URL}&type=${attachmentType.toLowerCase()}`, {
        headers: { authorization: getAuthSession('access_token') },
      })
      .then((response: any) => {
        resolve(response);
      })
      .catch((error) => {
        // add log's
        setLogs(`attachmentType:${attachmentType} URL:${URL}`, 'info');
        setLogs(error, 'error');
      });
  });

export { validateMediaMethod as validateMedia };

// function to get the random number with min and max
export const randomIntFromInterval = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const copyToClipboardMethod = (text: string) => {
  if (text) {
    try {
      navigator.clipboard.writeText(text).then(() => {
        setNotification('Copied to clipboard');
      });
    } catch (err) {
      setNotification('Sorry, cannot copy content over insecure connection', 'warning');
    }
  }
};

export { copyToClipboardMethod as copyToClipboard };

export const addLogsMethod = (event: string, logData: any) => {
  setLogs(event, 'info');
  setLogs(logData, 'info');
};

export const exportFlowMethod = async (exportData: any, flowName: string) => {
  const blob = new Blob([exportData], { type: 'application/json' });
  const href = await URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `${flowName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export { addLogsMethod as addLogs };

export const getInteractiveMessageBody = (interactiveJSON: any) => {
  let messageBody;
  if (interactiveJSON.type === 'list') {
    messageBody = interactiveJSON.body;
  } else if (interactiveJSON.type === 'quick_reply') {
    const { content } = interactiveJSON;
    switch (content.type) {
      case 'text':
      case 'image':
      case 'video':
        messageBody = content.text;
        break;
      case 'file':
        messageBody = content.filename;
        break;
      default:
        break;
    }
  }

  return messageBody;
};

export const getDisplayName = (conversation: any) => {
  // let's return early with default simulator name if we are looking at simulator contact
  const isSimulatorContact = conversation.contact.phone.startsWith(SIMULATOR_NUMBER_START);
  if (isSimulatorContact) {
    return conversation.contact.name || conversation.contact.maskedPhone;
  }

  let displayName = '';
  let contactFields: any = {};
  try {
    contactFields = JSON.parse(conversation.contact.fields);
  } catch (er) {
    setLogs(er, 'error');
  }

  if (contactFields?.name) {
    displayName = contactFields.name.value;
  } else if (conversation.contact.name) {
    displayName = conversation.contact.name;
  } else {
    displayName = conversation.contact.maskedPhone;
  }
  return displayName;
};

export default getObject;
