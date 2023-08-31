import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { vi } from 'vitest';

import {
  createBillingSubscriptionQuery,
  getBillingQuery,
  createStatusPendingQuery,
  getBillingQueryWithoutsubscription,
  createBillingSubscriptionPromoQuery,
  getCouponCode,
  getCustomerPortalQuery,
  getPendingBillingQuery,
  getBillingQueryWithoutVars,
  updateBillingQueryMock3,
} from 'mocks/Billing';
import { Billing } from './Billing';

const mocks = [createBillingSubscriptionQuery, getBillingQuery, getBillingQueryWithoutVars];

const mountElementMock = vi.fn();
const mockElement = () => ({
  mount: vi.fn(),
  destroy: vi.fn(),
  on: mountElementMock,
  update: vi.fn(),
});

window.open = vi.fn();

const mockElements = () => {
  const elements: any = {};

  return {
    create: vi.fn((type) => {
      elements[type] = mockElement();
      return elements[type];
    }),
    getElement: vi.fn((type) => {
      return elements[type] || null;
    }),
  };
};

const mockStripe = () => ({
  elements: vi.fn(() => mockElements()),
  createToken: vi.fn(),
  createSource: vi.fn(),
  createPaymentMethod: vi.fn((props) => {
    return {
      error: null,
      paymentMethod: { id: 'qwerty' },
    };
  }),
  confirmCardPayment: vi.fn(),
  confirmCardSetup: vi.fn(),
  paymentRequest: vi.fn(),
  _registerWrapper: vi.fn(),
});

vi.mock('@stripe/react-stripe-js', async () => {
  const stripe = await vi.importActual<any>('@stripe/react-stripe-js');

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
    expect(mountElementMock).toHaveBeenCalled;
  });
});

test('creating a subscription with response as pending', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider
      mocks={[createStatusPendingQuery, getBillingQueryWithoutVars, getBillingQueryWithoutVars]}
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
    expect(getByText('Subscribe for monthly billing')).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('submitButton'));

  await waitFor(() => {});
});

test('subscription status is already in pending state', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider
      mocks={[getPendingBillingQuery, getCustomerPortalQuery, getBillingQueryWithoutVars]}
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
    expect(getByText('Your payment is in pending state'));
  });

  // check for customer portal button and click on it
  fireEvent.click(getByTestId('customerPortalButton'));
  await waitFor(() => {});
});

test('complete a subscription', async () => {
  const user = UserEvent.setup();
  const { getByText, getByTestId } = render(
    <MockedProvider
      mocks={[
        getBillingQueryWithoutsubscription,
        createBillingSubscriptionQuery,
        getBillingQueryWithoutVars,
        getBillingQueryWithoutVars,
        getCustomerPortalQuery,
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
    expect(getByText('Variable charges as usage increases')).toBeInTheDocument();
  });

  user.click(getByTestId('submitButton'));

  await waitFor(() => {});
  await waitFor(() => {
    expect(getByText('You have an active subscription')).toBeInTheDocument();
  });
});

test('open customer portal', async () => {
  const user = UserEvent.setup();
  const { getByText, getByTestId } = render(
    <MockedProvider
      mocks={[
        getBillingQueryWithoutsubscription,
        createBillingSubscriptionQuery,
        getCustomerPortalQuery,
        getBillingQueryWithoutVars,
      ]}
      addTypename={false}
    >
      <Router>
        <Billing />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('One time setup')).toBeInTheDocument();
  });

  user.click(getByTestId('submitButton'));
  await waitFor(() => {});
});

test('update billing details', async () => {
  const user = UserEvent.setup();
  const { getByText, getByTestId, container } = render(
    <MockedProvider
      mocks={[
        getBillingQueryWithoutsubscription,
        createBillingSubscriptionQuery,
        updateBillingQueryMock3,
        getBillingQueryWithoutVars,
        getBillingQueryWithoutVars,
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
    expect(getByText('Monthly Recurring')).toBeInTheDocument();
  });

  const name = container.querySelector('input[name="name"]') as HTMLInputElement;
  fireEvent.change(name, { target: { value: 'Glific Admin 1' } });
  user.click(getByTestId('submitButton'));

  screen.debug();
  await waitFor(() => {
    expect(getByText('You have an active subscription')).toBeInTheDocument();
  });
});

test('update billing details with coupon code', async () => {
  const user = UserEvent.setup();
  const { getByText, getByTestId, container } = render(
    <MockedProvider
      mocks={[
        getBillingQueryWithoutsubscription,
        createBillingSubscriptionPromoQuery,
        getCouponCode,
        getBillingQueryWithoutVars,
        getBillingQueryWithoutVars,
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

  // Wait for the loading state to disappear
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  const coupon = container.querySelector('input[name="coupon"]') as HTMLInputElement;

  user.click(coupon);
  user.keyboard('PBXGFH');
  user.click(getByText('APPLY'));

  await waitFor(() => {
    expect(getByText('Invalid Coupon!')).toBeInTheDocument();
  });

  user.click(getByTestId('submitButton'));
  await waitFor(() => {});

  // await waitFor(() => {
  //   expect(getByText('You have an active subscription')).toBeInTheDocument();
  // });
});
