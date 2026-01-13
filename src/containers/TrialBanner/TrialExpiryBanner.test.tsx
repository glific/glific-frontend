import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import { TrialExpiryBanner } from './TrialExpiryBanner';
import { GET_ORGANIZATION_STATUS } from 'graphql/queries/Organization';

describe('TrialExpiryBanner', () => {
  const originalWindowOpen = window.open;
  const originalLocationHref = window.location.href;

  let mockWindowOpen: any;

  beforeEach(() => {
    mockWindowOpen = vi.fn();
    window.open = mockWindowOpen;

    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  afterEach(() => {
    window.open = originalWindowOpen;
    (window as any).location = { href: originalLocationHref };
    vi.clearAllMocks();
  });

  const createMockData = (daysRemaining: number, isTrialOrg = true, isSuspended = false) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysRemaining);

    return {
      request: {
        query: GET_ORGANIZATION_STATUS,
      },
      result: {
        data: {
          organization: {
            organization: {
              isTrialOrg,
              trialExpirationDate: futureDate.toISOString(),
              isSuspended,
              __typename: 'Organization',
            },
            __typename: 'OrganizationResult',
          },
        },
      },
    };
  };

  describe('Banner Visibility', () => {
    it('should not render when not a trial organization', async () => {
      const mocks = [createMockData(5, false)];

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should not render when organization is suspended', async () => {
      const mocks = [createMockData(5, true, true)];

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should not render when more than 7 days remaining', async () => {
      const mocks = [createMockData(8)];

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should render when 7 days remaining', async () => {
      const mocks = [createMockData(7)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        const trialBadges = screen.getAllByText('TRIAL');
        expect(trialBadges.length).toBeGreaterThan(0);
      });
    });

    it('should render when 1 day remaining', async () => {
      const mocks = [createMockData(1)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Expiring soon!')).toBeInTheDocument();
      });
    });
  });

  describe('Normal State (3+ days)', () => {
    it('should display normal banner with correct text', async () => {
      const mocks = [createMockData(5)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Click for options')).toBeInTheDocument();
      });
    });
  });

  describe('Urgent State (2 days or less)', () => {
    it('should display urgent banner for 2 days', async () => {
      const mocks = [createMockData(2)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Expiring soon!')).toBeInTheDocument();
      });
    });

    it('should display urgent banner for 1 day', async () => {
      const mocks = [createMockData(1)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Expiring soon!')).toBeInTheDocument();
      });
    });
  });

  describe('Expand/Collapse', () => {
    it('should expand when clicked', async () => {
      const mocks = [createMockData(5)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Click for options')).toBeInTheDocument();
      });

      const collapsedBanner = screen.getByText('Click for options').closest('div');
      if (collapsedBanner?.parentElement) {
        fireEvent.click(collapsedBanner.parentElement);
      }

      await waitFor(() => {
        expect(screen.getByText('Get Support')).toBeInTheDocument();
        expect(screen.getByText('Schedule Call')).toBeInTheDocument();
      });
    });

    it('should collapse when close button clicked', async () => {
      const mocks = [createMockData(5)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Click for options')).toBeInTheDocument();
      });

      const collapsedBanner = screen.getByText('Click for options').closest('div');
      if (collapsedBanner?.parentElement) {
        fireEvent.click(collapsedBanner.parentElement);
      }

      await waitFor(() => {
        expect(screen.getByText('Get Support')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('collapse banner');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.getByText('Click for options')).toBeInTheDocument();
      });
    });
  });

  describe('Button Actions', () => {
    it('should trigger email when Get Support clicked', async () => {
      const mocks = [createMockData(5)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Click for options')).toBeInTheDocument();
      });

      const collapsedBanner = screen.getByText('Click for options').closest('div');
      if (collapsedBanner?.parentElement) {
        fireEvent.click(collapsedBanner.parentElement);
      }

      await waitFor(() => {
        expect(screen.getByText('Get Support')).toBeInTheDocument();
      });

      const supportButton = screen.getByText('Get Support');
      fireEvent.click(supportButton);

      expect(window.location.href).toBe('mailto:connect@glific.org?subject=Glific Trial Support');
    });

    it('should open calendar when Schedule Call clicked', async () => {
      const mocks = [createMockData(5)];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Click for options')).toBeInTheDocument();
      });

      const collapsedBanner = screen.getByText('Click for options').closest('div');
      if (collapsedBanner?.parentElement) {
        fireEvent.click(collapsedBanner.parentElement);
      }

      await waitFor(() => {
        expect(screen.getByText('Schedule Call')).toBeInTheDocument();
      });

      const scheduleButton = screen.getByText('Schedule Call');
      fireEvent.click(scheduleButton);

      expect(mockWindowOpen).toHaveBeenCalledWith('https://calendar.app.google/USJMfhSsDvW5yS6B7', '_blank');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing expiration date', async () => {
      const mocks = [
        {
          request: {
            query: GET_ORGANIZATION_STATUS,
          },
          result: {
            data: {
              organization: {
                organization: {
                  isTrialOrg: true,
                  trialExpirationDate: null,
                  isSuspended: false,
                },
              },
            },
          },
        },
      ];

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should handle error state', async () => {
      const mocks = [
        {
          request: {
            query: GET_ORGANIZATION_STATUS,
          },
          error: new Error('Network error'),
        },
      ];

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TrialExpiryBanner />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });
});
