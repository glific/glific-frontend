import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ASK_GLIFIC } from 'graphql/mutations/AskGlific';
import { GET_ASKME_BOT_CONVERSATIONS } from 'graphql/queries/AskGlific';
import AskGlific from './AskGlific';

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

const AskGlificMock = {
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
  result: {
    data: {
      askGlific: {
        answer: 'This is a mock response from the bot.',
        conversationId: 'conv-123',
        conversationName: null,
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
      <MockedProvider mocks={[conversationsMock]}>
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
      <MockedProvider mocks={[conversationsMock, AskGlificMock]}>
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
      <MockedProvider mocks={[conversationsMock, AskGlificMock]}>
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
      <MockedProvider mocks={[conversationsMock, AskGlificMock]}>
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
