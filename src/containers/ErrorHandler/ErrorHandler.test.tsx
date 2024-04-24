import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent } from '@testing-library/dom';

import ErrorHandler from './ErrorHandler';

const resolvers = {
  Query: {
    errorMessage: () => {
      return {
        message: 'An error has occurred!',
        type: 'Error',
        networkError: 'Unable to fetch',
        graphqlError: null,
      };
    },
  },
};

const resolversWithNullError = {
  Query: {
    errorMessage: () => {
      return '';
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
  const resolvers = {
    Query: {
      errorMessage: () => {
        return {
          message: [{ message: 'An error has occurred!' }],
          type: 'Error',
          networkError: 'Unable to fetch',
          graphqlError: null,
        };
      },
    },
  };
  const { getByText } = render(
    <MockedProvider resolvers={resolvers} addTypename={false}>
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
  const resolvers = {
    Query: {
      errorMessage: () => {
        return {
          title: 'Error Title',
          message: [{ message: 'An error has occurred!' }],
          type: 'Error',
          networkError: 'Unable to fetch',
          graphqlError: null,
        };
      },
    },
  };
  render(
    <MockedProvider resolvers={resolvers} addTypename={false}>
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
    <MockedProvider resolvers={resolversWithNullError} addTypename={false}>
      <ErrorHandler />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
