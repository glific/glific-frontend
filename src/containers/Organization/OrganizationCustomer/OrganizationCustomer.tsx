import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Dialog, DialogContent } from '@material-ui/core';

import styles from './OrganizationCustomer.module.css';
import { Input } from '../../../components/UI/Form/Input/Input';
import { FormLayout } from '../../Form/FormLayout';
import { ReactComponent as ConsultingIcon } from '../../../assets/images/icons/icon-consulting.svg';
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
  ];

  const setPayload = (payload: any) => {
    const payloadBody = { ...payload };
    payloadBody.organizationId = match.params.id;
    return payloadBody;
  };

  const icon = <ConsultingIcon className={styles.OrganizationCustomerIcon} />;

  return (
    <Dialog
      open={openDialog}
      classes={{
        paper: styles.Dialogbox,
      }}
    >
      <DialogContent classes={{ root: styles.DialogContent }}>
        <FormLayout
          {...queries}
          title={t('Add Customer')}
          listItem="getOrganizationBilling"
          listItemName="getOrganizationBilling"
          pageLink="getOrganizationBilling"
          match={match}
          refetchQueries={[]}
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
        />
      </DialogContent>
    </Dialog>
  );
};
