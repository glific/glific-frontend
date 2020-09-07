import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';

import { REACT_APP_GLIFIC_REGISTRATION_API } from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import { Auth } from '../Auth';
import { Input } from '../../../components/UI/Form/Input/Input';
import { sendOTP } from '../../../services/AuthService';

export interface ConfirmOTPProps {
  location: any;
}

export const ConfirmOTP: React.SFC<ConfirmOTPProps> = (props) => {
  const { setAuthenticated } = useContext(SessionContext);
  const [OTP, setOTP] = useState('');
  const [tokenResponse, setTokenResponse] = useState('');
  const [authError, setAuthError] = useState('');

  const handleResend = () => {
    sendOTP(props.location.state.phoneNumber, 'true').catch((error: any) => {
      setAuthError('We are unable to generate an OTP, kindly contact your technical team.');
    });
  };

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

  const states = { OTP };
  const setStates = ({ OTP }: any) => {
    setOTP(OTP);
  };

  const formFields = [
    {
      component: Input,
      type: 'otp',
      name: 'OTP',
      placeholder: 'OTP',
      helperText: 'Please confirm the OTP received at your whatsapp number.',
      endAdornmentCallback: handleResend,
    },
  ];

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required('Input required'),
  });

  const initialFormValues = { OTP: '' };

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
        localStorage.setItem('glific_session', responseString);
        setAuthenticated(true);
        setTokenResponse(responseString);
      })
      .catch((error: any) => {
        setAuthError('We are unable to register, kindly contact your technical team.');
      });
  };

  return (
    <Auth
      pageTitle={'Create your new account'}
      buttonText={'CONTINUE'}
      mode={'confirmotp'}
      formFields={formFields}
      setStates={setStates}
      states={states}
      validationSchema={FormSchema}
      saveHandler={onSubmitOTP}
      initialFormValues={initialFormValues}
      errorMessage={authError}
    />
  );
};

export default ConfirmOTP;
