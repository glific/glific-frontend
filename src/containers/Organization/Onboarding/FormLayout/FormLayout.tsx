import { Field, FormikProvider, useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import styles from './FormLayout.module.css';
import { Button } from 'components/UI/Form/Button/Button';
import { Captcha } from 'components/UI/Form/Captcha/Captcha';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';

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
  okButtonHelperText?: any;
  identifier: string;
  handleStepChange: Function;
  submitData: Function;
  saveData: Function;
  loading?: boolean;
  showModal?: boolean;
  isDisabled?: boolean;
  handleEffect?: Function;
  customError?: null | string;
  setCustomError?: Function;
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
  identifier,
  submitData,
  handleStepChange,
  saveData,
  loading,
  showModal,
  isDisabled,
  handleEffect,
  customError,
  setCustomError,
}: FormLayoutProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveHandler = async (itemData: any, setErrors: Function) => {
    const payload = setPayload(itemData);

    if (identifier !== 'reachOutToUs') saveData(payload, identifier);

    await submitData(payload, setErrors);

    setIsModalOpen(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setErrors }) => {
      if (showModal && !isDisabled) setIsModalOpen(true);
      else saveHandler(values, setErrors);
    },
  });

  useEffect(() => {
    const registrationData = localStorage.getItem('registrationData');

    if (registrationData && identifier !== 'reachOutToUs') {
      const data = JSON.parse(registrationData);
      if (data[identifier]) setStates(data[identifier]);
    }
  }, []);

  useEffect(() => {
    if (handleEffect) handleEffect(identifier, formik);
  }, [formik.touched?.name, formik.values.name, formik.values.registered_address, formik.values.same_address]);

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
  };

  const form = (
    <form onSubmit={formik.handleSubmit} className={styles.Form} data-testid="formLayout">
      <div className={styles.FormFieldContainer}>
        <div className={styles.FormFields}>
          {formFieldItems.map((field, index) => {
            const key = index;

            if (field.children) {
              return (
                <div className={styles.FormSection} key={key}>
                  <Typography data-testid="formLabel" variant="h5" className={styles.SectionHeading}>
                    {field.label}
                  </Typography>
                  <div className={styles.FormFields}>
                    {field.children.map((child: any, i: number) => {
                      return (
                        <div className={child.additionalStyles} key={i}>
                          {child.label && (
                            <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
                              {child.label}
                            </Typography>
                          )}
                          <Field key={i} {...child} />
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

                <Field key={key} {...field} onSubmit={formik.submitForm} />
                {field.fieldEndAdornment && field.fieldEndAdornment.show && field.fieldEndAdornment.component(formik)}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${styles.Buttons} ${buttonState.align === 'right' && styles.RightButton}`}>
        {identifier !== 'reachOutToUs' && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              const values = setPayload(formik.values);
              saveData(values, identifier);
              handleStepChange(false);
            }}
            className={styles.Button}
            data-testid="back-button"
          >
            Previous
          </Button>
        )}
        {identifier === 'platformDetails' ? (
          <Captcha
            component={Button}
            variant="contained"
            color="primary"
            onClick={formik.submitForm}
            className={styles.Button}
            data-testid="submitActionButton"
            onTokenUpdate={(token: string) => {
              formik.setFieldValue('token', token);
            }}
            action="register"
          >
            Next
          </Captcha>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              onSaveButtonClick(formik.errors);
              formik.submitForm();
            }}
            className={styles.Button}
            data-testid="submitActionButton"
            disabled={buttonState.status}
            loading={loading}
          >
            {buttonState.text ? buttonState.text : 'Next'}
          </Button>
        )}
      </div>
      {okButtonHelperText && <p className={styles.OkButtonHelperText}>{okButtonHelperText}</p>}
    </form>
  );

  let modal;
  let errorModal;
  if (showModal)
    modal = (
      <DialogBox
        handleCancel={() => setIsModalOpen(false)}
        handleOk={() => {
          saveHandler(formik.values, formik.setErrors);
        }}
        title="Confirmation"
        buttonOk="Confirm"
        buttonCancel="Cancel"
        buttonOkLoading={loading}
      >
        <div className={styles.Modal}>
          <p>You wont be able to make changes to this page once confirmed. Do you want to go ahead?</p>
          {loading && <p className={styles.Wait}>Please wait, this might take a few seconds.</p>}
        </div>
      </DialogBox>
    );

  if (customError && setCustomError) {
    errorModal = (
      <DialogBox
        handleOk={() => setCustomError(null)}
        handleCancel={() => setCustomError(null)}
        title="Something went wrong!"
        buttonOk="Ok"
        skipCancel
        colorOk="warning"
      >
        <div className={styles.Modal}>
          <p>{customError}</p>
          <p>Please contact the Glific team for support.</p>
        </div>
      </DialogBox>
    );
  }
  return (
    <FormikProvider value={formik}>
      <div className={styles.FormContainer}>
        {header}
        {form}
      </div>
      {isModalOpen && modal}
      {errorModal}
    </FormikProvider>
  );
};
