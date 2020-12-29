import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from '../graphql/subscriptions/Chat';
import { SAVED_SEARCH_QUERY, SEARCH_QUERY, SEARCH_MULTI_QUERY } from '../graphql/queries/Search';
import { searchQueryMock as searchQuery } from '../containers/Chat/ChatConversations/ChatConversations.test.helper';
import { searchQueryEmptyMock as searchEmptyQuery } from '../containers/Chat/ChatConversations/ChatConversations.test.helper';
import { addMessageTagSubscription, deleteMessageTagSubscription } from './Tag';
import { filterTagsQuery, getTagsQuery } from './Tag';
import { contactGroupsQuery } from './Contact';
import { CREATE_AND_SEND_MESSAGE_MUTATION, UPDATE_MESSAGE_TAGS } from '../graphql/mutations/Chat';
import { SEARCH_QUERY_VARIABLES as queryVariables } from '../common/constants';
import { getOrganizationLanguagesQuery } from './Organization';

const getConversationQuery = (data: any) => {
  return {
    request: {
      query: SEARCH_QUERY,
      variables: queryVariables,
    },
    result: {
      data: data,
    },
  };
};

const conversationMessageQuery = (
  contactId: any,
  contactName: string,
  contactNumber: string,
  contactLimit: number = 50,
  messageLimit: object = { limit: 50 }
) => ({
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: {
        limit: contactLimit,
      },
      filter: { id: contactId.toString() },
      messageOpts: messageLimit,
    },
  },
  result: {
    data: {
      search: [
        {
          contact: {
            id: contactId.toString(),
            name: contactName,
            phone: contactNumber,
            maskedPhone: contactNumber,
            lastMessageAt: '2020-06-25T13:36:43Z',
            status: 'VALID',
            bspStatus: 'SESSION_AND_HSM',
          },
          messages: [
            {
              id: '1',
              body: 'Hello',
              insertedAt: '2020-06-25T13:36:43Z',
              receiver: {
                id: '1',
              },
              sender: {
                id: '2',
              },
              tags: [
                {
                  id: '1',
                  label: 'Unread',
                  colorCode: '#00d084',
                  parent: null,
                },
              ],
              type: 'TEXT',
              media: null,
            },
          ],
        },
      ],
    },
  },
});

export const messageReceivedSubscription = {
  request: {
    query: MESSAGE_RECEIVED_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      receivedMessage: {
        body: 'hello',
        flow: 'INBOUND',
        id: '21',
        insertedAt: '2020-07-11T14:03:28Z',
        receiver: {
          id: '1',
          phone: '917834811114',
        },
        sender: {
          id: '2',
          phone: '919090709009',
        },
        tags: [],
        type: 'TEXT',
        media: {
          caption: null,
          url:
            'https://filemanager.gupshup.io/fm/wamedia/demobot1/36623b99-5844-4195-b872-61ef34c9ce11',
        },
      },
    },
  },
};

export const messageSendSubscription = {
  request: {
    query: MESSAGE_SENT_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      sentMessage: {
        body: 'How can we help?',
        flow: 'OUTBOUND',
        id: '22',
        insertedAt: '2020-07-11T14:03:28Z',
        receiver: {
          id: '2',
          phone: '919090909009',
        },
        sender: {
          id: '1',
          phone: '917834811114',
        },
        tags: [],
        type: 'TEXT',
        media: {
          caption: null,
          url:
            'https://filemanager.gupshup.io/fm/wamedia/demobot1/36623b99-5844-4195-b872-61ef34c9ce11',
        },
      },
    },
  },
};

export const savedSearchQuery = {
  request: {
    query: SAVED_SEARCH_QUERY,
    variables: { filter: {}, opts: { limit: 10 } },
  },
  result: {
    data: {
      savedSearches: [
        {
          args:
            '{"messageOpts":{"limit":5},"filter":{"includeTags":["12"]},"contactOpts":{"limit":10}}',
          id: '1',
          label: 'All unread conversations',
          shortcode: 'Unread',
          count: 10,
        },
      ],
    },
  },
};

