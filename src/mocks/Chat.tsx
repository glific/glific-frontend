import {
  COLLECTION_SENT_SUBSCRIPTION,
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
  MESSAGE_STATUS_SUBSCRIPTION,
} from 'graphql/subscriptions/Chat';
import {
  SAVED_SEARCH_QUERY,
  SEARCH_QUERY,
  SEARCH_MULTI_QUERY,
  SEARCHES_COUNT,
} from 'graphql/queries/Search';
import { CREATE_AND_SEND_MESSAGE_MUTATION } from 'graphql/mutations/Chat';
import {
  DEFAULT_ENTITY_LIMIT,
  DEFAULT_MESSAGE_LIMIT,
  SEARCH_QUERY_VARIABLES as queryVariables,
} from 'common/constants';
import { searchQueryMock as searchQuery } from 'containers/Chat/ChatConversations/ChatConversations.test.helper';
import { searchQueryEmptyMock as searchEmptyQuery } from 'containers/Chat/ChatConversations/ChatConversations.test.helper';
import { contactCollectionsQuery } from './Contact';
import { getOrganizationLanguagesQuery } from './Organization';
import {
  SEND_MESSAGE_IN_WA_GROUP,
  SEND_MESSAGE_IN_WA_GROUP_COLLECTION,
} from 'graphql/mutations/Group';

export const getConversationQuery = (data: any) => {
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

export const sampleMessages = {
  __typename: 'Message',
  id: '1',
  body: 'Hello',
  insertedAt: '2020-06-25T13:36:43Z',
  receiver: {
    id: '1',
  },
  sender: {
    id: '2',
  },
  type: 'TEXT',
  media: null,
  location: null,
  errors: null,
  messageNumber: 2,
  contextMessage: {
    body: 'All good',
    contextId: 1,
    messageNumber: 10,
    errors: '{}',
    media: null,
    type: 'TEXT',
    insertedAt: '2021-04-26T06:13:03.832721Z',
    location: null,
    receiver: {
      id: '1',
    },
    sender: {
      id: '2',
      name: 'User',
    },
  },
  sendBy: 'Glific User',
  interactiveContent: '{}',
  flowLabel: null,
};

export const conversationMessageQuery = (
  filter: any,
  contactName: string,
  contactNumber: string,
  contactLimit: number = DEFAULT_ENTITY_LIMIT,
  messageLimit: object = { limit: DEFAULT_MESSAGE_LIMIT }
) => ({
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: {
        limit: contactLimit,
      },
      filter,
      messageOpts: messageLimit,
    },
  },
  result: {
    data: {
      search: [
        {
          id: 'contact_2',
          group: null,
          contact: {
            id: '2',
            name: contactName,
            phone: contactNumber,
            maskedPhone: contactNumber,
            lastMessageAt: '2020-06-25T13:36:43Z',
            status: 'VALID',
            bspStatus: 'SESSION_AND_HSM',
            isOrgRead: true,
            fields: '{}',
          },
          messages: [sampleMessages],
        },
      ],
    },
  },
});

