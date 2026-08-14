import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { vi } from 'vitest';

import { conversationQuery } from 'mocks/Chat';
import {
  messageReceivedSubscription,
  messageSendSubscription,
  simulatorSearchQuery,
  keywordSentSubscription,
  interactiveMessageReceiveSubscription,
} from 'mocks/Simulator';
import Simulator from './Simulator';
import { setUserSession } from 'services/AuthService';

vi.mock('axios');
const mockedAxios = axios as any;

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));

const simulatorContact = { id: '1', name: 'Glific Simulator', phone: '987654321' };

const mocks = [
  conversationQuery,
  simulatorSearchQuery,
  simulatorSearchQuery,
  messageReceivedSubscription(),
  messageSendSubscription(),
];

const getDefaultProps = () => ({
  simulatorContact,
  isPreviewMessage: false,
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('the phone body owns neither a close nor a reset control — the container does', async () => {
  render(
    <MockedProvider mocks={mocks}>
      <Simulator {...getDefaultProps()} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
  });
  expect(screen.queryByTestId('clearIcon')).not.toBeInTheDocument();
  expect(screen.queryByTestId('resetIcon')).not.toBeInTheDocument();
});

test('send a message/media from the simulator', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...getDefaultProps()} />
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
  const interactiveMocks = [simulatorSearchQuery, keywordSentSubscription, interactiveMessageReceiveSubscription];

  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));

  const { getByTestId } = render(
    <MockedProvider mocks={interactiveMocks}>
      <Simulator {...getDefaultProps()} />
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

test('a bumped resetNonce resends the keyword to restart the flow', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { rerender } = render(
    <MockedProvider mocks={mocks}>
      <Simulator simulatorContact={simulatorContact} message="draft:a" resetNonce={0} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  rerender(
    <MockedProvider mocks={mocks}>
      <Simulator simulatorContact={simulatorContact} message="draft:a" resetNonce={1} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
  expect(mockedAxios.post.mock.calls[1][1].payload.payload).toEqual({ text: 'draft:a' });
});

const HSMProps: any = {
  isPreviewMessage: true,
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

test('disconnection banner should not be displayed when simulator is connected', async () => {
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    value: true,
  });

  const { queryByText } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...getDefaultProps()} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(queryByText('Simulator connection lost. Try to reload.')).not.toBeInTheDocument();
  });
});

test('disconnection banner should be displayed when simulator connection is lost', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId, getByText, queryByText } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...getDefaultProps()} />
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
