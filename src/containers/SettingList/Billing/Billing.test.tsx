import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Billing } from './Billing';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  createBillingSubscriptionQuery,
  createStatusPendingQuery,
  getBillingQuery,
  getPendingBillingQuery,
} from '../../../mocks/Billing';

const mocks = [createBillingSubscriptionQuery, getBillingQuery];

const mountElementMock = jest.fn();
const mockElement = () => ({
  mount: jest.fn(),
  destroy: jest.fn(),
  on: mountElementMock,
  update: jest.fn(),
});

const mockElements = () => {
  const elements = {};

  return {
    create: jest.fn((type) => {
      elements[type] = mockElement();
      return elements[type];
    }),
    getElement: jest.fn((type) => {
      return elements[type] || null;
    }),
  };
};

const mockStripe = () => ({
  elements: jest.fn(() => mockElements()),
  createToken: jest.fn(),
  createSource: jest.fn(),
  createPaymentMethod: jest.fn((props) => {
    return {
      error: null,
      paymentMethod: { id: 'qwerty' },
    };
  }),
  confirmCardPayment: jest.fn(),
  confirmCardSetup: jest.fn(),
  paymentRequest: jest.fn(),
  _registerWrapper: jest.fn(),
});

jest.mock('@stripe/react-stripe-js', () => {
  const stripe = jest.requireActual('@stripe/react-stripe-js');

  return {
    ...stripe,

    Element: () => {
      return mockElement;
    },
    useStripe: () => {
      return mockStripe();
    },
    useElements: () => {
      return mockElements();
    },
  };
});

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Billing />
    </Router>
  </MockedProvider>
);

describe('<Billing />', () => {
  it('renders component properly', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Back to settings')).toBeInTheDocument();
    });

    expect(mountElementMock).toHaveBeenCalled;
  });
});

test('complete a subscription without any authentication', async () => {
  const { getByText, getByTestId } = render(wrapper);
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Back to settings')).toBeInTheDocument();
  });
  fireEvent.click(getByTestId('submitButton'));
  // await waitFor(() => {});
  // await waitFor(() => {
  //   expect(getByText('You have an active subscription')).toBeInTheDocument();
  // });
});

test('subscription in pending state', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={[createStatusPendingQuery]} addTypename={false}>
      <Router>
        <Billing />
      </Router>
    </MockedProvider>
  );
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Back to settings')).toBeInTheDocument();
  });
  fireEvent.click(getByTestId('submitButton'));
  await waitFor(() => {});
});

test('card status already pending', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={[getPendingBillingQuery]} addTypename={false}>
      <Router>
        <Billing />
      </Router>
    </MockedProvider>
  );
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Back to settings')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Your payment is in pending state'));
  });
});
