import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import {
  getCountGoldenQaEmptyMock,
  getCountGoldenQaMock,
  getListGoldenQaEmptyMock,
  getListGoldenQaMock,
} from 'mocks/AIEvaluations';
import { GoldenQAList } from './GoldenQAList';

const renderComponent = (searchQuery = '', mocks = [getListGoldenQaMock, getCountGoldenQaMock]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <GoldenQAList searchQuery={searchQuery} />
      </MemoryRouter>
    </MockedProvider>
  );

describe('GoldenQAList', () => {
  it('renders table headers', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Created On')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('renders rows after data loads', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Diabetescare-0101')).toBeInTheDocument();
      expect(screen.getByText('Healthcare-0102')).toBeInTheDocument();
      expect(screen.getByText('Testabc-0801')).toBeInTheDocument();
      expect(screen.getByText('GuideMentalHealth-2111')).toBeInTheDocument();
    });
  });

  it('renders download button for each row', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getAllByTestId('additionalButton')).toHaveLength(4);
    });
  });

  it('shows empty state when no data', async () => {
    renderComponent('', [getListGoldenQaEmptyMock, getCountGoldenQaEmptyMock]);
    await waitFor(() => {
      expect(screen.getByText(/There are no Golden QA datasets right now/i)).toBeInTheDocument();
    });
  });

  it('shows pagination controls', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /rows per page/i })).toBeInTheDocument();
    });
  });
});
