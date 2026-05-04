import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import {
  getCountGoldenQaMock,
  getListGoldenQaMock,
} from 'mocks/AIEvaluations';
import AIEvalsPage from './AIEvalsPage';

const defaultMocks = [getListGoldenQaMock, getCountGoldenQaMock];

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

  it('shows placeholder content on AI Evaluations tab by default', () => {
    renderComponent();
    expect(screen.getByText(/AI Evaluations list coming soon/i)).toBeInTheDocument();
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
