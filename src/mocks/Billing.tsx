import CREATE_BILLING_SUBSCRIPTION, {
  UPDATE_BILLING,
  CREATE_BILLING,
} from 'graphql/mutations/Billing';
import GET_ORGANIZATION_BILLING, {
  GET_COUPON_CODE,
  GET_CUSTOMER_PORTAL,
} from 'graphql/queries/Billing';

export const createBillingSubscriptionQuery = {
  request: {
    query: CREATE_BILLING_SUBSCRIPTION,
    variables: {
      stripePaymentMethodId: 'qwerty',
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

export const updateBillingQuery = {
  request: {
    query: UPDATE_BILLING,
    variables: {
      id: '1',
      input: {
        name: 'Glific Admin 1',
        currency: 'inr',
        email: 'glific@glific.com',
      },
    },
  },
  result: {
    data: {
      updateBilling: {
        billing: {
          id: '1',
        },
      },
    },
  },
};

export const createStatusPendingQuery = {
  request: {
    query: CREATE_BILLING_SUBSCRIPTION,
    variables: {
      stripePaymentMethodId: 'qwerty',
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
          deductTds: false,
          tdsAmount: 0,
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

export const createBillingSubscriptionPromoQuery = {
  request: {
    query: CREATE_BILLING_SUBSCRIPTION,
    variables: {
      couponCode: 'jsjscbjwew',
      stripePaymentMethodId: 'qwerty',
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

export const getCustomerPortalQuery = {
  request: {
    query: GET_CUSTOMER_PORTAL,
  },
  result: {
    data: {
      customerPortal: {
        url: 'billing.glific.com/session/_sdjsjscbjwew',
      },
    },
  },
};

export const getCouponCode = {
  request: {
    query: GET_COUPON_CODE,
    variables: {
      code: 'PBXGFH',
    },
  },
  result: {
    data: {
      getCouponCode: {
        id: 'jsjscbjwew',
        code: 'PBXGFH',
        metadata: '{}',
      },
    },
  },
};

const getOrganizationBilling = {
  request: {
    query: GET_ORGANIZATION_BILLING,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      getOrganizationBilling: {
        billing: {
          currency: 'inr',
          email: 'testing@example.com',
          id: '1',
          isActive: true,
          name: 'test',
          stripeSubscriptionId: null,
          stripeSubscriptionItems: '{}',
          stripeSubscriptionStatus: null,
          tdsAmount: 4,
          deductTds: true,
        },
      },
    },
  },
};

const getOrganizationBillingWithNoBilling = {
  request: {
    query: GET_ORGANIZATION_BILLING,
    variables: { organizationId: '2' },
  },
  result: {
    data: {
      getOrganizationBilling: {
        billing: null,
      },
    },
  },
};

const createOrganizationBilling = {
  request: {
    query: CREATE_BILLING,
    variables: {
      currency: 'inr',
      email: 'testing@example.com',
      name: 'testing',
      organizationId: '2',
    },
  },
  result: {
    data: {
      createBilling: {
        billing: {
          id: '1',
        },
        errors: null,
      },
    },
  },
};

export const organizationCustomerMock = [
  createOrganizationBilling,
  getOrganizationBilling,
  getOrganizationBillingWithNoBilling,
  updateBillingQuery,
];
