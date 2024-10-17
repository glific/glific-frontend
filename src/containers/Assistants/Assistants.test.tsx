import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';
import Assistants from './Assistants';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MOCKS } from 'mocks/Assistants';
import * as Notification from 'common/notification';

const notificationSpy = vi.spyOn(Notification, 'setNotification');
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

const assistantsComponent = (
  <MockedProvider mocks={MOCKS}>
    <MemoryRouter initialEntries={['/assistants', '/assistants/2']}>
      <Routes>
        <Route path="/assistants" element={<Assistants />} />
        <Route path="/assistants/:assistantId" element={<Assistants />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

test('it renders the list properly and switches between items', async () => {
  render(assistantsComponent);

  await waitFor(() => {
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-405db438')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('listItem')).toHaveLength(3);
  });

  fireEvent.click(screen.getAllByTestId('listItem')[1]);
});

test('it creates an assistant', async () => {
  render(assistantsComponent);

  await waitFor(() => {
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-405db438')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('headingButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});
