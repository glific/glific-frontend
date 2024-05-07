import { Field, Form, Formik } from 'formik';
import { Fragment, useEffect, useState } from 'react';

import styles from './FormLayout.module.css';
import { Typography } from '@mui/material';

import { Button } from 'components/UI/Form/Button/Button';
import axios from 'axios';
import { Captcha } from 'components/UI/Form/Captcha/Captcha';

interface FormLayoutProps {
  validationSchema: any;
  formFieldItems: Array<any>;
  initialValues: any;
  title: string;
  helperText: string;
  step?: number;
  setStates: Function;
  buttonState?: {
    text: string;
    status?: boolean;
    align?: string;
  };
  setPayload: Function;
  showStep?: boolean;
  okButtonHelperText?: string;
  apiUrl?: any;
  identifier: string;
  handleStepChange: Function;
}

export const FormLayout = ({
  validationSchema,
  formFieldItems,
  initialValues,
  title,
  helperText,
  step,
  setStates,
  buttonState = { text: '', status: false, align: 'right' },
  setPayload,
  showStep = true,
  okButtonHelperText,
  apiUrl,
  identifier,
  handleStepChange,
}: FormLayoutProps) => {
  const [loading, setLoading] = useState(false);

  const saveData = (registrationData: any, identifier: string) => {
    if (!step) return;
    const existingData = localStorage.getItem('registrationData');

    let data = {
      [identifier]: registrationData,
    };

    if (existingData) {
      data = {
        ...data,
        ...JSON.parse(existingData),
      };
    }

    localStorage.setItem('registrationData', JSON.stringify(data));
  };

  useEffect(() => {
    const registrationData = localStorage.getItem('registrationData');
    // console.log(registrationData);

    if (registrationData) {
      const data = JSON.parse(registrationData);
      if (data[identifier]) setStates(data[identifier]);
    }
  }, []);

  const saveHandler = (itemData: any) => {
    const payload = setPayload(itemData);
    saveData(payload, identifier);

    if (apiUrl) {
      axios.post(apiUrl, payload).then(({ data }: { data: any }) => {
        setLoading(false);

        if (data.is_valid) {
          saveData(data, 'registrationDetails');
        } else {
          return;
        }
      });
    }

    handleStepChange();
  };

  const header = (
    <div className={styles.Header}>
      {showStep && <span className={styles.Step}>STEP {step} of 4</span>}
      <h1 data-testid="heading" className={styles.Title}>
        {title}
      </h1>
      <div className={styles.HelperText}>{helperText}</div>
    </div>
  );

  const onSaveButtonClick = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      return;
    }
    setLoading(true);
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
        saveHandler(itemData);
      }}
    >
      {({ errors, submitForm, setFieldValue, values }) => (
        <Form className={styles.Form} data-testid="formLayout">
          <div className={styles.FormFields}>
            {formFieldItems.map((field, index) => {
              const key = index;

              if (field.children) {
                return (
                  <div className={styles.FormSection} key={key}>
                    <Typography
                      data-testid="formLabel"
                      variant="h5"
                      className={styles.SectionHeading}
                    >
                      {field.label}
                    </Typography>
                    <div className={styles.FormFields}>
                      {field.children.map((child: any, i: number) => {
                        return (
                          <div className={child.additionalStyles} key={i}>
                            {child.label && (
                              <Typography
                                data-testid="formLabel"
                                variant="h5"
                                className={styles.FieldLabel}
                              >
                                {child.label}
                              </Typography>
                            )}
                            <Field key={i} {...child} onSubmit={submitForm} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className={field.additionalStyles}>
                  {field.label && (
                    <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
                      {field.label}
                    </Typography>
                  )}
                  <Field key={key} {...field} onSubmit={submitForm} />
                </div>
              );
            })}
          </div>

          <div
            className={`${styles.Buttons} ${buttonState.align === 'right' && styles.RightButton}`}
          >
            {identifier === 'orgDetails' ? (
              <Captcha
                component={Button}
                variant="contained"
                color="primary"
                onClick={submitForm}
                className={styles.Button}
                data-testid="submitActionButton"
                loading={loading}
                onTokenUpdate={(token: string) => {
                  console.log(token);

                  setFieldValue('token', token);
                }}
                // disabled={!values.captcha}
                action="register"
              >
                Next
              </Captcha>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  onSaveButtonClick(errors);
                  submitForm();
                }}
                className={styles.Button}
                data-testid="submitActionButton"
                loading={loading}
                disabled={buttonState.status}
              >
                {buttonState.text ? buttonState.text : 'Next'}
              </Button>
            )}

            <p className={styles.OkButtonHelperText}>{okButtonHelperText}</p>
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
