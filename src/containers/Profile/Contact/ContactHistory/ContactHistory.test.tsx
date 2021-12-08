import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ContactHistory } from './ContactHistory';
import { contactHistoryQuery, countContactHistoryQuery } from 'mocks/Contact';

const mocks = [contactHistoryQuery, countContactHistoryQuery];
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

  // toggle phone visibility

  //   const togglePhone = screen.getByRole('button');
  //   fireEvent.click(togglePhone);
});
