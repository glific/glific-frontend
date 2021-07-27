import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

test('it renders contact profile and update tags', async () => {
  const { container } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactProfile {...defaultProps} />
    </MockedProvider>
  );

  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  const autocomplete = screen.getByTestId('autocomplete-element');
  expect(autocomplete).toBeInTheDocument();

  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  await waitFor(() => {});

  // select the first item
  fireEvent.keyDown(autocomplete, { key: 'Enter' });
  await waitFor(() => {});

  const save = screen.getByRole('button', { name: 'Save' });
  fireEvent.click(save);

  await waitFor(() => {});
});
