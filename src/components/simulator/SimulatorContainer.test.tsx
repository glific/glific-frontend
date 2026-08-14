import { ApolloLink, Observable } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';

import { CHANNEL_WEB, CHANNEL_WHATSAPP } from 'common/constants';
import {
  clearSimulatorMessagesMutation,
  messageReceivedSubscription,
  messageSendSubscription,
  simulatorGetQuery,
  simulatorReleaseQuery,
  simulatorReleaseSubscription,
  webSimulatorSearchQuery,
} from 'mocks/Simulator';
import { setUserSession } from 'services/AuthService';
import SimulatorContainer, { FLOW_DISABLED_REASON } from './SimulatorContainer';

vi.mock('axios');

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));

const mocks = [
  simulatorGetQuery,
  simulatorGetQuery,
  simulatorReleaseQuery,
  simulatorReleaseSubscription(),
  webSimulatorSearchQuery,
  webSimulatorSearchQuery,
  webSimulatorSearchQuery,
  messageReceivedSubscription(),
  messageSendSubscription(),
  clearSimulatorMessagesMutation,
  clearSimulatorMessagesMutation,
];

const onClose = vi.fn();

const renderLive = (props: any = {}) =>
  render(
    <MockedProvider mocks={mocks}>
      <SimulatorContainer mode="live" onClose={onClose} disabledReason={FLOW_DISABLED_REASON} {...props} />
    </MockedProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  (axios as any).post.mockResolvedValue({ data: {} });
});

describe('tab gating (contract §13)', () => {
  test('an omnichannel flow enables both tabs', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId(`simulatorTab-${CHANNEL_WHATSAPP}`)).not.toBeDisabled();
    });
    expect(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`)).not.toBeDisabled();
  });

  test('a web-only flow disables the WhatsApp tab and says why on hover', async () => {
    renderLive({ channels: [CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId(`simulatorTab-${CHANNEL_WHATSAPP}`)).toBeDisabled();
    });
    expect(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`)).not.toBeDisabled();

    // the reason lives on a wrapper — MUI's Tooltip never fires on a disabled child
    fireEvent.mouseOver(screen.getByTestId(`simulatorTabDisabled-${CHANNEL_WHATSAPP}`));
    await waitFor(() => {
      expect(screen.getByText(/only runs on the web channel/i)).toBeInTheDocument();
    });
  });

  test('a web-only flow opens ON the web tab rather than a disabled one', async () => {
    renderLive({ channels: [CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    });
  });

  test('an omnichannel flow opens on WhatsApp', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('webSimulator')).not.toBeInTheDocument();
  });

  test('the channels shrinking under an open container re-homes it onto an enabled tab', async () => {
    const { rerender } = render(
      <MockedProvider mocks={mocks}>
        <SimulatorContainer mode="live" onClose={onClose} channels={[CHANNEL_WHATSAPP, CHANNEL_WEB]} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });

    // a save added a blocks node: the flow is web-only now, and the panel never reopened
    rerender(
      <MockedProvider mocks={mocks}>
        <SimulatorContainer mode="live" onClose={onClose} channels={[CHANNEL_WEB]} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId(`simulatorTab-${CHANNEL_WHATSAPP}`)).toBeDisabled();
    });
    await waitFor(() => {
      expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    });
  });
});

describe('header actions', () => {
  test('reset sits to the left of close', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorReset')).toBeInTheDocument();
    });

    const header = screen.getByTestId('simulatorContainerHeader');
    const actions = Array.from(
      header.querySelectorAll('[data-testid="simulatorReset"],[data-testid="simulatorClose"]')
    );
    expect(actions.map((node) => node.getAttribute('data-testid'))).toEqual(['simulatorReset', 'simulatorClose']);
  });

  test('close releases the simulator contact and tells the caller', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorClose')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('simulatorClose'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('the WhatsApp tab does not render its own close button — the container owns it', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('clearIcon')).not.toBeInTheDocument();
  });

  test('reset clears the transcript and restarts the flow', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB], keyword: 'draft:a' });

    await waitFor(() => {
      expect((axios as any).post).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByTestId('simulatorReset'));

    await waitFor(() => {
      expect((axios as any).post).toHaveBeenCalledTimes(2);
    });
  });
});

describe('reset on tab switch (contract §13.4)', () => {
  test('switching is immediate — no confirmation stands between the two tabs', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`));

    expect(screen.queryByTestId('ok-button')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('simulatorHeader')).not.toBeInTheDocument();
  });

  test('the clear settles before the other tab mounts and sends its keyword', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB] });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`));

    // the spinner stands in for the modal: the switch is in flight, the new tab is not mounted yet
    expect(screen.getByTestId('simulatorSwitching')).toBeInTheDocument();
    expect(screen.queryByTestId('webSimulator')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('simulatorSwitching')).not.toBeInTheDocument();
  });
});

describe('starting the flow', () => {
  test('the WhatsApp tab posts the keyword to the BSP callback exactly once', async () => {
    renderLive({ channels: [CHANNEL_WHATSAPP, CHANNEL_WEB], keyword: 'draft:a' });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect((axios as any).post).toHaveBeenCalledTimes(1);
    });
    // a second start would run the flow twice and double the transcript
    expect((axios as any).post.mock.calls[0][1].payload.payload).toEqual({ text: 'draft:a' });
  });

  test('the web tab never touches the BSP callback — that path is WhatsApp-only by construction', async () => {
    renderLive({ channels: [CHANNEL_WEB], keyword: 'draft:a' });

    await waitFor(() => {
      expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    });
    expect((axios as any).post).not.toHaveBeenCalled();
  });
});

describe('preview mode', () => {
  /** Records every operation the component issues so "no allocation" can be asserted directly. */
  const recordingProvider = (children: any, operations: string[]) => {
    const link = new ApolloLink((operation) => {
      operations.push(operation.operationName);
      return new Observable((observer) => observer.complete());
    });
    return <MockedProvider link={link}>{children}</MockedProvider>;
  };

  test('issues no GET_SIMULATOR — opening a form must not consume a pooled simulator', async () => {
    const operations: string[] = [];
    render(
      recordingProvider(
        <SimulatorContainer mode="preview" channels={[CHANNEL_WHATSAPP]} message={{ type: 'TEXT', body: 'hi' }} />,
        operations
      )
    );

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });
    expect(operations).not.toContain('getSimulator');
    expect(operations).toEqual([]);
  });

  test('renders no close action when the caller gives no onClose', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SimulatorContainer mode="preview" channels={[CHANNEL_WHATSAPP]} message={{ type: 'TEXT', body: 'hi' }} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('simulatorReset')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('simulatorClose')).not.toBeInTheDocument();
  });

  test('switching tabs is free — there is no flow context to reset', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SimulatorContainer
          mode="preview"
          channels={[CHANNEL_WHATSAPP, CHANNEL_WEB]}
          message={{ type: 'TEXT', body: 'hi' }}
        />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`));

    expect(screen.queryByTestId('simulatorSwitching')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('webPreview')).toBeInTheDocument();
    });
  });

  test('a caller-supplied web preview replaces the default web body', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SimulatorContainer
          mode="preview"
          channels={[CHANNEL_WEB]}
          webPreview={<div data-testid="callerWebPreview">blocks</div>}
        />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('callerWebPreview')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('webPreview')).not.toBeInTheDocument();
  });
});
