import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import { WaPollListMocks } from 'mocks/WaPolls';
import WaPolls from '../WaPolls';
import WaPollsList from './WaPollsList';

const wrapper = (
  <MockedProvider mocks={WaPollListMocks}>
    <MemoryRouter initialEntries={['/group/polls']}>
      <Routes>
        <Route path="group/polls" element={<WaPollsList />} />
        <Route path="group/polls/:id/edit" element={<WaPolls />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

const notificationSpy = vi.spyOn(Notification, 'setNotification');
const mockedUsedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUsedNavigate,
}));

test('it should render the WaPollsList component', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Group Polls')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('poll 1')).toBeInTheDocument();
  });
});

test('it should copy the uuid', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Group Polls')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('it should open the view dialog box', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Group Polls')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('view-icon')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('CloseIcon'));
});

test('it navigates to create a copy', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Group Polls')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('duplicate-icon')[0]);

  await waitFor(() => {
    expect(screen.getByText('Copy Poll')).toBeInTheDocument();
  });
});

test('it should delete the poll', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Group Polls')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('delete-icon')[0]);
  fireEvent.click(screen.getByTestId('CloseIcon'));
  fireEvent.click(screen.getAllByTestId('delete-icon')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});
