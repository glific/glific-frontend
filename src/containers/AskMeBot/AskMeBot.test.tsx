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

  mockedAxios.post.mockResolvedValueOnce({
    data: {
      response: 'This is a mock response from the bot.',
    },
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
      expect(screen.getByText('Ask Glific')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('close-icon'));

    await waitFor(() => {
      expect(screen.queryByText('Ask Glific')).not.toBeInTheDocument();
    });
  });

  test('it should send messages from suggestion', async () => {
    render(wrapper);

    fireEvent.click(screen.getByTestId('ask-me-bot-fab'));

    await waitFor(() => {
      expect(screen.getByText('Ask Glific')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('suggestion')[0]);

    fireEvent.click(screen.getByTestId('send-icon'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('This is a mock response from the bot.')).toBeInTheDocument();
    });
  });
});
