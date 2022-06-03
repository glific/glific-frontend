import React from 'react';

import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { useLazyQuery, useQuery } from '@apollo/client';
import { FILTER_ORGANIZATIONS } from 'graphql/queries/Organization';
import { setVariables } from 'common/constants';
import { EXPORT_CONSULTING_HOURS } from 'graphql/queries/Consulting';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

import { ReactComponent as ExportIcon } from 'assets/images/icons/Export/export.svg';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Calendar } from 'components/UI/Form/Calendar/Calendar';
import { downloadFile } from 'common/utils';
import { Button } from 'components/UI/Form/Button/Button';

import styles from './ExportConsulting.module.css';

export interface ExportConsultingPropTypes {
  setFilters: any;
}

const formatDate = (value: any) => moment(value).format('YYYY-MM-DD');

export const ExportConsulting: React.FC<ExportConsultingPropTypes> = ({
  setFilters,
}: ExportConsultingPropTypes) => {
  const { data: organizationList } = useQuery(FILTER_ORGANIZATIONS, {
    variables: setVariables(),
  });

  const { t } = useTranslation();

  const [getConsultingDetails] = useLazyQuery(EXPORT_CONSULTING_HOURS, {
    fetchPolicy: 'network-only',
    onCompleted: ({ fetchConsultingHours }) => {
      downloadFile(
        `data:attachment/csv,${encodeURIComponent(fetchConsultingHours)}`,
        'consulting-hours.csv'
      );
    },
  });

  const formFields = [
    {
      component: AutoComplete,
      name: 'organization',
      placeholder: t('Select Organization'),
      options: organizationList ? organizationList.organizations : [],
      optionLabel: 'name',
      multiple: false,
      textFieldProps: {
        label: t('Select Organization'),
        variant: 'outlined',
      },
    },
    {
      component: Calendar,
      name: 'dateFrom',
      type: 'date',
      placeholder: t('Date from'),
      label: t('Date range'),
    },
    {
      component: Calendar,
      name: 'dateTo',
      type: 'date',
      placeholder: t('Date to'),
    },
  ];

  const validationSchema = Yup.object().shape({
    organization: Yup.object().test(
      'organization',
      'Organization is required',
      (val) => val.name !== undefined
    ),

    dateTo: Yup.string().when('dateFrom', (startDateValue: any, schema: any) =>
      schema.test({
        test: (endDateValue: any) =>
          !(startDateValue !== undefined && !moment(endDateValue).isAfter(startDateValue)),
        message: t('End date should be greater than the start date'),
      })
    ),
  });

  return (
    <div className={styles.FilterContainer}>
      <Formik
        initialValues={{ organization: { name: '', id: '' }, dateFrom: '', dateTo: '' }}
        onSubmit={(values) => {
          const organizationFilter: any = { organizationName: values.organization.name };

          if (values.dateFrom && values.dateTo) {
            organizationFilter.startDate = formatDate(values.dateFrom);
            organizationFilter.endDate = formatDate(values.dateTo);
          }

          setFilters(organizationFilter);
        }}
        validationSchema={validationSchema}
      >
        {({ values, submitForm }) => (
          <div className={styles.FormContainer}>
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
                  Filter
                </Button>
                <ExportIcon
                  className={styles.ExportIcon}
                  onClick={() => {
                    getConsultingDetails({
                      variables: {
                        filter: {
                          clientId: values.organization.id,
                          startDate: formatDate(values.dateFrom),
                          endDate: formatDate(values.dateTo),
                        },
                      },
                    });
                  }}
                />
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
};
