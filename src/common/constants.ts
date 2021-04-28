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
