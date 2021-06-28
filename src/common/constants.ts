import moment from 'moment';

export const SIDE_DRAWER_WIDTH = 233;
export const DATE_FORMAT = 'DD/MM/YY';
export const FULL_DATE_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'DD/MM/YYYY, HH:mm:ss';
export const SIMULATOR_CONTACT = '9876543210';
export const FLOW_STATUS_PUBLISHED = 'published';
export const SIMULATOR_NUMBER_START = '9876543210';
export const CLEAR_CACHE_DURATION = 360000;
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

export const dayList: any = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
  { id: 7, label: 'Sunday' },
];

// default contact limit for search
export const DEFAULT_CONTACT_LIMIT = 25;

// load more contact limit
export const DEFAULT_CONTACT_LOADMORE_LIMIT = 10;

// default message limit for search
export const DEFAULT_MESSAGE_LIMIT = 20;

// load more message limit
export const DEFAULT_MESSAGE_LOADMORE_LIMIT = 50;

export const SEARCH_QUERY_VARIABLES = {
  contactOpts: {
    limit: DEFAULT_CONTACT_LIMIT,
  },
  filter: {},
  messageOpts: {
    limit: DEFAULT_MESSAGE_LIMIT,
  },
};

export const COLLECTION_SEARCH_QUERY_VARIABLES = {
  contactOpts: {
    limit: DEFAULT_CONTACT_LIMIT,
  },
  filter: { searchGroup: true },
  messageOpts: {
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

export const is24HourWindowOver = (time: any) =>
  moment.duration(moment(new Date()).diff(moment(time))).asHours() > 24;

// connection retry attempt configuration
export const CONNECTION_RECONNECT_ATTEMPTS = 5;

export const MEDIA_MESSAGE_TYPES = ['IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'STICKER'];

export const setColumnToBackendTerms: any = (listName: string, columnName: string) => {
  const backendTerms: any = {
    'LAST MODIFIED': 'updated_at',
    'END DATE': 'updated_at',
    NAME: 'name',
    LABEL: 'label',
    BODY: 'body',
    DESCRIPTION: 'description',
    TITLE: 'label',
    STATUS: 'status',
    BENEFICIARY: 'name',
    'PHONE NO': 'phone',
    TIME: 'updated_at',
    URL: 'url',
    'STATUS CODE': 'status_code',
    ERROR: 'error',
    METHOD: 'method',
    'REQUEST HEADER': 'request_headers',
    'REQUEST JSON': 'request_json',
    'RESPONSE JSON': 'response_json',
  };

  if (listName === 'Search') {
    backendTerms.TITLE = 'shortcode';
    backendTerms.DESCRIPTION = 'label';
  }

  if (listName === 'consultingHour') {
    backendTerms.NAME = 'organization_name';
    backendTerms.MINUTES = 'duration';
    backendTerms.DATE = 'when';
    backendTerms.TYPE = 'is_billable';
  }

  if (listName === 'notification') {
    backendTerms.TIMESTAMP = 'updated_at';
    backendTerms.SEVERITY = 'severity';
    backendTerms.CATEGORY = 'category';
    backendTerms.ENTITY = 'entity';
    backendTerms.MESSAGE = 'message';
  }

  if (listName === 'contactField') {
    backendTerms['VARIABLE NAME'] = 'name';
    backendTerms['INPUT NAME'] = 'name';
  }
  return backendTerms[columnName];
};

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
  'https://glific.slab.com/public/posts/facebook-verification-process-for-wa-business-api-065jvy5a';

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
export const QUICK_REPLY = 'QUICK_REPLY';

// Gupshup sample media
export const SAMPLE_MEDIA_FOR_SIMULATOR = [
  {
    name: 'image',
    id: 'IMAGE',
    payload: {
      caption: 'Sample image',
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
      caption: 'Sample video',
      url: 'https://www.buildquickbots.com/whatsapp/media/sample/video/sample01.mp4',
    },
  },
  {
    name: 'file',
    id: 'DOCUMENT',
    payload: {
      caption: 'sample.pdf',
      url: 'https://www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf',
    },
  },
  {
    name: 'sticker',
    id: 'STICKER',
    payload: {
      caption: 'sample.pdf',
      url: 'http://www.buildquickbots.com/whatsapp/stickers/SampleSticker01.webp',
    },
  },
];
