import React, { useState } from 'react';

import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { useLazyQuery, useQuery } from '@apollo/client';
import { FILTER_ORGANIZATIONS } from 'graphql/queries/Organization';
import { setVariables } from 'common/constants';
import { EXPORT_CONSULTING_HOURS } from 'graphql/queries/Consulting';
import { Field, Form, Formik } from 'formik';
import { ReactComponent as ExportIcon } from 'assets/images/icons/Export/export.svg';
import { useTranslation } from 'react-i18next';
// import { TextField } from '@material-ui/core';
import { Button } from 'components/UI/Form/Button/Button';
// import { DateRangePicker } from '@material-ui/pickers';
import styles from './ExportConsulting.module.css';

export interface ExportConsultingPropTypes {}

export const ExportConsulting: React.FC<ExportConsultingPropTypes> = () => {
  const [organization] = useState({});
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
      //   onChange: (val: any) => setOrganization(val),
    },
  ];

  return (
    <div className={styles.FilterContainer}>
      <Formik initialValues={{ organization }} onSubmit={() => {}}>
        {() => (
          <div className={styles.FormContainer}>
            <Form className={styles.Form}>
              {formFields.map((field) => (
                <Field className={styles.Field} {...field} />
              ))}

              <div className={styles.Buttons}>
                <Button variant="outlined" color="primary">
                  Filter
                </Button>
                <ExportIcon
                  className={styles.ExportIcon}
                  onClick={() => {
                    getConsultingDetails({
                      variables: {
                        filter: {
                          clientId: 1,
                          endDate: '2022-12-31',
                          startDate: '2021-12-31',
                        },
                      },
                    });
                  }}
                />
              </div>

              {/* <DateRangePicker
                value={[new Date('2021-12-31'), new Date('2022-12-31')]}
                onChange={() => {}}
                renderInput={({ inputProps, ...startProps }: any, endProps: any) => {
                  const some = inputProps;
                  const startValue = inputProps.value;
                  delete some.value;
                  return (
                    <TextField
                      {...startProps}
                      inputProps={some}
                      value={`${startValue}-${endProps.inputProps.value}`}
                    />
                  );
                }}
              /> */}
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
};
