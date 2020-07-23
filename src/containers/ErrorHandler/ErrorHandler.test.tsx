import React from 'react';
import { cleanup, render, screen, wait } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent } from '@testing-library/dom';

import { ErrorHandler } from './ErrorHandler';

const resolvers = {
  Query: {
    errorMessage: () => {
      return {
        message: 'An error has occured!',
        type: 'Error',
        networkError: 'Unable to fetch',
        graphqlError: null,
      };
    },
  },
};

describe('<ErrorHandler />', () => {
  afterEach(cleanup);

  test('it should render <ErrorHandler /> component correctly', async () => {
    const { findByText, getByText, container } = render(
      <MockedProvider resolvers={resolvers} addTypename={false}>
        <ErrorHandler />
      </MockedProvider>
    );

    // loading is shown initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
    expect(screen.queryByRole('dialog')).toBeInTheDocument();

    //check if error message is displayed
    const errorMessageText = await findByText('An error has occured!');
    expect(errorMessageText).toBeInTheDocument();

    // click ok and close
    const okButton = screen
      .queryByRole('dialog')
      ?.querySelector('button.MuiButton-containedSecondary');
    fireEvent.click(okButton);
    await wait();
  });
});