export const conversationQuery = getConversationQuery({
  search: [
    {
      contact: {
        id: '2',
        name: 'Jane Doe',
        phone: '919090909009',
        maskedPhone: '919090909009',
        lastMessageAt: '2020-06-25T13:36:43Z',
        status: 'VALID',
        bspStatus: 'SESSION_AND_HSM',
      },
      messages: [
        {
          id: '1',
          body: 'Hello',
          insertedAt: '2020-06-25T13:36:43Z',
          receiver: {
            id: '1',
          },
          sender: {
            id: '2',
          },
          tags: [
            {
              id: '2',
              label: 'Important',
              colorCode: '#00d084',
              parent: null,
            },
          ],
          type: 'TEXT',
          media: null,
        },
        {
          id: '2',
          body: 'How can we help?',
          insertedAt: '2020-06-25T13:36:43Z',
          receiver: {
            id: '2',
          },
          sender: {
            id: '1',
          },
          tags: [
            {
              id: '1',
              label: 'Unread',
              colorCode: '#00d084',
              parent: null,
            },
          ],
          type: 'TEXT',
          media: null,
        },
      ],
    },
  ],
});

export const searchMultiQuery = (term: string = '', limit: number = 50) => {
  return {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: {
        searchFilter: { term: term },
        messageOpts: { limit: limit, order: 'ASC' },
        contactOpts: { order: 'DESC', limit: limit },
      },
    },
    result: {
      data: {
        searchMulti: {
          contacts: [
            {
              bspStatus: 'SESSION_AND_HSM',
              id: '2',
              lastMessageAt: '2020-11-18T04:37:57Z',
              name: 'Default receiver',
              status: 'VALID',
              tags: [],
            },
            {
              bspStatus: 'SESSION',
              id: '3',
              lastMessageAt: '2020-11-18T04:37:57Z',
              name: 'Adelle Cavin',
              status: 'VALID',
              tags: [],
            },
          ],
          messages: [
            {
              body: 'Hi',
              contact: {
                bspStatus: 'HSM',
                id: '8',
                lastMessageAt: '2020-10-15T07:15:33Z',
                name: 'Dignesh',
                status: 'VALID',
              },
              id: '18',
              insertedAt: '2020-10-15T06:59:31.473314Z',
              media: null,
              messageNumber: 48,
              receiver: {
                id: '1',
              },
              sender: {
                id: '8',
              },
              tags: [
                {
                  colorCode: '#0C976D',
                  id: '4',
                  label: 'Greeting',
                },
              ],
              type: 'TEXT',
            },
          ],
          tags: [
            {
              body: 'Hi',
              contact: {
                bspStatus: 'HSM',
                id: '8',
                lastMessageAt: '2020-10-15T07:15:33Z',
                name: 'Dignesh',
                status: 'VALID',
              },
              id: '12',
              insertedAt: '2020-10-15T06:58:34.432894Z',
              media: null,
              messageNumber: 54,
              receiver: {
                id: '1',
              },
              sender: {
                id: '8',
              },
              tags: [
                {
                  colorCode: '#0C976D',
                  id: '4',
                  label: 'Greeting',
                },
              ],
              type: 'TEXT',
            },
          ],
        },
      },
    },
  };
};

export const CONVERSATION_MOCKS = [
  conversationQuery,
  contactGroupsQuery,
  contactGroupsQuery,
  searchQuery,
  searchEmptyQuery,
  conversationQuery,
  messageReceivedSubscription,
  messageSendSubscription,
  addMessageTagSubscription,
  deleteMessageTagSubscription,
  savedSearchQuery,
  getOrganizationLanguagesQuery,
  conversationMessageQuery('2', 'Jane Doe', '919090909009', 50, { limit: 50 }),
  conversationMessageQuery('3', 'Jane Monroe', '919090709009', 50, { limit: 50 }),
  conversationMessageQuery('2', 'Jane Doe', '919090909009', 1, { limit: 50, offset: 0 }),
];

const updateMessageTagsQuery = {
  request: {
    query: UPDATE_MESSAGE_TAGS,
    variables: {
      input: {
        messageId: '7217',
        addTagIds: ['87'],
        deleteTagIds: ['1'],
      },
    },
  },
  result: {
    data: {
      updateMessageTags: {
        messageTags: [
          {
            message: {
              id: '7217',
            },
            tag: {
              id: '87',
              label: 'Good message',
              colorCode: '#0C976D',
              parent: null,
            },
          },
        ],
      },
    },
  },
};

