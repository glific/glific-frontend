import React, { useState, useContext } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Typography, FormHelperText, makeStyles, createStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Button } from '../../../components/UI/Form/Button/Button';
import styles from './Login.module.css';
import { USER_SESSION } from '../../../common/constants';
import clsx from 'clsx';
import axios from 'axios';
import { SessionContext } from '../../../context/session';
import Auth from '../Auth';

export interface LoginProps {}

const useStyles = makeStyles(() =>
  createStyles({
    continueButton: {
      width: '340px',
      borderRadius: '27px',
      marginTop: '0px',
      color: 'white',
    },
    inputField: {
      lineHeight: '32px',
    },
    titleText: {
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#073F24',
      display: 'flex',
      alignItems: 'start',
    },
  })
);

export const Login: React.SFC<LoginProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [invalidLogin, setInvalidLogin] = useState(false);
  const classes = useStyles();

  const handlePasswordChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordError(false);
  };

  const handlePhoneNumberChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
    setPhoneNumberError(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleInputErrors = () => {
    let foundErrors = false;
    if (!phoneNumber) {
      setPhoneNumberError(true);
      foundErrors = true;
    } else if (phoneNumber) {
      setPhoneNumberError(false);
    }
    if (!password) {
      setPasswordError(true);
      foundErrors = true;
    } else if (password) {
      setPasswordError(false);
    }
    return foundErrors;
  };

  const handlerSubmit = () => {
    // set invalid login false as it should be set only on server response
    // errors are handled separately for the client side
    setInvalidLogin(false);

    // if errors just return
    if (handleInputErrors()) {
      return;
    }

    // we should call the backend only if frontend has valid input
    if (!passwordError && !phoneNumberError) {
      axios
        .post(USER_SESSION, {
          user: {
            phone: phoneNumber,
            password: password,
          },
        })
        .then((response: any) => {
          const responseString = JSON.stringify(response.data.data);
          localStorage.setItem('session', responseString);
          setAuthenticated(true);
          setSessionToken(responseString);
        })
        .catch((error: any) => {
          setInvalidLogin(true);
        });
    }
  };

  if (sessionToken) {
    return (
      <Redirect
        to={{
          pathname: '/chat',
          state: {
            tokens: sessionToken,
          },
        }}
      />
    );
  }

  return (
    <Auth
      pageTitle={'Login to your account'}
      buttonText={'LOGIN'}
      alternateLink={'registration'}
      alternateText={'CREATE A NEW ACCOUNT'}
      handlerSubmitCallback={handlerSubmit}
      mode={'login'}
    >
      <div className={styles.Margin}>
        <FormControl className={styles.TextField} variant="outlined">
          <InputLabel classes={{ root: styles.FormLabel }}>Your phone number</InputLabel>
          <OutlinedInput
            classes={{
              root: styles.InputField,
              notchedOutline: styles.InputField,
              focused: styles.InputField,
            }}
            data-testid="phoneNumber"
            error={phoneNumberError}
            id="phone-number"
            label="Your phone number"
            value={phoneNumber}
            type="tel"
            required
            onChange={handlePhoneNumberChange()}
          />
          {phoneNumberError ? (
            <FormHelperText classes={{ root: styles.FormHelperText }}>
              Please enter a phone number.
            </FormHelperText>
          ) : null}
        </FormControl>
      </div>
      <div className={clsx(styles.Margin, styles.BottomMargin)}>
        <FormControl className={styles.TextField} variant="outlined">
          <InputLabel classes={{ root: styles.FormLabel }}>Password</InputLabel>
          <OutlinedInput
            classes={{
              root: styles.InputField,
              notchedOutline: styles.InputField,
              focused: styles.InputField,
            }}
            data-testid="password"
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            required
            onChange={handlePasswordChange()}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
          {passwordError ? (
            <FormHelperText classes={{ root: styles.FormHelperText }}>
              Please enter a password.
            </FormHelperText>
          ) : null}
        </FormControl>
      </div>
      {invalidLogin ? <div className={styles.Errors}>Incorrect username or password.</div> : null}
    </Auth>
  );

  // return (
  //   <div className={styles.Container}>
  //     <div className={styles.Login}>
  //       <div className={styles.GlificLogo}>Glific</div>
  //       <div className={styles.Box}>
  //         <div className={styles.LoginTitle}>
  //           <Typography variant="h4" className={classes.titleText}>
  //             Login to your <br /> account
  //           </Typography>
  //         </div>
  //         <div className={styles.Margin}>
  //           <FormControl className={styles.TextField} variant="outlined">
  //             <InputLabel classes={{ root: styles.FormLabel }}>Your phone number</InputLabel>
  //             <OutlinedInput
  //               classes={{
  //                 root: styles.InputField,
  //                 notchedOutline: styles.InputField,
  //                 focused: styles.InputField,
  //               }}
  //               data-testid="phoneNumber"
  //               error={phoneNumberError}
  //               id="phone-number"
  //               label="Your phone number"
  //               value={phoneNumber}
  //               type="tel"
  //               required
  //               onChange={handlePhoneNumberChange()}
  //             />
  //             {phoneNumberError ? (
  //               <FormHelperText classes={{ root: styles.FormHelperText }}>
  //                 Please enter a phone number.
  //               </FormHelperText>
  //             ) : null}
  //           </FormControl>
  //         </div>
  //         <div className={clsx(styles.Margin, styles.BottomMargin)}>
  //           <FormControl className={styles.TextField} variant="outlined">
  //             <InputLabel classes={{ root: styles.FormLabel }}>Password</InputLabel>
  //             <OutlinedInput
  //               classes={{
  //                 root: styles.InputField,
  //                 notchedOutline: styles.InputField,
  //                 focused: styles.InputField,
  //               }}
  //               data-testid="password"
  //               id="outlined-adornment-password"
  //               type={showPassword ? 'text' : 'password'}
  //               label="Password"
  //               value={password}
  //               required
  //               onChange={handlePasswordChange()}
  //               endAdornment={
  //                 <InputAdornment position="end">
  //                   <IconButton
  //                     aria-label="toggle password visibility"
  //                     onClick={handleClickShowPassword}
  //                     onMouseDown={handleMouseDownPassword}
  //                     edge="end"
  //                   >
  //                     {showPassword ? <Visibility /> : <VisibilityOff />}
  //                   </IconButton>
  //                 </InputAdornment>
  //               }
  //             />
  //             {passwordError ? (
  //               <FormHelperText classes={{ root: styles.FormHelperText }}>
  //                 Please enter a password.
  //               </FormHelperText>
  //             ) : null}
  //           </FormControl>
  //         </div>
  //         {invalidLogin ? (
  //           <div className={styles.Errors}>Incorrect username or password.</div>
  //         ) : null}
  //         <Button
  //           className={styles.ContinueButton}
  //           onClick={handleSubmit}
  //           color="default"
  //           variant={'contained'}
  //         >
  //           Login
  //         </Button>
  //       </div>
  //       <div className={styles.Or}>
  //         <hr />
  //         <div className={styles.OrText}>OR</div>
  //         <hr />
  //       </div>
  //       <div>
  //         <Link to="/registration">CREATE A NEW ACCOUNT</Link>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default Login;
