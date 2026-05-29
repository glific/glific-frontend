import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NEW_DOMAIN, OLD_DOMAIN } from 'common/constants';

const mockPosthogInit = vi.hoisted(() => vi.fn());
const mockCreateRoot = vi.hoisted(() => vi.fn());
const configValues = vi.hoisted(() => ({
  POSTHOG_PROJECT_TOKEN: '' as string | undefined,
  POSTHOG_HOST: 'https://us.i.posthog.com',
}));

vi.mock('./sentry.config', () => ({}));
vi.mock('posthog-js', () => ({ default: { init: mockPosthogInit } }));
vi.mock('@posthog/react', () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="posthog-provider">{children}</div>
  ),
}));
vi.mock('App', () => ({ default: () => <div data-testid="mock-app">App</div> }));
vi.mock('config', () => ({
  get POSTHOG_PROJECT_TOKEN() {
    return configValues.POSTHOG_PROJECT_TOKEN;
  },
  get POSTHOG_HOST() {
    return configValues.POSTHOG_HOST;
  },
}));
vi.mock('react-dom/client', async () => {
  const actual = await vi.importActual<typeof import('react-dom/client')>('react-dom/client');
  mockCreateRoot.mockImplementation(actual.createRoot);
  return { createRoot: mockCreateRoot };
});

const setWindowLocation = (hostname: string, pathname = '/') => {
  Object.defineProperty(window, 'location', {
    value: { hostname, pathname, host: hostname, protocol: 'https:' },
    writable: true,
    configurable: true,
  });
};

const loadIndex = async () => {
  vi.resetModules();
  await act(async () => {
    await import('./index');
  });
};

describe('index', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    configValues.POSTHOG_PROJECT_TOKEN = '';
    configValues.POSTHOG_HOST = 'https://us.i.posthog.com';
    mockCreateRoot.mockClear();
    mockPosthogInit.mockClear();
    mockPosthogInit.mockReset();
    setWindowLocation('glific.test');
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('redirects hostnames on the old domain', async () => {
    const locationMock = {
      hostname: `app.${OLD_DOMAIN}`,
      pathname: '/login',
      host: `app.${OLD_DOMAIN}`,
      protocol: 'https:',
    };
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
      configurable: true,
    });

    await loadIndex();

    expect(locationMock.hostname).toBe(`app.${NEW_DOMAIN}/login`);
    expect(mockCreateRoot).not.toHaveBeenCalled();
  });

  it('mounts the app into the root element', async () => {
    await loadIndex();

    expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(await screen.findByTestId('mock-app')).toBeInTheDocument();
  });

  it('initializes PostHog and wraps the app when init succeeds', async () => {
    configValues.POSTHOG_PROJECT_TOKEN = 'phc_test_token';

    await loadIndex();

    expect(mockPosthogInit).toHaveBeenCalledWith('phc_test_token', {
      api_host: configValues.POSTHOG_HOST,
      defaults: '2026-01-30',
      capture_performance: { web_vitals: true },
    });
    expect(screen.getByTestId('posthog-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-app')).toBeInTheDocument();
  });

  it('renders without PostHog provider when init fails', async () => {
    configValues.POSTHOG_PROJECT_TOKEN = 'phc_test_token';
    mockPosthogInit.mockImplementation(() => {
      throw new Error('PostHog init failed');
    });

    await loadIndex();

    expect(mockPosthogInit).toHaveBeenCalled();
    expect(screen.queryByTestId('posthog-provider')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-app')).toBeInTheDocument();
  });

  it('renders without PostHog provider when no project token is configured', async () => {
    await loadIndex();

    expect(mockPosthogInit).not.toHaveBeenCalled();
    expect(screen.queryByTestId('posthog-provider')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-app')).toBeInTheDocument();
  });
});
