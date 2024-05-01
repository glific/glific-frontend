import { Field, Form, Formik } from 'formik';
import { Fragment, useState } from 'react';

import styles from './FormLayout.module.css';
import { Typography } from '@mui/material';

import { Button } from 'components/UI/Form/Button/Button';
import { useTranslation } from 'react-i18next';

interface FormLayoutProps {
  validationSchema: any;
  formFieldItems: Array<any>;
  initialValues: any;
  title: string;
  helperText: string;
  step: number;
  states: Object;
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
  states,
  setStates,
  buttonState = { text: '', status: false },
  button = 'Next',
  setPayload,
}: FormLayoutProps) => {
  const [customError, setCustomError] = useState<any>(null);
  const [saveClick, onSaveClick] = useState(false);

  const saveHandler = (data: any) => {};

  const { t } = useTranslation();

  const header = (
    <div className={styles.Header}>
      <span className={styles.Step}>STEP {step} of 4</span>
      <div className={styles.Title}>{title}</div>
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
        ...states,
      }}
      validationSchema={validationSchema}
      onSubmit={(itemData, { setErrors }) => {
        // when you want to show custom error on form field and error message is not coming from api
        setCustomError({ setErrors });
        saveHandler(itemData);
      }}
    >
      {({ errors, submitForm }) => (
        <Form className={styles.Form} data-testid="formLayout">
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
          <div className={styles.Buttons}>
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
              {buttonState.status ? buttonState.text : button}
            </Button>
            {/* <Button
              variant="outlined"
              color="secondary"
              onClick={cancelHandler}
              data-testid="cancelActionButton"
            >
              {t('Cancel')}
            </Button> */}
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
