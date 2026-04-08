import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ASK_GLIFIC } from 'graphql/mutations/AskGlific';
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
            createdAt: now - 3600,
            updatedAt: now - 60,
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
      <MockedProvider mocks={[conversationsMock, suggestionMock]}>
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

    // Click thumbs up
    fireEvent.click(thumbUp);
    // Click thumbs down (should switch)
    fireEvent.click(thumbDown);
    // Click thumbs down again (should toggle off)
    fireEvent.click(thumbDown);

    // Should not throw and buttons should still be present
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

    // Should not show loading
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

  test('it should send message via send button (handleOk)', async () => {
    const typedMessageMock = createAskGlificMock('What is Glific?');

    render(
      <MockedProvider mocks={[conversationsMock, typedMessageMock]}>
        <AskGlific />
      </MockedProvider>
    );

    openPanel();

    const textbox = screen.getByTestId('textbox');
    fireEvent.change(textbox, { target: { value: 'What is Glific?' } });
    fireEvent.click(screen.getByTestId('send-icon'));

    await waitFor(() => {
      expect(screen.getByText('What is Glific?')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });
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

    // In floating mode, clicking header left opens the history dropdown
    await waitFor(() => {
      expect(screen.getByText('New chat')).toBeInTheDocument();
    });

    // Click header left to open history dropdown
    fireEvent.click(screen.getByText('New chat'));

    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    // Select the conversation
    fireEvent.click(screen.getByText('Test Conversation'));

    // Should load messages for that conversation
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
});
