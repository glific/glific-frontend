import {
  GET_CONVERSATION_MESSAGE_QUERY,
  GET_CONVERSATION_QUERY,
} from '../../../graphql/queries/Chat';
import {
  CREATE_AND_SEND_MESSAGE_MUTATION,
  UPDATE_MESSAGE_TAGS,
} from '../../../graphql/mutations/Chat';
import { GET_TAGS } from '../../../graphql/queries/Tag';

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
            },
          },
        ],
      },
    },
  },
};

const conversationWithNoMessage = {
  conversations: [
    {
      contact: {
        id: 2,
        name: 'Effie Cormier',
        phone: '9044222334',
      },
      messages: null,
    },
  ],
};
const conversation = {
  conversations: [
    {
      contact: {
        id: 2,
        name: 'Effie Cormier',
        phone: '9044222334',
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
            },
            {
              id: '5',
              label: 'Greeting',
            },
            {
              id: '15',
              label: 'Help',
            },
          ],
        },
      ],
    },
  ],
};

const conversationWithMultipleMessages = {
  conversations: [
    {
      contact: {
        id: 2,
        name: 'Effie Cormier',
        phone: '9044222334',
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
        },
      ],
    },
  ],
};

const getConversationQuery = (data: any) => {
  return {
    request: {
      query: GET_CONVERSATION_QUERY,
      variables: {
        contactOpts: {
          limit: 50,
        },
        filter: {},
        messageOpts: {
          limit: 100,
        },
      },
    },
    result: {
      data: data,
    },
  };
};

const noConversation = {
  conversations: [],
};

const mocks = [
  updateMessageTagsQuery,
  updateMessageTagsQuery,

  {
    request: {
      query: GET_CONVERSATION_MESSAGE_QUERY,
      variables: { contactId: '2', filter: {}, messageOpts: { limit: 100 } },
    },
    result: {
      data: {
        conversation: {
          contact: {
            id: '2',
            name: 'Vaibhav',
          },
          messages: [
            {
              id: '1',
              body: 'Hey there whats up?',
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
                  label: 'important',
                },
              ],
            },
          ],
        },
      },
    },
  },

  {
    request: {
      query: GET_TAGS,
    },
    result: {
      data: {
        tags: [
          {
            id: '87',
            label: 'Good message',
            description: 'Hey There',
          },
          {
            id: '1',
            label: 'important',
            description: 'some description',
          },
        ],
      },
    },
  },

  {
    request: {
      query: CREATE_AND_SEND_MESSAGE_MUTATION,
      variables: {
        input: {
          body: 'Hey There Wow',
          senderId: 1,
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
  },
];

export const mocksWithConversation = [...mocks, getConversationQuery(conversation)];
export const mocksWithNoMessages = [...mocks, getConversationQuery(conversationWithNoMessage)];
export const mocksWithMultipleMessages = [
  ...mocks,
  getConversationQuery(conversationWithMultipleMessages),
];
export const mocksWithNoConversation = [...mocks, getConversationQuery(noConversation)];
