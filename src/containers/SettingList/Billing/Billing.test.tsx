import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';
import { vi } from 'vitest';

import {
  createBillingSubscriptionQuery,
  createBillingSubscriptionNetworkErrorQuery,
  getBillingQuery,
  createStatusPendingQuery,
  getBillingQueryWithoutsubscription,
  createBillingSubscriptionPromoQuery,
  getCouponCode,
  getCustomerPortalQuery,
  getCustomerPortalNetworkErrorQuery,
  getPendingBillingQuery,
  getBillingQueryWithoutVars,
  updateBillingQueryMock3,
  resetSubscriptionAfterSecureFailureQuery,
} from 'mocks/Billing';
import { Billing } from './Billing';
import * as Notification from 'common/notification';

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

const confirmCardSetupMock = vi.fn((): Promise<any> => {
  return Promise.resolve({
    error: null,
    setupIntent: { status: 'succeeded' },
  });
});

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
  confirmCardSetup: confirmCardSetupMock,
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

const renderBilling = (mocksOverride: any[] = mocks) =>
  render(
    <MockedProvider mocks={mocksOverride} addTypename={false}>
      <Router>
        <Billing />
      </Router>
    </MockedProvider>
  );

afterEach(() => {
  confirmCardSetupMock.mockImplementation(() =>
    Promise.resolve({
      error: null,
      setupIntent: { status: 'succeeded' },
    })
  );
});

describe('<Billing />', () => {
  it('renders component properly', async () => {
    const { getByText } = renderBilling();
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    expect(mountElementMock).toHaveBeenCalled;
  });
});

test('creating a subscription with response as pending', async () => {
  const { getByText, getByTestId } = renderBilling([
    createStatusPendingQuery,
    getBillingQueryWithoutVars,
    getBillingQueryWithoutVars,
  ]);
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Subscribe for monthly billing')).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('submitButton'));

  await waitFor(() => {});
});

test('shows a warning and resets the subscription when 3D-secure confirmation fails', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  confirmCardSetupMock.mockResolvedValueOnce({
    error: { message: '3D-secure authentication failed' },
    setupIntent: null,
  });

  const { getByText, getByTestId } = renderBilling([
    createStatusPendingQuery,
    getBillingQueryWithoutVars,
    getBillingQueryWithoutVars,
    resetSubscriptionAfterSecureFailureQuery,
    getBillingQueryWithoutVars,
  ]);

  await waitFor(() => {
    expect(getByText('Subscribe for monthly billing')).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('submitButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('3D-secure authentication failed', 'warning');
  });

  await waitFor(() => {
    expect(getByText('Subscribe for monthly billing')).toBeInTheDocument();
  });
});

test('shows a warning when creating the subscription fails unexpectedly', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  const user = UserEvent.setup();
  const { getByText, getByTestId } = renderBilling([
    getBillingQueryWithoutsubscription,
    createBillingSubscriptionNetworkErrorQuery,
    getBillingQueryWithoutVars,
  ]);

  await waitFor(() => {
    expect(getByText('Variable charges as usage increases')).toBeInTheDocument();
  });

  user.click(getByTestId('submitButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Failed to create subscription', 'warning');
  });
});

test('subscription status is already in pending state', async () => {
  const { getByText, getByTestId } = renderBilling([
    getPendingBillingQuery,
    getCustomerPortalQuery,
    getBillingQueryWithoutVars,
  ]);
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Your payment is in pending state'));
  });

  // check for customer portal button and click on it
  fireEvent.click(getByTestId('customerPortalButton'));

  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith('billing.glific.com/session/_sdjsjscbjwew', '_blank', 'noopener');
  });
});

test('shows a warning when opening the customer portal fails unexpectedly', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  (window.open as any).mockClear();
  const { getByText, getByTestId } = renderBilling([
    getPendingBillingQuery,
    getCustomerPortalNetworkErrorQuery,
    getBillingQueryWithoutVars,
  ]);

  await waitFor(() => {
    expect(getByText('Your payment is in pending state'));
  });

  fireEvent.click(getByTestId('customerPortalButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('An error occurred', 'warning');
  });
  expect(window.open).not.toHaveBeenCalled();
});

test('complete a subscription', async () => {
  const user = UserEvent.setup();
  const { getByText, getByTestId } = renderBilling([
    getBillingQueryWithoutsubscription,
    createBillingSubscriptionQuery,
    getBillingQueryWithoutVars,
    getBillingQueryWithoutVars,
    getCustomerPortalQuery,
  ]);
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
  const { getByText, getByTestId } = renderBilling([
    getBillingQueryWithoutsubscription,
    createBillingSubscriptionQuery,
    getCustomerPortalQuery,
    getBillingQueryWithoutVars,
  ]);

  await waitFor(() => {
    expect(getByText('One time setup')).toBeInTheDocument();
  });

  user.click(getByTestId('submitButton'));

  await waitFor(() => {
    expect(getByText('You have an active subscription')).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('customerPortalButton'));

  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith('billing.glific.com/session/_sdjsjscbjwew', '_blank', 'noopener');
  });
});

test('update billing details', async () => {
  const user = UserEvent.setup();
  const { getByText, getByTestId, container } = renderBilling([
    getBillingQueryWithoutsubscription,
    createBillingSubscriptionQuery,
    updateBillingQueryMock3,
    getBillingQueryWithoutVars,
    getBillingQueryWithoutVars,
  ]);
  // loading is show initially

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Monthly Recurring')).toBeInTheDocument();
  });

  const name = container.querySelector('input[name="name"]') as HTMLInputElement;
  fireEvent.change(name, { target: { value: 'Glific Admin 1' } });
  user.click(getByTestId('submitButton'));

  await waitFor(() => {
    expect(getByText('You have an active subscription')).toBeInTheDocument();
  });
});

test('update billing details with coupon code', async () => {
  const user = UserEvent.setup();
  const { getByText, getByTestId, container } = renderBilling([
    getBillingQueryWithoutsubscription,
    createBillingSubscriptionPromoQuery,
    getCouponCode,
    getBillingQueryWithoutVars,
    getBillingQueryWithoutVars,
  ]);
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  // Wait for the loading state to disappear
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  const coupon = container.querySelector('input[name="coupon"]') as HTMLInputElement;

  await user.click(coupon);
  await user.keyboard('PBXGFH');
  user.click(getByText('APPLY'));

  await waitFor(() => {
    expect(getByText('Coupon Applied!')).toBeInTheDocument();
  });

  user.click(getByTestId('submitButton'));
  await waitFor(() => {});
});
