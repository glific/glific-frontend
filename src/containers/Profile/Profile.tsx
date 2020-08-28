import React, { useState } from 'react';
import { FormLayout } from '../Form/FormLayout';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import styles from './Profile.module.css';
import { GET_CONTACT } from '../../graphql/queries/Contact';
import { ReactComponent as ProfileIcon } from '../../assets/images/icons/Contact/Profile.svg';
import { CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT } from '../../graphql/mutations/Contact';
export interface ProfileProps {
  match: any;
}
const FormSchema = Yup.object().shape({});

const dialogMessage = "You won't be able to use this for tagging messages.";

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
];

const tagIcon = <ProfileIcon />;

const queries = {
  getItemQuery: GET_CONTACT,
  createItemQuery: CREATE_CONTACT,
  updateItemQuery: UPDATE_CONTACT,
  deleteItemQuery: DELETE_CONTACT,
};

export const Profile: React.SFC<ProfileProps> = ({ match }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const states = { name, phone };
  const setStates = ({ name, phone }: any) => {
    setName(name);
    setPhone(phone);
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
      languageSupport={false}
      icon={tagIcon}
    />
  );
};
