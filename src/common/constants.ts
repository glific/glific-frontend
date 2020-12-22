import moment from 'moment';

export const SIDE_DRAWER_WIDTH = 233;
export const DATE_FORMAT = 'DD/MM/YY';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'DD/MM/YYYY, HH:mm:ss';
export const SIMULATOR_CONTACT = '9876543210';
export const FLOW_STATUS_PUBLISHED = 'published';

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

export const SEARCH_QUERY_VARIABLES = {
  contactOpts: {
    limit: 50,
  },
  filter: {},
  messageOpts: {
    limit: 50,
  },
};

export const setVariables = (
  filter: any = {},
  limit: any = null,
  offset: number = 0,
  order: string = 'ASC'
) => {
  return {
    filter,
    opts: {
      limit,
      offset,
      order,
    },
  };
};

export const is24HourWindowOver = (time: any) => {
  return moment.duration(moment(new Date()).diff(moment(time))).asHours() > 24;
};

// connection retry attempt configuration
export const CONNECTION_RECONNECT_ATTEMPTS = 5;

export const MEDIA_MESSAGE_TYPES = ['IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'STICKER'];

export const setColumnToBackendTerms: any = (listName: string, columnName: string) => {
  const backendTerms: any = {
    'LAST MODIFIED': 'updated_at',
    NAME: 'name',
    desc: 'desc',
    asc: 'asc',
    LABEL: 'label',
    BODY: 'body',
    DESCRIPTION: 'description',
    TITLE: 'label',
    STATUS: 'status',
    ACTIVE: 'is_active',
    BENEFICIARY: 'name',
    'PHONE NO': 'phone',
  };

  if (listName === 'Collection') {
    backendTerms.TITLE = 'shortcode';
    backendTerms.DESCRIPTION = 'label';
  }

  return backendTerms[columnName];
};
