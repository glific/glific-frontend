import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TrialBanner } from './TrialBanner';

describe('TrialBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-12T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when isTrial is false', () => {
    const { container } = render(<TrialBanner trialExpirationDate="2026-01-15 05:16:24" isTrial={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when trialExpirationDate is null', () => {
    const { container } = render(<TrialBanner trialExpirationDate={null} isTrial={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render with correct message for 0 days remaining', () => {
    render(<TrialBanner trialExpirationDate="2026-01-12 23:59:59" isTrial={true} />);

    expect(
      screen.getByText(
        "Your Glific trial ends today. Get support if you're stuck, or schedule a call to purchase your own account"
      )
    ).toBeInTheDocument();
  });

  it('should render with correct message for 1 day remaining', () => {
    render(<TrialBanner trialExpirationDate="2026-01-13 23:59:59" isTrial={true} />);

    expect(
      screen.getByText(
        "Your Glific trial ends in 1 day. Get support if you're stuck, or schedule a call to purchase your own account"
      )
    ).toBeInTheDocument();
  });

  it('should render with correct message for multiple days remaining', () => {
    render(<TrialBanner trialExpirationDate="2026-01-16 23:59:59" isTrial={true} />);

    expect(
      screen.getByText(
        "Your Glific trial ends in 4 days. Get support if you're stuck, or schedule a call to purchase your own account"
      )
    ).toBeInTheDocument();
  });
});
