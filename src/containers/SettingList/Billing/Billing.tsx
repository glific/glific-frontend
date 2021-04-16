import React, { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { loadStripe } from '@stripe/stripe-js';
import { Formik, Form, Field } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { IconButton, Typography } from '@material-ui/core';

import { ReactComponent as ApprovedIcon } from '../../../assets/images/icons/Template/Approved.svg';
import { ReactComponent as Settingicon } from '../../../assets/images/icons/Settings/Settings.svg';
import { ReactComponent as PendingIcon } from '../../../assets/images/icons/Template/Pending.svg';
import { Button } from '../../../components/UI/Form/Button/Button';
import {
  CREATE_BILLING_SUBSCRIPTION,
  UPDATE_BILLING,
  CREATE_BILLING,
} from '../../../graphql/mutations/Billing';
import styles from './Billing.module.css';
import { STRIPE_PUBLISH_KEY } from '../../../config';
import { setNotification } from '../../../common/notification';
import { GET_ORGANIZATION_BILLING } from '../../../graphql/queries/Billing';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { ReactComponent as BackIcon } from '../../../assets/images/icons/Back.svg';
import { Input } from '../../../components/UI/Form/Input/Input';

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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [cardError, setCardError] = useState<any>('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [pending, setPending] = useState(false);
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
    email: Yup.string().email().required(t('Email is required.')),
  });

  // get organization billing details
  const { data: billData, loading: billLoading, refetch } = useQuery(GET_ORGANIZATION_BILLING, {
    fetchPolicy: 'network-only',
  });

  const formFieldItems = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'Your name',
      disabled: alreadySubscribed || pending,
    },
    {
      component: Input,
      name: 'email',
      type: 'text',
      placeholder: 'Email ID',
      disabled: alreadySubscribed || pending,
    },
  ];

  useEffect(() => {
    // Set name and email if a customer is already created
    if (billData && billData.getOrganizationBilling?.billing) {
      setName(billData.getOrganizationBilling?.billing.name);
      setEmail(billData.getOrganizationBilling?.billing.email);
    }
  }, [billData]);

  const [updateBilling] = useMutation(UPDATE_BILLING);
  const [createBilling] = useMutation(CREATE_BILLING);

  const [createSubscription] = useMutation(CREATE_BILLING_SUBSCRIPTION, {
    onCompleted: (data) => {
      const result = JSON.parse(data.createBillingSubscription.subscription);
      // needs additional security (3d secure)
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
      } // successful subscription
      else if (result.status === 'active') {
        setDisable(true);
        setLoading(false);
        setNotification(client, 'Your billing account is setup successfully');
      }
    },
    onError: (error) => {
      refetch();
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
    if (billingDetails) {
      const { stripeSubscriptionId, stripeSubscriptionStatus } = billingDetails;
      if (stripeSubscriptionId && stripeSubscriptionStatus === 'pending') {
        setPending(true);
      } else if (stripeSubscriptionId && stripeSubscriptionStatus === 'active') {
        setAlreadySubscribed(true);
      }
    }
  }

  const stripePayment = async () => {
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
      refetch();
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

  const handleSubmit = async (itemData: any) => {
    const { name: billingName, email: billingEmail } = itemData;
    setLoading(true);

    if (billData) {
      const billingDetails = billData.getOrganizationBilling?.billing;
      if (billingDetails) {
        // Check if customer needs to be updated
        if (billingDetails.name !== name || billingDetails.email !== email) {
          updateBilling({
            variables: {
              id: billingDetails.id,
              input: {
                name: billingName,
                email: billingEmail,
                currency: 'inr',
              },
            },
          })
            .then(() => {
              stripePayment();
            })
            .catch((error) => {
              setNotification(client, error.message, 'warning');
            });
        } else {
          stripePayment();
        }
      } else {
        // There is no customer created. Creating a customer first
        createBilling({
          variables: {
            input: {
              name: billingName,
              email: billingEmail,
              currency: 'inr',
            },
          },
        })
          .then(() => {
            stripePayment();
          })
          .catch((error) => {
            setNotification(client, error.message, 'warning');
          });
      }
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
        options={{ hidePostalCode: true }}
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
    </>
  );

  const subscribed = (
    <div className={styles.Subscribed}>
      <ApprovedIcon />
      You have an active subscription
      <div>
        Please <span>contact us</span> to deactivate
      </div>
    </div>
  );
  let paymentBody = alreadySubscribed || disable ? subscribed : cardElements;

  if (pending) {
    paymentBody = (
      <div className={styles.Pending}>
        <PendingIcon className={styles.PendingIcon} />
        Your payment is in pending state
      </div>
    );
  }

  return (
    <div className={styles.Form}>
      <Typography variant="h5" className={styles.Title}>
        <IconButton disabled className={styles.Icon}>
          <Settingicon />
        </IconButton>
        Billing
      </Typography>
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

      <div>
        <Formik
          enableReinitialize
          initialValues={{
            name,
            email,
          }}
          validationSchema={validationSchema}
          onSubmit={(itemData) => {
            handleSubmit(itemData);
          }}
        >
          {() => (
            <Form>
              {formFieldItems.map((field, index) => {
                const key = index;
                return <Field key={key} {...field} />;
              })}
              {paymentBody}
              {!alreadySubscribed && !pending && !disable ? (
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
              ) : null}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Billing;
