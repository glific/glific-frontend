import dayjs from 'dayjs';
import * as Yup from 'yup';
import { getDisplayName, getDisplayNameForSearch } from './utils';

export const OLD_DOMAIN = 'tides.coloredcow.com';
export const NEW_DOMAIN = 'glific.com';
export const SIDE_DRAWER_WIDTH = 233;
export const SHORT_DATE_FORMAT = 'DD/MM/YY';
export const LONG_DATE_FORMAT = 'DD/MM/YYYY';
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';
export const ISO_DATE_FORMAT_SHORT = 'YY-MM-DD';
export const MONTH_DATE_FORMAT = 'MM/DD/YYYY';
export const DATE_FORMAT_WITH_MONTH = 'DD MMM YYYY';
export const SHORT_TIME_FORMAT = 'HH:mm';
export const LONG_TIME_FORMAT = 'HH:mm:ss';
export const EXTENDED_TIME_FORMAT = 'THH:mm:ss';
export const STANDARD_DATE_TIME_FORMAT = 'DD/MM/YYYY, HH:mm:ss';
export const SHORT_DATE_TIME_FORMAT = 'DD/MM/YYYY, HH:mm';
export const EXTENDED_DATE_TIME_FORMAT = 'MMMM DD, YYYY, [at] HH:mm:ss';
export const EXTENDED_DATE_TIME_FORMAT_WITH_AMPM = 'DD/MM/YYYY_hh:mmA';
export const DATE_TIME_FORMAT_WITH_AMPM_SHORT = 'DD/MM/YYYY hh:mm a';
export const DATE_TIME_FORMAT_WITH_AMPM_LONG = 'DD MMM YYYY hh:mm a';
export const SIMULATOR_CONTACT = '9876543210';
export const FLOW_STATUS_PUBLISHED = 'published';
export const SIMULATOR_NUMBER_START = '9876543210';
export const GUPSHUP_ENTERPRISE_SHORTCODE = 'gupshup_enterprise';
export const VALID_URL_REGEX =
  'https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,4}([-a-zA-Z0-9@:%_+.~#?&/=]*)';
// to find variables in message
export const pattern = /[^{}]+(?=})/g;

// const enums
// provider status against the contact
export const PROVIDER_STATUS = [
  { id: 'NONE', label: 'Cannot send messages' },
  { id: 'HSM', label: 'Can send template messages' },
  { id: 'SESSION', label: 'Can send speed sends' },
  { id: 'SESSION_AND_HSM', label: 'Can send template messages and speed sends' },
];

// status against the contact
export const CONTACT_STATUS = [
  { id: 'VALID', label: 'Valid contact' },
  { id: 'INVALID', label: 'Invalid contact' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'FAILED', label: 'Failed' },
];

export const dateList: any = Array.from(Array(31), (_, i) => ({
  id: i + 1,
  label: (i + 1).toString(),
}));

export const hourList: any = Array.from(Array(24), (_, i) => {
  let timeOfDay = 'AM';
  let hour = i;
  if (i > 11) {
    timeOfDay = 'PM';
    hour -= 12;
  }

  let hourLabel = hour.toString();
  if (hour === 0) {
    hourLabel = '12';
  }

  return {
    id: i,
    label: `${hourLabel} ${timeOfDay}`,
  };
});

export const dayList: any = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
  { id: 7, label: 'Sunday' },
];

// default entity limit for search
export const DEFAULT_ENTITY_LIMIT = 25;

// load more entity limit
export const DEFAULT_ENTITY_LOADMORE_LIMIT = 10;

// default message limit for search
export const DEFAULT_MESSAGE_LIMIT = 20;

// load more message limit
export const DEFAULT_MESSAGE_LOADMORE_LIMIT = 50;

export const SEARCH_QUERY_VARIABLES = {
  contactOpts: {
    limit: DEFAULT_ENTITY_LIMIT,
  },
  filter: {},
  messageOpts: {
    limit: DEFAULT_MESSAGE_LIMIT,
  },
};

