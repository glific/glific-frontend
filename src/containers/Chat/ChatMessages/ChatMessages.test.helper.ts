import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import {
  CREATE_AND_SEND_MESSAGE_MUTATION,
  UPDATE_MESSAGE_TAGS,
} from '../../../graphql/mutations/Chat';
import { FILTER_TAGS, FILTER_TAGS_NAME } from '../../../graphql/queries/Tag';
import { GET_CONTACT_GROUPS } from '../../../graphql/queries/Contact';

export const contactGroupsQuery = {
  request: {
    query: GET_CONTACT_GROUPS,
    variables: {
      id: '2',
    },
  },
  result: {
    data: {
      contact: {
        contact: {
          groups: [
            {
              id: '1',
              label: 'Default Group',
              users: [],
            },
            {
              id: '2',
              label: 'Staff Group',
              users: [],
            },
          ],
        },
      },
    },
  },
};

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

const conversationWithNoMessage = {
  search: [
    {
      contact: {
        id: 2,
        name: 'Effie Cormier',
        phone: '9044222334',
        status: 'VALID',
      },
      messages: null,
    },
  ],
};
const conversation = {
  search: [
    {
      contact: {
        id: '2',
        name: 'Effie Cormier',
        phone: '9044222334',
        lastMessageAt: '2020-06-29T09:31:47Z',
        status: 'VALID',
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
        lastMessageAt: '2020-06-29T09:31:47Z',
        status: 'VALID',
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

const getConversationQuery = (data: any) => {
  return {
    request: {
      query: SEARCH_QUERY,
      variables: {
        contactOpts: {
          limit: 50,
        },
        filter: {},
        messageOpts: {
          limit: 50,
        },
      },
    },
    result: {
      data: data,
    },
  };
};

const mocks = [
  contactGroupsQuery,
  updateMessageTagsQuery,
  updateMessageTagsQuery,

  {
    request: {
      query: SEARCH_QUERY,
      variables: { contactOpts: { limit: 50 }, filter: { id: '2' }, messageOpts: { limit: 50 } },
    },
    result: {
      data: {
        search: [
          {
            contact: {
              id: '2',
              name: 'Vaibhav',
              status: 'VALID',
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
    },
  },

  {
    request: {
      query: FILTER_TAGS_NAME,
      variables: {
        filter: {},
        opts: {
          order: 'ASC',
        },
      },
    },
    result: {
      data: {
        tags: [
          {
            id: '87',
            label: 'Good message',
          },
          {
            id: '1',
            label: 'important',
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
  },
];

export const mocksWithConversation = [...mocks, getConversationQuery(conversation)];
export const mocksWithMultipleMessages = [
  ...mocks,
  getConversationQuery(conversationWithMultipleMessages),
];
