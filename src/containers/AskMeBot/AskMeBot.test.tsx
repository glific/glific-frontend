import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ASK_ME_BOT } from 'graphql/mutations/AskMeBot';
import { AskMeBot } from './AskMeBot';

const askMeBotMock = {
  request: {
    query: ASK_ME_BOT,
    variables: {
      input: {
        query: 'Create your first chatbot',
        conversationId: '',
      },
    },
  },
  result: {
    data: {
      askmeBot: {
        answer: 'This is a mock response from the bot.',
        conversationId: 'conv-123',
        errors: null,
      },
    },
  },
};

describe('AskMeBot', () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    writable: true,
  });

  test('should render AskMeBot component', async () => {
    render(
      <MockedProvider mocks={[]}>
        <AskMeBot />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ask-me-bot-fab')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ask-me-bot-fab'));

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
      <MockedProvider mocks={[askMeBotMock]}>
        <AskMeBot />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('ask-me-bot-fab'));

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
      <MockedProvider mocks={[askMeBotMock]}>
        <AskMeBot />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('ask-me-bot-fab'));
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
      <MockedProvider mocks={[askMeBotMock]}>
        <AskMeBot />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('ask-me-bot-fab'));
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    expect(screen.getByTestId('feedback-up')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-down')).toBeInTheDocument();
  });
});
