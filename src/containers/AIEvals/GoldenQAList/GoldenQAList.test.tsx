import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import {
  getCountGoldenQaEmptyMock,
  getCountGoldenQaMock,
  getGoldenQaDownloadMock,
  getListGoldenQaEmptyMock,
  getListGoldenQaMock,
} from 'mocks/AIEvaluations';
import { GoldenQAList } from './GoldenQAList';

const renderComponent = (
  searchQuery = '',
  mocks: MockedResponse[] = [getListGoldenQaMock, getCountGoldenQaMock]
) =>
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

  it('triggers download with signed URL when download button is clicked', async () => {
    const signedUrl = 'https://storage.example.com/golden-qa-1.csv';
    const originalCreateElement = document.createElement.bind(document);
    const linkEl = originalCreateElement('a');
    const clickSpy = vi.spyOn(linkEl, 'click').mockImplementation(() => {});

    vi.spyOn(document, 'createElement').mockImplementation((tag: string, ...args: any[]) => {
      if (tag === 'a') return linkEl;
      return originalCreateElement(tag, ...args);
    });

    renderComponent('', [getListGoldenQaMock, getCountGoldenQaMock, getGoldenQaDownloadMock('1', signedUrl)]);

    await waitFor(() => {
      expect(screen.getAllByTestId('additionalButton')).toHaveLength(4);
    });

    fireEvent.click(screen.getAllByTestId('additionalButton')[0]);

    await waitFor(() => {
      expect(linkEl.href).toBe(signedUrl);
      expect(clickSpy).toHaveBeenCalled();
    });

    vi.restoreAllMocks();
  });
});
