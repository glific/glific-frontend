import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import * as Yup from 'yup';
import { useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { USER_SESSION } from 'config';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { Input } from 'components/UI/Form/Input/Input';
import {
  setAuthSession,
  clearAuthSession,
  setUserSession,
  clearUserSession,
  setOrganizationServices,
} from 'services/AuthService';
import { GET_CURRENT_USER } from 'graphql/queries/User';
import { setUserRolePermissions } from 'context/role';
import setLogs from 'config/logs';
import { GET_ORGANIZATION_SERVICES } from 'graphql/queries/Organization';
import { Auth } from '../Auth';
import { setErrorMessage } from 'common/notification';

const notApprovedMsg = 'Your account is not approved yet. Please contact your organization admin.';

export const Login = () => {
  const [authError, setAuthError] = useState('');
  const { i18n, t } = useTranslation();
  const location: any = useLocation();
  const navigate = useNavigate();

  // function to unauthorize access
  const accessDenied = () => {
    setAuthError(notApprovedMsg);
    clearAuthSession();
    clearUserSession();
  };

  // get the information on current user
  const [getCurrentUser, { data: userData, error: userError }] = useLazyQuery(GET_CURRENT_USER);
  const [getOrganizationServices, { data: organizationServicesData }] = useLazyQuery(GET_ORGANIZATION_SERVICES);

  useEffect(() => {
    if (userData && organizationServicesData) {
      const { user } = userData.currentUser;
      const userCopy = JSON.parse(JSON.stringify(user));
      userCopy.roles = user.accessRoles;
      // set the current user object
      setUserSession(JSON.stringify(userCopy));
      setOrganizationServices(JSON.stringify(organizationServicesData.organizationServices));

      // get the roles
      const { accessRoles } = userData.currentUser.user;

      const userAccessRoles = accessRoles.map((role: any) => role.label);

      // check for user role none or empty
      if ((userAccessRoles.includes('None') && userAccessRoles.length === 1) || userAccessRoles.length === 0) {
        accessDenied();
      } else {
        // role & access permissions
        setUserRolePermissions();

        // set the language
        if (i18n.changeLanguage) {
          i18n.changeLanguage(userData.currentUser.user?.language.locale);
        }

        const targetPath = location.state?.to || '/chat';
        navigate(targetPath, { replace: true });
      }
    }
    if (userError) {
      accessDenied();
    }
  }, [userData, userError, organizationServicesData]);

  const formFields = [
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: t('Your phone number'),
      helperText: t('Please enter a phone number.'),
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: t('Password'),
      autoComplete: 'on',
    },
  ];

  const FormSchema = Yup.object().shape({
    phoneNumber: Yup.string().required(t('Input required')),
    password: Yup.string().required(t('Input required')),
  });

  const initialFormValues = { phoneNumber: '', password: '' };

  const onSubmitLogin = (values: any) => {
    setAuthError('');
    axios
      .post(USER_SESSION, {
        user: {
          phone: values.phoneNumber,
          password: values.password,
        },
      })
      .then((response: any) => {
        getCurrentUser();
        getOrganizationServices();
        setAuthSession(response.data.data);
      })
      .catch((error) => {
        if (error?.response?.status === 403) {
          setErrorMessage(error?.response?.data?.error);
          setAuthError(' ');
        } else if (error?.response?.data?.error) {
          setAuthError(error?.response?.data?.error?.message);
        } else {
          setAuthError('Something went wrong. Please contact the Glific team.');
        }
        setLogs(error, 'error', true);
      });
  };

  return (
    <Auth
      pageTitle={t('Login to your account')}
      buttonText={t('Login')}
      alternateLink="registration"
      alternateText={t('Create a new account')}
      mode="login"
      formFields={formFields}
      linkText={t('Forgot Password?')}
      linkURL="resetpassword-phone"
      validationSchema={FormSchema}
      saveHandler={onSubmitLogin}
      initialFormValues={initialFormValues}
      errorMessage={authError}
    />
  );
};

export default Login;
