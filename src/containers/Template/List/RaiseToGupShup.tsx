import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { REPORT_TO_GUPSHUP } from 'graphql/mutations/Template';
import { useMutation } from '@apollo/client';
import { setNotification } from 'common/notification';

export interface RaiseToGupShupPropTypes {
  handleCancel: Function;
  templateId: string;
  label: string;
}

export const RaiseToGupShup = ({ handleCancel, templateId, label }: RaiseToGupShupPropTypes) => {
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
          setEmail(event.target.value);
        },
      },
      helperText: t("Enter the email address you'd like to CC."),
    },
  ];

  useEffect(() => {
    setInitialValues({
      ...initialValues,
      email: email,
    });
  }, [email]);

  const [reportToGupshup] = useMutation(REPORT_TO_GUPSHUP, {
    onCompleted: (data: any) => {
      setNotification('Email Sent Successfully!');
      handleCancel();
    },
    onError: (error: any) => {
      setNotification(error?.message, 'warning');
    },
  });

  const validation = {
    email: Yup.string().email('Invalid Email').required('Atleast One Email is Required'),
  };

  const FormSchema = Yup.object().shape(validation);

  const performTask = (data: any) => {
    reportToGupshup({
      variables: {
        cc: JSON.stringify(data),
        templateId: templateId,
      },
    });
  };

  const form = (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={FormSchema}
      onSubmit={(itemData) => {
        performTask(itemData);
      }}
    >
      {({ submitForm }) => (
        <Form data-testid="formLayout">
          <DialogBox
            titleAlign="left"
            title={`Report Template ${label} to Gupshup`}
            handleOk={() => {
              submitForm();
            }}
            handleCancel={() => {
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
