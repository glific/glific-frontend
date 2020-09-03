import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ContactProfile } from './ContactProfile';
import { LOGGED_IN_USER_MOCK } from '../Profile.test.helper';

const mocks = LOGGED_IN_USER_MOCK;

const defaultProps = {
  match: { params: { id: 1 } },
};

describe('<ContactProfile />', () => {
  test('it should mount', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ContactProfile {...defaultProps} />
      </MockedProvider>
    );

    const contactProfile = screen.getByTestId('ContactProfile');

    expect(contactProfile).toBeInTheDocument();
  });
});
