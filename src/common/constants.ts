export const SIDE_DRAWER_WIDTH = 233;
export const DATE_FORMAT = 'DD/MM/YY';
export const TIME_FORMAT = 'HH:mm';
export const SIMULATOR_CONTACT = '9876543210';

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
    filter: filter,
    opts: {
      limit: limit,
      offset: offset,
      order: order,
    },
  };
};