export const GROUP_QUERY_VARIABLES = {
  waMessageOpts: {
    limit: DEFAULT_MESSAGE_LIMIT,
  },
  waGroupOpts: {
    limit: DEFAULT_ENTITY_LIMIT,
  },
  filter: {},
};

export const COLLECTION_SEARCH_QUERY_VARIABLES = {
  contactOpts: {
    limit: DEFAULT_ENTITY_LIMIT,
  },
  filter: { searchGroup: true },
  messageOpts: {
    limit: DEFAULT_MESSAGE_LIMIT,
  },
};

export const GROUP_COLLECTION_SEARCH_QUERY_VARIABLES = {
  waGroupOpts: {
    limit: DEFAULT_ENTITY_LIMIT,
  },
  filter: { searchGroup: true },
  waMessageOpts: {
    limit: DEFAULT_MESSAGE_LIMIT,
  },
};

export const setVariables = (
  filter: any = {},
  limit: any = null,
  offset: number = 0,
  order: string = 'ASC'
) => ({
  filter,
  opts: {
    limit,
    offset,
    order,
  },
});

export const is24HourWindowOver = (time: any) => dayjs().diff(dayjs(time), 'hours') > 24;

// connection retry attempt configuration
export const CONNECTION_RECONNECT_ATTEMPTS = 5;

export const MEDIA_MESSAGE_TYPES = ['IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'STICKER'];

// subscription duration to determine switch to fetch mode ( in seconds )
export const SUBSCRIPTION_ALLOWED_DURATION = 5;

// number of subscriptions allowed within above duration until we switch to fetch mode
export const SUBSCRIPTION_ALLOWED_NUMBER = 15;

// min offset for the wait ( in seconds )
export const REFETCH_RANDOM_TIME_MIN = 10;

// max offset for the wait ( in seconds )
export const REFETCH_RANDOM_TIME_MAX = 40;

// pre-requisite link for facebook business manager verification in organization setup
export const FB_MANAGER_VERIFICATION =
  'https://glific.slab.com/public/posts/02-facebook-verification-process-for-wa-business-api-skxjzu85';

// pre-requisite link for gupshup account creation in organization setup
export const GUPSHUP_ACCOUNT_CREATION =
  'https://glific.slab.com/public/posts/setup-the-organization-on-gupshup-and-go-live-qwbjphx0';

// Gupshup call to action text
export const GUPSHUP_CALL_TO_ACTION =
  "Whatsapp provides options to call, or send end-users to an external url. You can add only up to one button of each type. You may define a dynamic URL to be able to send links with different extensions. Ex. ‘https://www.glific.org/{{1}}' due to the variable you can programatically send different links to different users or same message to users at different times.";

// Gupshpu quick reply text
export const GUPSHUP_QUICK_REPLY =
  'You may get user responses via buttons. Whatsapp allows 3 quick replies. These are static unline the call to actions where you can define call or link actions.';

// Call to action button
export const CALL_TO_ACTION = 'CALL_TO_ACTION';
export const LIST = 'LIST';
export const QUICK_REPLY = 'QUICK_REPLY';
export const LOCATION_REQUEST = 'LOCATION_REQUEST_MESSAGE';
export const TERMS_OF_USE_LINK = 'https://tides.coloredcow.com/terms-of-use';
export const COMPACT_MESSAGE_LENGTH = 35;

// Gupshup sample media
export const SAMPLE_MEDIA_FOR_SIMULATOR = [
  {
    name: 'image',
    id: 'IMAGE',
    payload: {
      url: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg',
    },
  },
  {
    name: 'audio',
    id: 'AUDIO',
    payload: {
      url: 'https://www.buildquickbots.com/whatsapp/media/sample/audio/sample01.mp3',
    },
  },
  {
    name: 'video',
    id: 'VIDEO',
    payload: {
      url: 'https://www.buildquickbots.com/whatsapp/media/sample/video/sample01.mp4',
    },
  },
  {
    name: 'file',
    id: 'DOCUMENT',
    payload: {
      caption: 'sample pdf', // represents title of document
      url: 'https://www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf',
    },
  },
  {
    name: 'sticker',
    id: 'STICKER',
    payload: {
      url: 'http://www.buildquickbots.com/whatsapp/stickers/SampleSticker01.webp',
    },
  },
  {
    name: 'location',
    id: 'LOCATION',
    payload: {
      latitude: '41.725556',
      longitude: '-49.946944',
    },
  },
];

export const yupPasswordValidation = (t: any) =>
  Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]+$/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    )
    .min(10, t('Password must be at least 10 characters long.'))
    .required(t('Input required'));

