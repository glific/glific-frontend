import CREATE_BILLING_SUBSCRIPTION from '../graphql/mutations/Billing';

export const createBillingSubscriptionQuery = {
  request: {
    query: CREATE_BILLING_SUBSCRIPTION,
    variables: {
      input: {
        stripePaymentMethodId: 'qwerty',
      },
    },
  },
  result: {
    data: {
      createBillingSubscription: {
        errors: null,
        subscription: '{"status":"active"}',
      },
    },
  },
};

export const createStatusPendingQuery = {
  request: {
    query: CREATE_BILLING_SUBSCRIPTION,
    variables: {
      input: {
        stripePaymentMethodId: 'qwerty',
      },
    },
  },
  result: {
    data: {
      createBillingSubscription: {
        errors: null,
        subscription: '{"status":"pending"}',
      },
    },
  },
};
