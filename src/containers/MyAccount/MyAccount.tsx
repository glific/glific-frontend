import React, { useState } from 'react';
import * as Yup from 'yup';

import styles from './MyAccount.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { ReactComponent as UserIcon } from '../../assets/images/icons/Contact/Profile.svg';
import { UPDATE_CURRENT_USER } from '../../graphql/mutations/User';
import { GET_CURRENT_USER } from '../../graphql/queries/User';

export interface MyAccountProps {}

const userIcon = <UserIcon />;

export const MyAccount: React.SFC<MyAccountProps> = () => {
  const [password, setPassword] = useState('');

  const states = { password };
  const setStates = ({ password }: any) => {};

  const FormSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  const formFields = [
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: 'Change Password',
    },
  ];

  return (
    <div className={styles.MyAccount} data-testid="MyAccount">
      MyAccount Component
    </div>
  );
};
