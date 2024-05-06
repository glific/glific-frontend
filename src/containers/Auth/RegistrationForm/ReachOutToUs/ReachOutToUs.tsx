import { Dialog } from '@mui/material';
import * as Yup from 'yup';

import styles from './ReachOutToUs.module.css';
import { FormLayout } from '../FormLayout/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface ReachOutToUsProps {
  open: boolean;
  setOpen: Function;
  handleCancel: Function;
}

export const ReachOutToUs = ({ open, setOpen, handleCancel }: ReachOutToUsProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleClose = () => {
    setOpen(false);
  };

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      inputLabel: 'Full Name',
      placeholder: 'Enter full name',
    },
    {
      component: Input,
      name: 'email',
      type: 'text',
      inputLabel: 'Email address',
      placeholder: 'Enter your email address',
    },
    {
      component: Input,
      name: 'message',
      type: 'text',
      inputLabel: 'Message',
      placeholder: 'Your message here',
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

  return (
    <Dialog
      classes={{
        paper: styles.DialogboxPaper,
      }}
      maxWidth="lg"
      fullWidth={true}
      open={open}
      onClose={handleClose}
    >
      <FormLayout
        validationSchema={FormSchema}
        formFieldItems={formFields}
        initialValues={initialFormValues}
        showStep={false}
        title="Write to us"
        helperText="If you require any more clarifications to the T&C, contact us"
        setStates={setStates}
        setPayload={setPayload}
        buttonState={{
          text: 'Send',
          align: 'left',
        }}
        okButtonHelperText="If you have any further queries regarding the T&C, kindly write to this email user@glificqueries.com. Feel free to contact us if you have any more questions. "
      />
    </Dialog>
  );
};
