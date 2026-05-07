import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import {
  getCountGoldenQaMock,
  getListGoldenQaMock,
} from 'mocks/AIEvaluations';
import { LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import AIEvalsPage from './AIEvalsPage';

const aiEvaluationsListMock = {
  request: { query: LIST_AI_EVALUATIONS },
  variableMatcher: () => true,
  result: { data: { aiEvaluations: [] } },
};

const defaultMocks = [aiEvaluationsListMock, getListGoldenQaMock, getCountGoldenQaMock];

const renderComponent = (mocks = defaultMocks) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <AIEvalsPage />
      </MemoryRouter>
    </MockedProvider>
  );

describe('AIEvalsPage', () => {
  it('renders page heading', () => {
    renderComponent();
    expect(screen.getByTestId('headerTitle')).toHaveTextContent('AI Evaluations');
    expect(screen.getByText(/Run evaluations against/i)).toBeInTheDocument();
  });

  it('renders both tab buttons', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: 'AI Evaluations' })).toBeInTheDocument();
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

  it('shows Create AI Evaluation button on AI Evaluations tab', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Create AI Evaluation/i })).toBeInTheDocument();
  });

  it('switches to Golden QA tab and shows list', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Golden QA' }));
    expect(screen.getByText('Title')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Diabetescare-0101')).toBeInTheDocument();
    });
  });

  it('renders search bar in tab bar', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });
});
