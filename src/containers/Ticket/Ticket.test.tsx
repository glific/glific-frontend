import { render, waitFor, cleanup, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { Ticket } from './Ticket';
import { getTicketQuery } from 'mocks/Ticket';
import { getUsersQuery } from 'mocks/User';
import { getRoleNamesMock } from 'containers/StaffManagement/StaffManagement.test.helper';
import { getOrganizationLanguagesQuery } from 'mocks/Organization';
import { MemoryRouter } from 'react-router';

afterEach(cleanup);

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const mocks = [getTicketQuery, getUsersQuery, getRoleNamesMock, getOrganizationLanguagesQuery];

test('Render component correctly with the values', async () => {
  const setOpenDialogMock = vi.fn();
  render(
    <MemoryRouter>
      <MockedProvider mocks={mocks}>
        <Ticket selectedTicket={'1'} setOpenDialog={setOpenDialogMock} />
      </MockedProvider>
    </MemoryRouter>
  );

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Update ticket')).toBeInTheDocument();
  });

  // should have the heading as the issue
  await waitFor(() => {
    expect(screen.getByTestId('formLayout')).toHaveTextContent('Please resolve this issue');
    // also should have remarks
    expect(screen.getByTestId('formLayout')).toHaveTextContent('The issue was resolved');
  });
});
