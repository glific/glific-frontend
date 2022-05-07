import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  createBillingSubscriptionQuery,
  getBillingQuery,
  createStatusPendingQuery,
  getBillingQueryWithoutsubscription,
  createBillingSubscriptionPromoQuery,
  getCouponCode,
  getCustomerPortalQuery,
  getPendingBillingQuery,
  updateBillingQuery,
} from 'mocks/Billing';
import { Billing } from './Billing';

const mocks = [createBillingSubscriptionQuery, getBillingQuery];

const mountElementMock = jest.fn();
const mockElement = () => ({
  mount: jest.fn(),
  destroy: jest.fn(),
  on: mountElementMock,
  update: jest.fn(),
});

window.open = jest.fn();

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

test('creating a subscription with response as pending', async () => {
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

test('subscription status is already in pending state', async () => {
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

  // check for customer portal button and click on it
  fireEvent.click(getByTestId('customerPortalButton'));
  await waitFor(() => {});
});

test('complete a subscription', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider
      mocks={[getBillingQueryWithoutsubscription, createBillingSubscriptionQuery]}
      addTypename={false}
    >
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
  await waitFor(() => {
    expect(getByText('You have an active subscription')).toBeInTheDocument();
  });
});

test('open customer portal', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider
      mocks={[
        getBillingQueryWithoutsubscription,
        createBillingSubscriptionQuery,
        getCustomerPortalQuery,
      ]}
      addTypename={false}
    >
      <Router>
        <Billing />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('Back to settings')).toBeInTheDocument();
  });
  fireEvent.click(getByTestId('submitButton'));
  await waitFor(() => {
    expect(getByText('You have an active subscription')).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('customerPortalButton'));
  await waitFor(() => {});
});

test('update billing details', async () => {
  const { getByText, getByTestId, container } = render(
    <MockedProvider
      mocks={[
        getBillingQueryWithoutsubscription,
        createBillingSubscriptionQuery,
        updateBillingQuery,
      ]}
      addTypename={false}
    >
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
    const name = container.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(name, { target: { value: 'Glific Admin 1' } });
  });

  fireEvent.click(getByTestId('submitButton'));

  await waitFor(() => {
    expect(getByText('You have an active subscription')).toBeInTheDocument();
  });
});

test('update billing details', async () => {
  const { getByText, getByTestId, container } = render(
    <MockedProvider
      mocks={[
        getBillingQueryWithoutsubscription,
        createBillingSubscriptionPromoQuery,
        getCouponCode,
      ]}
      addTypename={false}
    >
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
    const coupon = container.querySelector('input[name="coupon"]') as HTMLInputElement;
    fireEvent.change(coupon, { target: { value: 'PBXGFH' } });
  });

  fireEvent.click(getByText('APPLY'));

  await waitFor(() => {
    expect(getByText('Coupon Applied!')).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('submitButton'));

  await waitFor(() => {
    expect(getByText('You have an active subscription')).toBeInTheDocument();
  });
});
