import React from 'react';

import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { useLazyQuery, useQuery } from '@apollo/client';
import { FILTER_ORGANIZATIONS } from 'graphql/queries/Organization';
import { setVariables } from 'common/constants';
import { EXPORT_CONSULTING_HOURS } from 'graphql/queries/Consulting';
import { Field, Form, Formik } from 'formik';

import { ReactComponent as ExportIcon } from 'assets/images/icons/Export/export.svg';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Calendar } from 'components/UI/Form/Calendar/Calendar';

import { Button } from 'components/UI/Form/Button/Button';

import styles from './ExportConsulting.module.css';

export interface ExportConsultingPropTypes {
  setFilters: any;
}

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
      const link = document.createElement('a');
      link.href = `data:attachment/csv,${encodeURIComponent(fetchConsultingHours)}`;
      link.target = '_blank';
      link.download = 'myFile.csv';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  return (
    <div className={styles.FilterContainer}>
      <Formik
        initialValues={{ organization: { name: '', id: '' }, dateFrom: '', dateTo: '' }}
        onSubmit={() => {}}
      >
        {({ values }) => (
          <div className={styles.FormContainer}>
            <Form className={styles.Form}>
              {formFields.map((field) => (
                <Field className={styles.Field} {...field} />
              ))}

              <div className={styles.Buttons}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    console.log(values);
                    setFilters({
                      organizationName: values.organization.name,
                      startDate: moment(values.dateFrom).format('YYYY-MM-DD'),
                      endDate: moment(values.dateTo).format('YYYY-MM-DD'),
                    });
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
                          startDate: moment(values.dateFrom).format('YYYY-MM-DD'),
                          endDate: moment(values.dateTo).format('YYYY-MM-DD'),
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
