import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  messageReceivedSubscription,
  messageSendSubscription,
  simulatorWebMessageMutation,
  webSimulatorSearchQuery,
} from 'mocks/Simulator';
import { setUserSession } from 'services/AuthService';
import { WebSimulator, isWebMessage } from './WebSimulator';

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));

const contact = { id: '1', name: 'Glific Simulator', phone: '987654321' };

const baseMocks = [
  webSimulatorSearchQuery,
  webSimulatorSearchQuery,
  messageReceivedSubscription(),
  messageSendSubscription(),
];

const renderWeb = (mocks: any[], props: any = {}) =>
  render(
    <MockedProvider mocks={[...baseMocks, ...mocks]}>
      <WebSimulator contact={contact} {...props} />
    </MockedProvider>
  );

beforeEach(() => vi.clearAllMocks());

describe('isWebMessage', () => {
  test('only a message the backend stamped `web` belongs to the Web tab', () => {
    expect(isWebMessage({ channel: 'web' })).toBe(true);
    expect(isWebMessage({ channel: 'whatsapp' })).toBe(false);
    // legacy rows have no channel at all — they must NOT leak into the web transcript
    expect(isWebMessage({ channel: null })).toBe(false);
    expect(isWebMessage({})).toBe(false);
  });
});

describe('WebSimulator', () => {
  test('renders browser chrome rather than phone chrome', async () => {
    renderWeb([]);
    expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    expect(screen.getByTestId('webAddressBar')).toBeInTheDocument();
    expect(screen.queryByTestId('simulatorHeader')).not.toBeInTheDocument();
  });

  test('shows only web-channel messages (§13.4)', async () => {
    renderWeb([]);

    await waitFor(() => {
      expect(screen.getByTestId('webSimulatedMessages')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('blocksCarousel')).toBeInTheDocument();
    });
    expect(screen.queryByText('a whatsapp only message')).not.toBeInTheDocument();
  });

  test('posts the keyword on mount so the flow starts on the WEB channel', async () => {
    const keywordMock = simulatorWebMessageMutation({ type: 'TEXT', body: 'draft:a' });
    const spy = vi.fn(() => keywordMock.result);
    renderWeb([{ ...keywordMock, newData: spy }], { keyword: 'draft:a' });

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  test('sends typed text through simulatorWebMessage', async () => {
    const textMock = simulatorWebMessageMutation({ type: 'TEXT', body: 'hello there' });
    const spy = vi.fn(() => textMock.result);
    renderWeb([{ ...textMock, newData: spy }]);

    fireEvent.change(screen.getByTestId('composerInput'), { target: { value: 'hello there' } });
    fireEvent.click(screen.getByTestId('composerSend'));

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  test('sends a manually entered location', async () => {
    const locationMock = simulatorWebMessageMutation({ type: 'LOCATION', latitude: 12.5, longitude: 77.25 });
    const spy = vi.fn(() => locationMock.result);
    renderWeb([{ ...locationMock, newData: spy }]);

    fireEvent.click(screen.getByTestId('composerLocation'));
    fireEvent.change(screen.getByTestId('simulatorLatitude').querySelector('input')!, { target: { value: '12.5' } });
    fireEvent.change(screen.getByTestId('simulatorLongitude').querySelector('input')!, { target: { value: '77.25' } });
    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  test('answers a blocks message through the real blocks_response path (§13.5)', async () => {
    const responseMock = simulatorWebMessageMutation({
      type: 'BLOCKS_RESPONSE',
      messageId: '4211',
      component: 'glific/carousel',
      // The `Json` scalar takes an encoded string, never an object — see `sendBlocksResponse`.
      values: JSON.stringify({ product: 'p1' }),
      summary: 'Course A',
    });
    const spy = vi.fn(() => responseMock.result);
    renderWeb([{ ...responseMock, newData: spy }]);

    await waitFor(() => {
      expect(screen.getByTestId('carouselSelect')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('carouselSelect'));

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
