import { render, waitFor, cleanup, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { Ticket } from './Ticket';
import userEvent from '@testing-library/user-event';
import { getTicketQuery } from 'mocks/Ticket';

afterEach(cleanup);
const setOpenDialogMock = vi.fn();
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const mocks = [getTicketQuery];

test('Render component correctly with the values', async () => {
  const user = userEvent.setup();
  const setOpenDialogMock = vi.fn();
  render(
    <MockedProvider mocks={mocks}>
      <Ticket selectedTicket={'1'} setOpenDialog={setOpenDialogMock} />
    </MockedProvider>
  );

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Update ticket')).toBeInTheDocument();
  });

  // should have the heading as the issue
  expect(screen.getByTestId('formLayout')).toHaveTextContent('Please resolve this issue');
  // also should have remarks
  expect(screen.getByTestId('formLayout')).toHaveTextContent('The issue was resolved');
});
