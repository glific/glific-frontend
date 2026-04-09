import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Apollo from '@apollo/client';
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
        answer: null,
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

  let onDataCallback: Function;

  beforeEach(() => {
    vi.spyOn(Apollo, 'useSubscription').mockImplementation((_query: any, options: any) => {
      onDataCallback = options?.onData;
      return { data: undefined, loading: false, error: undefined, restart: vi.fn() } as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const simulateSubscriptionResponse = (answer: string, conversationId: string) => {
    onDataCallback?.({
      data: {
        data: {
          askGlificResponse: {
            answer,
            conversationId,
            errors: null,
          },
        },
      },
    });
  };

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

    simulateSubscriptionResponse('This is a mock response from the bot.', 'conv-123');

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
      expect(screen.getByText('thinking...')).toBeInTheDocument();
    });

    simulateSubscriptionResponse('This is a mock response from the bot.', 'conv-123');

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
      expect(screen.getByText('thinking...')).toBeInTheDocument();
    });

    simulateSubscriptionResponse('This is a mock response from the bot.', 'conv-123');

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    expect(screen.getByTestId('feedback-up')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-down')).toBeInTheDocument();
  });
});
