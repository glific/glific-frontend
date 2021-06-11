import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { FLOW_EDITOR_API } from '../../../../config/index';
import { getAuthSession } from '../../../../services/AuthService';

import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { pattern } from '../../../../common/constants';
import { AutoComplete } from '../../../../components/UI/Form/AutoComplete/AutoComplete';

export interface AddVariablesPropTypes {
  setVariable: any;
  handleCancel: any;
  bodyText: any;
  updateEditorState: any;
  variableParams: any;
  variableParam: any;
}

export const AddVariables: React.FC<AddVariablesPropTypes> = ({
  setVariable,
  handleCancel,
  bodyText,
  updateEditorState,
  variableParams,
  variableParam,
}: AddVariablesPropTypes) => {
  const [formFieldItems, setFormFieldItems] = useState<any>([]);
  const [validation, setValidation] = useState<any>({});
  const [initialValues, setInitialValues] = useState<any>({});
  const { t } = useTranslation();
  const [contactVariables, setContactVariables] = useState<any>([]);
  let contacts: any = [];
  let fields: any = [];

  const glificBase = FLOW_EDITOR_API;
  const prefix1 = '@contact.field.';
  const prefix2 = '@contact.';

  useEffect(() => {
    // get fields keys
    axios
      .get(`${glificBase}fields`, {
        headers: { Authorization: getAuthSession('access_token') },
      })
      .then((res) => {
        fields = res.data.results.map((i: any) => ({ ...i, key: prefix1.concat(i.key) }));

        // get contact keys
        axios
          .get(`${glificBase}completion`, {
            headers: { Authorization: getAuthSession('access_token') },
          })
          .then((response) => {
            const properties = response.data.types[5];
            contacts = properties.properties
              .map((i: any) => ({ ...i, key: prefix2.concat(i.key) }))
              .concat(fields);
            setContactVariables(contacts);
          });
      });
  }, []);

  useEffect(() => {
    const isVariable = bodyText.match(pattern);
    if (isVariable) {
      const formFieldItem: any = [];
      const validationObj: any = {};

      for (let index = 1; index <= isVariable.length; index += 1) {
        formFieldItem.push({
          component: AutoComplete,
          name: `variable${index}`,
          type: 'text',
          options: contactVariables,
          optionLabel: 'key',
          multiple: false,
          textFieldProps: {
            variant: 'outlined',
            label: `Variable ${index}`,
          },
        });

        validationObj[`variable${index}`] = Yup.string().required(`Variable ${index} is required.`);
      }
      setFormFieldItems(formFieldItem);
      setValidation(validationObj);
    }
  }, [bodyText, contactVariables]);

  useEffect(() => {
    const initialValue: any = {};
    variableParam.forEach((value: any, i: any) => {
      initialValue[`variable${i + 1}`] = value;
    });
    setInitialValues(initialValue);
  }, [variableParam]);

  const updateText = (variable: any) => {
    let body = bodyText;
    Object.keys(variable).forEach((element: string, index: number) => {
      body = body.replace(`{{${index + 1}}}`, variable[element]);
    });
    updateEditorState(body);
    variableParams(Object.values(variable));
  };

  const validationSchema = Yup.object().shape(validation);

  const form = (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(itemData) => {
        updateText(itemData);
        setVariable(false);
      }}
    >
      {({ submitForm }) => (
        <Form data-testid="formLayout">
          <DialogBox
            titleAlign="left"
            title={t('Select variables for the message')}
            contentText={bodyText}
            handleOk={() => {
              submitForm();
            }}
            handleCancel={() => {
              setVariable(false);
              handleCancel();
            }}
            buttonOk={t('Done')}
            alignButtons="left"
          >
            <div data-testid="variablesDialog">
              {formFieldItems.map((field: any) => (
                <Field {...field} key={field.name} />
              ))}
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );

  return form;
};
