import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ContactProfile } from './ContactProfile';
import { LOGGED_IN_USER_MOCK } from '../../../mocks/Contact';

const mocks = LOGGED_IN_USER_MOCK;

const defaultProps = {
  match: { params: { id: 1 } },
};

test('contact profile should render', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactProfile {...defaultProps} />
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByTestId('ContactProfile')).toBeInTheDocument();
  });
});

test('contact should have a name or number', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactProfile {...defaultProps} />
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByTestId('ContactProfile')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByTestId('outlinedInput').querySelector('input')?.value).toBe('Default User');
  });
});
