import React, { useState, useContext } from 'react';
import styles from './ConfirmOTP.module.css';
import { Typography, FormHelperText, makeStyles, createStyles } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { Button } from '../../../components/UI/Form/Button/Button';
import clsx from 'clsx';
import axios from 'axios';
import {
  REACT_APP_GLIFIC_REGISTRATION_API,
  REACT_APP_GLIFIC_AUTHENTICATION_API,
} from '../../../common/constants';
import { Redirect } from 'react-router-dom';
import { SessionContext } from '../../../context/session';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';

export interface ConfirmOTPProps {
  location: any;
}

const useStyles = makeStyles(() =>
  createStyles({
    continueButton: {
      width: '330px',
      borderRadius: '27px',
      marginTop: '0px',
    },
    inputField: {
      lineHeight: '32px',
    },
    titleText: {
      fontWeight: 'bold',
      marginBottom: '10px',
    },
  })
);

export const ConfirmOTP: React.SFC<ConfirmOTPProps> = (props) => {
  const { setAuthenticated } = useContext(SessionContext);
  const [userAuthCode, setUserAuthCode] = useState('');
  const [tokenResponse, setTokenResponse] = useState('');
  const [authError, setAuthError] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const classes = useStyles();

  const theme = createMuiTheme({
    overrides: {
      MuiOutlinedInput: {
        root: {
          '& $notchedOutline': {
            borderColor: '#93A29B',
            borderRadius: '12px',
            borderWidth: '2px',
          },
          '&$focused $notchedOutline': {
            borderColor: '#93A29B',
          },
          '&:hover $notchedOutline': {
            borderColor: '#93A29B',
          },
        },
      },
      MuiFormLabel: {
        root: {
          color: '#93A29B',
          '&$focused': {
            color: '#93A29B',
          },
        },
      },
      MuiInputBase: {
        root: {
          lineHeight: '32px',
          width: '340px',
          color: '#93A29B',
        },
      },
      MuiIconButton: {
        root: {
          color: '#93A29B',
        },
      },
      MuiInputLabel: {
        root: {
          color: '#93A29B',
        },
      },
      MuiFormHelperText: {
        root: {
          color: '#93A29B',
          marginTop: '0px',
          lineHeight: '1.5',
          maginLeft: '0px',
        },
      },
    },
  });

  const handleuserAuthCodeChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAuthCode(event.target.value);
  };

  const handleResend = () => {
    axios
      .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
        user: {
          phone: props.location.state.phoneNumber,
        },
      })
      .then((response: any) => {
        console.log(response);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const handleSubmit = () => {
    if (userAuthCode.length < 6) {
      setAuthError(true);
    } else {
      axios
        .post(REACT_APP_GLIFIC_REGISTRATION_API, {
          user: {
            name: props.location.state.name,
            phone: props.location.state.phoneNumber,
            password: props.location.state.password,
            otp: userAuthCode,
          },
        })
        .then(function (response: any) {
          const responseString = JSON.stringify(response.data.data);
          localStorage.setItem('session', responseString);
          setAuthenticated(true);
          setTokenResponse(responseString);
        })
        .catch(function (error: any) {
          if (error.response.data.error.errors.phone === 'has already been taken') {
            setAlreadyExists(true);
          } else if (error.response.data.error.errors === 'does_not_exist') {
            setAuthError(true);
          }
        });
    }
  };

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

  return (
    <div className={styles.Container}>
      <div className={styles.CenterRegistrationAuth}>
        <div className={styles.Box}>
          <div className={styles.RegistrationAuthTitle}>
            <Typography variant="h4" className={classes.titleText}>
              Create your new <br />
              account
            </Typography>
          </div>
          <div className={clsx(styles.Margin, styles.BottomMargin)}>
            <ThemeProvider theme={theme}>
              <FormControl className={styles.TextField} variant="outlined">
                <InputLabel>OTP</InputLabel>
                <OutlinedInput
                  error={alreadyExists || authError}
                  id="authentication-code"
                  label="OTP"
                  type="text"
                  value={userAuthCode}
                  onChange={handleuserAuthCodeChange()}
                  endAdornment={
                    <ThemeProvider theme={theme}>
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleResend}
                          edge="end"
                        >
                          <RefreshIcon />
                        </IconButton>
                      </InputAdornment>
                    </ThemeProvider>
                  }
                />
                <div>
                  <FormHelperText>
                    Please confirm the OTP received by your WhatsApp <br />
                    number.
                  </FormHelperText>
                  {authError || alreadyExists ? (
                    <FormHelperText>
                      {alreadyExists
                        ? 'An account already exists with this phone number.'
                        : 'Invalid authentication code.'}
                    </FormHelperText>
                  ) : null}
                </div>
              </FormControl>
            </ThemeProvider>
          </div>
          <div className="button">
            <Button
              className={classes.continueButton}
              onClick={handleSubmit}
              color="primary"
              variant={'contained'}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOTP;
