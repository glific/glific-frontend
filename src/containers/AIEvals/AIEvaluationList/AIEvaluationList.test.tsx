import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';

import {
  completedEvaluationFlatFormat,
  completedEvaluationSummaryScores,
  failedEvaluation,
  getListAiEvaluationsWithDataMock,
  runningEvaluation,
} from 'mocks/AIEvaluations';
import { LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import { AIEvaluationList } from './AIEvaluationList';

const emptyListMock = {
  request: { query: LIST_AI_EVALUATIONS },
  variableMatcher: () => true,
  result: { data: { aiEvaluations: [] } },
};

const renderList = (mocks: any[] = [emptyListMock]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/ai-evaluations']}>
        <Routes>
          <Route path="/ai-evaluations" element={<AIEvaluationList />} />
          <Route path="/ai-evaluations/create" element={<div>Create Page</div>} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

describe('AIEvaluationList', () => {
  test('renders all column headers', async () => {
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Evaluation Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Cosine Similarity')).toBeInTheDocument();
      expect(screen.getByText('LLM-as-judge')).toBeInTheDocument();
      expect(screen.getByText('Completed at')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  test('renders Create New Evaluation button without a duplicate + prefix', async () => {
    renderList();

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Create New Evaluation/i });
      expect(button).toBeInTheDocument();
      expect(button.textContent).not.toMatch(/^\+\s*\+/);
    });
  });

  test('shows evaluation name and Completed status badge', async () => {
    renderList([getListAiEvaluationsWithDataMock([completedEvaluationSummaryScores])]);

    await waitFor(() => {
      expect(screen.getByText('Cosine Test')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  test('shows cosine similarity avg from summary_scores as percentage', async () => {
    renderList([getListAiEvaluationsWithDataMock([completedEvaluationSummaryScores])]);

    await waitFor(() => {
      expect(screen.getByText('10.0%')).toBeInTheDocument();
    });
  });

  test('shows LLM-as-judge avg from summary_scores as percentage', async () => {
    renderList([getListAiEvaluationsWithDataMock([completedEvaluationSummaryScores])]);

    await waitFor(() => {
      expect(screen.getByText('80.0%')).toBeInTheDocument();
    });
  });

  test('shows — for metrics when results are null', async () => {
    renderList([getListAiEvaluationsWithDataMock([runningEvaluation])]);

    await waitFor(() => {
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('shows Running badge for running evaluations', async () => {
    renderList([getListAiEvaluationsWithDataMock([runningEvaluation])]);

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
    });
  });

  test('shows Failed badge for failed evaluations', async () => {
    renderList([getListAiEvaluationsWithDataMock([failedEvaluation])]);

    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  test('shows — for Completed at when evaluation is not completed', async () => {
    renderList([getListAiEvaluationsWithDataMock([runningEvaluation])]);

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('shows formatted date in Completed at column for completed evaluations', async () => {
    renderList([getListAiEvaluationsWithDataMock([completedEvaluationSummaryScores])]);

    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
      // Completed at cell should show a date string, not a dash
      const allText = document.body.textContent ?? '';
      expect(allText).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  test('falls back to flat cosine_similarity field when summary_scores is absent', async () => {
    renderList([getListAiEvaluationsWithDataMock([completedEvaluationFlatFormat])]);

    await waitFor(() => {
      expect(screen.getByText('75.0%')).toBeInTheDocument();
      expect(screen.getByText('60.0%')).toBeInTheDocument();
    });
  });

  test('renders multiple evaluations in the list', async () => {
    renderList([
      getListAiEvaluationsWithDataMock([
        completedEvaluationSummaryScores,
        runningEvaluation,
        failedEvaluation,
      ]),
    ]);

    await waitFor(() => {
      expect(screen.getByText('Cosine Test')).toBeInTheDocument();
      expect(screen.getByText('Running Eval')).toBeInTheDocument();
      expect(screen.getByText('Failed Eval')).toBeInTheDocument();
    });
  });
});
