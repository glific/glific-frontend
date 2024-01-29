import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import styles from './AddVariables.module.css';
import { FLOW_EDITOR_API } from 'config';
import { getAuthSession } from 'services/AuthService';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';

export interface AddVariablesPropTypes {
  setVariable: any;
  handleCancel: any;
  template: any;
  updateEditorState: any;
  variableParams: any;
  variableParam: any;
}

export const AddVariables = ({
  setVariable,
  handleCancel,
  template,
  updateEditorState,
  variableParams,
  variableParam,
}: AddVariablesPropTypes) => {
  const [formFieldItems, setFormFieldItems] = useState<any>([]);
  const initialValue: any = {};
  variableParam.forEach((value: any, i: any) => {
    initialValue[`variable${i + 1}`] = value;
  });
  const [initialValues, setInitialValues] = useState<any>(initialValue);
  const { t } = useTranslation();
  const [contactVariables, setContactVariables] = useState<any>([]);

  let contacts: any = [];
  let fields: any = [];
  let selectedVariables: any = [];

  const glificBase = FLOW_EDITOR_API;
  const contactFieldsprefix = '@contact.fields.';
  const contactVariablesprefix = '@contact.';
  const headers = { authorization: getAuthSession('access_token') };

  useEffect(() => {
    const getVariableOptions = async () => {
      // get fields keys
      const fieldsData = await axios.get(`${glificBase}fields`, {
        headers,
      });

      fields = fieldsData.data.results.map((i: any) => contactFieldsprefix.concat(i.key));

      // get contact keys
      const contactData = await axios.get(`${glificBase}completion`, {
        headers,
      });

      const properties = contactData.data.context.types[5];
      contacts = properties.properties
        .map((i: any) => contactVariablesprefix.concat(i.key))
        .concat(fields)
        .slice(1);

      setContactVariables(contacts);
    };

    getVariableOptions();
  }, []);

  const syncInitialValuesWithFormik = (val: any, index: number) => {
    const initialStateValue = { ...initialValues };
    initialStateValue[`variable${index}`] = val;
    setInitialValues(initialStateValue);
  };

  useEffect(() => {
    const hasVariables = template?.numberParameters > 0;

    if (hasVariables) {
      const formFieldItem: any = [];

      for (let index = 1; index <= template.numberParameters; index += 1) {
        formFieldItem.push({
          component: AutoComplete,
          name: `variable${index}`,
          type: 'text',
          options: contactVariables,
          optionLabel: 'key',
          multiple: false,
          freeSolo: true,
          selectTextAsOption: !!initialValues[`variable${index}`],
          onInputChange: (event: any, newInputValue: any) => {
            syncInitialValuesWithFormik(newInputValue, index);
          },
          label: `Variable ${index}`,
        });
      }

      setFormFieldItems(formFieldItem);
    }
  }, [template, contactVariables, initialValues]);

  const updateText = (variable: any) => {
    let body = template?.body;
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
            <div className={styles.TemplateText}> {template?.body}</div>
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
