import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AskMeBot } from './AskMeBot';

describe('AskMeBot', () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    writable: true,
  });

  vi.mock('axios');
  const mockedAxios = axios as any;

  beforeEach(() => {
    mockedAxios.post.mockResolvedValue({
      data: {
        response: 'This is a mock response from the bot.',
      },
    });
    localStorage.removeItem('askMeBotHistory');
  });

  const wrapper = (
    <MockedProvider>
      <AskMeBot />
    </MockedProvider>
  );

  test('should render AskMeBot component', async () => {
    render(wrapper);

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
    render(wrapper);

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
    render(wrapper);

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
    render(wrapper);

    fireEvent.click(screen.getByTestId('ask-me-bot-fab'));
    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });

    expect(screen.getByTestId('feedback-up')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-down')).toBeInTheDocument();
  });
});
