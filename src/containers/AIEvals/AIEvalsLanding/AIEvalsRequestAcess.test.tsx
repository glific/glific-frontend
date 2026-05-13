import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import { setErrorMessage, setNotification } from 'common/notification';

vi.mock('i18next', () => ({ t: (key: string) => key }));

import { ORG_EVAL_ACCESS_CACHE_KEY } from 'containers/AIEvals/orgEvalAccessCache';
import {
  getOrgEvalAccessRequestApprovedMock,
  getOrgEvalAccessRequestErrorMock,
  getOrgEvalAccessRequestLoadingMock,
  getOrgEvalAccessRequestNoneMock,
  getOrgEvalAccessRequestPendingMock,
  requestAiEvaluationAccessApiErrorMock,
  requestAiEvaluationAccessNetworkErrorMock,
  requestAiEvaluationAccessSuccessMock,
} from 'mocks/AIEvaluations';
import * as AuthService from 'services/AuthService';
import AIEvalsRequestAcess from './AIEvalsRequestAcess';

vi.mock('common/notification', () => ({
  setNotification: vi.fn(),
  setErrorMessage: vi.fn(),
}));

const renderComponent = (mocks: any[] = [getOrgEvalAccessRequestNoneMock]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <AIEvalsRequestAcess />
      </MemoryRouter>
    </MockedProvider>
  );

