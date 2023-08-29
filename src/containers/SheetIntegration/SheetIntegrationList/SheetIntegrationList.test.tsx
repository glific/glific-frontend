import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { setUserSession } from 'services/AuthService';
import { SheetIntegrationList } from './SheetIntegrationList';
import {
  getSearchSheetQuery,
  getSheetQuery,
  deleteSheetQuery,
  createSheetQuery,
  getSheetCountQuery,
  syncSheetMutation,
} from 'mocks/Sheet';

const mocks = [
  getSearchSheetQuery,
  getSheetQuery,
  getSheetQuery,
  deleteSheetQuery,
  createSheetQuery,
  getSheetCountQuery,
  syncSheetMutation,
];

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <SheetIntegrationList />
    </MockedProvider>
  </MemoryRouter>
);

window.open = vi.fn();

setUserSession(JSON.stringify({ roles: ['Admin'] }));
describe('<SheetIntegrationList />', () => {
  test('Should render SheetIntegrationList', async () => {
    const { getByText, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Google sheets')).toBeInTheDocument();
    });
  });

  test('should search sheet and check if sheet keywords are present below the name', async () => {
    const { getByTestId, queryByPlaceholderText, getByText } = render(wrapper);
    await waitFor(() => {
      expect(getByTestId('searchInput')).toBeInTheDocument();
      const searchInput = queryByPlaceholderText('Search') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Sheet1' } });
      expect(getByText('Sheet1')).toBeInTheDocument();
    });
  });

  test('Link and Sync Button testing', async () => {
    const { getAllByTestId, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();
    // SYNC Button
    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    //LINK Button
    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[1]);
      expect(window.open).toBeCalled();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[1]);
    });
  });
});
