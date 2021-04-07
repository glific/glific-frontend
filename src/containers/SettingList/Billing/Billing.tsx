import React, { useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { loadStripe } from '@stripe/stripe-js';
import { Link } from 'react-router-dom';

import { Button } from '../../../components/UI/Form/Button/Button';
import { CREATE_BILLING_SUBSCRIPTION } from '../../../graphql/mutations/Billing';
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
  const [cardError, setCardError] = useState<any>('');

  const { loading: billLoading } = useQuery(GET_ORGANIZATION_BILLING);

  const [createSubscription] = useMutation(CREATE_BILLING_SUBSCRIPTION, {
    onCompleted: (data) => {
      const result = JSON.parse(data.createBillingSubscription.subscription);
      console.log(result);
      setDisable(true);
      setLoading(false);
      setNotification(client, 'Subscribed successfully');
    },
    onError: (error) => {
      setNotification(client, error.message, 'warning');
    },
  });

  if (billLoading) {
    return <Loading />;
  }

  // if (data && data.getOrganizationBilling.billing.stripeSubscriptionId) {
  //   return <div>You are already subscribed</div>;
  // }

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

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[error]', error);
      setLoading(false);
    } else if (paymentMethod) {
      createSubscription({
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

  return (
    <form onSubmit={handleSubmit} style={{ width: '500px', marginLeft: '24px', marginTop: '10px' }}>
      <h1>Billing</h1>

      {backLink}

      <div className={styles.Description}>
        <div className={styles.Heading}>
          <div>Prices</div>
          <div>Messages</div>
          <div>Users</div>
        </div>
        You will be charged a monthly amount of R 7,500+GST for an exchange of upto 250K messages
        and 10 staff members. For higher volumes, the monthly price will be a percentage of the
        messaging costs, such as:
        <ul>
          <li>upto 250K messages/1 – 10 users – INR 7500 ($110)</li>
          <li> 250K – 500K/1 – 15 users – INR 15000 ($220)</li>
          <li> 500K – 1 million/1 – 20 users – INR 22500 ($330) </li>
          <li>
            and an additional INR 7,500 ($110) for every 1 million bucket and an additional INR
            1,500 ($22) for every 10 users
          </li>
        </ul>
      </div>
      <CardElement
        className={styles.Card}
        onChange={(e) => {
          setCardError(e.error?.message);
        }}
      />
      <div>
        <small>{cardError}</small>
      </div>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        className={styles.Button}
        disabled={!stripe || disable}
        loading={loading}
      >
        Subscribe
      </Button>
    </form>
  );
};

export default Billing;
