import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ContactHistory } from './ContactHistory';
import {
  contactHistoryQuery,
  countContactHistoryQuery,
  contactHistoryQueryUpdatedOffset,
} from 'mocks/Contact';
import { MemoryRouter } from 'react-router';

export const mocks = [
  contactHistoryQuery,
  countContactHistoryQuery,
  contactHistoryQueryUpdatedOffset,
];
const defaultProps = {
  contactId: '1',
};

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactHistory {...defaultProps} />
    </MockedProvider>
  </MemoryRouter>
);

it('should render Contact History', async () => {
  const { getByText, getByTestId } = render(wrapper);
  expect(getByTestId('loading')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Date and Time')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Removed from collection: "Optout contacts"')).toBeInTheDocument();
  });
});
