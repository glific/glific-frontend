import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';

import { CHANNEL_WEB, CHANNEL_WHATSAPP, FLOW_TYPE_WEB } from 'common/constants';
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
import SimulatorPanel from './SimulatorPanel';

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

const setShowSimulator = vi.fn();

const renderPanel = (props: any = {}) =>
  render(
    <MockedProvider mocks={mocks}>
      <SimulatorPanel setShowSimulator={setShowSimulator} {...props} />
    </MockedProvider>
  );

beforeEach(() => vi.clearAllMocks());

describe('tab gating (contract §13)', () => {
  test('an omnichannel flow enables both tabs', async () => {
    renderPanel({ flowType: 'MESSAGE' });

    await waitFor(() => {
      expect(screen.getByTestId(`simulatorTab-${CHANNEL_WHATSAPP}`)).not.toBeDisabled();
    });
    expect(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`)).not.toBeDisabled();
  });

  test('a WEB_MESSAGE flow disables the WhatsApp tab and says why on hover', async () => {
    renderPanel({ flowType: FLOW_TYPE_WEB });

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
    renderPanel({ flowType: FLOW_TYPE_WEB });

    await waitFor(() => {
      expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    });
  });

  test('an omnichannel flow opens on WhatsApp', async () => {
    renderPanel({ flowType: 'MESSAGE' });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('webSimulator')).not.toBeInTheDocument();
  });
});

describe('reset on tab switch (contract §13.4)', () => {
  test('switching asks for confirmation before wiping the transcript', async () => {
    renderPanel({ flowType: 'MESSAGE' });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`));

    expect(screen.getByTestId('simulatorSwitchConfirm')).toBeInTheDocument();
    // nothing switched yet — the confirm is what commits it
    expect(screen.queryByTestId('webSimulator')).not.toBeInTheDocument();
  });

  test('cancelling leaves the active tab alone', async () => {
    renderPanel({ flowType: 'MESSAGE' });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`));
    fireEvent.click(screen.getByTestId('cancel-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('simulatorSwitchConfirm')).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId('webSimulator')).not.toBeInTheDocument();
    expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
  });

  test('confirming clears the simulator and only then mounts the other tab', async () => {
    renderPanel({ flowType: 'MESSAGE' });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`simulatorTab-${CHANNEL_WEB}`));
    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('simulatorHeader')).not.toBeInTheDocument();
  });
});

describe('simulator contact allocation', () => {
  test('the panel allocates once and releases on close', async () => {
    renderPanel({ flowType: 'MESSAGE' });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorPanelClose')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('simulatorPanelClose'));

    await waitFor(() => {
      expect(setShowSimulator).toHaveBeenCalledWith(false);
    });
  });

  test('the WhatsApp tab does not render its own close button — the panel owns it', async () => {
    renderPanel({ flowType: 'MESSAGE' });

    await waitFor(() => {
      expect(screen.getByTestId('simulatorHeader')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('clearIcon')).not.toBeInTheDocument();
  });
});

describe('starting the flow', () => {
  test('the WhatsApp tab posts the keyword to the BSP callback exactly once', async () => {
    renderPanel({ flowType: 'MESSAGE', keyword: 'draft:a' });

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
    renderPanel({ flowType: FLOW_TYPE_WEB, keyword: 'draft:a' });

    await waitFor(() => {
      expect(screen.getByTestId('webSimulator')).toBeInTheDocument();
    });
    expect((axios as any).post).not.toHaveBeenCalled();
  });
});
