import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ProfileIcon } from 'assets/images/icons/Contact/Profile.svg';
import { CONTACT_STATUS, PROVIDER_STATUS } from 'common/constants';
import { FormLayout } from 'containers/Form/FormLayout';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_CONTACT } from 'graphql/queries/Contact';
import { CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT } from 'graphql/mutations/Contact';
import { GET_CURRENT_USER } from 'graphql/queries/User';

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
  additionalQuery?: Function;
  afterDelete?: any;
  removePhoneField?: boolean;
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
  removePhoneField = false,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [bspStatus, setBspStatus] = useState('');
  const { t } = useTranslation();

  let param = match;

  const { data, loading } = useQuery(GET_CURRENT_USER);
  if (loading) return <Loading />;

  const loggedInUserContactId = data.currentUser.user.contact.id;
  const currentUserPhone = data.currentUser.user.phone;

  let currentContactId;
  if (!match) {
    // let's manually set the contact id in the match object in case of user profile
    param = { params: { id: loggedInUserContactId } };
    currentContactId = loggedInUserContactId;
  } else {
    currentContactId = match.params.id;
  }

  const states: any = { name, phone, status, bspStatus };

  const setStates = ({
    name: nameValue,
    phone: phoneValue,
    status: statusValue,
    bspStatus: bspStatusValue,
    ...rest
  }: any) => {
    setName(nameValue);
    if (phoneValue) {
      setPhone(phoneValue);
    } else {
      // contact api does not return the phone when role is staff, hence in this case we manually set the phone
      // for the current user
      setPhone(currentUserPhone);
    }
    setStatus(statusValue);
    setBspStatus(bspStatusValue);
    if (additionalProfileStates) {
      additionalProfileStates.setState(rest[additionalProfileStates.name]);
    }
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
  });

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      disabled: profileType === 'Contact',
      placeholder: t('Name'),
    },
    {
      component: Input,
      name: 'phone',
      placeholder: t('Phone Number'),
      disabled: true,
      skipPayload: true,
    },
    {
      component: Dropdown,
      name: 'status',
      placeholder: t('Status'),
      options: CONTACT_STATUS,
      disabled: true,
      skipPayload: true,
    },

    {
      component: Dropdown,
      name: 'bspStatus',
      placeholder: t('Provider status'),
      options: PROVIDER_STATUS,
      disabled: true,
      skipPayload: true,
    },
  ];

  if (additionalProfileStates) {
    states[additionalProfileStates.name] = additionalProfileStates.state;
    formFields.splice(1, 0, additionalField);
  }

  // remove phone field incase of contact profile
  if (removePhoneField) {
    formFields.splice(2, 1);
  }

  let type: any;
  let pageTitle = t('Contact Profile');
  if (profileType === 'User' || loggedInUserContactId === currentContactId) {
    type = 'UserProfile';
    pageTitle = t('My Profile');
  }

  const dialogMessage = t("You won't be able to send the messages to this contact.");

  return (
    <FormLayout
      {...queries}
      match={param}
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