export const conversationCollectionQuery = (
  collectionId: any,
  collectionName: string,
  filter: object = { searchGroup: true },
  contactLimit: number = DEFAULT_ENTITY_LIMIT,
  messageLimit: object = { limit: DEFAULT_MESSAGE_LIMIT }
) => ({
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: {
        limit: contactLimit,
      },
      filter: filter,
      messageOpts: messageLimit,
    },
  },
  result: {
    data: {
      search: [
        {
          id: `group_${collectionId.toString()}`,
          contact: null,
          group: {
            id: collectionId.toString(),
            label: collectionName,
          },
          messages: [
            {
              body: 'x ↵',
              errors: '{}',
              id: '32899',
              insertedAt: '2021-03-25T10:30:26.244125Z',
              location: null,
              media: null,
              messageNumber: 50,
              receiver: { id: '1' },
              sender: { id: '1' },
              type: 'TEXT',
              contextMessage: {
                body: 'All good',
                contextId: 1,
                messageNumber: 10,
                errors: '{}',
                media: null,
                type: 'TEXT',
                insertedAt: '2021-04-26T06:13:03.832721Z',
                location: null,
                receiver: {
                  id: '1',
                },
                sender: {
                  id: '2',
                  name: 'User',
                },
              },
              interactiveContent: '{}',
              sendBy: 'test',
              flowLabel: null,
            },
            {
              id: '1',
              body: 'Hello',
              insertedAt: '2020-06-25T13:36:43Z',
              messageNumber: 48,
              receiver: {
                id: '1',
              },
              sender: {
                id: '2',
              },
              type: 'TEXT',
              media: null,
              location: null,
              errors: '{}',
              contextMessage: {
                body: 'All good',
                contextId: 1,
                messageNumber: 10,
                errors: '{}',
                media: null,
                type: 'TEXT',
                insertedAt: '2021-04-26T06:13:03.832721Z',
                location: null,
                receiver: {
                  id: '1',
                },
                sender: {
                  id: '2',
                  name: 'User',
                },
              },
              interactiveContent: '{}',
              sendBy: 'test',
              flowLabel: null,
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
        groupId: null,
        id: '21',
        messageNumber: 0,
        insertedAt: '2020-07-11T14:03:28Z',
        receiver: {
          id: '1',
          phone: '917834811114',
        },
        contact: {
          bspStatus: 'SESSION',
        },
        sender: {
          id: '2',
          phone: '919090709009',
        },
        type: 'TEXT',
        fields: '{}',
        media: {
          caption: null,
          url: 'https://filemanager.gupshup.io/fm/wamedia/demobot1/36623b99-5844-4195-b872-61ef34c9ce11',
        },
        location: null,
        errors: '{}',
        contextMessage: {
          body: 'All good',
          contextId: 1,
          messageNumber: 10,
          errors: '{}',
          media: null,
          type: 'TEXT',
          insertedAt: '2021-04-26T06:13:03.832721Z',
          location: null,
          receiver: {
            id: '1',
          },
          sender: {
            id: '2',
            name: 'User',
          },
        },
        interactiveContent: '{}',
        sendBy: 'test',
        flowLabel: null,
      },
    },
  },
};

export const collectionSendSubscription = {
  request: {
    query: COLLECTION_SENT_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      sentGroupMessage: {
        body: 'How can we help?',
        flow: 'OUTBOUND',
        groupId: 1,
        id: '22',
        insertedAt: '2020-07-11T14:03:28Z',
        messageNumber: 0,
        receiver: {
          id: '1',
          phone: '917834811114',
        },
        sender: {
          id: '1',
          phone: '917834811114',
        },
        type: 'TEXT',
        fields: '{}',
        media: {
          caption: null,
          url: 'https://filemanager.gupshup.io/fm/wamedia/demobot1/36623b99-5844-4195-b872-61ef34c9ce11',
        },
        location: null,
        errors: '{}',
        contextMessage: {
          body: 'All good',
          contextId: 1,
          messageNumber: 10,
          errors: '{}',
          media: null,
          type: 'TEXT',
          insertedAt: '2021-04-26T06:13:03.832721Z',
          location: null,
          receiver: {
            id: '1',
          },
          sender: {
            id: '2',
            name: 'User',
          },
        },
        interactiveContent: '{}',
        sendBy: 'test',
        flowLabel: null,
      },
    },
  },
};

const messageSubscriptionData = {
  sentMessage: {
    body: 'How can we help?',
    groupId: null,
    flow: 'OUTBOUND',
    id: '22',
    messageNumber: 0,
    insertedAt: '2020-07-11T14:03:28Z',
    receiver: {
      id: '2',
      phone: '919090909009',
    },
    sender: {
      id: '1',
      phone: '917834811114',
    },
    type: 'TEXT',
    fields: '{}',
    media: {
      caption: null,
      url: 'https://filemanager.gupshup.io/fm/wamedia/demobot1/36623b99-5844-4195-b872-61ef34c9ce11',
    },
    location: null,
    errors: '{}',
    contextMessage: {
      body: 'All good',
      contextId: 1,
      messageNumber: 10,
      errors: '{}',
      media: null,
      type: 'TEXT',
      insertedAt: '2021-04-26T06:13:03.832721Z',
      location: null,
      receiver: {
        id: '1',
      },
      sender: {
        id: '2',
        name: 'User',
      },
    },
    interactiveContent: '{}',
    sendBy: 'test',
    flowLabel: null,
  },
};

export const messageSendSubscription = {
  request: {
    query: MESSAGE_SENT_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: messageSubscriptionData,
  },
};

export const messageStatusSubscription = {
  request: {
    query: MESSAGE_STATUS_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      updateMessageStatus: {
        id: '22',
        receiver: {
          id: '2',
        },
        location: null,
        errors: '{}',
      },
    },
  },
};

