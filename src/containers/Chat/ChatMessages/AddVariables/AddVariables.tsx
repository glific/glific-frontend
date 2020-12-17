import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { Input } from '../../../../components/UI/Form/Input/Input';
import { pattern } from '../../../../common/constants';

export interface AddVariablesPropTypes {
  setVariable: any;
  handleCancel: any;
  bodyText: any;
}

export const AddVariables: React.FC<AddVariablesPropTypes> = ({
  setVariable,
  handleCancel,
  bodyText,
}: AddVariablesPropTypes) => {
  const [formFieldItems, setFormFieldItems] = useState<any>([]);
  const [validation, setValidation] = useState<any>({});

  useEffect(() => {
    const isVariable = bodyText.match(pattern);
    if (isVariable) {
      const formFieldItem: any = [];
      const validationObj: any = {};
      for (let index = 1; index <= isVariable.length; index += 1) {
        formFieldItem.push({
          component: Input,
          name: `variable${index}`,
          type: 'text',
          placeholder: `Variable ${index}`,
        });

        validationObj[`variable${index}`] = Yup.string().required(`Variable ${index} is required.`);
      }
      setFormFieldItems(formFieldItem);
      setValidation(validationObj);
    }
  }, [bodyText]);

  const validationSchema = Yup.object().shape(validation);

  const form = (
    <Formik
      enableReinitialize
      initialValues={{}}
      validationSchema={validationSchema}
      onSubmit={(itemData) => {
        console.log(itemData);
        setVariable(false);
      }}
    >
      {({ submitForm }) => (
        <Form data-testid="formLayout">
          <DialogBox
            titleAlign="left"
            title="Select variables for the message"
            contentText={bodyText}
            handleOk={() => {
              submitForm();
            }}
            handleCancel={() => {
              setVariable(false);
              handleCancel();
            }}
            buttonOk="Done"
            alignButtons="left"
          >
            <div data-testid="variablesDialog">
              {formFieldItems.map((field: any) => {
                return <Field {...field} />;
              })}
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );

  return form;
};
