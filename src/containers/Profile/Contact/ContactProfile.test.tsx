import React from 'react';
import { render, screen, wait, within, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ContactProfile } from './ContactProfile';
import { LOGGED_IN_USER_MOCK } from '../Profile.test.helper';

const mocks = LOGGED_IN_USER_MOCK;

const defaultProps = {
  match: { params: { id: 1 } },
};

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

test('contact profile should mount', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactProfile {...defaultProps} />
    </MockedProvider>
  );
  await wait();
  await wait();

  expect(getByTestId('ContactProfile')).toBeInTheDocument();
});

test('add tags to profile', async () => {
  const { getByTestId, getByText, getAllByRole } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactProfile {...defaultProps} />
    </MockedProvider>
  );
  await wait();

  const autocomplete = getByTestId('autocomplete-element');
  fireEvent.click(autocomplete.querySelector('.MuiAutocomplete-popupIndicator'));
  fireEvent.click(getAllByRole('option')[1]);
  await wait();
  fireEvent.click(getByText('Save'));
  await wait();
  expect(getByText('dd')).toBeInTheDocument();
});
