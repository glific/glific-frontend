import { Field, Form, Formik } from 'formik';
import { Fragment, useState } from 'react';

import styles from './FormLayout.module.css';
import { Typography } from '@mui/material';

import { Button } from 'components/UI/Form/Button/Button';

interface FormLayoutProps {
  validationSchema: any;
  formFieldItems: Array<any>;
  initialValues: any;
  title: string;
  helperText: string;
  step: number;
  setStates: Function;
  buttonState?: {
    text: string;
    status: boolean;
  };
  setPayload?: Function;
  button?: string;
}

export const FormLayout = ({
  validationSchema,
  formFieldItems,
  initialValues,
  title,
  helperText,
  step,
  setStates,
  buttonState = { text: '', status: false },
  button = 'Next',
  setPayload,
}: FormLayoutProps) => {
  const [saveClick, onSaveClick] = useState(false);
  const saveHandler = (data: any) => {
    console.log(data);
  };

  const header = (
    <div className={styles.Header}>
      <span className={styles.Step}>STEP {step} of 4</span>
      <h1 className={styles.Title}>{title}</h1>
      <div className={styles.HelperText}>{helperText}</div>
    </div>
  );

  const onSaveButtonClick = (errors: any) => {
    console.log(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    onSaveClick(true);
  };

  const form = (
    <Formik
      enableReinitialize
      validateOnMount
      initialValues={{
        ...initialValues,
      }}
      validationSchema={validationSchema}
      onSubmit={(itemData, { setErrors }) => {
        console.log(itemData);
        saveHandler(itemData);
      }}
    >
      {({ errors, submitForm }) => (
        <Form className={styles.Form} data-testid="formLayout">
          <div className={styles.FormFields}>
            {formFieldItems.map((field, index) => {
              const key = index;

              if (field.skip) {
                return null;
              }

              return (
                <Fragment key={key}>
                  {field.label && (
                    <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
                      {field.label}
                    </Typography>
                  )}
                  <Field key={key} {...field} onSubmit={submitForm} />
                </Fragment>
              );
            })}
          </div>

          <div className={styles.Buttons}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onSaveButtonClick(errors);
                console.log(errors);

                submitForm();
              }}
              className={styles.Button}
              data-testid="submitActionButton"
              loading={saveClick}
              disabled={buttonState.status}
            >
              {buttonState.status ? buttonState.text : button}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className={styles.FormContainer}>
      {header}
      {form}
    </div>
  );
};
