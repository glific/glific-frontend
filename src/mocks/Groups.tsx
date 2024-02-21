import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';

const withResult = {
  data: {
    search: [
      {
        __typename: 'Conversation',
        group: {
          id: '1',
          bspId: '120363238069881530@g.us',
          name: 'Maytapi Testing ',
          phone: '918657048983',
          participants: ['Test User 1', 'Test User 2'],
          admins: ['Test User'],
          lastMessageAt: '2024-02-17T21:14:19Z',
          isOrgRead: false,
        },
        messages: [
          {
            __typename: 'Message',
            id: '27',
            body: 'To be, or not to be: that is the question.',
            insertedAt: '2024-02-17T21:14:19.490693Z',
            messageNumber: 3,
            receiver: {
              __typename: 'Contact',
              id: '11',
            },
            sender: {
              __typename: 'Contact',
              id: '1',
            },
            location: null,
            type: 'TEXT',
            media: null,
            errors: '{}',
            contextMessage: {
              __typename: 'Message',
              body: 'What a piece of work is man! how noble in reason! how infinite in faculty! in form and moving how express and admirable! in action how like an angel! in apprehension how like a god! the beauty of the world, the paragon of animals! .',
              contextId: null,
              messageNumber: 2,
              errors: '{}',
              media: null,
              type: 'TEXT',
              insertedAt: '2024-02-17T21:14:19.489266Z',
              location: null,
              receiver: {
                __typename: 'Contact',
                id: '11',
              },
              sender: {
                __typename: 'Contact',
                id: '1',
                name: 'NGO Main Account',
              },
            },
            interactiveContent: '{}',
            sendBy: '',
            flowLabel: null,
          },
          {
            __typename: 'Message',
            id: '26',
            body: 'What a piece of work is man! how noble in reason! how infinite in faculty! in form and moving how express and admirable! in action how like an angel! in apprehension how like a god! the beauty of the world, the paragon of animals! .',
            insertedAt: '2024-02-17T21:14:19.489266Z',
            messageNumber: 2,
            receiver: {
              __typename: 'Contact',
              id: '1',
            },
            sender: {
              __typename: 'Contact',
              id: '11',
            },
            location: null,
            type: 'TEXT',
            media: null,
            errors: '{}',
            contextMessage: null,
            interactiveContent: '{}',
            sendBy: '',
            flowLabel: null,
          },
          {
            __typename: 'Message',
            id: '11',
            body: 'Default Group message body',
            insertedAt: '2024-02-17T21:14:19.446806Z',
            messageNumber: 1,
            receiver: {
              __typename: 'Contact',
              id: '1',
            },
            sender: {
              __typename: 'Contact',
              id: '11',
            },
            location: null,
            type: 'TEXT',
            media: null,
            errors: '{}',
            contextMessage: null,
            interactiveContent: '{}',
            sendBy: '',
            flowLabel: null,
          },
        ],
        collections: [
          {
            id: '1',
            label: 'Default Collection',
          },
        ],
      },
      {
        __typename: 'Conversation',
        group: {
          id: '2',
          bspId: '120363238069881530@g.us',
          name: 'Maytapi Testing Group 2',
          phone: '918657048983',
          participants: ['Test User 1', 'Test User 2'],
          admins: ['Test User'],
          lastMessageAt: '2024-02-17T21:14:19Z',
          isOrgRead: true,
        },
        messages: [
          {
            __typename: 'Message',
            id: '24',
            body: "The play 's the thing wherein I'll catch the conscience of the king.",
            insertedAt: '2024-02-17T21:14:19.482501Z',
            messageNumber: 2,
            receiver: {
              __typename: 'Contact',
              id: '1',
            },
            sender: {
              __typename: 'Contact',
              id: '2',
            },
            location: null,
            type: 'TEXT',
            media: null,
            errors: '{}',
            contextMessage: null,
            interactiveContent: '{}',
            sendBy: '',
            flowLabel: null,
          },
          {
            __typename: 'Message',
            id: '9',
            body: 'Default Group message body',
            insertedAt: '2024-02-17T21:14:19.442462Z',
            messageNumber: 1,
            receiver: {
              __typename: 'Contact',
              id: '2',
            },
            sender: {
              __typename: 'Contact',
              id: '1',
            },
            location: null,
            type: 'TEXT',
            media: null,
            errors: '{}',
            contextMessage: null,
            interactiveContent: '{}',
            sendBy: '',
            flowLabel: null,
          },
        ],
        collections: [
          {
            id: '1',
            label: 'Default Collection',
          },
        ],
      },
    ],
  },
};

const noResult = { data: { search: [] } };

export const groupSearchQuery = (
  messageLimit: object,
  contactLimit: number,
  filter: any,
  showResult: boolean = true
) => {
  return {
    request: {
      query: GROUP_SEARCH_QUERY,
      variables: {
        filter,
        messageOpts: messageLimit,
        contactOpts: { limit: contactLimit },
      },
    },
    result: showResult ? withResult : noResult,
  };
};

export const groupCollectionSearchQuery = () => {
  return {
    result: {
      data: {
        search: [
          {
            __typename: 'Conversation',
            contact: null,
            group: {
              __typename: 'Group',
              id: '1',
              label: 'Optout contacts',
            },
            messages: [],
          },
          {
            __typename: 'Conversation',
            contact: null,
            group: {
              __typename: 'Group',
              id: '2',
              label: 'Default Group',
            },
            messages: [
              {
                __typename: 'Message',
                id: '16',
                body: 'Default Group message body',
                insertedAt: '2024-02-17T21:14:19.457253Z',
                messageNumber: 1,
                receiver: {
                  __typename: 'Contact',
                  id: '1',
                },
                sender: {
                  __typename: 'Contact',
                  id: '2',
                },
                location: null,
                type: 'TEXT',
                media: null,
                errors: '{}',
                contextMessage: null,
                interactiveContent: '{}',
                sendBy: '',
                flowLabel: null,
              },
            ],
          },
        ],
      },
    },
  };
};

export const mockResolver = () => {
  return withResult?.data;
};
