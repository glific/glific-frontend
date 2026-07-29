import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Analytics } from './Analytics';

vi.mock('@superset-ui/embedded-sdk', () => ({
  embedDashboard: vi.fn(),
}));

vi.mock('components/UI/Layout/Loading/Loading', () => ({
  Loading: () => <div data-testid="loading-spinner" />,
}));

vi.mock('components/UI/ErrorPage/ErrorPage', () => ({
  ErrorPage: ({ title, onRefresh }: { title: string; onRefresh?: () => void }) => (
    <div data-testid="error-page">
      <p>{title}</p>
      <button onClick={onRefresh ?? (() => window.location.reload())}>Refresh</button>
    </div>
  ),
}));

vi.mock('axios');

vi.mock('services/AuthService', () => ({
  getAuthSession: vi.fn(() => 'mock-access-token'),
}));

// Override the global setupTests mock so we can track calls
vi.mock('config/logs', () => ({
  default: vi.fn(),
}));

vi.mock('config', () => ({
  ANALYTICS_ENDPOINT: 'https://api.test/v1/get-embed-token',
  SUPERSET_DASHBOARD_ID: 'test-dashboard-id',
}));

vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('<Analytics />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading spinner while fetching token', async () => {
    let resolvePost: (val: any) => void;
    vi.mocked(axios.post).mockReturnValue(new Promise((res) => (resolvePost = res)) as any);

    render(<Analytics />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    resolvePost!({ data: { token: 'tok' } });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('embeds dashboard on successful token fetch', async () => {
    const { embedDashboard } = await import('@superset-ui/embedded-sdk');
    vi.mocked(axios.post).mockResolvedValue({ data: { token: 'test-embed-token' } });

    render(<Analytics />);

    await waitFor(() => {
      expect(embedDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-dashboard-id',
          supersetDomain: expect.any(String),
        })
      );
    });

    const callArgs = vi.mocked(embedDashboard).mock.calls[0][0];
    expect(typeof callArgs.fetchGuestToken).toBe('function');
  });

  it('fetchGuestToken returns a promise resolving to the token', async () => {
    const { embedDashboard } = await import('@superset-ui/embedded-sdk');
    vi.mocked(axios.post).mockResolvedValue({ data: { token: 'abc123' } });

    render(<Analytics />);

    await waitFor(() => {
      expect(embedDashboard).toHaveBeenCalled();
    });

    const callArgs = vi.mocked(embedDashboard).mock.calls[0][0];
    const token = await callArgs.fetchGuestToken();
    expect(token).toBe('abc123');
  });

  it('shows error UI when token fetch fails', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Network error'));

    render(<Analytics />);

    await screen.findByTestId('error-page');
    expect(screen.getByText('Unable to load the analytics dashboard.')).toBeInTheDocument();
  });

  it('calls setLogs with error severity when fetch fails', async () => {
    const setLogs = (await import('config/logs')).default;
    vi.mocked(axios.post).mockRejectedValue(new Error('Fetch failed'));

    render(<Analytics />);

    await waitFor(() => {
      expect(vi.mocked(setLogs)).toHaveBeenCalledWith('Fetch failed', 'error', true);
    });
  });

  it('clicking refresh button calls window.location.reload', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { reload: reloadMock },
    });

    vi.mocked(axios.post).mockRejectedValue(new Error('Network error'));

    render(<Analytics />);

    const refreshButton = await screen.findByRole('button', { name: 'Refresh' });
    await userEvent.click(refreshButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('re-fetches token when interval fires', async () => {
    let capturedCallback: (() => Promise<void>) | undefined;
    vi.spyOn(globalThis, 'setInterval').mockImplementation((cb: any) => {
      capturedCallback = cb;
      return 1 as any;
    });

    vi.mocked(axios.post).mockResolvedValue({ data: { token: 'tok' } });

    render(<Analytics />);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    expect(capturedCallback).toBeDefined();
    await capturedCallback!();

    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it('clears interval on unmount', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { token: 'tok' } });

    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = render(<Analytics />);

    await waitFor(() => {
      expect(setIntervalSpy).toHaveBeenCalled();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
