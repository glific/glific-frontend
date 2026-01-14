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

vi.mock('axios');
const mockedAxios = axios as any;

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

test('disconnection banner should not be displayed when simulator is connected', async () => {
  const connectionProps = getDefaultProps();
  connectionProps.showSimulator = true;

  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    value: true,
  });

  const { queryByText } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...connectionProps} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(queryByText('Simulator connection lost. Try to reload.')).not.toBeInTheDocument();
  });
});

test('disconnection banner should be displayed when simulator connection is lost', async () => {
  const disconnectionProps = getDefaultProps();
  disconnectionProps.showSimulator = true;
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId, getByText, queryByText } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...disconnectionProps} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByTestId('simulatorInput')).toBeInTheDocument();
  });

  fireEvent.change(getByTestId('simulatorInput'), { target: { value: 'something' } });

  await waitFor(() => {
    fireEvent.keyPress(getByTestId('simulatorInput'), { key: 'Enter', code: 13, charCode: 13 });
  });

  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    value: false,
  });

  // Trigger offline event to simulate real browser behavior
  window.dispatchEvent(new Event('offline'));

  await waitFor(() => {
    expect(getByText('Simulator connection lost. Try to reload.')).toBeInTheDocument();
  });

  // the banner should disappear when connection is restored
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    value: true,
  });

  window.dispatchEvent(new Event('online'));

  await waitFor(() => {
    expect(queryByText('Simulator connection lost. Try to reload.')).not.toBeInTheDocument();
  });
});
