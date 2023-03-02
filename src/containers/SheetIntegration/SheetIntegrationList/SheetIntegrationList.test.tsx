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

window.open = jest.fn();

setUserSession(JSON.stringify({ roles: ['Admin'] }));
describe('<SheetIntegrationList />', () => {
  test('Should render SheetIntegrationList', async () => {
    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
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
    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    // SYNC Button
    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[0]);
      expect(window.open).toBeCalled();
    });
    //LINK Button
    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[1]).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[1]);
    });
  });
});
