import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { vi } from 'vitest';

import { conversationQuery } from 'mocks/Chat';
import {
  messageReceivedSubscription,
  messageSendSubscription,
  simulatorGetQuery,
  simulatorReleaseQuery,
  simulatorReleaseSubscription,
  simulatorSearchQuery,
  keywordSentSubscription,
  interactiveMessageReceiveSubscription,
} from 'mocks/Simulator';
import Simulator from './Simulator';
import { setUserSession } from 'services/AuthService';
import { getWsClient } from 'config/apolloclient';

vi.mock('axios');
vi.mock('config/apolloclient');

const mockedAxios = axios as any;
const mockedWsClient = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  close: vi.fn(),
} as any;

(getWsClient as any).mockReturnValue(mockedWsClient);

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));
const mockSetShowSimulator = vi.fn();

const mocks = [
  conversationQuery,
  simulatorReleaseSubscription(),
  simulatorReleaseQuery,
  simulatorReleaseQuery,
  simulatorSearchQuery,
  simulatorSearchQuery,
  messageReceivedSubscription(),
  messageSendSubscription(),
  simulatorGetQuery,
  simulatorGetQuery,
];
const getDefaultProps = () => ({
  showSimulator: false,
  setShowSimulator: mockSetShowSimulator,
  setSimulatorId: mockSetShowSimulator,
  isPreviewMessage: false,
  resetMessage: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();

  mockedWsClient.on.mockImplementation((event: string, handler: Function) => {
    return vi.fn();
  });
});

test('opened simulator should close when click of simulator icon', async () => {
  const props = getDefaultProps();
  const mockOpenSimulator = vi.fn();
  props.setShowSimulator = mockOpenSimulator;
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByTestId('clearIcon')).toBeInTheDocument();
  });
  // To open simulator
  const button = getByTestId('clearIcon');
  fireEvent.click(button);
  await waitFor(() => {
    expect(mockOpenSimulator).toHaveBeenCalledTimes(1);
  });
});

test('send a message/media from the simulator', async () => {
  const props = getDefaultProps();
  props.showSimulator = true;
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByTestId('simulatorInput')).toBeInTheDocument();
  });
  const input = getByTestId('simulatorInput');
  fireEvent.change(input, { target: { value: 'something' } });

  await waitFor(() => {
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
  });

  await waitFor(() => {
    expect(input).toHaveTextContent('');
  });

  // Get attachment icon
  const attachmentIcon = screen.getByTestId('attachment');
  expect(attachmentIcon).toBeInTheDocument();

  fireEvent.click(attachmentIcon);
  await waitFor(() => {});

  const [imageButton] = screen.getAllByRole('button');
  expect(imageButton).toBeInTheDocument();

  fireEvent.click(imageButton);
  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
});

test('Receive an interactive message and send the response with correct uuid', async () => {
  const expectedUuid = interactiveMessageReceiveSubscription.result.data.sentSimulatorMessage.uuid;
  const mocks = [
    simulatorSearchQuery,
    simulatorReleaseSubscription(),
    simulatorReleaseQuery,
    simulatorGetQuery,
    keywordSentSubscription,
    interactiveMessageReceiveSubscription,
  ];

  const props = getDefaultProps();
  props.showSimulator = true;
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));

  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByTestId('simulatorInput')).toBeInTheDocument();
  });

  const input = getByTestId('simulatorInput');
  fireEvent.change(input, { target: { value: 'draft:a' } });
  await waitFor(() => {
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
  });

  await waitFor(async () => {
    const quickReplyButton = await screen.findByText(/yes/i);
    expect(quickReplyButton).toBeInTheDocument();
    fireEvent.click(quickReplyButton);
  });

  await waitFor(() => {
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    const payload = mockedAxios.post.mock.calls[1][1];
    expect(payload.payload.payload.id).toBe(expectedUuid);
  });
});

test('click on clear icon closes the simulator', async () => {
  const props = getDefaultProps();
  props.showSimulator = true;
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
    </MockedProvider>
  );
  await waitFor(() => {
    fireEvent.click(getByTestId('clearIcon'));
  });
  expect(mockSetShowSimulator).toBeCalled();
});

const HSMProps: any = {
  showSimulator: true,
  setShowSimulator: mockSetShowSimulator,
  setSimulatorId: mockSetShowSimulator,
  isPreviewMessage: true,
  simulatorIcon: false,
};