export const savedSearchStatusQuery = {
  request: {
    query: SAVED_SEARCH_QUERY,
    variables: { filter: { isReserved: true }, opts: {} },
  },
  result: {
    data: {
      savedSearches: [
        {
          args: '{"messageOpts":{"limit":1},"filter":{"includeLabels":["12"]},"contactOpts":{"limit":1}}',
          id: '1',
          isReserved: true,
          label: 'All',
          shortcode: 'all',
          count: 10,
        },
        {
          args: '{"messageOpts":{"limit":5},"filter":{"includeLabels":["12"]},"contactOpts":{"limit":10}}',
          id: '2',
          isReserved: true,
          label: 'All unread conversations',
          shortcode: 'Unread',
          count: 10,
        },
        {
          args: '{"messageOpts":{"limit":5},"filter":{"includeLabels":["12"]},"contactOpts":{"limit":10}}',
          id: '3',
          isReserved: true,
          label: 'Not replied',
          shortcode: 'Not replied',
          count: 10,
        },
        {
          args: '{"messageOpts":{"limit":5},"filter":{"includeLabels":["12"]},"contactOpts":{"limit":10}}',
          id: '4',
          isReserved: true,
          label: 'Optin',
          shortcode: 'Optin',
          count: 10,
        },
      ],
    },
  },
};

export const savedSearchQuery = {
  request: {
    query: SAVED_SEARCH_QUERY,
    variables: { filter: { isReserved: false }, opts: {} },
  },
  result: {
    data: {
      savedSearches: [
        {
          args: '{"messageOpts":{"limit":1},"filter":{"includeLabels":["12"]},"contactOpts":{"limit":1}}',
          id: '1',
          isReserved: false,
          label: 'test',
          shortcode: 'test',
          count: 10,
        },
      ],
    },
  },
};

export const collectionCountQuery = {
  request: {
    query: SEARCHES_COUNT,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      collectionStats: '{"1":{"Unread":15}}',
    },
  },
};

export const conversationQuery = getConversationQuery({
  search: [
    {
      id: 'contact_2',
      group: null,
      contact: {
        id: '2',
        name: 'Jane Doe',
        phone: '919090909009',
        maskedPhone: '919090909009',
        lastMessageAt: '2020-06-25T13:36:43Z',
        status: 'VALID',
        bspStatus: 'SESSION_AND_HSM',
        isOrgRead: true,
        fields: '{}',
      },
      messages: [
        {
          id: '1',
          body: 'Hello',
          insertedAt: '2020-06-25T13:36:43Z',
          messageNumber: 0,
          location: null,
          receiver: {
            id: '1',
          },
          sender: {
            id: '2',
          },
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: {
            body: 'All good',
            contextId: 1,
            messageNumber: 10,
            errors: '{}',
            media: null,
            type: 'TEXT',
            insertedAt: '2021-04-26T06:13:03.832721Z',
            location: null,
            receiver: {
              id: '1',
            },
            sender: {
              id: '2',
              name: 'User',
            },
          },
          interactiveContent: '{}',
          sendBy: 'test',
          flowLabel: null,
        },
        {
          id: '2',
          body: 'How can we help?',
          insertedAt: '2020-06-25T13:36:43Z',
          messageNumber: 1,
          location: null,
          receiver: {
            id: '2',
          },
          sender: {
            id: '1',
          },
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: {
            body: 'All good',
            contextId: 1,
            messageNumber: 10,
            errors: '{}',
            media: null,
            type: 'TEXT',
            insertedAt: '2021-04-26T06:13:03.832721Z',
            location: null,
            receiver: {
              id: '1',
            },
            sender: {
              id: '2',
              name: 'User',
            },
          },
          interactiveContent: '{}',
          sendBy: 'test',
          flowLabel: null,
        },
      ],
    },
  ],
});

