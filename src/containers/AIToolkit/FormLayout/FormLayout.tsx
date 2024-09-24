import { Field, Form, Formik, FormikProvider, useFormik } from 'formik';
import styles from './FormLayout.module.css';
import { Typography } from '@mui/material';
import { Button } from 'components/UI/Form/Button/Button';

interface FormLayoutProps {
  initialValues: any;
  validationSchema: any;
  formFieldItems: any;
  skipSave?: boolean;
}

export const FormLayout = ({
  initialValues,
  validationSchema,
  formFieldItems,
  skipSave = false,
}: FormLayoutProps) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setErrors }) => {},
  });

  return (
    <FormikProvider value={formik}>
      <div className={styles.FormContainer}>
        <form className={styles.Form} onSubmit={formik.handleSubmit} data-testid="formLayout">
          <div className={styles.FormFields}>
            {formFieldItems.map((field: any) => (
              <div className={styles.FormSection} key={field.name}>
                <Typography className={styles.Label} variant="h5">
                  {field.label}
                </Typography>

                <Field key={field.name} {...field} />
              </div>
            ))}
          </div>
          <div className={styles.Buttons}>
            {!skipSave && <Button variant="contained">Save</Button>}

            <Button variant="outlined" color="error">
              Remove
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};
