import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { GET_ASSISTANT_VERSIONS } from 'graphql/queries/Assistant';
import { mockVersions } from 'mocks/Assistants';
import { VersionPanel } from './VersionPanel';

const getVersionsMock = (assistantId: string, versions = mockVersions) => ({
  request: {
    query: GET_ASSISTANT_VERSIONS,
    variables: { assistantId },
  },
  result: {
    data: { assistantVersions: versions },
  },
});

const defaultProps = {
  assistantId: '1',
  selectedVersionId: null,
  onSelectVersion: vi.fn(),
  onRefetchSelect: vi.fn(),
  refetchTrigger: 0,
};

const renderVersionPanel = (props = {}, mocks = [getVersionsMock('1')]) =>
  render(
    <MockedProvider mocks={mocks}>
      <VersionPanel {...defaultProps} {...props} />
    </MockedProvider>
  );

describe('VersionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders version cards after loading', async () => {
    renderVersionPanel();

    await waitFor(() => {
      expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
    });
  });

  it('renders versions sorted in descending order (latest first)', async () => {
    renderVersionPanel();

    await waitFor(() => {
      const cards = screen.getAllByTestId('versionCard');
      expect(cards[0]).toHaveTextContent('Version 2');
      expect(cards[1]).toHaveTextContent('Version 1');
    });
  });

  it('shows LIVE badge on the live version', async () => {
    renderVersionPanel();

    await waitFor(() => {
      expect(screen.getByTestId('liveBadge')).toBeInTheDocument();
    });
  });

  it('shows in_progress status chip correctly', async () => {
    const versionsWithInProgress = [{ ...mockVersions[0], status: 'in_progress' }];
    renderVersionPanel({}, [getVersionsMock('1', versionsWithInProgress)]);

    await waitFor(() => {
      expect(screen.getByTestId('versionStatus')).toHaveTextContent('In Progress');
    });
  });

  it('does not show status chip for ready status', async () => {
    const versionsWithReady = [{ ...mockVersions[0], status: 'ready' }];
    renderVersionPanel({}, [getVersionsMock('1', versionsWithReady)]);

    await waitFor(() => {
      expect(screen.getAllByTestId('versionCard')).toHaveLength(1);
    });

    expect(screen.queryByTestId('versionStatus')).not.toBeInTheDocument();
  });

  it('shows failed status chip correctly', async () => {
    const versionsWithFailed = [{ ...mockVersions[0], status: 'failed' }];
    renderVersionPanel({}, [getVersionsMock('1', versionsWithFailed)]);

    await waitFor(() => {
      expect(screen.getByTestId('versionStatus')).toHaveTextContent('Failed');
    });
  });

  it('shows empty state when no versions exist', async () => {
    renderVersionPanel({}, [getVersionsMock('1', [])]);

    await waitFor(() => {
      expect(screen.getByText('No versions found')).toBeInTheDocument();
    });
  });

  it('calls onSelectVersion when a version card is clicked', async () => {
    const onSelectVersion = vi.fn();
    renderVersionPanel({ onSelectVersion });

    await waitFor(() => {
      expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByTestId('versionCard')[0]);
    expect(onSelectVersion).toHaveBeenCalledWith(mockVersions[1]);
  });

  it('auto-selects the live version on initial load', async () => {
    const onSelectVersion = vi.fn();
    renderVersionPanel({ onSelectVersion });

    await waitFor(() => {
      expect(onSelectVersion).toHaveBeenCalledWith(expect.objectContaining({ id: 'v1', isLive: true }));
    });
  });

  it('auto-selects the latest version when no live version exists', async () => {
    const versionsNoLive = mockVersions.map((v) => ({ ...v, isLive: false }));
    const onSelectVersion = vi.fn();
    renderVersionPanel({ onSelectVersion }, [getVersionsMock('1', versionsNoLive)]);

    await waitFor(() => {
      expect(onSelectVersion).toHaveBeenCalledWith(expect.objectContaining({ id: 'v2', versionNumber: 2 }));
    });
  });

  it('highlights the selected version card', async () => {
    renderVersionPanel({ selectedVersionId: 'v1' });

    await waitFor(() => {
      const cards = screen.getAllByTestId('versionCard');
      const selectedCard = cards.find((c) => c.classList.toString().includes('Selected'));
      expect(selectedCard).toBeInTheDocument();
    });
  });

  it('displays model name on each version card', async () => {
    renderVersionPanel();

    await waitFor(() => {
      expect(screen.getByText('gpt-4o')).toBeInTheDocument();
      expect(screen.getByText('gpt-4o-mini')).toBeInTheDocument();
    });
  });

  it('displays description when present', async () => {
    renderVersionPanel();

    await waitFor(() => {
      expect(screen.getByText(/Initial version/)).toBeInTheDocument();
    });
  });
});
