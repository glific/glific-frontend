import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import { apiClient } from 'services/apiClient';
import { Logout } from './Logout';
import { MockedProvider } from '@apollo/client/testing';
import { ORG_EVAL_ACCESS_CACHE_KEY } from 'containers/AIEvals/orgEvalAccessCache';

const { mockPosthogCapture, mockPosthogReset } = vi.hoisted(() => ({
  mockPosthogCapture: vi.fn(),
  mockPosthogReset: vi.fn(),
}));

// logout now goes through the shared apiClient (with `skipAuth`), not bare axios
vi.mock('services/apiClient', () => ({
  apiClient: { delete: vi.fn() },
}));
vi.mock('@posthog/react', () => ({
  usePostHog: () => ({
    capture: mockPosthogCapture,
    reset: mockPosthogReset,
  }),
}));

const mockedApiClient = apiClient as any;

describe('<Logout />', () => {
  const originalLocation = window.location;
  let locationReplaceMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockedApiClient.delete.mockResolvedValue({});
    locationReplaceMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, replace: locationReplaceMock },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  test('it should logout user', async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </MockedProvider>
    );
  });

  test('it should render component and click login', async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const button = screen.getByTestId('ok-button');
      fireEvent.click(button);
    });
  });

  test('it should clear org eval access request key from local storage on logout', async () => {
    localStorage.setItem(ORG_EVAL_ACCESS_CACHE_KEY, JSON.stringify({ status: 'pending' }));

    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const button = screen.getByTestId('ok-button');
      fireEvent.click(button);
    });

    expect(localStorage.getItem(ORG_EVAL_ACCESS_CACHE_KEY)).toBeNull();
  });

  test('completes delete session action before navigating to login page', async () => {
    let resolveDeleteRequest: (value: unknown) => void = () => {};
    mockedApiClient.delete.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDeleteRequest = resolve;
        })
    );

    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('ok-button'));

    expect(mockedApiClient.delete).toHaveBeenCalledTimes(1);
    expect(locationReplaceMock).not.toHaveBeenCalled();

    resolveDeleteRequest({});

    await waitFor(() => {
      expect(locationReplaceMock).toHaveBeenCalledWith('/login');
    });
  });

  test('tracks logout in posthog before redirect', async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('ok-button'));
    });

    await waitFor(() => {
      expect(mockPosthogCapture).toHaveBeenCalledWith('user_logged_out');
      expect(mockPosthogReset).toHaveBeenCalled();
      expect(locationReplaceMock).toHaveBeenCalledWith('/login');
    });
  });

  test('redirects to login with window.location.replace on user-initiated logout', async () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/logout/user']}>
          <Routes>
            <Route path="/logout/:mode" element={<Logout />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(locationReplaceMock).toHaveBeenCalledWith('/login');
    });
  });
});