describe('AIEvalsRequestAcess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the New Feature badge', async () => {
    renderComponent();
    expect(await screen.findByText('New Feature')).toBeInTheDocument();
  });

  it('renders the page title', async () => {
    renderComponent();
    expect(await screen.findByRole('heading', { name: 'AI Evaluations', level: 1 })).toBeInTheDocument();
  });

  it('renders the description text', async () => {
    renderComponent();
    expect(
      await screen.findByText(/AI Evaluations is the process to determine objectively/i)
    ).toBeInTheDocument();
  });

  it('renders the Why Use Evals section heading', async () => {
    renderComponent();
    expect(await screen.findByRole('heading', { name: 'Why Use Evals?', level: 2 })).toBeInTheDocument();
  });

  it('renders all 7 benefit items', async () => {
    renderComponent();
    await screen.findByText('New Feature');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(7);
  });

  it('renders each benefit item with its number', async () => {
    renderComponent();
    await screen.findByText('New Feature');
    ['1.', '2.', '3.', '4.', '5.', '6.', '7.'].forEach((num) => {
      expect(screen.getByText(num)).toBeInTheDocument();
    });
  });

  it('renders the first benefit text with "Improve answers" in bold', async () => {
    renderComponent();
    await screen.findByText('New Feature');
    const bold = screen.getByText('Improve answers');
    expect(bold.tagName).toBe('STRONG');
    expect(bold.closest('span')).toHaveTextContent(
      'Improve answers on critical topics like health, safety, rights, and legal queries.'
    );
  });

  it('renders the last benefit text', async () => {
    renderComponent();
    expect(await screen.findByText(/Lower legal and compliance risks/i)).toBeInTheDocument();
  });

  // ── Right panel static content ───────────────────────────────────────────────

  it('renders the CTA heading', async () => {
    renderComponent();
    expect(await screen.findByRole('heading', { name: 'Set up your NGO on Evals', level: 2 })).toBeInTheDocument();
  });

  it('renders the CTA subtitle', async () => {
    renderComponent();
    expect(await screen.findByText(/Make your NGO chatbot smarter, safer/i)).toBeInTheDocument();
  });

  it('renders the laptop mockup with Intro to AI Evals card', async () => {
    renderComponent();
    expect(await screen.findByText('Intro to')).toBeInTheDocument();
    expect(screen.getByText('AI Evals')).toBeInTheDocument();
  });

  it('renders the Glific badge inside the mockup', async () => {
    renderComponent();
    expect(await screen.findByText('Glific')).toBeInTheDocument();
  });

  it('renders the help text below the mockup', async () => {
    renderComponent();
    expect(
      await screen.findByText(/Apply for access and tell us what functionality/i)
    ).toBeInTheDocument();
  });

  it('redirects to main AI Evaluations when access is already approved', async () => {
    render(
      <MockedProvider mocks={[getOrgEvalAccessRequestApprovedMock]} addTypename={false}>
        <MemoryRouter initialEntries={['/ai-evaluations/intro']}>
          <Routes>
            <Route path="/ai-evaluations/intro" element={<AIEvalsRequestAcess />} />
            <Route path="/ai-evaluations" element={<div>AI Evaluations main</div>} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('AI Evaluations main')).toBeInTheDocument();
    });
  });

  it('shows Request Access button when org has not yet requested', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock]);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).toBeInTheDocument();
    });
  });

  it('button is enabled when org has not yet requested', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock]);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });
  });

  it('shows Request Pending and disables button when org already has a pending request', async () => {
    renderComponent([getOrgEvalAccessRequestPendingMock]);
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Request Pending' });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });
  });

  it('shows full-screen loading while the access check query is loading', () => {
    renderComponent([getOrgEvalAccessRequestLoadingMock]);
    expect(screen.getByTestId('orgEvalAccessGateLoading')).toBeInTheDocument();
    expect(screen.queryByText('New Feature')).not.toBeInTheDocument();
  });

  it('shows full-screen error when the access check query fails', async () => {
    renderComponent([getOrgEvalAccessRequestErrorMock]);
    expect(await screen.findByTestId('orgEvalAccessGateError')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Something went wrong while checking your AI Evaluations access. Please refresh the page or try again.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('writes pending status to localStorage after a successful access request', async () => {
    vi.spyOn(AuthService, 'getUserSession').mockImplementation((key?: string) => {
      if (key === 'organizationId') {
        return 'org-test-1';
      }
      return null;
    });
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessSuccessMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Pending' })).toBeInTheDocument();
    });

    expect(JSON.parse(localStorage.getItem(ORG_EVAL_ACCESS_CACHE_KEY)!)).toEqual({
      organizationId: 'org-test-1',
      status: 'pending',
    });
  });

  it('redirects when approved status is read from localStorage without running the query', async () => {
    vi.spyOn(AuthService, 'getUserSession').mockImplementation((key?: string) => {
      if (key === 'organizationId') {
        return 'org-test-2';
      }
      return null;
    });
    localStorage.setItem(
      ORG_EVAL_ACCESS_CACHE_KEY,
      JSON.stringify({ organizationId: 'org-test-2', status: 'approved' })
    );

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <MemoryRouter initialEntries={['/ai-evaluations/intro']}>
          <Routes>
            <Route path="/ai-evaluations/intro" element={<AIEvalsRequestAcess />} />
            <Route path="/ai-evaluations" element={<div>AI Evaluations main</div>} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('AI Evaluations main')).toBeInTheDocument();
    });
  });

  it('clicking Request Access calls the mutation', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessSuccessMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Pending' })).toBeInTheDocument();
    });
  });

  it('disables the button after a successful request', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessSuccessMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Pending' })).toBeDisabled();
    });
  });

  it('calls setNotification with a success message after a successful request', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessSuccessMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith(
        'Your request has been submitted. You will be notified when it gets approved.'
      );
    });
  });

  it('does not call setErrorMessage on a successful mutation', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessSuccessMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Pending' })).toBeInTheDocument();
    });

    expect(setErrorMessage).not.toHaveBeenCalled();
  });

  it('calls setErrorMessage when the mutation returns API errors', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessApiErrorMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Access request already exists' })
      );
    });
  });

  it('keeps button active after an API error so the user can retry', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessApiErrorMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
  });

  it('calls setErrorMessage on a network error', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessNetworkErrorMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalled();
    });
  });

  it('keeps button active after a network error so the user can retry', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessNetworkErrorMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
  });
});
