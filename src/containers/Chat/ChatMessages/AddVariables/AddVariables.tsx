import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
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
  const [initialValues, setInitialValues] = useState<any>({});
  const { t } = useTranslation();
  const [contactVariables, setContactVariables] = useState<any>([]);

  let contacts: any = [];
  let fields: any = [];
  let selectedVariables: any = [];

  const glificBase = FLOW_EDITOR_API;
  const contactFieldsprefix = '@contact.fields.';
  const contactVariablesprefix = '@contact.';
  const headers = { Authorization: getAuthSession('access_token') };

  useEffect(() => {
    const getVariableOptions = async () => {
      // get fields keys
      const fieldsData = await axios.get(`${glificBase}fields`, {
        headers,
      });

      fields = fieldsData.data.results.map((i: any) => ({
        key: contactFieldsprefix.concat(i.key),
      }));

      // get contact keys
      const contactData = await axios.get(`${glificBase}completion`, {
        headers,
      });
      const properties = contactData.data.types[5];
      contacts = properties.properties
        .map((i: any) => ({ key: contactVariablesprefix.concat(i.key) }))
        .concat(fields)
        .slice(1);
      setContactVariables(contacts);
    };

    getVariableOptions();
  }, []);

  useEffect(() => {
    const isVariable = bodyText.match(pattern);
    if (isVariable) {
      const formFieldItem: any = [];

      for (let index = 1; index <= isVariable.length; index += 1) {
        formFieldItem.push({
          component: AutoComplete,
          name: `variable${index}`,
          type: 'text',
          options: contactVariables,
          optionLabel: 'key',
          multiple: false,
          freeSolo: true,
          autoSelect: true,
          textFieldProps: {
            variant: 'outlined',
            label: `Variable ${index}`,
          },
        });
      }

      setFormFieldItems(formFieldItem);
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
      body = body.replace(
        `{{${index + 1}}}`,
        variable[element].key ? variable[element].key : variable[element]
      );
    });
    updateEditorState(body);
    selectedVariables = Object.values(variable).map((item: any) => (item.key ? item.key : item));

    variableParams(selectedVariables);
  };

  const form = (
    <Formik
      enableReinitialize
      initialValues={initialValues}
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
