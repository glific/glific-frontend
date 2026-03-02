import { gql, useMutation } from '@apollo/client';
import FileIcon from 'assets/images/FileGreen.svg?react';
import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

import styles from './UploadGoldenQaDialog.module.css';

export const CREATE_GOLDEN_QA = gql`
  mutation CreateGoldenQa($input: GoldenQaInput!) {
    createGoldenQa(input: $input) {
      goldenQa {
        name
      }
      errors {
        message
      }
    }
  }
`;

export interface UploadGoldenQaDialogProps {
  open: boolean;
  fileName: string;
  file: File | null;
  onClose: () => void;
  onProceed: (values: { name: string; duplicationFactor: number }) => void;
}

export const UploadGoldenQaDialog = ({ open, fileName, file, onClose, onProceed }: UploadGoldenQaDialogProps) => {
  const [createGoldenQa, { loading }] = useMutation(CREATE_GOLDEN_QA);

  const initialValues = {
    name: fileName
      .split('.')[0]
      .replace(/-/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, ''),
    duplicationFactor: 1,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .matches(/^[a-zA-Z0-9_-]+$/, 'Name can only contain alphanumeric characters and underscores'),
    duplicationFactor: Yup.number()
      .typeError('Duplication factor must be a number')
      .min(1, 'Duplication factor must be between 1 and 5')
      .max(5, 'Duplication factor must be between 1 and 5')
      .required('Duplication factor is required'),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    if (!file) {
      setNotification('No file selected for Golden QA upload', 'error');
      return;
    }

    try {
      const { data } = await createGoldenQa({
        variables: {
          input: {
            name: values.name,
            file: file,
            duplication_factor: Number(values.duplicationFactor),
          },
        },
      });

      const { goldenQa, errors } = data?.createGoldenQa;

      if (errors !== null) {
        let errorMsg = 'Failed to upload Golden QA';
        if (Array.isArray(errors)) {
          errorMsg =
            errors
              .map((err: any) => err?.message)
              .filter(Boolean)
              .join('; ') || errorMsg;
        } else if (typeof errors === 'object' && errors !== null) {
          errorMsg = errors.message || errorMsg;
        }
        setNotification(errorMsg, 'error');
        return;
      }

      setNotification('Golden QA uploaded successfully', 'success');
      onProceed({
        name: goldenQa.name,
        duplicationFactor: goldenQa.duplication_factor,
      });
    } catch (error: any) {
      setErrorMessage(error?.message || 'An unknown error occurred, please contact Glific support team.');
    }
  };

  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ submitForm }) => (
        <Form>
          <DialogBox
            open={open}
            title="Upload Golden QA"
            titleAlign="left"
            buttonOk="Upload"
            buttonCancel="Cancel"
            alignButtons="right"
            buttonOkLoading={loading}
            disableOk={loading}
            skipCancel={loading}
            handleOk={() => {
              submitForm();
            }}
            handleCancel={() => {
              if (!loading) {
                onClose();
              }
            }}
            fullWidth
          >
            <div className={styles.UploadGoldenQaDialog}>
              <div className={styles.UploadGoldenQaFileRow}>
                <FileIcon />
                <div className={styles.UploadGoldenQaFileName}>{fileName}</div>
              </div>
              <div className={styles.UploadGoldenQaFieldGroup}>
                <div className={styles.UploadGoldenQaField}>
                  <Field
                    component={Input}
                    name="name"
                    type="text"
                    placeholder="Name your Golden QA collection"
                    inputLabel="Name"
                    required
                  />
                </div>
                <div className={styles.UploadGoldenQaField}>
                  <Field
                    component={Input}
                    name="duplicationFactor"
                    type="number"
                    placeholder="1"
                    inputLabel="Duplication Factor"
                    inputProp={{ min: 1, max: 5 }}
                  />
                  <div className={styles.UploadGoldenQaHelperText}>
                    No of times the golden questions are repeated while running the evaluation. Allowed values 1-5.
                  </div>
                </div>
              </div>
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );
};
