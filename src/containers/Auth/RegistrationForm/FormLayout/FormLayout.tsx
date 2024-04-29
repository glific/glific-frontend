import { Field, Form, Formik } from 'formik';
import { Fragment, useState } from 'react';

import styles from './FormLayout.module.css';
import { Typography } from '@mui/material';

import { Button } from 'components/UI/Form/Button/Button';
import { useTranslation } from 'react-i18next';

interface FormLayoutProps {
  validationSchema: any;
  formFieldItems: any;
  initialValues: any;
  title: string;
  helperText: string;
  step: number;
}

export const FormLayout = ({
  validationSchema,
  formFieldItems,
  initialValues,
  title,
  helperText,
  step,
}: FormLayoutProps) => {
  const [customError, setCustomError] = useState<any>(null);

  const saveHandler = (data: any) => {};

  const { t } = useTranslation();

  const header = (
    <div className={styles.Header}>
      <span className={styles.Step}>STEP {step} of 4</span>
      <div className={styles.Title}>{title}</div>
      <div className={styles.HelperText}>{helperText}</div>
    </div>
  );

  const form = (
    <Formik
      enableReinitialize
      validateOnMount
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(itemData, { setErrors }) => {
        // when you want to show custom error on form field and error message is not coming from api
        setCustomError({ setErrors });
        saveHandler(itemData);
      }}
    >
      {({ errors, submitForm }) => (
        <Form className={styles.Form} data-testid="formLayout">
          {formFieldItems.map((field: any, index: number) => {
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
                <div>{customError}</div>
              </Fragment>
            );
          })}
          <div className={styles.Buttons}>
            <Button
              variant="contained"
              color="primary"
              // onClick={cancelHandler}
              data-testid="cancelActionButton"
            >
              {t('Next')}
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
