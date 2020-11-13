import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import * as Yup from 'yup';

import { ReactComponent as ProfileIcon } from '../../assets/images/icons/Contact/Profile.svg';
import { CONTACT_STATUS, PROVIDER_STATUS } from '../../common/constants';
import { FormLayout } from '../Form/FormLayout';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { Input } from '../../components/UI/Form/Input/Input';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { GET_CONTACT } from '../../graphql/queries/Contact';
import { CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT } from '../../graphql/mutations/Contact';
import { GET_CURRENT_USER } from '../../graphql/queries/User';

const dialogMessage = "You won't be able to send the messages to this contact.";

const profileIcon = <ProfileIcon />;

const queries = {
  getItemQuery: GET_CONTACT,
  createItemQuery: CREATE_CONTACT,
  updateItemQuery: UPDATE_CONTACT,
  deleteItemQuery: DELETE_CONTACT,
};

export interface ProfileProps {
  match?: any;
  profileType: string;
  redirectionLink: string;
  additionalField?: any;
  additionalProfileStates?: any;
  additionalState?: any;
  additionalQuery?: any;
  afterDelete?: any;
}

export const Profile: React.SFC<ProfileProps> = ({
  match,
  profileType,
  redirectionLink,
  additionalField,
  additionalProfileStates,
  additionalState,
  additionalQuery,
  afterDelete,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [bspStatus, setBspStatus] = useState('');

  const { data, loading } = useQuery(GET_CURRENT_USER);
  if (loading) return <Loading />;

  const loggedInUserContactId = data.currentUser.user.contact.id;

  let currentContactId;
  if (!match) {
    // let's manually set the contact id in the match object in case of user profile
    match = { params: { id: loggedInUserContactId } };
    currentContactId = loggedInUserContactId;
  } else {
    currentContactId = match.params.id;
  }

  const states: any = { name, phone, status, bspStatus };

  const setStates = ({ nameValue, phoneValue, statusValue, bspStatusValue, ...rest }: any) => {
    setName(nameValue);
    setPhone(phoneValue);
    setStatus(statusValue);
    setBspStatus(bspStatusValue);
    if (additionalProfileStates) {
      additionalProfileStates.setState(rest[additionalProfileStates.name]);
    }
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
      name: 'bspStatus',
      placeholder: 'Provider status',
      options: PROVIDER_STATUS,
      disabled: true,
      skipPayload: true,
    },
  ];

  if (additionalProfileStates) {
    states[additionalProfileStates.name] = additionalProfileStates.state;
    formFields.splice(1, 0, additionalField);
  }

  let type: any;
  let pageTitle = 'Contact Profile';
  if (profileType === 'User' || loggedInUserContactId === currentContactId) {
    type = 'UserProfile';
    pageTitle = 'My Profile';
  }

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      additionalState={additionalState}
      validationSchema={FormSchema}
      listItemName="Contact"
      dialogMessage={dialogMessage}
      additionalQuery={additionalQuery}
      formFields={formFields}
      redirectionLink={redirectionLink}
      listItem="contact"
      icon={profileIcon}
      afterDelete={afterDelete}
      type={type}
      title={pageTitle}
    />
  );
};
