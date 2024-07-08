import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { listingMock } from 'mocks/Consulting';
import { setUserSession } from 'services/AuthService';
import ConsultingList from './ConsultingList';

const mocks = listingMock;

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ConsultingList />
    </Router>
  </MockedProvider>
);

it('Renders ConsultingList component successfully', async () => {
  render(list);

  expect(screen.getByTestId('loading')).toBeInTheDocument();
  await waitFor(() => {
    const nameLabel = screen.getByText('Name');
    const dateLabel = screen.getByText('Date');
    const minutesLabel = screen.getByText('Minutes');
    const typeLabel = screen.getByText('Type');
    const actionLabel = screen.getByText('Actions');

    expect(nameLabel).toBeInTheDocument();
    expect(dateLabel).toBeInTheDocument();
    expect(minutesLabel).toBeInTheDocument();
    expect(typeLabel).toBeInTheDocument();
    expect(actionLabel).toBeInTheDocument();
  });
});

it('Renders dialog box on clicking add new button', async () => {
  const { getByText, getByTestId } = render(list);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Add Consulting Hours')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Add Consulting Hours'));

  await waitFor(() => {
    expect(screen.getByText('Add consulting record')).toBeInTheDocument();
  });
});

it('should open dialog box', async () => {
  const { getByText, getByTestId, getAllByTestId } = render(list);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Add Consulting Hours')).toBeInTheDocument();
  });

  fireEvent.click(getAllByTestId('edit')[1]);

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });
});
