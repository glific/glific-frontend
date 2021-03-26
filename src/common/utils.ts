import axios from 'axios';
import { FLOW_EDITOR_API } from '../config';
import setLogs from '../config/logs';

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

// function to get the random number with min and max
export const randomIntFromInterval = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);
