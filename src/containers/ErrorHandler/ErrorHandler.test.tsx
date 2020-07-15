import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ErrorHandler } from './ErrorHandler';
import { ERROR_MESSAGE } from '../../graphql/queries/Notification';

const mocks = [
  {
    request: {
      query: ERROR_MESSAGE,
    },
    result: {
      data: {
        errorMessage: 'An error has occured.',
      },
    },
  },
];

describe('<ErrorHandler />', () => {
  afterEach(cleanup);

  test('it should render <ErrorHandler /> component correctly', async () => {
    const { findByText, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ErrorHandler />
      </MockedProvider>
    );

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // check if error message is displayed
    const errorMessageText = await findByText('An error has occured.');
    expect(errorMessageText).toBeInTheDocument();
  });
});
