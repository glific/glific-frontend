import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';
import {
  REACT_APP_GLIFIC_REGISTRATION_API,
  REACT_APP_GLIFIC_AUTHENTICATION_API,
} from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import Auth from '../Auth';
import { Input } from '../../../components/UI/Form/Input/Input';

export interface ConfirmOTPProps {
  location: any;
}

export const ConfirmOTP: React.SFC<ConfirmOTPProps> = (props) => {
  const { setAuthenticated } = useContext(SessionContext);
  const [OTP, setOTP] = useState('');
  const [tokenResponse, setTokenResponse] = useState('');
  const [authError, setAuthError] = useState('');

  // Let's not allow direct navigation to this page
  if (props.location && props.location.state === undefined) {
    return <Redirect to={'/registration'} />;
  }

  if (tokenResponse) {
    return (
      <Redirect
        to={{
          pathname: '/chat',
          state: {
            tokens: tokenResponse,
          },
        }}
      />
    );
  }

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required('Input required'),
  });

  const states = { OTP };
  const setStates = ({ OTP }: any) => {
    setOTP(OTP);
  };

  const formFields = [
    {
      component: Input,
      name: 'OTP',
      placeholder: 'OTP',
      helperText: 'Please confirm the OTP received at your whatsapp number.',
    },
  ];

  const onSubmitOTP = (values: any) => {
    axios
      .post(REACT_APP_GLIFIC_REGISTRATION_API, {
        user: {
          name: props.location.state.name,
          phone: props.location.state.phoneNumber,
          password: props.location.state.password,
          otp: values.OTP,
        },
      })
      .then((response: any) => {
        const responseString = JSON.stringify(response.data.data);
        localStorage.setItem('session', responseString);
        setAuthenticated(true);
        setTokenResponse(responseString);
      })
      .catch((error: any) => {
        setAuthError('We are unable to register, kindly contact your technical team.');
      });
  };

  const initialFormikValues = {};

  return (
    <Auth
      pageTitle={'Create your new account'}
      buttonText={'CONTINUE'}
      mode={'confirmotp'}
      formFields={formFields}
      setStates={setStates}
      states={states}
      validationSchema={FormSchema}
      onFormikSubmit={onSubmitOTP}
      initialFormikValues={initialFormikValues}
      errorMessage={authError}
    />
  );
};

export default ConfirmOTP;
