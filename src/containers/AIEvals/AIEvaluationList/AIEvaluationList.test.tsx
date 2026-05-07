import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { setErrorMessage, setNotification } from 'common/notification';
import { LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import {
  getEvaluationScoresEmptyTracesMock,
  getEvaluationScoresErrorMock,
  getEvaluationScoresFlatArrayMock,
  getEvaluationScoresInvalidJsonMock,
  getEvaluationScoresInvalidRowsMock,
  getEvaluationScoresMock,
  getEvaluationScoresNetworkErrorMock,
  getEvaluationScoresNullMock,
  getListAiEvaluationsAllStatusesMock,
  getListAiEvaluationsBothMetricsMock,
  getListAiEvaluationsInvalidResultsMock,
  getListAiEvaluationsWithItemsMock,
} from 'mocks/AIEvaluations';
import { AIEvaluationList } from './AIEvaluationList';

vi.mock('common/notification', () => ({
  setNotification: vi.fn(),
  setErrorMessage: vi.fn(),
}));

const emptyListMock = {
  request: { query: LIST_AI_EVALUATIONS },
  variableMatcher: () => true,
  result: { data: { aiEvaluations: [] } },
};

const renderComponent = (mocks: MockedResponse[] = [getListAiEvaluationsWithItemsMock], searchQuery?: string) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <AIEvaluationList searchQuery={searchQuery} />
      </MemoryRouter>
    </MockedProvider>
  );

