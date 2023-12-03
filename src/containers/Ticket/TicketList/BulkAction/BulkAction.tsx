import { useLazyQuery, useMutation } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

import { useTranslation } from 'react-i18next';
import moment from 'moment';
import styles from './BulkAction.module.css';
import { UPDATE_TICKETS_STATUS } from 'graphql/queries/Ticket';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';

export interface BulkActionPropTypes {
  setShowBulkClose: any;
}

export const BulkAction = ({ setShowBulkClose }: BulkActionPropTypes) => {
  const { t } = useTranslation();

  const [updateTicketsStatus, { loading }] = useMutation(UPDATE_TICKETS_STATUS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setShowBulkClose(false);
    },
  });

  const formFields = [
    {
      component: Input,
      name: 'topic',
      type: 'text',
      placeholder: 'Topic',
    },
  ];

  const validationSchema = Yup.object().shape({
    topic: Yup.string().required(),
  });

  return (
    <Formik
      initialValues={{ topic: '' }}
      onSubmit={(values) => {
        if (values.topic) {
          updateTicketsStatus({
            variables: {
              input: {
                status: 'closed',
                topic: values.topic,
              },
            },
          });
        }
      }}
      validationSchema={validationSchema}
    >
      {({ submitForm }) => (
        <DialogBox
          open
          title="Bulk update"
          titleAlign="left"
          buttonOk="Close tickets"
          buttonOkLoading={loading}
          alignButtons="center"
          handleOk={() => submitForm()}
          handleCancel={() => setShowBulkClose(false)}
        >
          <div className={styles.FilterContainer}>
            <Form>
              <div className={styles.Form}>
                {formFields.map((field) => (
                  <div className={styles.FieldContainer}>
                    <Field {...field} key={field.name} />
                  </div>
                ))}
              </div>
              <div className={styles.Description} data-testid="description">
                All tickets will be closed for this topic
              </div>
            </Form>
          </div>
        </DialogBox>
      )}
    </Formik>
  );
};