export const WA_GROUPS_COLLECTION = 'WA';
export const CONTACTS_COLLECTION = 'WABA';

export const getVariables = (
  contactOptions: any,
  messageOptions: any,
  variables: any,
  groups?: boolean
) => {
  const contactVariable: string = groups ? 'waGroupOpts' : 'contactOpts';
  const messageVariable: string = groups ? 'waMessageOpts' : 'messageOpts';
  return {
    [contactVariable]: contactOptions,
    [messageVariable]: messageOptions,
    ...variables,
  };
};

export const getConversationForSearchMulti = (
  conversation: any,
  selectedContactId: any,
  groups: boolean
) => {
  const chatType: string = groups ? 'waGroup' : 'contact';

  let entity = conversation;
  let selectedRecord = false;
  let timer;
  if (selectedContactId == entity.id) {
    selectedRecord = true;
  }
  let entityId: any;
  let displayName: string;
  let contactIsOrgRead: boolean = false;

  if (groups) {
    entityId = entity.waGroup?.id || entity.id;
  } else {
    entityId = entity.contact?.id || entity.id;
  }

  if (conversation[chatType]) {
    entity = conversation[chatType];
    if (selectedContactId == conversation[chatType]?.id) {
      selectedRecord = true;
    }
  } else if (conversation.bspStatus && conversation.lastMessageAt) {
    contactIsOrgRead = conversation.isOrgRead;
    timer = {
      time: conversation.lastMessageAt,
      contactStatus: conversation.status,
      contactBspStatus: conversation.bspStatus,
    };
  }

  displayName = getDisplayNameForSearch(entity, groups);

  return {
    displayName,
    contactIsOrgRead,
    selectedRecord,
    entityId,
    entity,
    timer,
  };
};

export const getConversation = (
  conversation: any,
  selectedContactId: any,
  selectedCollectionId: any
) => {
  let lastMessage = [];
  if (conversation.messages && conversation.messages.length > 0) {
    [lastMessage] = conversation.messages;
  }
  let entityId: any;
  let displayName = '';
  let contactIsOrgRead = false;
  let selectedRecord = false;
  let timer;
  if (conversation.waGroup) {
    if (selectedContactId === conversation.waGroup?.id) {
      selectedRecord = true;
    }
    entityId = conversation.waGroup?.id;
    displayName = conversation.waGroup?.label;
    contactIsOrgRead = false;
  } else if (conversation.contact) {
    if (selectedContactId === conversation.contact.id) {
      selectedRecord = true;
    }
    entityId = conversation.contact.id;
    displayName = getDisplayName(conversation);
    contactIsOrgRead = conversation.contact.isOrgRead;
    timer = {
      contactStatus: conversation.contact.status,
      contactBspStatus: conversation.contact.bspStatus,
      time: conversation.contact.lastMessageAt,
    };
  }

  if (conversation.group) {
    if (selectedCollectionId === conversation.group.id) {
      selectedRecord = true;
    }
    entityId = conversation.group.id;
    displayName = conversation.group.label;
    contactIsOrgRead = conversation.group.isOrgRead;
  }

  return {
    lastMessage,
    entityId,
    displayName,
    contactIsOrgRead,
    selectedRecord,
    timer,
  };
};
