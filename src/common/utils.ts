import axios from 'axios';
import { FLOW_EDITOR_API } from '../config';
import setLogs from '../config/logs';
import { getAuthSession } from '../services/AuthService';
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
        headers: { Authorization: getAuthSession('access_token') },
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

export { getObject as default };
