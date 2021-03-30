import axios from 'axios';
import { FLOW_EDITOR_API } from '../config';
import setLogs from '../config/logs';
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

export { getObject as default };

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
      .get(`${FLOW_EDITOR_API}validate-media?url=${URL}&type=${attachmentType.toLowerCase()}`)
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

export const copyToClipboardMethod = (client: any, text: string) => {
  if (text) {
    try {
      navigator.clipboard.writeText(text).then(() => {
        setNotification(client, 'Copied to clipboard');
      });
    } catch (err) {
      setNotification(client, 'Sorry, cannot copy content over insecure connection', 'warning');
    }
  }
};

export { copyToClipboardMethod as copyToClipboard };

export const addLogsMethod = (event: string, logData: any) => {
  setLogs(event, 'info');
  setLogs(`variables-${logData}`, 'info');
};

export { addLogsMethod as addLogs };
