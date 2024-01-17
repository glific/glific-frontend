import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { REPORT_TO_GUPSHUP } from 'graphql/mutations/Template';
import { useMutation } from '@apollo/client';

export interface RaiseToGupShupPropTypes {
  handleCancel: any;
  templateId: any;
}

export const RaiseToGupShup = ({ handleCancel, templateId }: RaiseToGupShupPropTypes) => {
  const [initialValues, setInitialValues] = useState<any>({
    email: '',
  });
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');

  const formFields = [
    {
      component: Input,
      type: 'text',
      name: 'email',
      placeholder: 'CC',
      inputProp: {
        onChange: (event: any) => {
          setInitialValues({
            ...initialValues,
            email: event.target.value,
          });
        },
      },
      // helperText: t('Please confirm the OTP received at your WhatsApp number.'),
    },
  ];

  const setPayload = (payload: any) => {
    const data = { ...payload };
    return data;
  };

  const [reportToGupshup] = useMutation(REPORT_TO_GUPSHUP, {
    onCompleted: (data: any) => {
      console.log(data);
    },
    onError: (error: any) => {},
  });

  const validation = {
    email: Yup.string().email('Invalid Email').required(t('Email is required.')),
  };

  const FormSchema = Yup.object().shape(validation);

  const form = (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={FormSchema}
      onSubmit={(itemData) => {
        setPayload(itemData);
        reportToGupshup({
          variables: { cc: JSON.stringify(itemData), templateId: templateId },
        });
      }}
    >
      {({ submitForm }) => (
        <Form data-testid="formLayout">
          <DialogBox
            titleAlign="left"
            title={t('Raise To Gupshup')}
            handleOk={() => {
              submitForm();
            }}
            handleCancel={() => {
              //   setVariable(false);
              handleCancel();
            }}
            buttonOk={t('Done')}
            alignButtons="left"
          >
            <div data-testid="variablesDialog">
              {formFields.map((field: any) => (
                <Field {...field} key={field.name} />
              ))}
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );

  return form;
};
