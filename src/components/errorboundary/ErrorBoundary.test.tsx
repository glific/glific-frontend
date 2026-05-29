import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const mockedUsedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUsedNavigate,
}));

let shouldThrow = true;
const ThrowingChild = () => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="recovered-child">Recovered</div>;
};

const renderWithError = () => {
  shouldThrow = true;
  return render(
    <MemoryRouter>
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    </MemoryRouter>
  );
};

describe('ErrorBoundary', () => {
  // suppress the expected error log from React when the child throws
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  test('renders the fallback UI with Retry and Close buttons when a child throws', async () => {
    const { getByTestId, getByText } = renderWithError();

    await waitFor(() => {
      expect(getByTestId('errorMessage')).toBeInTheDocument();
    });
    expect(getByText('Retry')).toBeInTheDocument();
    expect(getByText('Close')).toBeInTheDocument();
  });

  test('Close button navigates to /chat and dismisses the dialog', async () => {
    const { getByTestId, queryByTestId } = renderWithError();

    await waitFor(() => {
      expect(getByTestId('ok-button')).toBeInTheDocument();
    });

    // simulate route change: the throwing child would unmount, so future renders shouldn't throw
    shouldThrow = false;
    fireEvent.click(getByTestId('ok-button'));

    expect(mockedUsedNavigate).toHaveBeenCalledWith('/chat');
    await waitFor(() => {
      expect(queryByTestId('errorMessage')).not.toBeInTheDocument();
    });
  });

  test('Retry button reloads the page', async () => {
    const reloadMock = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });

    const { getByTestId } = renderWithError();

    await waitFor(() => {
      expect(getByTestId('cancel-button')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('cancel-button'));

    expect(reloadMock).toHaveBeenCalled();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});
