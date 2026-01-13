// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TrialVideoModal from './TrialVideoModal';

describe('<TrialVideoModal />', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  const getSessionData = (overrides = {}) => ({
    last_login_time: null,
    is_trial: true,
    trial_expiration_date: '2025-12-31T00:00:00Z',
    ...overrides,
  });

  it('should render modal when conditions are met (first login, trial account, not shown before)', () => {
    const sessionData = getSessionData();

    render(<TrialVideoModal sessionData={sessionData} />);

    // Modal should be visible
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Should have iframe with Canva embed
    const iframe = screen.getByTitle('Trial Welcome');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('canva.com'));

    // Should have CTA button
    const ctaButton = screen.getByText("Let's get Started");
    expect(ctaButton).toBeInTheDocument();

    // Should have close button
    const closeButton = screen.getByLabelText('close');
    expect(closeButton).toBeInTheDocument();
  });

  it('should NOT render modal if already shown in session', () => {
    sessionStorage.setItem('trial_video_shown', 'true');
    const sessionData = getSessionData();

    render(<TrialVideoModal sessionData={sessionData} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should NOT render modal for non-trial users', () => {
    const sessionData = getSessionData({ is_trial: false });

    render(<TrialVideoModal sessionData={sessionData} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should NOT render modal if not first login', () => {
    const sessionData = getSessionData({ last_login_time: '2025-12-20T10:00:00Z' });

    render(<TrialVideoModal sessionData={sessionData} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close modal when close button is clicked', async () => {
    const sessionData = getSessionData();

    render(<TrialVideoModal sessionData={sessionData} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