export const searchMultiQuery = (
  term: string = '',
  contactLimit: number = DEFAULT_ENTITY_LIMIT,
  messageLimit: number = DEFAULT_MESSAGE_LIMIT
) => {
  return {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: {
        searchFilter: { term: term },
        messageOpts: { limit: contactLimit, order: 'ASC' },
        contactOpts: { order: 'DESC', limit: messageLimit },
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
            },
            {
              bspStatus: 'SESSION',
              id: '3',
              lastMessageAt: '2020-11-18T04:37:57Z',
              name: 'Adelle Cavin',
              status: 'VALID',
            },
          ],
          messages: [
            {
              body: 'Hi',
              location: null,
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
  contactCollectionsQuery(2),
  contactCollectionsQuery(2),
  searchQuery,
  searchEmptyQuery,
  conversationQuery,
  messageReceivedSubscription,
  messageSendSubscription,
  collectionSendSubscription,
  messageStatusSubscription,
  savedSearchQuery,
  getOrganizationLanguagesQuery,
  conversationMessageQuery({ id: '2' }, 'Jane Doe', '919090909009', DEFAULT_ENTITY_LIMIT, {
    limit: DEFAULT_MESSAGE_LIMIT,
  }),
  conversationMessageQuery({ id: '3' }, 'Jane Monroe', '919090709009', DEFAULT_ENTITY_LIMIT, {
    limit: DEFAULT_MESSAGE_LIMIT,
  }),
  conversationMessageQuery({ id: '2' }, 'Jane Doe', '919090909009', 1, {
    limit: DEFAULT_MESSAGE_LIMIT,
    offset: 0,
  }),
  conversationMessageQuery({ id: '5' }, 'Jane Doe', '919090909009', 1, {
    limit: DEFAULT_MESSAGE_LIMIT,
    offset: 0,
  }),
  conversationCollectionQuery('2', 'Default collection'),
  conversationCollectionQuery(5, 'Test collection', { id: '5', searchGroup: true }, 25, {
    limit: 20,
    offset: 0,
  }),
  conversationMessageQuery({ id: '5' }, 'Jane Doe', '919090909009', 1, {
    limit: 20,
    offset: 0,
  }),
];

const conversation = {
  search: [
    {
      contact: {
        id: '2',
        name: 'Effie Cormier',
        phone: '9044222334',
        maskedPhone: '9044222334',
        fields: '{}',
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
          type: 'TEXT',
          media: null,
        },
      ],
      id: 'contact_2',
    },
  ],
};

const conversationWithMultipleMessages = {
  search: [
    {
      id: 'contact_2',
      contact: {
        id: '2',
        name: 'Effie Cormier',
        phone: '9044222334',
        maskedPhone: '9044222334',
        fields: '{}',
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
          type: 'TEXT',
          media: null,
        },
      ],
    },
  ],
};

export const createAndSendMessageMutation = {
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
        },
      },
    },
  },
};

export const createAndSendMessageMutation2 = {
  request: {
    query: CREATE_AND_SEND_MESSAGE_MUTATION,
    variables: {
      input: {
        body: 'hey',
        senderId: 1,
        receiverId: '2',
        flow: 'OUTBOUND',
        interactiveTemplateId: undefined,
        type: 'TEXT',
        mediaId: null,
      },
    },
  },
  result: {
    data: {
      createAndSendMessage: {
        message: {
          body: 'hey',
          insertedAt: '2020-06-25T13:36:43Z',
          id: '10388',
          receiver: {
            id: '2',
          },
          sender: {
            id: '1',
          },
          media: null,
        },
      },
    },
  },
};

export const sendMessageInWaGroup = {
  request: {
    query: SEND_MESSAGE_IN_WA_GROUP,
    variables: {
      input: {
        message: 'hey',
        waManagedPhoneId: '1',
        waGroupId: '2',
        type: 'TEXT',
        mediaId: null,
      },
    },
  },
  result: {
    data: {
      sendMessageInWaGroup: {
        errors: null,
      },
    },
  },
};

export const sendMessageInWaGroupCollection = {
  request: {
    query: SEND_MESSAGE_IN_WA_GROUP_COLLECTION,
    variables: { groupId: '1', input: { mediaId: null, message: 'hey', type: 'TEXT' } },
  },
  result: {
    data: {
      sendMessageToWaGroupCollection: {
        errors: null,
        success: true,
      },
    },
  },
};

