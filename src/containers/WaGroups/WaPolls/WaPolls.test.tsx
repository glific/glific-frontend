import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import { WaPollMocks } from 'mocks/WaPolls';
import WaPolls from './WaPolls';
import WaPollsList from './WaPollsList/WaPollsList';

const notificationSpy = vi.spyOn(Notification, 'setNotification');
const mockUseLocationValue: any = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  useLocation: () => {
    return mockUseLocationValue;
  },
  Navigate: ({ to }: any) => <div>Navigated to {to}</div>,
}));

beforeEach(() => {
  cleanup();
});

describe('Create', () => {
  test('it should create a whatsapp poll', async () => {
    render(
      <MockedProvider mocks={WaPollMocks}>
        <MemoryRouter initialEntries={['/group/polls/add']}>
          <Routes>
            <Route path="group/polls/add" element={<WaPolls />} />
            <Route path="group/polls" element={<WaPollsList />} />
            <Route path="group/polls/:id/edit" element={<WaPolls />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Add a new waPoll')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'Poll Title' } });
    fireEvent.change(inputs[1], { target: { value: 'Poll Content' } });

    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'Option 1' } });
    fireEvent.change(screen.getByPlaceholderText('Option 2'), { target: { value: 'Option 2' } });

    fireEvent.click(screen.getByTestId('add-btn'));

    fireEvent.change(screen.getByPlaceholderText('Option 3'), { target: { value: 'Option 3' } });

    fireEvent.click(screen.getAllByTestId('cross-icon')[1]);

    fireEvent.click(screen.getByText('Allow multiple options'));

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});

describe('Copy', () => {
  test('it should copy a whatsapp poll', async () => {
    mockUseLocationValue.state = 'copy';

    const copyFlow = (
      <MockedProvider mocks={WaPollMocks} addTypename={false}>
        <MemoryRouter initialEntries={[`/group/polls/1/edit`]}>
          <Routes>
            <Route path="group/polls/:id/edit" element={<WaPolls />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    render(copyFlow);

    await waitFor(() => {
      expect(screen.getByText('Copy waPoll')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('Copy of Poll Title');
    });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});
