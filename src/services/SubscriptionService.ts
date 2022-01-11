import { getUserSession } from './AuthService';

const subscriptionVariables = { organizationId: getUserSession('organizationId') };

export const startSubscription = (
  subscriptionFunc: any,
  document: any,
  type: any,
  updateFunc: any
) => {
  subscriptionFunc({
    document,
    variables: subscriptionVariables,
    updateQuery: (prev: any, { subscriptionData }: any) => updateFunc(prev, subscriptionData, type),
  });
};
