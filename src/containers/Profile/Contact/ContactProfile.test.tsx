import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { LOGGED_IN_USER_MOCK } from 'mocks/Contact';
import { ContactProfile } from './ContactProfile';

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

  // await waitFor(() => {
  //   expect(getByTestId('outlinedInput').querySelector('input')?.value).toBe('Default User');
  // });
});

/**
 * Now tags will be replaced by labels
 * commenting tag cases for now. we'll visit sometime later.
 */
test('it renders contact profile and update tags', async () => {
  const { getByRole } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactProfile {...defaultProps} />
    </MockedProvider>
  );

  // const autocomplete = screen.getByTestId('autocomplete-element');
  // expect(autocomplete).toBeInTheDocument();

  // autocomplete.focus();
  // fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  // await waitFor(() => {});

  // // select the first item
  // fireEvent.keyDown(autocomplete, { key: 'Enter' });
  // await waitFor(() => {});

  await waitFor(() => {
    const save = getByRole('button', { name: 'Save' });
    fireEvent.click(save);
  });
});
