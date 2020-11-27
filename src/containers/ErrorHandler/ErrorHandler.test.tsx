import React from 'react';
import { cleanup, render, screen, waitFor, act } from '@testing-library/react';
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
    const { getByText } = render(
      <MockedProvider resolvers={resolvers} addTypename={false}>
        <ErrorHandler />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
      //check if error message is displayed
    });

    const errorMessageText = getByText('An error has occured!');
    expect(errorMessageText).toBeInTheDocument();

    // click ok and close
    const okButton: any = screen
      .queryByRole('dialog')
      ?.querySelector('button.MuiButton-containedSecondary');
    fireEvent.click(okButton);

    //need to assert something here
    await waitFor(() => {});
  });
});
