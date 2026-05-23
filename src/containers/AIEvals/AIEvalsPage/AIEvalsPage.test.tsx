import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

vi.mock('i18next', () => ({ t: (key: string) => key }));

import { ORG_EVAL_ACCESS_CACHE_KEY } from 'containers/AIEvals/orgEvalAccessCache';
import { LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import {
  getCountGoldenQaMock,
  getListGoldenQaMock,
  getOrgEvalAccessRequestApprovedMock,
  getOrgEvalAccessRequestErrorMock,
  getOrgEvalAccessRequestLoadingMock,
  getOrgEvalAccessRequestNoneMock,
  getOrgEvalAccessRequestPendingMock,
} from 'mocks/AIEvaluations';
import * as AuthService from 'services/AuthService';
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

const mocksWithoutAccessQuery = [aiEvaluationsListMock, getListGoldenQaMock, getCountGoldenQaMock];

describe('AIEvalsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('shows full-screen loading while the access check query is loading', () => {
    renderComponent([getOrgEvalAccessRequestLoadingMock]);
    expect(screen.getByTestId('orgEvalAccessGateLoading')).toBeInTheDocument();
  });

  it('shows full-screen error when the access check query fails', async () => {
    renderComponent([getOrgEvalAccessRequestErrorMock]);
    expect(await screen.findByTestId('orgEvalAccessGateError')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Something went wrong while checking your AI Evaluations access. Please refresh the page or try again.'
      )
    ).toBeInTheDocument();
  });

  it('renders the page when access is approved in localStorage without the access query mock', async () => {
    vi.spyOn(AuthService, 'getUserSession').mockImplementation((key?: string) => {
      if (key === 'organizationId') {
        return 'org-page-1';
      }
      return null;
    });
    localStorage.setItem(
      ORG_EVAL_ACCESS_CACHE_KEY,
      JSON.stringify({ organizationId: 'org-page-1', status: 'approved' })
    );

    renderComponent(mocksWithoutAccessQuery);

    await waitFor(() => {
      expect(screen.getByTestId('headerTitle')).toHaveTextContent('AI Evaluations');
    });
    expect(screen.queryByTestId('orgEvalAccessGateLoading')).not.toBeInTheDocument();
  });
});
