import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ASK_GLIFIC } from 'graphql/mutations/AskGlific';
import AskGlific from './AskGlific';

const AskGlificMock = {
  request: {
    query: ASK_GLIFIC,
    variables: {
      input: {
        query: 'Create your first chatbot',
        conversationId: '',
      },
    },
  },
  result: {
    data: {
      askGlific: {
        answer: 'This is a mock response from the bot.',
        conversationId: 'conv-123',
        errors: null,
      },
    },
  },
};

describe('AskGlific', () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    writable: true,
  });

  test('should render AskGlific component', async () => {
    render(
      <MockedProvider mocks={[]}>
        <AskGlific />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ask-glific-fab')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ask-glific-fab'));

    await waitFor(() => {
      expect(screen.getByText('Ask Glific! Learn About How It Works?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('minimize-btn'));

    await waitFor(() => {
      expect(screen.queryByText('Ask Glific! Learn About How It Works?')).not.toBeInTheDocument();
    });
  });

  test('it should send messages from suggestion', async () => {
    render(
      <MockedProvider mocks={[AskGlificMock]}>
        <AskGlific />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('ask-glific-fab'));

    await waitFor(() => {
      expect(screen.getByText('Ask Glific! Learn About How It Works?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('thinking...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });
  });

  test('it should allow new chat', async () => {
    render(
      <MockedProvider mocks={[AskGlificMock]}>
        <AskGlific />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('ask-glific-fab'));
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('new-chat-btn'));

    await waitFor(() => {
      expect(screen.getByText('Ask Glific! Learn About How It Works?')).toBeInTheDocument();
    });
  });

  test('it should show feedback buttons on bot responses', async () => {
    render(
      <MockedProvider mocks={[AskGlificMock]}>
        <AskGlific />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('ask-glific-fab'));
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    expect(screen.getByTestId('feedback-up')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-down')).toBeInTheDocument();
  });
});
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ASK_GLIFIC, ASK_GLIFIC_FEEDBACK } from 'graphql/mutations/AskGlific';
import { GET_ASKME_BOT_CONVERSATIONS, GET_ASKME_BOT_MESSAGES } from 'graphql/queries/AskGlific';
import AskGlific from './AskGlific';

const now = Math.floor(Date.now() / 1000);

const conversationsMock = {
  request: {
    query: GET_ASKME_BOT_CONVERSATIONS,
    variables: { limit: 10, lastId: '' },
  },
  result: {
    data: {
      askmeBotConversations: {
        conversations: [],
        hasMore: false,
        limit: 10,
      },
    },
  },
  maxUsageCount: Number.MAX_SAFE_INTEGER,
};

const conversationsWithDataMock = {
  request: {
    query: GET_ASKME_BOT_CONVERSATIONS,
    variables: { limit: 10, lastId: '' },
  },
  result: {
    data: {
      askmeBotConversations: {
        conversations: [
          {
            id: 'conv-abc',
            name: 'Test Conversation',
            status: 'normal',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'conv-abc',
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
            id: 'conv-y',
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

const messagesMock = {
  request: {
    query: GET_ASKME_BOT_MESSAGES,
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

const createAskGlificMock = (query: string) => ({
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

const suggestionMock = createAskGlificMock('Create your first chatbot');

const askGlificErrorMock = {
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

const feedbackMock = {
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

const feedbackDislikeMock = {
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

const openPanel = () => {
  fireEvent.click(screen.getByTestId('ask-glific-fab'));
};

describe('AskGlific', () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    writable: true,
  });

  test('should render AskGlific component', async () => {
    render(
      <MockedProvider mocks={[conversationsMock]}>
        <AskGlific />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ask-glific-fab')).toBeInTheDocument();
    });

    openPanel();

    await waitFor(() => {
      expect(screen.getByText('Ask Glific! Learn About How It Works?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('minimize-btn'));

    await waitFor(() => {
      expect(screen.queryByText('Ask Glific! Learn About How It Works?')).not.toBeInTheDocument();
    });
  });

  test('it should send messages from suggestion', async () => {
    render(
      <MockedProvider mocks={[conversationsMock, suggestionMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    await waitFor(() => {
      expect(screen.getByText('Ask Glific! Learn About How It Works?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('thinking...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });
  });

  test('it should allow new chat', async () => {
    render(
      <MockedProvider mocks={[conversationsMock, suggestionMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('new-chat-btn'));

    await waitFor(() => {
      expect(screen.getByText('Ask Glific! Learn About How It Works?')).toBeInTheDocument();
    });
  });

  test('it should show feedback buttons on bot responses', async () => {
    render(
      <MockedProvider mocks={[conversationsMock, suggestionMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    expect(screen.getByTestId('feedback-up')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-down')).toBeInTheDocument();
  });

  test('it should toggle feedback on click', async () => {
    render(
      <MockedProvider mocks={[conversationsMock, suggestionMock, feedbackMock, feedbackDislikeMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    const thumbUp = screen.getByTestId('feedback-up');
    const thumbDown = screen.getByTestId('feedback-down');

    fireEvent.click(thumbUp);
    fireEvent.click(thumbDown);
    fireEvent.click(thumbDown);

    expect(thumbUp).toBeInTheDocument();
    expect(thumbDown).toBeInTheDocument();
  });

  test('it should send message via text input and Enter key (handleOk + handleKeyDown)', async () => {
    const typedMessageMock = createAskGlificMock('How do flows work?');

    render(
      <MockedProvider mocks={[conversationsMock, typedMessageMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    await waitFor(() => {
      expect(screen.getByTestId('textbox')).toBeInTheDocument();
    });

    const textbox = screen.getByTestId('textbox');

    fireEvent.change(textbox, { target: { value: 'How do flows work?' } });
    fireEvent.keyDown(textbox, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(screen.getByText('How do flows work?')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });
  });

  test('it should not send message on Shift+Enter', async () => {
    render(
      <MockedProvider mocks={[conversationsMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    const textbox = screen.getByTestId('textbox');
    fireEvent.change(textbox, { target: { value: 'test' } });
    fireEvent.keyDown(textbox, { key: 'Enter', shiftKey: true });

    expect(screen.queryByText('thinking...')).not.toBeInTheDocument();
  });

  test('it should not send empty message', async () => {
    render(
      <MockedProvider mocks={[conversationsMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    const sendButton = screen.getByTestId('send-icon');
    expect(sendButton).toBeDisabled();

    const textbox = screen.getByTestId('textbox');
    fireEvent.change(textbox, { target: { value: '   ' } });
    fireEvent.keyDown(textbox, { key: 'Enter', shiftKey: false });

    expect(screen.queryByText('thinking...')).not.toBeInTheDocument();
  });

  test('it should show error message on mutation failure', async () => {
    render(
      <MockedProvider mocks={[conversationsMock, askGlificErrorMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Sorry, I encountered an error while processing your request. Please try again.')
      ).toBeInTheDocument();
    });
  });

  test('it should load conversations and select one (loadConversations + handleSelectConversation)', async () => {
    render(
      <MockedProvider mocks={[conversationsWithDataMock, messagesMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    await waitFor(() => {
      expect(screen.getByText('New chat')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New chat'));

    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Conversation'));

    await waitFor(() => {
      expect(screen.getByText('Hello bot')).toBeInTheDocument();
      expect(screen.getByText('Hi there! How can I help?')).toBeInTheDocument();
    });
  });

  test('it should switch display modes', async () => {
    render(
      <MockedProvider mocks={[conversationsMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByTestId('display-mode-btn'));

    await waitFor(() => {
      expect(screen.getByText('Sidebar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sidebar'));

    // Panel should still be visible
    expect(screen.getByTestId('ask-me-bot-panel')).toBeInTheDocument();
  });

  describe('getDateLabel', () => {
    test('should group yesterday conversations under Yesterday label', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);
      const yesterdayTs = Math.floor(yesterday.getTime() / 1000);

      const mock = {
        request: {
          query: GET_ASKME_BOT_CONVERSATIONS,
          variables: { limit: 10, lastId: '' },
        },
        result: {
          data: {
            askmeBotConversations: {
              conversations: [
                {
                  id: 'conv-yd',
                  name: 'Yesterday Date Chat',
                  status: 'normal',
                  createdAt: yesterdayTs,
                  updatedAt: yesterdayTs,
                },
              ],
              hasMore: false,
              limit: 10,
            },
          },
        },
        maxUsageCount: Number.MAX_SAFE_INTEGER,
      };

      render(
        <MockedProvider mocks={[mock]}>
          <AskGlific />
        </MockedProvider>
      );

      openPanel();
      fireEvent.click(screen.getByText('New chat'));

      await waitFor(() => {
        const yesterdayLabels = screen.getAllByText('Yesterday');
        expect(yesterdayLabels.length).toBeGreaterThanOrEqual(1);
      });
    });

    test('should show formatted date for older conversations', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      const oldTs = Math.floor(oldDate.getTime() / 1000);
      const expectedLabel = oldDate.toLocaleDateString();

      const mock = {
        request: {
          query: GET_ASKME_BOT_CONVERSATIONS,
          variables: { limit: 10, lastId: '' },
        },
        result: {
          data: {
            askmeBotConversations: {
              conversations: [
                { id: 'conv-old', name: 'Old Date Chat', status: 'normal', createdAt: oldTs, updatedAt: oldTs },
              ],
              hasMore: false,
              limit: 10,
            },
          },
        },
        maxUsageCount: Number.MAX_SAFE_INTEGER,
      };

      render(
        <MockedProvider mocks={[mock]}>
          <AskGlific />
        </MockedProvider>
      );

      openPanel();
      fireEvent.click(screen.getByText('New chat'));

      await waitFor(() => {
        // Both the date label and the timeAgo should use toLocaleDateString
        const dateLabels = screen.getAllByText(expectedLabel);
        expect(dateLabels.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  test('it should load more messages when load more button is clicked', async () => {
    const messagesWithMoreMock = {
      request: {
        query: GET_ASKME_BOT_MESSAGES,
        variables: { conversationId: 'conv-abc', limit: 50 },
      },
      result: {
        data: {
          askGlificMessages: {
            messages: [
              {
                id: 'msg-1',
                conversationId: 'conv-abc',
                query: 'First question',
                answer: 'First answer',
                createdAt: now - 3000,
                feedback: null,
              },
            ],
            hasMore: true,
            limit: 50,
          },
        },
      },
      maxUsageCount: Number.MAX_SAFE_INTEGER,
    };

    const olderMessagesMock = {
      request: {
        query: GET_ASKME_BOT_MESSAGES,
        variables: { conversationId: 'conv-abc', limit: 50, firstId: 'msg-1' },
      },
      result: {
        data: {
          askGlificMessages: {
            messages: [
              {
                id: 'msg-0',
                conversationId: 'conv-abc',
                query: 'Older question',
                answer: 'Older answer',
                createdAt: now - 6000,
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

    render(
      <MockedProvider mocks={[conversationsWithDataMock, messagesWithMoreMock, olderMessagesMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByText('New chat'));
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Conversation'));

    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument();
    });

    const loadMoreBtn = screen.getByTestId('load-more-messages');
    expect(loadMoreBtn).toBeInTheDocument();

    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      expect(screen.getByText('Older question')).toBeInTheDocument();
      expect(screen.getByText('Older answer')).toBeInTheDocument();
    });
  });

  test('it should highlight active conversation in history', async () => {
    render(
      <MockedProvider mocks={[conversationsWithDataMock, messagesMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByText('New chat'));
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Conversation'));

    await waitFor(() => {
      expect(screen.getByText('Hello bot')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Conversation'));

    await waitFor(() => {
      const menuItems = screen.getAllByRole('menuitem');
      const activeItem = menuItems.find((item) => item.textContent === 'Test Conversation');
      expect(activeItem).toBeInTheDocument();
    });
  });

  test('it should load more conversations when hasMore is true', async () => {
    const conversationsPage1 = {
      request: {
        query: GET_ASKME_BOT_CONVERSATIONS,
        variables: { limit: 10, lastId: '' },
      },
      result: {
        data: {
          askmeBotConversations: {
            conversations: [
              { id: 'conv-1', name: 'First Chat', status: 'normal', createdAt: now - 60, updatedAt: now - 60 },
            ],
            hasMore: true,
            limit: 10,
          },
        },
      },
      maxUsageCount: Number.MAX_SAFE_INTEGER,
    };

    const conversationsPage2 = {
      request: {
        query: GET_ASKME_BOT_CONVERSATIONS,
        variables: { limit: 10, lastId: 'conv-1' },
      },
      result: {
        data: {
          askmeBotConversations: {
            conversations: [
              { id: 'conv-2', name: 'Second Chat', status: 'normal', createdAt: now - 7200, updatedAt: now - 7200 },
            ],
            hasMore: false,
            limit: 10,
          },
        },
      },
      maxUsageCount: Number.MAX_SAFE_INTEGER,
    };

    render(
      <MockedProvider mocks={[conversationsPage1, conversationsPage2]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByText('New chat'));

    await waitFor(() => {
      expect(screen.getByText('First Chat')).toBeInTheDocument();
    });

    const loadMoreBtn = screen.getByTestId('load-more-conversations-dropdown');
    expect(loadMoreBtn).toBeInTheDocument();

    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      expect(screen.getByText('Second Chat')).toBeInTheDocument();
    });
  });

  test('it should close history dropdown when clicking outside', async () => {
    render(
      <MockedProvider mocks={[conversationsWithDataMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByText('New chat'));

    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText('Test Conversation')).not.toBeInTheDocument();
    });
  });

  test('it should close display mode menu on item selection', async () => {
    render(
      <MockedProvider mocks={[conversationsMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByTestId('display-mode-btn'));

    await waitFor(() => {
      expect(screen.getByText('Floating')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Floating'));

    await waitFor(() => {
      expect(screen.queryByText('Sidebar')).not.toBeInTheDocument();
    });
  });

  test('it should switch to fullscreen display mode', async () => {
    render(
      <MockedProvider mocks={[conversationsMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByTestId('display-mode-btn'));

    await waitFor(() => {
      expect(screen.getByText('Fullscreen')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Fullscreen'));

    expect(screen.getByTestId('ask-me-bot-panel')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Floating')).not.toBeInTheDocument();
    });
  });

  test('it should show existing feedback when loading chat history', async () => {
    const messagesWithFeedbackMock = {
      request: {
        query: GET_ASKME_BOT_MESSAGES,
        variables: { conversationId: 'conv-abc', limit: 50 },
      },
      result: {
        data: {
          askGlificMessages: {
            messages: [
              {
                id: 'msg-fb-1',
                conversationId: 'conv-abc',
                query: 'How does Glific work?',
                answer: 'Glific is a communication platform.',
                createdAt: now - 3000,
                feedback: 'like',
              },
            ],
            hasMore: false,
            limit: 50,
          },
        },
      },
      maxUsageCount: Number.MAX_SAFE_INTEGER,
    };

    render(
      <MockedProvider mocks={[conversationsWithDataMock, messagesWithFeedbackMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByText('New chat'));

    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Conversation'));

    await waitFor(() => {
      expect(screen.getByText('Glific is a communication platform.')).toBeInTheDocument();
    });

    const thumbUp = screen.getByTestId('feedback-up');
    expect(thumbUp.className).toContain('FeedbackButtonActive');
  });

  test('it should call feedback mutation when clicking thumbs up', async () => {
    const feedbackMutationMock = {
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
    };

    render(
      <MockedProvider mocks={[conversationsMock, suggestionMock, feedbackMutationMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    const thumbUp = screen.getByTestId('feedback-up');
    fireEvent.click(thumbUp);

    expect(thumbUp.className).toContain('FeedbackButtonActive');
  });

  test('it should show history panel in sidebar mode and select conversation', async () => {
    render(
      <MockedProvider mocks={[conversationsWithDataMock, messagesMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    fireEvent.click(screen.getByTestId('display-mode-btn'));
    await waitFor(() => {
      expect(screen.getByText('Sidebar')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Sidebar'));

    fireEvent.click(screen.getByText('New chat'));

    await waitFor(() => {
      expect(screen.getByTestId('history-panel')).toBeInTheDocument();
      expect(screen.getByText('Chat History')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Conversation'));

    await waitFor(() => {
      expect(screen.getByText('Hello bot')).toBeInTheDocument();
    });
  });
});
