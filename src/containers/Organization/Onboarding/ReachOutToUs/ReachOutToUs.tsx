import { useEffect, useState } from 'react';
import { Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as Yup from 'yup';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { ONBOARD_URL_REACT_OUT } from 'config';
import styles from './ReachOutToUs.module.css';
import { FormLayout } from '../FormLayout/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';

interface ReachOutToUsProps {
  open: boolean | any;
  setOpen: Function;
  handleStepChange: Function;
  saveData: Function;
}

export const ReachOutToUs = ({ open, setOpen, handleStepChange, saveData }: ReachOutToUsProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      inputLabel: 'Full Name',
    },
    {
      component: Input,
      name: 'email',
      type: 'text',
      inputLabel: 'Email address',
    },
    {
      component: Input,
      name: 'message',
      type: 'text',
      inputLabel: 'Message',
      textArea: true,
      additionalStyles: styles.MessageField,
    },
  ];

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('This Field is required.')).max(40),
    email: Yup.string().required(t('This Field is required.')).email('Enter a valid email.'),
    message: Yup.string().required(t('This Field is required.')),
  });

  const initialFormValues: any = { name, email, message };

  const setPayload = (payload: any) => {
    return payload;
  };

  const setStates = (states: any) => {
    const { name, email, message } = states;
    setName(name);
    setEmail(email);
    setMessage(message);
  };

  const handleSubmit = async (payload: any, setErrors: Function) => {
    setLoading(true);
    await axios
      .post(ONBOARD_URL_REACT_OUT, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(({ data }) => {
        setLoading(false);

        if (data.is_valid) {
          setSuccess(true);
          return true;
        } else {
          setErrors(data.messages);
          return false;
        }
      });
  };

  useEffect(() => {
    setTimeout(() => {
      if (success) {
        setOpen(false);
      }
    }, 3000);
  }, [success]);

  return (
    <Dialog
      classes={{
        paper: styles.DialogboxPaper,
      }}
      maxWidth="lg"
      fullWidth={true}
      open={open}
      onClose={() => setOpen(false)}
      data-testid="dialogBox"
    >
      <div className={styles.CloseButton}>
        <IconButton
          aria-label="close"
          data-testid="close-button"
          className={styles.CloseIcon}
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>
      </div>
      {success ? (
        <div className={styles.Success}>
          <h2>Thankyou for reaching out to us! We will get back to you shortly.</h2>
        </div>
      ) : (
        <FormLayout
          validationSchema={FormSchema}
          formFieldItems={formFields}
          initialValues={initialFormValues}
          showStep={false}
          title="Write to us"
          helperText="Please enter your details and the query."
          setStates={setStates}
          setPayload={setPayload}
          buttonState={{
            text: 'Send',
            align: 'left',
          }}
          okButtonHelperText="You can also reachout to us on support@glific.org."
          identifier="reachOutToUs"
          handleStepChange={handleStepChange}
          saveData={saveData}
          submitData={handleSubmit}
          loading={loading}
        />
      )}
    </Dialog>
  );
};
