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

const billingQuery = (status: any, subscriptionId: any = 'wjnwicwowc98nj') => ({
  request: {
    query: GET_ORGANIZATION_BILLING,
    variables: {},
  },
  result: {
    data: {
      getOrganizationBilling: {
        billing: {
          name: 'Glific Admin',
          currency: 'inr',
          email: 'glific@glific.com',
          id: '1',
          isActive: true,
          stripeSubscriptionId: subscriptionId,
          stripeSubscriptionItems: null,
          stripeSubscriptionStatus: status,
        },
      },
    },
  },
});

export const getBillingQuery = billingQuery('');

export const getPendingBillingQuery = billingQuery('pending');

export const getBillingQueryWithoutsubscription = billingQuery(null, null);
