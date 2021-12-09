import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ContactHistory } from './ContactHistory';
import {
  contactHistoryQuery,
  countContactHistoryQuery,
  contactHistoryQueryUpdatedOffset,
} from 'mocks/Contact';

const mocks = [contactHistoryQuery, countContactHistoryQuery, contactHistoryQueryUpdatedOffset];
const defaultProps = {
  contactId: '1',
};

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <ContactHistory {...defaultProps} />
  </MockedProvider>
);

it('should render ContactDescription', async () => {
  const { getByTestId, getByText } = render(wrapper);
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByTestId('ContactHistory')).toBeInTheDocument();
  });

  expect(getByText('Removed from collection: "Optout contacts"')).toBeInTheDocument();
});

it('should load more details when we click on show more button', async () => {
  const { getByTestId, getByText } = render(wrapper);
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByTestId('ContactHistory')).toBeInTheDocument();
  });
  fireEvent.click(getByText('Show more'));
  await waitFor(() => {
    expect(getByText('Removed from collection: "Optout contacts"')).toBeInTheDocument();
  });
});
