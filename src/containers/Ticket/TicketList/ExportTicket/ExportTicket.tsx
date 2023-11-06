import { useLazyQuery } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Calendar } from 'components/UI/Form/Calendar/Calendar';
import { downloadFile } from 'common/utils';
import { Button } from 'components/UI/Form/Button/Button';

import styles from './ExportTicket.module.css';
import { EXPORT_SUPPORT_TICKETS } from 'graphql/queries/Ticket';

export interface ExportTicketPropTypes {}

const formatDate = (value: any) => moment(value).format('YYYY-MM-DD');

export const ExportTicket = () => {
  const { t } = useTranslation();

  const [getTicketDetails] = useLazyQuery(EXPORT_SUPPORT_TICKETS, {
    fetchPolicy: 'network-only',
    onCompleted: ({ fetchSupportTickets }) => {
      downloadFile(
        `data:attachment/csv,${encodeURIComponent(fetchSupportTickets)}`,
        'consulting-hours.csv'
      );
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
          !(startDate !== undefined && !moment(endDateValue).isAfter(startDate)),
        message: t('End date should be greater than the start date'),
      })
    ),
  });

  return (
    <div className={styles.FilterContainer}>
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
          <div>
            <Form className={styles.Form}>
              {formFields.map((field) => (
                <Field className={styles.Field} {...field} key={field.name} />
              ))}

              <div className={styles.Buttons}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    submitForm();
                  }}
                >
                  Export
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
};
