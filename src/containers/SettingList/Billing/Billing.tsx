import React, { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { loadStripe } from '@stripe/stripe-js';
import { Formik, Form, Field } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { CircularProgress, IconButton, InputAdornment, Typography } from '@material-ui/core';
import CallMadeIcon from '@material-ui/icons/CallMade';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';

import { ReactComponent as ApprovedIcon } from 'assets/images/icons/Template/Approved.svg';
import { ReactComponent as Settingicon } from 'assets/images/icons/Settings/Settings.svg';
import { ReactComponent as PendingIcon } from 'assets/images/icons/Template/Pending.svg';
import { ReactComponent as BackIcon } from 'assets/images/icons/Back.svg';
import {
  CREATE_BILLING_SUBSCRIPTION,
  UPDATE_BILLING,
  CREATE_BILLING,
} from 'graphql/mutations/Billing';
import {
  GET_CUSTOMER_PORTAL,
  GET_ORGANIZATION_BILLING,
  GET_COUPON_CODE,
} from 'graphql/queries/Billing';
import { Button } from 'components/UI/Form/Button/Button';
import Loading from 'components/UI/Layout/Loading/Loading';
import { Input } from 'components/UI/Form/Input/Input';
import { STRIPE_PUBLISH_KEY } from 'config';
import { setNotification } from 'common/notification';
import styles from './Billing.module.css';

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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [cardError, setCardError] = useState<any>('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [pending, setPending] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [coupon] = useState('');

  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
    email: Yup.string().email().required(t('Email is required.')),
  });

  // get organization billing details
  const {
    data: billData,
    loading: billLoading,
    refetch,
  } = useQuery(GET_ORGANIZATION_BILLING, {
    fetchPolicy: 'network-only',
  });

  const [getCouponCode, { data: couponCode, loading: couponLoading, error: couponError }] =
    useLazyQuery(GET_COUPON_CODE);

  const [getCustomerPortal, { loading: portalLoading }] = useLazyQuery(GET_CUSTOMER_PORTAL, {
    fetchPolicy: 'network-only',
  });

  const formFieldItems = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'Your Organization Name',
      disabled: alreadySubscribed || pending || disable,
    },
    {
      component: Input,
      name: 'email',
      type: 'text',
      placeholder: 'Email ID',
      disabled: alreadySubscribed || pending || disable,
    },
  ];

  useEffect(() => {
    // Set name and email if a customer is already created
    if (billData && billData.getOrganizationBilling?.billing) {
      const billing = billData.getOrganizationBilling?.billing;
      setName(billing?.name);
      setEmail(billing?.email);

      if (billing?.stripeSubscriptionStatus === null) {
        setPending(false);
      }
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
                setNotification(securityResult.error?.message, 'warning');
                setLoading(false);
                refetch().then(({ data: refetchedData }) => {
                  updateBilling({
                    variables: {
                      id: refetchedData.getOrganizationBilling?.billing?.id,
                      input: {
                        stripeSubscriptionId: null,
                        stripeSubscriptionStatus: null,
                      },
                    },
                  }).then(() => {
                    refetch();
                  });
                });
              } else if (securityResult.setupIntent.status === 'succeeded') {
                setDisable(true);
                setLoading(false);
                setNotification('Your billing account is setup successfully');
              }
            });
        }
      } // successful subscription
      else if (result.status === 'active') {
        refetch();
        setDisable(true);
        setLoading(false);
        setNotification('Your billing account is setup successfully');
      }
    },
    onError: (error) => {
      refetch();
      setNotification(error.message, 'warning');
      setLoading(false);
    },
  });

  if (billLoading || portalLoading) {
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
      setNotification(error.message ? error.message : 'An error occurred', 'warning');
    } else if (paymentMethod) {
      setPaymentMethodId(paymentMethod.id);

      const variables: any = {
        stripePaymentMethodId: paymentMethod.id,
      };

      if (couponApplied) {
        variables.couponCode = couponCode.getCouponCode.id;
      }

      await createSubscription({
        variables,
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
        if (billingDetails.name !== billingName || billingDetails.email !== billingEmail) {
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
              setNotification(error.message, 'warning');
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
            setNotification(error.message, 'warning');
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
    <div>
      <div className={styles.Subscribed}>
        <ApprovedIcon />
        You have an active subscription
        <div>
          Please <span>contact us</span> to deactivate
          <br />
          *Note that we do not store your credit card details, as Stripe securely does.
        </div>
      </div>

      <div
        aria-hidden
        className={styles.Portal}
        data-testid="customerPortalButton"
        onClick={() => {
          getCustomerPortal().then(({ data: { customerPortal } }) => {
            window.open(customerPortal.url, '_blank');
          });
        }}
      >
        Visit Stripe portal <CallMadeIcon />
      </div>
    </div>
  );
  let paymentBody = alreadySubscribed || disable ? subscribed : cardElements;

  if (pending) {
    paymentBody = (
      <div>
        <div className={styles.Pending}>
          <PendingIcon className={styles.PendingIcon} />
          Your payment is in pending state
        </div>
        <div
          aria-hidden
          className={styles.Portal}
          data-testid="customerPortalButton"
          onClick={() => {
            getCustomerPortal();
          }}
        >
          Visit Stripe portal <CallMadeIcon />
        </div>
      </div>
    );
  }

  const couponDescription = couponCode && JSON.parse(couponCode.getCouponCode.metadata);
  const processIncomplete = !alreadySubscribed && !pending && !disable;
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
        <div className={styles.UpperSection}>
          <div className={styles.Setup}>
            <div>
              <div className={styles.Heading}>One time setup</div>
              <div className={styles.Pricing}>
                <span>INR 15000</span> ($220)
              </div>
              <div className={styles.Pricing}>+ taxes</div>
              <ul className={styles.List}>
                <li>5hr consulting</li>
                <li>1 hr onboarding session</li>
              </ul>
            </div>
            <div>
              <div className={styles.Heading}>Monthly Recurring</div>
              <div className={styles.Pricing}>
                <span>INR 7,500</span> ($110)
              </div>
              <div className={styles.Pricing}>+ taxes</div>
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
        <div className={styles.DottedSpaced} />
        <div className={styles.BottomSection}>
          <div className={styles.InactiveHeading}>
            Suspended or inactive accounts:{' '}
            <span className={styles.Amount}> INR 4,500/mo + taxes</span>
          </div>
        </div>
      </div>

      {couponApplied && (
        <div className={styles.CouponDescription}>
          <div className={styles.CouponHeading}>Coupon Applied!</div>
          <div>{couponDescription.description}</div>
        </div>
      )}

      {processIncomplete && couponError && (
        <div className={styles.CouponError}>
          <div>Invalid Coupon!</div>
        </div>
      )}

      <div>
        <Formik
          enableReinitialize
          validateOnBlur={false}
          initialValues={{
            name,
            email,
            coupon,
          }}
          validationSchema={validationSchema}
          onSubmit={(itemData) => {
            handleSubmit(itemData);
          }}
        >
          {({ values, setFieldError, setFieldTouched }) => (
            <Form>
              {processIncomplete && (
                <Field
                  component={Input}
                  name="coupon"
                  type="text"
                  placeholder="Coupon Code"
                  disabled={couponApplied}
                  endAdornment={
                    <InputAdornment position="end">
                      {couponLoading ? (
                        <CircularProgress />
                      ) : (
                        <div
                          aria-hidden
                          className={styles.Apply}
                          onClick={() => {
                            if (values.coupon === '') {
                              setFieldError('coupon', 'Please input coupon code');
                              setFieldTouched('coupon');
                            } else {
                              getCouponCode({ variables: { code: values.coupon } }).then(
                                ({ data: { getCouponCode: couponCodeResult } }) => {
                                  if (couponCodeResult.code) {
                                    setCouponApplied(true);
                                  }
                                }
                              );
                            }
                          }}
                        >
                          {couponApplied ? (
                            <CancelOutlinedIcon
                              className={styles.CrossIcon}
                              onClick={() => setCouponApplied(false)}
                            />
                          ) : (
                            ' APPLY'
                          )}
                        </div>
                      )}
                    </InputAdornment>
                  }
                />
              )}
              {formFieldItems.map((field, index) => {
                const key = index;
                return <Field key={key} {...field} />;
              })}

              {paymentBody}

              {processIncomplete && (
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
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Billing;