const conversation = {
  search: [
    {
      contact: {
        id: '2',
        name: 'Effie Cormier',
        phone: '9044222334',
        maskedPhone: '9044222334',
        lastMessageAt: '2020-06-29T09:31:47Z',
        status: 'VALID',
        bspStatus: 'SESSION_AND_HSM',
      },
      messages: [
        {
          body: 'Hey',
          id: '7217',
          insertedAt: '2020-06-29T09:31:47Z',
          receiver: {
            id: '1',
          },
          sender: {
            id: '2',
          },
          tags: [
            {
              id: '1',
              label: 'important',
              colorCode: '#00d084',
              parent: null,
            },
            {
              id: '5',
              label: 'Greeting',
              colorCode: '#00d084',
              parent: null,
            },
            {
              id: '15',
              label: 'Help',
              colorCode: '#00d084',
              parent: null,
            },
          ],
          type: 'TEXT',
          media: null,
        },
      ],
    },
  ],
};

const conversationWithMultipleMessages = {
  search: [
    {
      contact: {
        id: '2',
        name: 'Effie Cormier',
        phone: '9044222334',
        maskedPhone: '9044222334',
        lastMessageAt: '2020-06-29T09:31:47Z',
        status: 'VALID',
        bspStatus: 'SESSION_AND_HSM',
      },
      messages: [
        {
          body: 'Hey',
          id: '7217',
          insertedAt: '2020-06-29T09:31:47Z',
          receiver: {
            id: '1',
          },
          sender: {
            id: '2',
          },
          tags: [],
          type: 'TEXT',
          media: null,
        },
        {
          body: 'Yo',
          id: '7',
          insertedAt: '2020-06-29T09:31:47Z',
          receiver: {
            id: '1',
          },
          sender: {
            id: '2',
          },
          tags: [],
          type: 'TEXT',
          media: null,
        },
      ],
    },
  ],
};

const createAndSendMessageMutation = {
  request: {
    query: CREATE_AND_SEND_MESSAGE_MUTATION,
    variables: {
      input: {
        body: 'Hey There Wow',
        senderId: '1',
        receiverId: '2',
        type: 'TEXT',
        flow: 'OUTBOUND',
      },
    },
  },
  result: {
    data: {
      createAndSendMessage: {
        message: {
          body: 'Hey There Wow',
          insertedAt: '2020-06-25T13:36:43Z',
          id: '10388',
          receiver: {
            id: '2',
          },
          sender: {
            id: '1',
          },
          tags: [
            {
              id: 1,
              label: 'critical',
            },
          ],
        },
      },
    },
  },
};

const searchQueryResult = {
  data: {
    search: [
      {
        contact: {
          id: '2',
          name: 'Vaibhav',
          lastMessageAt: '2020-06-29T09:31:47Z',
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
        },
        messages: [
          {
            id: '1',
            body: 'Hey there whats up?',
            insertedAt: '2020-06-25T13:36:43Z',
            receiver: {
              id: '1',
            },
            sender: {
              id: '2',
            },
            tags: [
              {
                id: '1',
                label: 'important',
                colorCode: '#00d084',
                parent: null,
              },
            ],
            type: 'TEXT',
            media: null,
          },
        ],
      },
    ],
  },
};

export const searchQuerywithFilter = {
  request: {
    query: SEARCH_QUERY,
    variables: { contactOpts: { limit: 50 }, filter: { id: '2' }, messageOpts: { limit: 50 } },
  },
  result: searchQueryResult,
};

export const searchQuerywithFilterOffset = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: 50 },
      filter: { id: '2' },
      messageOpts: { limit: 50, offset: 50 },
    },
  },
  result: searchQueryResult,
};

const chatMessagesMocks = [
  contactGroupsQuery,
  updateMessageTagsQuery,
  updateMessageTagsQuery,
  searchQuerywithFilter,
  searchQuerywithFilterOffset,
  searchQuerywithFilterOffset,
  filterTagsQuery,
  getTagsQuery,
  createAndSendMessageMutation,
];

export const mocksWithConversation = [...chatMessagesMocks, getConversationQuery(conversation)];
export const mocksWithMultipleMessages = [
  ...chatMessagesMocks,
  getConversationQuery(conversationWithMultipleMessages),
];
