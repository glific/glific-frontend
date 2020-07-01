import React from 'react';
import { Typography } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Button } from '../../UI/Form/Button/Button';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import styles from './Login.module.css';
import clsx from 'clsx';

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

export interface LoginProps {}

interface State {
  password: string;
  showPassword: boolean;
  phoneNumber: string;
}

export const Login: React.SFC<LoginProps> = () => {
  const classes = useStyles();

  const [values, setValues] = React.useState<State>({
    password: '',
    phoneNumber: '',
    showPassword: false,
  });

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = () => {
    console.log('hello');
  };

  return (
    <div className={styles.Container}>
      <div className={styles.CenterLogin}>
        <div className={styles.LoginTitle}>
          <Typography variant="h5">Login</Typography>
        </div>
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
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Login
        </Button>
      </div>
    </div>
  );
};

export default Login;
