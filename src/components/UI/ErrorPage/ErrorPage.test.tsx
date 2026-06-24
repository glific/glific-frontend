import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorPage } from './ErrorPage';

vi.mock('i18next', () => ({ t: (key: string) => key }));

vi.mock('assets/images/GlificError.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="glific-error-icon" {...props} />,
}));

vi.mock('components/UI/Form/Button/Button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe('<ErrorPage />', () => {
  it('renders the error icon', () => {
    render(<ErrorPage title="Something went wrong." />);
    expect(screen.getByTestId('glific-error-icon')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<ErrorPage title="Unable to load the analytics dashboard." />);
    expect(screen.getByText('Unable to load the analytics dashboard.')).toBeInTheDocument();
  });

  it('renders the subtitle hint text', () => {
    render(<ErrorPage title="Something went wrong." />);
    expect(screen.getByText('Click refresh to try again or contact our support team for help')).toBeInTheDocument();
  });

  it('renders a Refresh button', () => {
    render(<ErrorPage title="Something went wrong." />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('calls window.location.reload when no onRefresh prop is provided', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { reload: reloadMock },
    });

    render(<ErrorPage title="Something went wrong." />);
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('calls onRefresh prop when provided instead of window.location.reload', async () => {
    const onRefresh = vi.fn();
    render(<ErrorPage title="Something went wrong." onRefresh={onRefresh} />);

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
