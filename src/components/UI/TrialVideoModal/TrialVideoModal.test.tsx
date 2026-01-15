// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TrialVideoModal from './TrialVideoModal';

interface SessionData {
  last_login_time: string | null;
  is_trial: boolean;
  trial_expiration_date: string | null;
}

describe('<TrialVideoModal />', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  const getSessionData = (overrides = {}): SessionData => ({
    last_login_time: null,
    is_trial: true,
    trial_expiration_date: '2025-12-31T00:00:00Z',
    ...overrides,
  });

  const renderTrialVideoModal = (sessionData: SessionData | null) =>
    render(<TrialVideoModal sessionData={sessionData} />);

  it('should render modal when conditions are met (first login, trial account, not shown before)', () => {
    const sessionData = getSessionData();
    renderTrialVideoModal(sessionData);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    const iframe = screen.getByTitle('Trial Welcome');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('canva.com'));

    const ctaButton = screen.getByText("Let's get Started");
    expect(ctaButton).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close trial welcome video');
    expect(closeButton).toBeInTheDocument();
  });

  it('should NOT render modal if already shown in session', () => {
    sessionStorage.setItem('trial_video_shown', 'true');
    const sessionData = getSessionData();

    renderTrialVideoModal(sessionData);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should NOT render modal for non-trial users', () => {
    const sessionData = getSessionData({ is_trial: false });

    renderTrialVideoModal(sessionData);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should NOT render modal if not first login', () => {
    const sessionData = getSessionData({ last_login_time: '2025-12-20T10:00:00Z' });

    renderTrialVideoModal(sessionData);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should NOT render modal if sessionData is null', () => {
    renderTrialVideoModal(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close modal when close button is clicked', async () => {
    const sessionData = getSessionData();
    renderTrialVideoModal(sessionData);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close trial welcome video');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close modal when CTA button is clicked', async () => {
    const sessionData = getSessionData();
    renderTrialVideoModal(sessionData);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const ctaButton = screen.getByText("Let's get Started");
    fireEvent.click(ctaButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should set sessionStorage flag when modal is shown', () => {
    const sessionData = getSessionData();
    renderTrialVideoModal(sessionData);

    expect(sessionStorage.getItem('trial_video_shown')).toBe('true');
  });

  it('should handle all conditions together correctly', () => {
    const sessionData = getSessionData({
      last_login_time: '2025-12-20T10:00:00Z',
      is_trial: false,
    });

    renderTrialVideoModal(sessionData);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
