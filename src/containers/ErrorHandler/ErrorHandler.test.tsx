import React from 'react';
import { cleanup, render, screen, wait } from '@testing-library/react';
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
        errorMessage: {
          message: 'An error has occured!',
          type: 'Error',
          networkError: 'Unable to fetch',
          graphqlError: '',
        },
      },
    },
  },
];

describe('<ErrorHandler />', () => {
  afterEach(cleanup);
  const handleErrorClose = () => {};

  test('it should render <ErrorHandler /> component correctly', async () => {
    const { findByText, getByText, container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ErrorHandler />
      </MockedProvider>
    );

    // loading is shown initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
    expect(screen.queryByRole('dialog')).toBeInTheDocument();

    // check if error message is displayed
    // const errorMessageText = await findByText('An error has occured!');
    // expect(errorMessageText).toBeInTheDocument();
  });
});
