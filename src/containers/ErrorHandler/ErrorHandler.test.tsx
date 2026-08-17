import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { fireEvent } from '@testing-library/dom';

import { ERROR_MESSAGE } from 'graphql/queries/Notification';
import ErrorHandler from './ErrorHandler';

// MockedProvider's local-resolver support (v3's `resolvers` prop) requires opting in to
// Apollo Client 4's LocalState, which this app doesn't otherwise use - setErrorMessage()
// writes directly to the cache instead. So these tests seed the @client errorMessage field
// the same way the app does, via cache.writeQuery, rather than a local resolver function.
const cacheWithErrorMessage = (errorMessage: any) => {
  const cache = new InMemoryCache();
  cache.writeQuery({
    query: ERROR_MESSAGE,
    data: { errorMessage },
  });
  return cache;
};

describe('<ErrorHandler />', () => {
  afterEach(cleanup);

  test('it should render <ErrorHandler /> component correctly', async () => {
    const { getByText } = render(
      <MockedProvider
        cache={cacheWithErrorMessage({
          message: 'An error has occurred!',
          type: 'Error',
          networkError: 'Unable to fetch',
          graphqlError: null,
        })}
      >
        <ErrorHandler />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
      //check if error message is displayed
    });

    const errorMessageText = getByText('An error has occurred!');
    expect(errorMessageText).toBeInTheDocument();

    // click ok and close
    const okButton: any = screen.getByTestId('ok-button');

    fireEvent.click(okButton);

    //need to assert something here
    await waitFor(() => {});
  });
});

test('it should render <ErrorHandler /> component with custom message', async () => {
  const { getByText } = render(
    <MockedProvider
      cache={cacheWithErrorMessage({
        message: [{ message: 'An error has occurred!' }],
        type: 'Error',
        networkError: 'Unable to fetch',
        graphqlError: null,
      })}
    >
      <ErrorHandler />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeInTheDocument();
    //check if error message is displayed
  });

  const errorMessageText = getByText('An error has occurred!');
  expect(errorMessageText).toBeInTheDocument();

  // click ok and close
  const okButton: any = screen.getByTestId('ok-button');
  fireEvent.click(okButton);

  //need to assert something here
  await waitFor(() => {});
});

test('it should render <ErrorHandler /> component with custom title', async () => {
  render(
    <MockedProvider
      cache={cacheWithErrorMessage({
        title: 'Error Title',
        message: [{ message: 'An error has occurred!' }],
        type: 'Error',
        networkError: 'Unable to fetch',
        graphqlError: null,
      })}
    >
      <ErrorHandler />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeInTheDocument();
  });

  expect(screen.getByTestId('dialogTitle')).toHaveTextContent('Error Title');
});

test('it should render <ErrorHandler /> component with no error message', async () => {
  render(
    <MockedProvider cache={cacheWithErrorMessage('')}>
      <ErrorHandler />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
