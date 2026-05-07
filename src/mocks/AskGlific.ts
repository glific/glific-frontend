import { ASK_GLIFIC, ASK_GLIFIC_FEEDBACK } from 'graphql/mutations/AskGlific';
import { GET_ASK_GLIFIC_CONVERSATIONS, GET_ASK_GLIFIC_MESSAGES } from 'graphql/queries/AskGlific';
import { ASK_GLIFIC_RESPONSE_SUBSCRIPTION } from 'graphql/subscriptions/AskGlific';

const now = Math.floor(Date.now() / 1000);

export const createSubscriptionMock = (
  overrides: Partial<{
    answer: string;
    conversationId: string;
    conversationName: string;
    messageId: string;
    errors: { message: string }[] | null;
    delay: number;
  }> = {}
) => {
  const { delay = 30, ...data } = overrides;
  return {
    request: {
      query: ASK_GLIFIC_RESPONSE_SUBSCRIPTION,
      variables: { organizationId: '1' },
    },
    result: {
      data: {
        askGlificResponse: {
          answer: 'This is a mock response from the bot.',
          conversationId: 'conv-123',
          conversationName: 'Test Chat',
          messageId: 'msg-new-001',
          errors: null,
          ...data,
        },
      },
    },
    delay,
  };
};

export const subscriptionMock = createSubscriptionMock();

export const conversationsMock = {
  request: {
    query: GET_ASK_GLIFIC_CONVERSATIONS,
    variables: { limit: 10, lastId: '' },
  },
  result: {
    data: {
      askGlificConversations: {
        conversations: [],
        hasMore: false,
        limit: 10,
      },
    },
  },
  maxUsageCount: Number.MAX_SAFE_INTEGER,
};

export const conversationsWithDataMock = {
  request: {
    query: GET_ASK_GLIFIC_CONVERSATIONS,
    variables: { limit: 10, lastId: '' },
  },
  result: {
    data: {
      askGlificConversations: {
        conversations: [
          {
            id: 'conv-abc',
            name: 'Test Conversation',
            status: 'normal',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'conv-abc-2',
            name: 'Test Conversation 2',
            status: 'normal',
            createdAt: now - 3600,
            updatedAt: now - 60,
          },
          {
            id: 'conv-y',
            name: 'Yesterday Chat',
            status: 'normal',
            createdAt: Math.floor(Date.now() / 1000) - 3600 * 3,
            updatedAt: Math.floor(Date.now() / 1000) - 3600 * 3,
          },
          {
            id: 'conv-y-2',
            name: 'Yesterday Chat',
            status: 'normal',
            createdAt: Math.floor(Date.now() / 1000) - 86400 - 100,
            updatedAt: Math.floor(Date.now() / 1000) - 86400 - 100,
          },
          {
            id: 'conv-o',
            name: 'Old Chat',
            status: 'normal',
            createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
            updatedAt: Math.floor(Date.now() / 1000) - 86400 * 5,
          },
        ],
        hasMore: false,
        limit: 10,
      },
    },
  },
  maxUsageCount: Number.MAX_SAFE_INTEGER,
};

export const messagesMock = {
  request: {
    query: GET_ASK_GLIFIC_MESSAGES,
    variables: { conversationId: 'conv-abc', limit: 50 },
  },
  result: {
    data: {
      askGlificMessages: {
        messages: [
          {
            id: 'msg-1',
            conversationId: 'conv-abc',
            query: 'Hello bot',
            answer: 'Hi there! How can I help?',
            createdAt: now - 3000,
            feedback: null,
          },
        ],
        hasMore: false,
        limit: 50,
      },
    },
  },
  maxUsageCount: Number.MAX_SAFE_INTEGER,
};

export const createAskGlificMock = (query: string) => ({
  request: {
    query: ASK_GLIFIC,
    variables: {
      input: {
        query,
        conversationId: '',
        pageUrl: window.location.href,
      },
    },
  },
  result: {
    data: {
      askGlific: {
        answer: 'This is a mock response from the bot.',
        conversationId: 'conv-123',
        conversationName: 'Test Chat',
        messageId: 'msg-new-001',
        errors: null,
      },
    },
  },
});

export const suggestionMock = createAskGlificMock('Create your first chatbot');

export const askGlificErrorMock = {
  request: {
    query: ASK_GLIFIC,
    variables: {
      input: {
        query: 'Create your first chatbot',
        conversationId: '',
        pageUrl: window.location.href,
      },
    },
  },
  error: new Error('Network error'),
};

export const feedbackMock = {
  request: {
    query: ASK_GLIFIC_FEEDBACK,
    variables: {
      input: {
        messageId: 'msg-new-001',
        rating: 'like',
      },
    },
  },
  result: {
    data: {
      askGlificFeedback: {
        success: true,
      },
    },
  },
  maxUsageCount: Number.MAX_SAFE_INTEGER,
};

export const feedbackDislikeMock = {
  request: {
    query: ASK_GLIFIC_FEEDBACK,
    variables: {
      input: {
        messageId: 'msg-new-001',
        rating: 'dislike',
      },
    },
  },
  result: {
    data: {
      askGlificFeedback: {
        success: true,
      },
    },
  },
  maxUsageCount: Number.MAX_SAFE_INTEGER,
};

export const feedbackClearMock = {
  request: {
    query: ASK_GLIFIC_FEEDBACK,
    variables: {
      input: {
        messageId: 'msg-new-001',
        rating: null,
      },
    },
  },
  result: {
    data: {
      askGlificFeedback: {
        success: true,
      },
    },
  },
  maxUsageCount: Number.MAX_SAFE_INTEGER,
};
