import moment from 'moment';
import * as Yup from 'yup';

export const SIDE_DRAWER_WIDTH = 233;
export const DATE_FORMAT = 'DD/MM/YY';
export const FULL_DATE_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'DD/MM/YYYY, HH:mm:ss';
export const SIMULATOR_CONTACT = '9876543210';
export const FLOW_STATUS_PUBLISHED = 'published';
export const SIMULATOR_NUMBER_START = '9876543210';
export const GUPSHUP_ENTERPRISE_SHORTCODE = 'gupshup_enterprise';
export const VALID_URL_REGEX =
  'https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,4}([-a-zA-Z0-9@:%_+.~#?&\/=]*)';
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

export const INTERACTIVE_QUICK_REPLY = 'QUICK_REPLY';
export const INTERACTIVE_LIST = 'LIST';
export const INTERACTIVE_LOCATION_REQUEST = 'LOCATION_REQUEST_MESSAGE';

export const TERMS_OF_USE_LINK = 'https://tides.coloredcow.com/terms-of-use';

export const COMPACT_MESSAGE_LENGTH = 35;
