import { useLazyQuery } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Calendar } from 'components/UI/Form/Calendar/Calendar';
import { downloadFile } from 'common/utils';

import styles from './ExportTicket.module.css';
import { EXPORT_SUPPORT_TICKETS } from 'graphql/queries/Ticket';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';

export interface ExportTicketPropTypes {
  setShowExportDialog: any;
}

const formatDate = (value: any) => dayjs(value).format('YYYY-MM-DD');

export const ExportTicket = ({ setShowExportDialog }: ExportTicketPropTypes) => {
  const { t } = useTranslation();

  const [getTicketDetails, { loading }] = useLazyQuery(EXPORT_SUPPORT_TICKETS, {
    fetchPolicy: 'network-only',
    onCompleted: ({ fetchSupportTickets }) => {
      downloadFile(`data:attachment/csv,${encodeURIComponent(fetchSupportTickets)}`, 'tickets.csv');
      setShowExportDialog(false);
    },
  });

  const formFields = [
    {
      component: Calendar,
      name: 'startDate',
      type: 'date',
      placeholder: t('Date from'),
      label: t('Date range'),
    },
    {
      component: Calendar,
      name: 'endDate',
      type: 'date',
      placeholder: t('Date to'),
    },
  ];

  const validationSchema = Yup.object().shape({
    endDate: Yup.string().when('startDate', ([startDate], schema: any) =>
      schema.test({
        test: (endDateValue: any) =>
          !(startDate !== undefined && !dayjs(endDateValue).isAfter(startDate)),
        message: t('End date should be greater than the start date'),
      })
    ),
  });

  return (
    <Formik
      initialValues={{ startDate: '', endDate: '' }}
      onSubmit={(values) => {
        if (values.startDate && values.endDate) {
          getTicketDetails({
            variables: {
              filter: {
                startDate: formatDate(values.startDate),
                endDate: formatDate(values.endDate),
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
          title="Export tickets"
          titleAlign="left"
          buttonOk="Export"
          buttonOkLoading={loading}
          alignButtons="center"
          handleOk={() => submitForm()}
          handleCancel={() => setShowExportDialog(false)}
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
            </Form>
          </div>
        </DialogBox>
      )}
    </Formik>
  );
};
