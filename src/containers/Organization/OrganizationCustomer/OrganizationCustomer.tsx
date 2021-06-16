import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Dialog, DialogContent } from '@material-ui/core';
import { useLazyQuery } from '@apollo/client';

import styles from './OrganizationCustomer.module.css';
import { Input } from '../../../components/UI/Form/Input/Input';
import { FormLayout } from '../../Form/FormLayout';
import { ReactComponent as OrganizationCustomerIcon } from '../../../assets/images/icons/customer_details.svg';
import { GET_ORGANIZATION_BILLING } from '../../../graphql/queries/Billing';
import { CREATE_BILLING, UPDATE_BILLING } from '../../../graphql/mutations/Billing';

export interface OrganizationCustomerProps {
  match: any;
  openDialog: boolean;
}

export const OrganizationCustomer: React.SFC<OrganizationCustomerProps> = ({
  match,
  openDialog,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('');
  const [isBillingPresent, setIsBillingPresent] = useState(false);

  const variables = { filter: { organizationId: match.params.id } };
  const [getBillingDetailsForOrganization] = useLazyQuery(GET_ORGANIZATION_BILLING, {
    variables,
    onCompleted: ({ getOrganizationBilling }) => {
      if (getOrganizationBilling) {
        setIsBillingPresent(!!getOrganizationBilling.billing);
      }
    },
  });

  useEffect(() => {
    getBillingDetailsForOrganization();
  }, []);

  const { t } = useTranslation();

  const states = { name, email, currency };
  const setStates = ({ name: nameVal, email: emailVal, currency: currencyVal }: any) => {
    setName(nameVal);
    setEmail(emailVal);
    setCurrency(currencyVal);
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
  });

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Customer Name'),
      disabled: isBillingPresent,
      inputProp: {
        onChange: (event: any) => setName(event.target.value),
      },
    },
    {
      component: Input,
      name: 'email',
      type: 'text',
      disabled: isBillingPresent,
      placeholder: t('Customer Email'),
      inputProp: {
        onChange: (event: any) => setEmail(event.target.value),
      },
    },
    {
      component: Input,
      name: 'currency',
      type: 'text',
      disabled: isBillingPresent,
      placeholder: t('Currency'),
      inputProp: {
        onChange: (event: any) => setCurrency(event.target.value),
      },
    },
  ];

  const setPayload = (payload: any) => {
    const payloadBody = { ...payload };
    payloadBody.organizationId = match.params.id;
    return payloadBody;
  };

  const icon = <OrganizationCustomerIcon className={styles.OrganizationCustomerIcon} />;
  const title = isBillingPresent ? 'Customer Details' : 'Add Customer';
  const editStyles = isBillingPresent ? styles.Edit : '';

  return (
    <div className={styles.container}>
      <Dialog
        open={openDialog}
        classes={{
          paper: styles.Dialogbox,
        }}
      >
        <DialogContent classes={{ root: styles.DialogContent }}>
          <div className={`${styles.Layout} ${editStyles}`}>
            <FormLayout
              {...queries}
              title={t(`${title}`)}
              listItem="billing"
              listItemName="billing"
              match={match}
              refetchQueries={[
                { query: GET_ORGANIZATION_BILLING, variables: { organizationId: match.params.id } },
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
