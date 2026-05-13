import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import {
  getCountGoldenQaMock,
  getListGoldenQaMock,
  getOrgEvalAccessRequestApprovedMock,
  getOrgEvalAccessRequestNoneMock,
  getOrgEvalAccessRequestPendingMock,
} from 'mocks/AIEvaluations';
import { LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import AIEvalsPage from './AIEvalsPage';

const aiEvaluationsListMock = {
  request: { query: LIST_AI_EVALUATIONS },
  variableMatcher: () => true,
  result: { data: { aiEvaluations: [] } },
};

const defaultMocks = [
  getOrgEvalAccessRequestApprovedMock,
  aiEvaluationsListMock,
  getListGoldenQaMock,
  getCountGoldenQaMock,
];

const renderComponent = (mocks: any[] = defaultMocks) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={['/ai-evaluations']}>
        <Routes>
          <Route path="/ai-evaluations" element={<AIEvalsPage />} />
          <Route path="/ai-evaluations/intro" element={<div>Intro Page</div>} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

describe('AIEvalsPage', () => {
  it('renders page heading when access is approved', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('headerTitle')).toHaveTextContent('AI Evaluations');
    });
    expect(screen.getByText(/Run evaluations against/i)).toBeInTheDocument();
  });

  it('renders both tab buttons when access is approved', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'AI Evaluations' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Golden QA' })).toBeInTheDocument();
  });

  it('shows AI Evaluations list on the default tab', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Evaluation Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Cosine Similarity')).toBeInTheDocument();
    });
  });

  it('shows Create AI Evaluation button on AI Evaluations tab', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create AI Evaluation/i })).toBeInTheDocument();
    });
  });

  it('switches to Golden QA tab and shows list', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Golden QA' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Golden QA' }));
    expect(screen.getByText('Title')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Diabetescare-0101')).toBeInTheDocument();
    });
  });

  it('renders search bar in tab bar', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });
  });

  it('redirects to intro page when org has no access request', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, aiEvaluationsListMock]);
    await waitFor(() => {
      expect(screen.getByText('Intro Page')).toBeInTheDocument();
    });
  });

  it('redirects to intro page when access request is pending', async () => {
    renderComponent([getOrgEvalAccessRequestPendingMock, aiEvaluationsListMock]);
    await waitFor(() => {
      expect(screen.getByText('Intro Page')).toBeInTheDocument();
    });
  });

  it('does not redirect when access is approved', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByText('Intro Page')).not.toBeInTheDocument();
      expect(screen.getByTestId('headerTitle')).toBeInTheDocument();
    });
  });
});
