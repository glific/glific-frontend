import { useMutation, useQuery } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

import { useTranslation } from 'react-i18next';
import styles from './BulkAction.module.css';
import { UPDATE_TICKETS_STATUS } from 'graphql/queries/Ticket';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { GET_ALL_FLOW_LABELS } from 'graphql/queries/FlowLabel';
import { setVariables } from 'common/constants';
import { setNotification } from 'common/notification';

export interface BulkActionPropTypes {
  setShowBulkClose: any;
}

export const BulkAction = ({ setShowBulkClose }: BulkActionPropTypes) => {
  const { t } = useTranslation();

  const [updateTicketsStatus, { loading }] = useMutation(UPDATE_TICKETS_STATUS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setNotification('Tickets closed successfully');
      setShowBulkClose(false);
    },
  });

  const { data: dataLabels } = useQuery(GET_ALL_FLOW_LABELS, {
    variables: setVariables(),
  });

  const formFields = [
    {
      component: AutoComplete,
      name: 'topic',
      placeholder: t('Select topic'),
      options: dataLabels ? dataLabels.flowLabels : [],
      optionLabel: 'name',
      multiple: false,
      textFieldProps: {
        label: t('Topic'),
        variant: 'outlined',
      },
    },
  ];

  const validationSchema = Yup.object().shape({
    topic: Yup.object().required('Topic is required'),
  });

  return (
    <Formik
      initialValues={{ topic: undefined }}
      onSubmit={(values: any) => {
        if (values.topic) {
          updateTicketsStatus({
            variables: {
              input: {
                status: 'closed',
                topic: values.topic.name,
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
                  <div className={styles.FieldContainer} key={field.name}>
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
