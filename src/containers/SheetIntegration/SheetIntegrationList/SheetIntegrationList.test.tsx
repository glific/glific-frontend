import { render, waitFor, fireEvent, screen, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { setUserSession } from 'services/AuthService';
import { SheetIntegrationList } from './SheetIntegrationList';
import * as Notification from 'common/notification';
import {
  getSearchSheetQuery,
  getSheetQuery,
  deleteSheetQuery,
  createSheetQuery,
  getSheetCountQuery,
  syncSheetMutation,
  syncSheetMutationWithWarnings,
} from 'mocks/Sheet';

const mocks = [
  getSearchSheetQuery,
  getSheetQuery,
  getSheetQuery,
  deleteSheetQuery,
  createSheetQuery,
  getSheetCountQuery,
  getSheetCountQuery,
];

const wrapper = (mockQuery?: any) => {
  if (mockQuery) {
    mocks.push(mockQuery);
  }

  return (
    <MemoryRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <SheetIntegrationList />
      </MockedProvider>
    </MemoryRouter>
  );
};

window.open = vi.fn();
afterEach(() => cleanup());

setUserSession(JSON.stringify({ roles: ['Admin'] }));
describe('<SheetIntegrationList />', () => {
  test('Should render SheetIntegrationList', async () => {
    const { getByText, getByTestId } = render(wrapper());

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Google sheets')).toBeInTheDocument();
    });
  });

  test('should search sheet and check if sheet keywords are present below the name', async () => {
    const { getByTestId, queryByPlaceholderText, getByText } = render(wrapper());
    await waitFor(() => {
      expect(getByTestId('searchInput')).toBeInTheDocument();
      const searchInput = queryByPlaceholderText('Search') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Sheet1' } });
      expect(getByText('Sheet1')).toBeInTheDocument();
    });
  });

  test('Link and Sync Button testing', async () => {
    const { getAllByTestId, getByTestId } = render(wrapper(syncSheetMutation));
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

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
      fireEvent.click(getAllByTestId('additionalButton')[0]);
    });

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });

    fireEvent.click(getAllByTestId('additionalButton')[1]);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalled();
    });
  });

  test('Should render warnings', async () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      wrapper(syncSheetMutationWithWarnings)
    );

    // loading is show initially
    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Google sheets')).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('additionalButton')[2]);

    await waitFor(() => {
      expect(screen.getByText('Please check the warnings')).toBeInTheDocument();
    });
  });
});
