import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Input } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';

interface InlineInputProps {
  valueProxy: string;
  type?: string;
  submitCallback: any;
}

const InlineInput: React.SFC<InlineInputProps> = ({
  valueProxy,
  type = 'text',
  submitCallback,
}) => {
  const handleSubmit = (value: any) => {
    submitCallback(value);
  };

  const validationSchema = Yup.object().shape({
    value: Yup.string().required('Required'),
  });

  const initialValues = {
    value: valueProxy,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        // same shape as initial values
        console.log(values);
        handleSubmit(values);
      }}
    >
      {({ errors, touched }) => (
        <Form>
          <Input name="value" type={type} />
          {errors.value && touched.value ? <div>{errors.value}</div> : null}
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};
