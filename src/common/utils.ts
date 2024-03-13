import axios from 'axios';
import { FLOW_EDITOR_API } from 'config';
import setLogs from 'config/logs';
import { checkDynamicRole } from 'context/role';
import { getAuthSession, getOrganizationServices, getUserSession } from 'services/AuthService';
import { SIMULATOR_NUMBER_START } from './constants';
import { setNotification } from './notification';

export const isSimulator = (phone: string) =>
  phone ? phone.startsWith(SIMULATOR_NUMBER_START) : false;

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

const validateMediaMethod = (URL: string, attachmentType: string, allowStickers: boolean = true) =>
  new Promise((resolve) => {
    // check if stickers are allowed instead of image, if not then return early
    if (
      !allowStickers &&
      attachmentType === 'IMAGE' &&
      URL.slice(-5).toLocaleLowerCase() === '.webp'
    ) {
      resolve({
        data: {
          is_valid: false,
          message: 'Stickers are not allowed.',
        },
      });
    }

    const encodedUrl = encodeURIComponent(URL);
    axios
      .get(
        `${FLOW_EDITOR_API}validate-media?url=${encodedUrl}&type=${attachmentType.toLowerCase()}`,
        {
          headers: { authorization: getAuthSession('access_token') },
        }
      )
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

export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFlowMethod = async (exportData: any, flowName: string) => {
  const blob = new Blob([exportData], { type: 'application/json' });
  const href = await URL.createObjectURL(blob);
  downloadFile(href, `${flowName}.json`);
};

export const exportCsvFile = async (exportData: any, flowName: string) => {
  const blob = new Blob([exportData], { type: 'text/csv' });
  const href = await URL.createObjectURL(blob);
  downloadFile(href, `${flowName}.csv`);
};

export const getFileExtension = (fileName: string) =>
  fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);

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
  } else if (interactiveJSON.type === 'location_request_message') {
    messageBody = interactiveJSON.body.text;
  }

  return messageBody;
};

export const getDisplayName = (conversation: any) => {
  // let's return early with default simulator name if we are looking at simulator contact
  const isSimulatorContact = isSimulator(conversation.contact.phone);
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

  if (contactFields?.name && contactFields.name.value) {
    displayName = contactFields.name.value;
  } else if (conversation.contact.name) {
    displayName = conversation.contact.name;
  } else {
    displayName = conversation.contact.maskedPhone;
  }
  return displayName;
};

export const getDisplayNameForSearch = (conversation: any, groups?: boolean) => {
  let displayName: string = '';
  if (groups) {
    displayName = conversation.name || conversation.waGroup.label;
  } else {
    displayName = conversation.name || conversation.maskedPhone || conversation.contact.name;
  }

  return displayName;
};

export const numberToAbbreviation = (numberString: string) => {
  const number = parseInt(numberString, 10);
  let abbreviation = '';
  if (number < 1000) {
    abbreviation = number.toString();
  } else if (number >= 1000 && number < 1000000) {
    abbreviation = `${(number / 1000).toFixed(0)}k`;
  } else if (number >= 1000000 && number < 1000000000) {
    abbreviation = `${(number / 1000000).toFixed(0)}m`;
  }
  return abbreviation;
};

// need to check from backend if organization has dynamic role
export const organizationHasDynamicRole = () => getOrganizationServices('rolesAndPermission');

export const getAddOrRemoveRoleIds = (roles: any, payload: any) => {
  const initialSelectedRoles = roles.map((role: any) => role.id);
  const payloadRoleIds = payload.roles.map((role: any) => role.id);

  let addRoleIds = payloadRoleIds.filter(
    (selectedRoles: any) => !initialSelectedRoles.includes(selectedRoles)
  );
  const deleteRoleIds = initialSelectedRoles.filter(
    (roleId: any) => !payloadRoleIds.includes(roleId)
  );

  if (checkDynamicRole()) {
    const userRoles = getUserSession('roles').map((role: any) => role.id);
    addRoleIds = [...addRoleIds, ...userRoles];
  }

  const { roles: userRoles, ...rest } = payload;

  return { ...rest, addRoleIds, deleteRoleIds };
};

export const slicedString = (string: string, length: number) =>
  string?.length > length ? `${string.slice(0, length)}...` : string;

export default getObject;
