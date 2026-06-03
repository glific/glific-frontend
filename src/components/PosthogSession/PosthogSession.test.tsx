import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as AuthService from 'services/AuthService';
import * as PostHogService from 'services/PostHogService';

import { PosthogSession } from './PosthogSession';

const { mockSetupFromStoredSession } = vi.hoisted(() => ({
  mockSetupFromStoredSession: vi.fn(),
}));

vi.mock('@posthog/react', () => ({
  usePostHog: () => ({ identify: vi.fn(), group: vi.fn() }),
}));

vi.mock('services/PostHogService', async (importOriginal) => {
  const actual = await importOriginal<typeof PostHogService>();
  return {
    ...actual,
    setupPostHogFromStoredSession: mockSetupFromStoredSession,
  };
});

describe('PosthogSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not sync when user is not authenticated', () => {
    vi.spyOn(AuthService, 'getAuthSession').mockReturnValue(null);

    render(<PosthogSession />);

    expect(mockSetupFromStoredSession).not.toHaveBeenCalled();
  });

  it('syncs PostHog groups when an auth token exists', () => {
    vi.spyOn(AuthService, 'getAuthSession').mockReturnValue('token-abc');

    render(<PosthogSession />);

    expect(mockSetupFromStoredSession).toHaveBeenCalledTimes(1);
    expect(mockSetupFromStoredSession).toHaveBeenCalledWith(
      expect.objectContaining({ identify: expect.any(Function), group: expect.any(Function) })
    );
  });
});
