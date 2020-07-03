import React from 'react';
import styles from './RegistrationAuthentication.module.css';
import { Typography } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { Button } from '../../UI/Form/Button/Button';
import clsx from 'clsx';

export interface RegistrationAuthProps {}

interface State {
  authCode: string;
}

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

export const RegistrationAuthentication: React.SFC<RegistrationAuthProps> = () => {
  const classes = useStyles();

  const [values, setValues] = React.useState<State>({
    authCode: '',
  });

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleSubmit = () => {
    console.log('hi');
  };

  return (
    <div className={styles.Container}>
      <div className={styles.CenterRegistrationAuth}>
        <div className={styles.RegistrationAuthTitle}>
          <Typography variant="h5">Authenticate your account.</Typography>
        </div>
        <Typography variant="h6">A code has been sent to your WhatsApp account.</Typography>
        <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined">
          <InputLabel>Authentication Code</InputLabel>
          <OutlinedInput
            id="authentication-code"
            label="Authentication Code"
            type="text"
            onChange={handleChange('authCode')}
          />
        </FormControl>
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default RegistrationAuthentication;
