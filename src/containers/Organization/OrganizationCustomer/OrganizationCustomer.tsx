import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Dialog, DialogContent } from '@material-ui/core';
import { useParams } from 'react-router-dom';

import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { ReactComponent as OrganizationCustomerIcon } from 'assets/images/icons/customer_details.svg';
import { GET_ORGANIZATION_BILLING } from 'graphql/queries/Billing';
import { CREATE_BILLING, UPDATE_BILLING } from 'graphql/mutations/Billing';
import styles from './OrganizationCustomer.module.css';

export interface OrganizationCustomerProps {
  openDialog: boolean;
}

export const OrganizationCustomer = ({ openDialog }: OrganizationCustomerProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('');
  const [tds, setTds] = useState(0);
  const [billingId, setBillingId] = useState(null);
  const [isBillingPresent, setIsBillingPresent] = useState(false);
  const params = useParams();

  const { t } = useTranslation();

  const states = { name, email, currency, tds };
  const setStates = ({
    name: nameVal,
    email: emailVal,
    currency: currencyVal,
    tdsAmount: tdsVal,
    id: idVal,
  }: any) => {
    setName(nameVal);
    setEmail(emailVal);
    setCurrency(currencyVal);
    setTds(tdsVal);
    setBillingId(idVal);
    setIsBillingPresent(true);
  };

  const queries: any = {
    getItemQuery: GET_ORGANIZATION_BILLING,
    createItemQuery: CREATE_BILLING,
    updateItemQuery: UPDATE_BILLING,
    deleteItemQuery: UPDATE_BILLING,
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
    email: Yup.string().email(t('Email is invalid')).required(t('Email is required.')),
    currency: Yup.string().required(t('Currency is required.')),
    tds: Yup.number()
      .min(0, 'TDS should not be negative')
      .max(10, 'TDS amount should be less than or equal 10%'),
  });

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Customer Name'),
      inputProp: {
        onChange: (event: any) => setName(event.target.value),
      },
    },
    {
      component: Input,
      name: 'email',
      type: 'text',
      placeholder: t('Customer Email'),
      inputProp: {
        onChange: (event: any) => setEmail(event.target.value),
      },
    },
    {
      component: Input,
      name: 'currency',
      type: 'text',
      placeholder: t('Currency'),
      inputProp: {
        onChange: (event: any) => setCurrency(event.target.value),
      },
    },
    {
      component: Input,
      name: 'tds',
      type: 'number',
      placeholder: t('TDS%'),
      inputProp: {
        onChange: (event: any) => setTds(event.target.value),
      },
    },
  ];

  const setPayload = (payload: any) => {
    const payloadBody = { ...payload };
    payloadBody.organizationId = params.id;

    payloadBody.tds_amount = Number(payloadBody.tds);
    delete payloadBody.tds;

    payloadBody.deduct_tds = !!payloadBody.tds_amount;
    if (isBillingPresent) {
      payloadBody.billingId = billingId;
    }

    return payloadBody;
  };

  const icon = <OrganizationCustomerIcon className={styles.OrganizationCustomerIcon} />;
  const title = isBillingPresent ? 'Customer Details' : 'Add Customer';

  return (
    <div className={styles.container}>
      <Dialog
        open={openDialog}
        classes={{
          paper: styles.Dialogbox,
        }}
      >
        <DialogContent classes={{ root: styles.DialogContent }}>
          <div className={styles.Layout}>
            <FormLayout
              {...queries}
              title={title}
              listItem="billing"
              listItemName="billing"
              refetchQueries={[
                { query: GET_ORGANIZATION_BILLING, variables: { organizationId: params.id } },
              ]}
              states={states}
              setStates={setStates}
              setPayload={setPayload}
              validationSchema={FormSchema}
              formFields={formFields}
              redirectionLink="organizations"
              icon={icon}
              languageSupport={false}
              customStyles={[styles.Form]}
              type="customer"
              idType="organizationId"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
