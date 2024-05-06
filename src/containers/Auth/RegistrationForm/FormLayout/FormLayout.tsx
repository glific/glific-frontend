import { Field, Form, Formik } from 'formik';
import { Fragment, useState } from 'react';

import styles from './FormLayout.module.css';
import { Typography } from '@mui/material';

import { Button } from 'components/UI/Form/Button/Button';
import { useNavigate } from 'react-router';

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
}: FormLayoutProps) => {
  const [saveClick, onSaveClick] = useState(false);
  const navigate = useNavigate();

  const saveHandler = (itemData: any) => {
    const payload = setPayload(itemData);

    if (payload) {
      console.log(payload);
      // navigate(`/registration/${step + 1}`);
    }
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
        saveHandler(itemData);
      }}
    >
      {({ errors, submitForm }) => (
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
                          <Fragment key={i}>
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
                          </Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className={field?.additionalStyles}>
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onSaveButtonClick(errors);
                submitForm();
              }}
              className={styles.Button}
              data-testid="submitActionButton"
              loading={saveClick}
              disabled={buttonState.status}
            >
              {buttonState.text ? buttonState.text : 'Next'}
            </Button>

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
