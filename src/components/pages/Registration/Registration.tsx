import React, { useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import styles from './Registration.module.css';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios';

export interface RegistrationProps {}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    },
    textField: {
      width: '40ch',
    },
    bottomMargin: {
      marginBottom: '25px',
    },
  })
);

interface State {
  password: string;
  showPassword: boolean;
  phoneNumber: number;
  userName: string;
  confirmPassword: string;
  showConfirmPassword: boolean;
  authRedirect: boolean;
  authToken: any;
  authCode: any;
  errors: any;
}

export const Registration: React.SFC<RegistrationProps> = () => {
  const classes = useStyles();

  const [values, setValues] = React.useState<State>({
    password: '',
    showPassword: false,
    phoneNumber: 0,
    userName: '',
    confirmPassword: '',
    showConfirmPassword: false,
    authRedirect: false,
    authToken: null,
    authCode: null,
    errors: null,
  });

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleClickShowConfirmPassword = () => {
    setValues({ ...values, showConfirmPassword: !values.showConfirmPassword });
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseDownConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = () => {
    axios
      .post('http://localhost:4000/api/v1/registration', {
        user: {
          name: values.userName,
          phone: values.phoneNumber,
          password: values.password,
          password_confirmation: values.confirmPassword,
        },
      })
      .then(function (response: any) {
        console.log(response);
        const responseString = JSON.stringify(response);
        setValues((values) => ({ ...values, authToken: responseString }));
        axios
          .post('http://localhost:4000/api/v1/registration/send_otp', {
            user: {
              phone: values.phoneNumber,
            },
          })
          .then(function (response: any) {
            console.log(response);
            setValues((values) => ({ ...values, authCode: response }));
          });
      })
      .catch(function (error: any) {
        console.log(error.response.data.error.errors);
        setValues((values) => ({ ...values, errors: error.response.data.error.errors }));
      });
  };

  if (values.authCode && values.authToken) {
    return (
      <Redirect
        to={{
          pathname: '/registrationauth',
          state: {
            authCode: values.authCode.data.data.otp,
            phoneNumber: values.phoneNumber,
            tokens: values.authToken,
          },
        }}
      />
    );
  }

  const errorList = values.errors
    ? Object.values(values.errors).map((error: any) =>
        error[0] == 'does not match confirmation' ? (
          <Typography variant="h6">Password {error[0]}</Typography>
        ) : (
          <Typography variant="h6">Field {error[0]}</Typography>
        )
      )
    : null;

  console.log(values.errors ? Object.values(values.errors).map((error: any) => error[0]) : 'helo');

  return (
    <div className={styles.Container}>
      <div className={styles.CenterRegistration}>
        <div className={styles.RegistrationTitle}>
          <Typography variant="h5">Create a New Account</Typography>
        </div>
        <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined">
          <InputLabel>Username</InputLabel>
          <OutlinedInput
            id="username"
            label="Username"
            type="text"
            onChange={handleChange('userName')}
          />
        </FormControl>
        <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined">
          <InputLabel>Phone Number</InputLabel>
          <OutlinedInput
            id="phone-number"
            label="Phone Number"
            type="integer"
            onChange={handleChange('phoneNumber')}
          />
        </FormControl>
        <FormControl
          className={clsx(classes.margin, classes.textField, classes.bottomMargin)}
          variant="outlined"
        >
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={values.showPassword ? 'text' : 'password'}
            label="Password"
            value={values.password}
            onChange={handleChange('password')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {values.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl
          className={clsx(classes.margin, classes.textField, classes.bottomMargin)}
          variant="outlined"
        >
          <InputLabel>Confirm Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-confirm-password"
            type={values.showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            value={values.confirmPassword}
            onChange={handleChange('confirmPassword')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownConfirmPassword}
                  edge="end"
                >
                  {values.showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        {values.errors ? <div className={styles.Errors}>{errorList}</div> : null}
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Registration;
