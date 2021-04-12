import React, { useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { loadStripe } from '@stripe/stripe-js';
import { Link } from 'react-router-dom';

import { Button } from '../../../components/UI/Form/Button/Button';
import { CREATE_BILLING_SUBSCRIPTION, UPDATE_BILLING } from '../../../graphql/mutations/Billing';
import styles from './Billing.module.css';
import { STRIPE_PUBLISH_KEY } from '../../../config';
import { setNotification } from '../../../common/notification';
import { GET_ORGANIZATION_BILLING } from '../../../graphql/queries/Billing';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { ReactComponent as BackIcon } from '../../../assets/images/icons/Back.svg';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(STRIPE_PUBLISH_KEY);

export const Billing = () => (
  <Elements stripe={stripePromise}>
    <BillingForm />
  </Elements>
);

export interface BillingProps {}

export const BillingForm: React.FC<BillingProps> = () => {
  const stripe = useStripe();
  const elements = useElements();
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [cardError, setCardError] = useState<any>('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [pending, setPending] = useState(false);

  // get organization billing details
  const { data: billData, loading: billLoading } = useQuery(GET_ORGANIZATION_BILLING, {
    fetchPolicy: 'network-only',
  });

  const [updateBilling] = useMutation(UPDATE_BILLING);

  const [createSubscription] = useMutation(CREATE_BILLING_SUBSCRIPTION, {
    onCompleted: (data) => {
      const result = JSON.parse(data.createBillingSubscription.subscription);
      if (result.status === 'pending') {
        if (stripe) {
          stripe
            .confirmCardSetup(result.client_secret, {
              payment_method: paymentMethodId,
            })
            .then((securityResult: any) => {
              if (securityResult.error?.message) {
                setNotification(client, securityResult.error?.message, 'warning');
                setLoading(false);
                updateBilling({
                  variables: {
                    id: billData.getOrganizationBilling?.billing?.id,
                    input: {
                      stripeSubscriptionId: null,
                      stripeSubscriptionStatus: null,
                    },
                  },
                });
              } else if (securityResult.setupIntent.status === 'succeeded') {
                setDisable(true);
                setLoading(false);
                setNotification(client, 'Your billing account is setup successfully');
              }
            });
        }
      } else if (result.status === 'active') {
        setDisable(true);
        setLoading(false);
        setNotification(client, 'Your billing account is setup successfully');
      }
    },
    onError: (error) => {
      setNotification(client, error.message, 'warning');
      setLoading(false);
    },
  });

  if (billLoading) {
    return <Loading />;
  }

  // check if the organization is already subscribed or in pending state
  if (billData && !alreadySubscribed && !pending) {
    const billingDetails = billData.getOrganizationBilling?.billing;
    if (
      billingDetails?.stripeSubscriptionId &&
      billingDetails?.stripeSubscriptionStatus === 'pending'
    )
      setPending(true);
    else if (
      billingDetails?.stripeSubscriptionId &&
      billingDetails?.stripeSubscriptionStatus === 'active'
    ) {
      setAlreadySubscribed(true);
    }
  }

  const handleSubmit = async (event: any) => {
    // Block native form submission.
    event.preventDefault();

    setLoading(true);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement: any = elements.getElement(CardElement);

    // create a payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setLoading(false);
      setNotification(client, error.message ? error.message : 'An error occurred', 'warning');
    } else if (paymentMethod) {
      setPaymentMethodId(paymentMethod.id);
      await createSubscription({
        variables: {
          input: {
            stripePaymentMethodId: paymentMethod.id,
          },
        },
      });
    }
  };

  const backLink = (
    <div className={styles.BackLink}>
      <Link to="/settings">
        <BackIcon />
        Back to settings
      </Link>
    </div>
  );

  const cardElements = (
    <>
      <CardElement
        className={styles.Card}
        onChange={(e) => {
          setCardError(e.error?.message);
        }}
      />
      <div className={styles.Error}>
        <small>{cardError}</small>
      </div>
      <div className={styles.Helper}>
        <small>Once subscribed you will be charged on basis of your usage automatically</small>
      </div>
      <Button
        variant="contained"
        data-testid="submitButton"
        color="primary"
        type="submit"
        className={styles.Button}
        disabled={!stripe || disable}
        loading={loading}
      >
        Subscribe for monthly billing
      </Button>
    </>
  );

  const subscribed = <div className={styles.Subscribed}>You have an active subscription</div>;
  let paymentBody = alreadySubscribed || disable ? subscribed : cardElements;

  if (pending) {
    paymentBody = <div className={styles.Subscribed}>Your payment is in pending state</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.Form}>
      <h1>Billing</h1>
      {backLink}
      <div className={styles.Description}>
        <div className={styles.Setup}>
          <div>
            <div className={styles.Heading}>One time setup</div>
            <div className={styles.Pricing}>
              <span>INR 0</span> ($0)
            </div>
          </div>
          <div>
            <div className={styles.Heading}>Monthly Recurring</div>
            <div className={styles.Pricing}>
              <span>INR 7,500</span> ($110)
            </div>
            <ul className={styles.List}>
              <li>upto 250k messages</li>
              <li>1-10 users</li>
            </ul>
          </div>
        </div>
        <div className={styles.Additional}>
          <div className={styles.Heading}>Variable charges as usage increases</div>
          <div>For every staff member over 10 users – INR 150 ($2)</div>
          <div>For every 1K messages upto 1Mn messages – INR 10 ($0.14)</div>
          <div>For every 1K messages over 1Mn messages – INR 5 ($0.07)</div>
        </div>
      </div>
      {paymentBody}
    </form>
  );
};

export default Billing;
