import CREATE_BILLING_SUBSCRIPTION from '../graphql/mutations/Billing';
import GET_ORGANIZATION_BILLING from '../graphql/queries/Billing';

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

export const getBillingQuery = {
  request: {
    query: GET_ORGANIZATION_BILLING,
    variables: {},
  },
  result: {
    data: {
      getOrganizationBilling: {
        billing: {
          currency: 'inr',
          email: 'glific@glific.com',
          id: '1',
          isActive: true,
          stripeSubscriptionId: '',
          stripeSubscriptionItems: null,
          stripeSubscriptionStatus: '',
        },
      },
    },
  },
};
