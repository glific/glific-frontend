import {
  COUNT_CONTACT_FIELDS,
  GET_ALL_CONTACT_FIELDS,
  GET_CONTACT_FIELD_BY_ID,
} from 'graphql/queries/ContactFields';
import { CREATE_CONTACT_FIELDS, UPDATE_CONTACT_FIELDS } from 'graphql/mutations/ContactFields';

const contactFieldsListMock = [
  {
    __typename: 'ContactsField',
    variable: '@contact.fields.age_group',
    valueType: 'TEXT',
    updatedAt: '2021-05-31T02:46:05Z',
    shortcode: 'age_group',
    scope: 'CONTACT',
    name: 'Age Group',
    insertedAt: '2021-05-31T02:46:05Z',
    id: '1',
    organization: {
      shortcode: 'glific',
      isApproved: true,
      isActive: true,
    },
  },
  {
    __typename: 'ContactsField',
    variable: '@contact.fields.dob',
    valueType: 'TEXT',
    updatedAt: '2021-05-31T02:46:05Z',
    shortcode: 'dob',
    scope: 'CONTACT',
    name: 'Date of Birth',
    insertedAt: '2021-05-31T02:46:05Z',
    id: '2',
    organization: {
      shortcode: 'glific',
      isApproved: true,
      isActive: true,
    },
  },
];

export const getContactField = {
  request: {
    query: GET_CONTACT_FIELD_BY_ID,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      contactsField: {
        __typename: 'ContactsFieldResult',
        contactsField: {
          __typename: 'ContactsField',
          id: '1',
          insertedAt: '2024-03-22T08:49:27Z',
          name: 'Namew',
          organization: {
            __typename: 'Organization',
            isActive: true,
            isApproved: true,
            shortcode: 'glific',
          },
          scope: 'CONTACT',
          shortcode: 'name',
          updatedAt: '2024-03-25T09:13:28Z',
          valueType: 'TEXT',
          variable: null,
        },
      },
    },
  },
};

export const contactFieldMocks = [
  {
    request: {
      query: COUNT_CONTACT_FIELDS,
      variables: { filter: {} },
    },
    result: {
      data: {
        countContactsFields: 2,
      },
    },
  },
  {
    request: {
      query: GET_ALL_CONTACT_FIELDS,
      variables: {
        filter: {},
        opts: {
          limit: 50,
          offset: 0,
          order: 'ASC',
          orderWith: 'name',
        },
      },
    },
    result: {
      data: {
        contactsFields: contactFieldsListMock,
      },
    },
  },
  {
    request: {
      query: UPDATE_CONTACT_FIELDS,
      variables: { id: '1', input: { name: 'Age Group Name' } },
    },
    result: {
      data: {
        updateContactsField: {
          contactsField: {
            __typename: 'ContactsField',
            valueType: 'TEXT',
            updatedAt: '2021-05-31T02:46:05Z',
            shortcode: 'age_group',
            scope: 'CONTACT',
            name: 'Age Group Name',
            insertedAt: '2021-05-31T02:46:05Z',
            id: '1',
            organization: {
              shortcode: 'glific',
              isApproved: true,
              isActive: true,
            },
          },
          errors: null,
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_CONTACT_FIELDS,
      variables: { id: '2', input: { shortcode: 'dAg' } },
    },
    result: {
      data: {
        updateContactsField: {
          contactsField: {
            valueType: 'TEXT',
            updatedAt: '2021-05-31T02:46:05Z',
            shortcode: 'dAg',
            scope: 'CONTACT',
            name: 'Do age group ',
            insertedAt: '2021-05-31T02:46:05Z',
            id: '1',
            organization: {
              shortcode: 'glific',
              isApproved: true,
              isActive: true,
            },
          },
          errors: null,
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_CONTACT_FIELDS,
      variables: { id: '1', input: { name: 'Age Group' } },
    },
    result: {
      data: {
        updateContactsField: {
          contactsField: {
            valueType: 'TEXT',
            updatedAt: '2021-05-31T02:46:05Z',
            shortcode: 'age_group',
            scope: 'CONTACT',
            name: 'Age Group',
            insertedAt: '2021-05-31T02:46:05Z',
            id: '1',
            organization: {
              shortcode: 'glific',
              isApproved: true,
              isActive: true,
            },
          },
          errors: null,
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_CONTACT_FIELDS,
      variables: { id: '2', input: { shortcode: 'dob' } },
    },
    result: {
      data: {
        updateContactsField: {
          contactsField: {
            valueType: 'TEXT',
            updatedAt: '2021-05-31T02:46:05Z',
            shortcode: 'dob',
            scope: 'CONTACT',
            name: 'Date of birth',
            insertedAt: '2021-05-31T02:46:05Z',
            id: '1',
            organization: {
              shortcode: 'glific',
              isApproved: true,
              isActive: true,
            },
          },
          errors: null,
        },
      },
    },
  },
  getContactField,
];

export const contactFieldErrorMock = {
  request: {
    query: UPDATE_CONTACT_FIELDS,
    variables: { id: '2', input: { shortcode: 'dob' } },
  },
  result: {
    data: {
      updateContactsField: {
        contactsField: null,
        errors: [{ key: 'shortcode', message: 'has already been taken' }],
      },
    },
  },
};

export const createContactField = {
  request: {
    query: CREATE_CONTACT_FIELDS,
    variables: { input: { name: 'Age Group', shortcode: 'age_group' } },
  },
  result: {
    data: {
      createContactsField: {
        contactsField: {
          id: '8',
          insertedAt: '2024-03-25T08:58:11Z',
          name: 'Age Group',
          organization: {
            isActive: true,
            isApproved: true,
            shortcode: 'glific',
          },
          scope: 'CONTACT',
          shortcode: 'age_group',
          updatedAt: '2024-03-25T08:58:11Z',
          valueType: 'TEXT',
          variable: '@contact.fields.age_group',
        },
        errors: null,
      },
    },
  },
};