const searchQueryResult = {
  data: {
    search: [
      {
        id: 'contact_1',
        contact: {
          id: '2',
          name: 'Vaibhav',
          lastMessageAt: '2020-06-29T09:31:47Z',
          status: 'VALID',
          fields: '{}',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: [
          {
            id: '1',
            body: 'Hey there whats up?',
            insertedAt: '2020-06-25T13:36:43Z',
            messageNumber: 0,
            receiver: {
              id: '1',
            },
            sender: {
              id: '2',
            },
            type: 'TEXT',
            media: null,
            contextMessage: {
              body: 'All good',
              contextId: 1,
              messageNumber: 10,
              errors: '{}',
              media: null,
              type: 'TEXT',
              insertedAt: '2021-04-26T06:13:03.832721Z',
              location: null,
              receiver: {
                id: '1',
              },
              sender: {
                id: '2',
                name: 'User',
              },
            },
            interactiveContent: '{}',
            sendBy: 'test',
            flowLabel: null,
          },
        ],
      },
    ],
  },
};

export const searchQuerywithFilter = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
      filter: { id: '2' },
      messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
    },
  },
  result: searchQueryResult,
};

export const searchQuerywithFilterOffset = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
      filter: { id: '2' },
      messageOpts: { limit: DEFAULT_MESSAGE_LIMIT, offset: DEFAULT_MESSAGE_LIMIT },
    },
  },
  result: searchQueryResult,
};

const chatMessagesMocks = [
  contactCollectionsQuery(2),
  searchQuerywithFilter,
  searchQuerywithFilterOffset,
  searchQuerywithFilterOffset,
  createAndSendMessageMutation,
];

export const mocksWithConversation = [...chatMessagesMocks, getConversationQuery(conversation)];
export const mocksWithMultipleMessages = [
  ...chatMessagesMocks,
  getConversationQuery(conversationWithMultipleMessages),
];

export const sendMessageMock = {
  request: {
    query: CREATE_AND_SEND_MESSAGE_MUTATION,
    variables: {
      input: {
        body: 'test',
        senderId: 1,
        receiverId: '2',
        flow: 'OUTBOUND',
        type: 'TEXT',
        mediaId: null,
      },
    },
  },
  result: {
    data: {
      createAndSendMessage: {
        __typename: 'MessageResult',
        message: {
          body: 'test',
          id: '74',
          insertedAt: '2024-03-16T19:38:25.749178Z',
          media: null,
          receiver: {
            __typename: 'Contact',
            id: '2',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
        },
      },
    },
  },
};

export const loadMoreChats = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: 1 },
      messageOpts: { limit: 46, offset: 1 },
      filter: { id: '2' },
    },
  },
  result: {
    data: {
      search: [
        {
          id: 'contact_2',
          contact: {
            bspStatus: 'HSM',
            fields: '{}',
            id: '2',
            isOrgRead: true,
            lastMessageAt: '2024-03-23T14:39:08Z',
            maskedPhone: '4977******79',
            name: 'Chrissy Cron',
            phone: '497735079',
            status: 'VALID',
          },
          group: null,
          messages: [
            {
              body: '1',
              contextMessage: null,
              errors: null,
              flowLabel: 'Help',
              id: '45619',
              insertedAt: '2024-03-18T16:03:02.430862Z',
              interactiveContent: '{}',
              location: null,
              media: null,
              messageNumber: 46,
              receiver: {
                __typename: 'Contact',
                id: '1',
              },
              sendBy: '',
              sender: {
                __typename: 'Contact',
                id: '2',
              },
              type: 'TEXT',
            },
          ],
        },
      ],
    },
  },
};

export const conversationMock = (variables: any) => ({
  request: {
    query: SEARCH_QUERY,
    variables,
  },
  result: {
    data: {
      search: [
        {
          id: 'contact_2',
          group: null,
          contact: {
            id: '2',
            name: 'Jane Doe',
            phone: '9857274829',
            maskedPhone: '974****678',
            lastMessageAt: '2020-06-25T13:36:43Z',
            status: 'VALID',
            bspStatus: 'SESSION_AND_HSM',
            isOrgRead: true,
            fields: '{}',
          },
          messages: [sampleMessages],
        },
      ],
    },
  },
});
