import { COUNT_CONTACT_FIELDS, GET_ALL_CONTACT_FIELDS } from 'graphql/queries/ContactFields';
import { UPDATE_CONTACT_FIELDS } from 'graphql/mutations/ContactFields';

const contactFieldsListMock = [
  {
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

export const mocks = [
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
];

export const contactFieldErrorMock = {
  request: {
    query: UPDATE_CONTACT_FIELDS,
    variables: { id: '2', input: { shortcode: 'age_group' } },
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