const HSMSimulator = (
  <MockedProvider mocks={mocks}>
    <Simulator {...HSMProps} />
  </MockedProvider>
);

test('simulator should open by default in preview HSM', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId } = render(HSMSimulator);
  await waitFor(() => {
    expect(getByTestId('beneficiaryName')).toBeInTheDocument();
  });
});

test('simulator icon should not be seen in preview HSM', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId } = render(HSMSimulator);
  expect(() => getByTestId('simulatorIcon')).toThrow();
});

test('simulator should render template message', () => {
  HSMProps.message = {
    type: 'TEXT',
    location: null,
    media: { caption: 'This is time for play. | [view contact, +917834811114]\n' },
    body: 'This is time for play. | [view contact, +917834811114]\n',
  };
  render(
    <MockedProvider mocks={mocks}>
      <Simulator {...HSMProps} />
    </MockedProvider>
  );
});

const props = {
  showSimulator: true,
  setSimulatorId: vi.fn(),
  message: 'fake_message',
  simulatorIcon: true,
  isPreviewMessage: false,
  flowSimulator: false,
  hasResetButton: true,
};

test('simulator should reset on clicking the reset button message', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByTestId('resetIcon')).toBeInTheDocument();
  });

  const resetButton = getByTestId('resetIcon');
  fireEvent.click(resetButton);
  await waitFor(() => {
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});

describe('WebSocket connection status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedWsClient.on.mockImplementation((event: string, handler: Function) => {
      return vi.fn();
    });
  });

  test('should handle WebSocket connected event', async () => {
    const simulatorProps = getDefaultProps();
    simulatorProps.showSimulator = true;

    const eventHandlers: { [key: string]: Function } = {};
    const disposeFunctions: { [key: string]: Function } = {};

    mockedWsClient.on.mockImplementation((event: string, handler: Function) => {
      eventHandlers[event] = handler;
      disposeFunctions[event] = vi.fn();
      return disposeFunctions[event];
    });

    const { queryByText } = render(
      <MockedProvider mocks={mocks}>
        <Simulator {...simulatorProps} />
      </MockedProvider>
    );

    expect(queryByText('⚠️ Simulator Connection Lost. Try Reloading')).not.toBeInTheDocument();

    if (eventHandlers.connected) {
      eventHandlers.connected();
    }

    await waitFor(() => {
      expect(queryByText('⚠️ Simulator Connection Lost. Try Reloading')).not.toBeInTheDocument();
    });
  });

  test('should handle WebSocket closed event and show disconnection status', async () => {
    const simulatorProps = getDefaultProps();
    simulatorProps.showSimulator = true;

    const eventHandlers: { [key: string]: Function } = {};
    const disposeFunctions: { [key: string]: Function } = {};

    mockedWsClient.on.mockImplementation((event: string, handler: Function) => {
      eventHandlers[event] = handler;
      disposeFunctions[event] = vi.fn();
      return disposeFunctions[event];
    });

    const { getByText, getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <Simulator {...simulatorProps} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('simulatorInput')).toBeInTheDocument();
    });

    if (eventHandlers.closed) {
      eventHandlers.closed({ code: 1006, reason: 'Connection closed' });
    }

    await waitFor(() => {
      expect(getByText('⚠️ Simulator Connection Lost. Try Reloading')).toBeInTheDocument();
    });
  });

  test('should handle WebSocket error event and show disconnection status', async () => {
    const simulatorProps = getDefaultProps();
    simulatorProps.showSimulator = true;

    const eventHandlers: { [key: string]: Function } = {};
    const disposeFunctions: { [key: string]: Function } = {};

    mockedWsClient.on.mockImplementation((event: string, handler: Function) => {
      eventHandlers[event] = handler;
      disposeFunctions[event] = vi.fn();
      return disposeFunctions[event];
    });

    const { getByText, getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <Simulator {...simulatorProps} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('simulatorInput')).toBeInTheDocument();
    });

    if (eventHandlers.error) {
      eventHandlers.error(new Error('WebSocket connection failed'));
    }

    await waitFor(() => {
      expect(getByText('⚠️ Simulator Connection Lost. Try Reloading')).toBeInTheDocument();
    });
  });
});
