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
  okButtonHelperText?: string;
  identifier: string;
  handleStepChange: Function;
  submitData?: Function;
  saveData: Function;
  loading?: boolean;
  showModal?: boolean;
  isDisabled?: boolean;
  cancelButton?: { text?: string; show: Boolean; action: any };
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
  cancelButton,
}: FormLayoutProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveHandler = async (itemData: any, setErrors: Function) => {
    const payload = setPayload(itemData);

    if (identifier !== 'reachOutToUs') saveData(payload, identifier);

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

    if (registrationData && identifier !== 'reachOutToUs') {
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
                {field.fieldEndAdornment &&
                  field.fieldEndAdornment.show &&
                  field.fieldEndAdornment.component(formik)}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`${cancelButton ? styles.SpacedOutButtons : styles.Buttons} ${buttonState.align === 'right' && styles.RightButton}`}
      >
        {cancelButton && cancelButton.show && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => cancelButton.action()}
            className={styles.Button}
            data-testid="cancelActionButton"
          >
            {cancelButton.text || 'Cancel'}
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

  if (showModal)
    modal = (
      <DialogBox
        handleCancel={() => setIsModalOpen(false)}
        handleOk={() => {
          saveHandler(formik.values, formik.setErrors);
        }}
        title={'Confirmation'}
        buttonOk={'Confirm'}
        buttonCancel="Cancel"
        buttonOkLoading={loading}
      >
        <div className={styles.Modal}>
          <p>
            The information listed on this form cannot be changed once confirmed. Do you want to
            proceed?
          </p>
          {loading && <p className={styles.Wait}>Please wait, this might take a few seconds.</p>}
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
