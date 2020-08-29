import React, { useState } from 'react';
import { FormLayout } from '../Form/FormLayout';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import styles from './Profile.module.css';
import { GET_CONTACT } from '../../graphql/queries/Contact';
import { ReactComponent as ProfileIcon } from '../../assets/images/icons/Contact/Profile.svg';
import { CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT } from '../../graphql/mutations/Contact';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
export interface ProfileProps {
  match: any;
}
const FormSchema = Yup.object().shape({
  name: Yup.string().required('Name is required.'),
});

const dialogMessage = "You won't be able to send the messages to this contact.";

const getOptions = (options: any) => {
  return options.map((option: any) => ({ id: option, label: option }));
};

const statusOptions = getOptions(['VALID', 'INVALID', 'PROCESSING', 'FAILED']);

const providerStatusOptions = getOptions(['HSM', 'NONE', 'SESSION', 'SESSION_AND_HSM']);

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
    options: statusOptions,
  },

  {
    component: Dropdown,
    name: 'providerStatus',
    placeholder: 'Provider status',
    options: providerStatusOptions,
  },
];

const profileIcon = <ProfileIcon />;

const queries = {
  getItemQuery: GET_CONTACT,
  createItemQuery: CREATE_CONTACT,
  updateItemQuery: UPDATE_CONTACT,
  deleteItemQuery: DELETE_CONTACT,
};

export const Profile: React.SFC<ProfileProps> = ({ match }) => {
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
      redirectionLink={`chat/${match.params.id}`}
      listItem="contact"
      icon={profileIcon}
    />
  );
};
