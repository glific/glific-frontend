import { Field, FormikProvider, useFormik } from 'formik';
import { useEffect, useState } from 'react';

import styles from './FormLayout.module.css';
import { Typography } from '@mui/material';

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
  okButtonHelperText?: string;
  identifier: string;
  handleStepChange: Function;
  submitData?: Function;
  saveData: Function;
  loading?: boolean;
  showModal?: boolean;
  isDisabled?: boolean;
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
}: FormLayoutProps) => {
  const [saveClick, onSaveClick] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveHandler = async (itemData: any, setErrors: Function) => {
    const payload = setPayload(itemData);

    saveData(payload, identifier);

    if (submitData) {
      await submitData(payload, setErrors);
    } else handleStepChange();

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

    if (registrationData) {
      const data = JSON.parse(registrationData);
      if (data[identifier]) setStates(data[identifier]);
    }
  }, []);

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
    <form onSubmit={formik.handleSubmit} className={styles.Form} data-testid="formLayout">
      <div className={styles.FormFieldContainer}>
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
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${styles.Buttons} ${buttonState.align === 'right' && styles.RightButton}`}>
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
            disabled={!formik.values.token}
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
            loading={loading || saveClick}
          >
            {buttonState.text ? buttonState.text : 'Next'}
          </Button>
        )}

        <p className={styles.OkButtonHelperText}>{okButtonHelperText}</p>
      </div>
    </form>
  );

  let modal;

  if (showModal)
    modal = (
      <DialogBox
        handleCancel={() => setIsModalOpen(false)}
        handleOk={() => {
          saveHandler(formik.values, formik.setErrors);
        }}
        title={'Confirmation'}
        buttonOk={'Confirm'}
        buttonOkLoading={loading}
      >
        <div className={styles.Modal}>
          <h4>Are you sure you want to submit?</h4>
          <p>Once submitted, the details cannot be edited.</p>
        </div>
      </DialogBox>
    );

  return (
    <FormikProvider value={formik}>
      <div className={styles.FormContainer}>
        {header}
        {form}
      </div>
      {isModalOpen && modal}
    </FormikProvider>
  );
};
