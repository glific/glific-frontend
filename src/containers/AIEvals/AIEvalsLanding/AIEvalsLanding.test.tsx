import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { setErrorMessage, setNotification } from 'common/notification';

vi.mock('i18next', () => ({ t: (key: string) => key }));

import {
  getOrgEvalAccessRequestLoadingMock,
  getOrgEvalAccessRequestNoneMock,
  getOrgEvalAccessRequestPendingMock,
  requestAiEvaluationAccessApiErrorMock,
  requestAiEvaluationAccessNetworkErrorMock,
  requestAiEvaluationAccessSuccessMock,
} from 'mocks/AIEvaluations';
import AIEvalsLanding from './AIEvalsLanding';

vi.mock('common/notification', () => ({
  setNotification: vi.fn(),
  setErrorMessage: vi.fn(),
}));

const renderComponent = (mocks: any[] = [getOrgEvalAccessRequestNoneMock]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <AIEvalsLanding />
      </MemoryRouter>
    </MockedProvider>
  );

describe('AIEvalsLanding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Beta badge', () => {
    renderComponent();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: 'AI Evaluations', level: 1 })).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderComponent();
    expect(screen.getByText(/AI Evaluations is the process to determine objectively/i)).toBeInTheDocument();
  });

  it('renders the Why Use Evals section heading', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: 'Why Use Evals?', level: 2 })).toBeInTheDocument();
  });

  it('renders all 7 benefit items', () => {
    renderComponent();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(7);
  });

  it('renders each benefit item with its number', () => {
    renderComponent();
    ['1.', '2.', '3.', '4.', '5.', '6.', '7.'].forEach((num) => {
      expect(screen.getByText(num)).toBeInTheDocument();
    });
  });

  it('renders the first benefit text', () => {
    renderComponent();
    expect(screen.getByText(/Improve answers on critical topics like health, safety, rights/i)).toBeInTheDocument();
  });

  it('renders the last benefit text', () => {
    renderComponent();
    expect(screen.getByText(/Lower legal and compliance risks/i)).toBeInTheDocument();
  });

  // ── Right panel static content ───────────────────────────────────────────────

  it('renders the CTA heading', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: 'Set up your NGO on Evals', level: 2 })).toBeInTheDocument();
  });

  it('renders the CTA subtitle', () => {
    renderComponent();
    expect(screen.getByText(/Make your NGO chatbot smarter, safer/i)).toBeInTheDocument();
  });

  it('renders the laptop mockup with Intro to AI Evals card', () => {
    renderComponent();
    expect(screen.getByText('Intro to')).toBeInTheDocument();
    expect(screen.getByText('AI Evals')).toBeInTheDocument();
  });

  it('renders the Glific badge inside the mockup', () => {
    renderComponent();
    expect(screen.getByText('Glific')).toBeInTheDocument();
  });

  it('renders the help text below the mockup', () => {
    renderComponent();
    expect(screen.getByText(/Apply for access and tell us what functionality/i)).toBeInTheDocument();
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

  it('shows Already Requested and disables button when org already has a pending request', async () => {
    renderComponent([getOrgEvalAccessRequestPendingMock]);
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Already Requested' });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });
  });

  it('button is disabled while the access check query is loading', () => {
    renderComponent([getOrgEvalAccessRequestLoadingMock]);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('clicking Request Access calls the mutation', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessSuccessMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Already Requested' })).toBeInTheDocument();
    });
  });

  it('disables the button after a successful request', async () => {
    renderComponent([getOrgEvalAccessRequestNoneMock, requestAiEvaluationAccessSuccessMock]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Access' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Already Requested' })).toBeDisabled();
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
      expect(screen.getByRole('button', { name: 'Already Requested' })).toBeInTheDocument();
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
