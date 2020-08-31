import React, { useState } from 'react';
import { FormLayout } from '../Form/FormLayout';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';

import { GET_CONTACT } from '../../graphql/queries/Contact';
import { ReactComponent as ProfileIcon } from '../../assets/images/icons/Contact/Profile.svg';
import { CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT } from '../../graphql/mutations/Contact';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { CONTACT_STATUS, PROVIDER_STATUS } from '../../common/constants';

const dialogMessage = "You won't be able to send the messages to this contact.";

const profileIcon = <ProfileIcon />;

const queries = {
  getItemQuery: GET_CONTACT,
  createItemQuery: CREATE_CONTACT,
  updateItemQuery: UPDATE_CONTACT,
  deleteItemQuery: DELETE_CONTACT,
};

export interface ProfileProps {
  match: any;
  profileType: string;
  redirectionLink: string;
}

export const Profile: React.SFC<ProfileProps> = ({ match, profileType, redirectionLink }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [providerStatus, setProviderStatus] = useState('');

  const states = { name, phone, status, providerStatus };
  const setStates = ({ name, phone, status, providerStatus }: any) => {
    setName(name);
    setPhone(phone);
    setStatus(status);
    setProviderStatus(providerStatus);
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required('Name is required.'),
  });

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'Name',
    },
    {
      component: Input,
      name: 'phone',
      placeholder: 'Phone Number',
      disabled: true,
      skipPayload: true,
    },
    {
      component: Dropdown,
      name: 'status',
      placeholder: 'Status',
      options: CONTACT_STATUS,
      disabled: true,
      skipPayload: true,
    },

    {
      component: Dropdown,
      name: 'providerStatus',
      placeholder: 'Provider status',
      options: PROVIDER_STATUS,
      disabled: true,
      skipPayload: true,
    },
  ];

  let type: any;
  if (profileType === 'User') {
    type = 'UserProfile';
  }

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="contact"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={redirectionLink}
      listItem="contact"
      icon={profileIcon}
      type={type}
    />
  );
};