describe('AIEvaluationList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all column headers', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Evaluation Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Cosine Similarity')).toBeInTheDocument();
      expect(screen.getByText('Completed at')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('renders evaluation names after data loads', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('failed-eval')).toBeInTheDocument();
      expect(screen.getByText('completed-eval')).toBeInTheDocument();
    });
  });

  it('shows empty state when no evaluations exist', async () => {
    renderComponent([emptyListMock]);
    await waitFor(() => {
      expect(screen.getByText(/There are no evaluations right now/i)).toBeInTheDocument();
    });
  });

  it('shows Failed and Completed status text', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('shows Running status text for running evaluation', async () => {
    renderComponent([getListAiEvaluationsAllStatusesMock]);
    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
    });
  });

  it('renders cosine similarity score for completed evaluation', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('0.85')).toBeInTheDocument();
    });
  });

  it('shows — dash for null metrics on failed evaluation', async () => {
    renderComponent();
    await waitFor(() => {
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  it('shows — for completed-at on non-completed rows', async () => {
    renderComponent();
    await waitFor(() => {
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  it('shows formatted date in completed-at for completed evaluation', async () => {
    renderComponent([getListAiEvaluationsBothMetricsMock]);
    await waitFor(() => {
      // completedEvaluationWithBothMetrics.updatedAt = '2026-01-04T02:00:00Z'
      expect(screen.getByText(/04\/01\/2026/)).toBeInTheDocument();
    });
  });

  it('renders without error when searchQuery prop is provided', async () => {
    renderComponent([getListAiEvaluationsWithItemsMock], 'test');
    await waitFor(() => {
      expect(screen.getByText('Evaluation Name')).toBeInTheDocument();
    });
  });

  it('shows Download Results button for every row', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getAllByText('Download Results')).toHaveLength(2);
    });
  });

  it('Download Results button for non-completed evaluation has disabled style', async () => {
    renderComponent();
    await waitFor(() => {
      const buttons = screen.getAllByText('Download Results');
      expect(buttons[0].className).toMatch(/DownloadCsvButtonDisabled/);
    });
  });

  it('Download Results button for completed evaluation has active style', async () => {
    renderComponent();
    await waitFor(() => {
      const buttons = screen.getAllByText('Download Results');
      expect(buttons[1].className).toMatch(/DownloadCsvButton/);
      expect(buttons[1].className).not.toMatch(/DownloadCsvButtonDisabled/);
    });
  });

  it('clicking Download Results on non-completed evaluation does not fire scores query', async () => {
    renderComponent([getListAiEvaluationsWithItemsMock]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[0]);

    await new Promise((r) => setTimeout(r, 100));
    expect(setNotification).not.toHaveBeenCalled();
    expect(setErrorMessage).not.toHaveBeenCalled();
  });

  it('Download Results button for running evaluation has disabled style', async () => {
    renderComponent([getListAiEvaluationsAllStatusesMock]);
    await waitFor(() => {
      const buttons = screen.getAllByText('Download Results');
      const runningButton = buttons.find((b) => b.className.includes('DownloadCsvButtonDisabled'));
      expect(runningButton).toBeTruthy();
    });
  });

  it('clicking Download Results on completed evaluation triggers file download', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const linkEl = originalCreateElement('a');
    const clickSpy = vi.spyOn(linkEl, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, ...args: any[]) => {
      if (tag === 'a') return linkEl;
      return originalCreateElement(tag, ...args);
    });

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    renderComponent([getListAiEvaluationsWithItemsMock, getEvaluationScoresMock('2')]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    vi.restoreAllMocks();
  });

  it('shows warning notification when scores field is null', async () => {
    renderComponent([getListAiEvaluationsWithItemsMock, getEvaluationScoresNullMock('2')]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('No scores available to download', 'warning');
    });
  });

  it('shows error when evaluationScores returns errors array', async () => {
    renderComponent([getListAiEvaluationsWithItemsMock, getEvaluationScoresErrorMock('2')]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalledWith('Evaluation scores not found');
    });
  });

  it('shows warning notification when traces array is empty', async () => {
    renderComponent([getListAiEvaluationsWithItemsMock, getEvaluationScoresEmptyTracesMock('2')]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('No scores available to download', 'warning');
    });
  });

  it('calls setErrorMessage on network error during download', async () => {
    renderComponent([getListAiEvaluationsWithItemsMock, getEvaluationScoresNetworkErrorMock('2')]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalled();
    });
  });

  it('renders — for metrics when results field is invalid JSON', async () => {
    renderComponent([getListAiEvaluationsInvalidResultsMock]);
    await waitFor(() => {
      expect(screen.getByText('bad-results-eval')).toBeInTheDocument();
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  it('triggers download when scores response is a flat array (no score.traces wrapper)', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const linkEl = originalCreateElement('a');
    const clickSpy = vi.spyOn(linkEl, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, ...args: any[]) => {
      if (tag === 'a') return linkEl;
      return originalCreateElement(tag, ...args);
    });
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    renderComponent([getListAiEvaluationsWithItemsMock, getEvaluationScoresFlatArrayMock('2')]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  it('shows warning when scores field is not valid JSON', async () => {
    renderComponent([getListAiEvaluationsWithItemsMock, getEvaluationScoresInvalidJsonMock('2')]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('Invalid scores data received', 'warning');
    });
  });

  it('shows warning when all trace rows are invalid and CSV is empty', async () => {
    renderComponent([getListAiEvaluationsWithItemsMock, getEvaluationScoresInvalidRowsMock('2')]);
    await waitFor(() => expect(screen.getAllByText('Download Results')).toHaveLength(2));

    fireEvent.click(screen.getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('No valid score rows to download', 'warning');
    });
  });

  it('renders assistant config name and version number as a link in name cell', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('failed-eval')).toBeInTheDocument();
    });
    const links = screen.getAllByTestId('assistantVersionLink');
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/assistants/45/version/1');
  });

  it('renders golden QA name and duplication factor in name cell', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('test_dataset | 2')).toBeInTheDocument();
      expect(screen.getByText('healthcare_dataset | 3')).toBeInTheDocument();
    });
  });

  it('does not render sub-info lines when all display fields are null', async () => {
    const nullFieldsMock = {
      request: { query: LIST_AI_EVALUATIONS },
      variableMatcher: () => true,
      result: {
        data: {
          aiEvaluations: [
            {
              id: '99',
              name: 'no-assoc-eval',
              status: 'FAILED',
              results: null,
              failureReason: null,
              goldenQaId: null,
              assistantConfigVersionId: null,
              goldenQaName: null,
              goldenQaDuplicationFactor: null,
              assistantConfigName: null,
              assistantConfigVersionNumber: null,
              assistantId: null,
              insertedAt: '2026-01-05T00:00:00Z',
              updatedAt: '2026-01-05T00:00:00Z',
            },
          ],
        },
      },
    };
    renderComponent([nullFieldsMock]);
    await waitFor(() => {
      expect(screen.getByText('no-assoc-eval')).toBeInTheDocument();
      expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\|/)).not.toBeInTheDocument();
    });
  });
});
