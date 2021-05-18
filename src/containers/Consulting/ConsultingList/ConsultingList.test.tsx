import { render, screen, act } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ConsultingList from './ConsultingList';
import { listingMock } from '../../../mocks/Consulting';
import { BrowserRouter as Router } from 'react-router-dom';
import { setUserSession } from '../../../services/AuthService';

const mocks = listingMock;
const props = {
  match: { params: {} },
  openDialog: false,
};
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ConsultingList {...props} />
    </Router>
  </MockedProvider>
);

it('Renders ConsultingList component successfully', async () => {
  render(list);

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const nameLabel = screen.getByText('NAME');
  const dateLabel = screen.getByText('DATE');
  const minutesLabel = screen.getByText('MINUTES');
  const typeLabel = screen.getByText('TYPE');
  const actionLabel = screen.getByText('ACTIONS');

  expect(nameLabel).toBeInTheDocument();
  expect(dateLabel).toBeInTheDocument();
  expect(minutesLabel).toBeInTheDocument();
  expect(typeLabel).toBeInTheDocument();
  expect(actionLabel).toBeInTheDocument();
});
