import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { AssistantOptions } from '../AssistantOptions/AssistantOptions';
import { useState } from 'react';
import { Field, FormikProvider, useFormik } from 'formik';
import { Typography } from '@mui/material';

import styles from './CreateAssistant.module.css';
import { Button } from 'components/UI/Form/Button/Button';

export const CreateAssistant = () => {
  const [name, setName] = useState('');
  const [model, setModel] = useState();
  const [prompt, setPrompt] = useState('');
  const [fileSearch, setFileSearch] = useState(true);
  const [options, setOptions] = useState({ fileSearch: true, temperature: 1 });

  const models = [
    { id: '1', name: 'gpt-4o ' },
    { id: '2', name: 'GPT-4' },
    { id: '3', name: 'GPT-5' },
  ];

  const formFields = [
    {
      component: AutoComplete,
      name: 'model',
      options: models,
      optionLabel: 'name',
      label: 'Model',
      skipPayload: true,
      helperText: 'Choose the best model for your needs',
      multiple: false,
    },
    {
      component: Input,
      name: 'name',
      type: 'text',
      label: 'Name',
      helperText: 'Give a recognizable name for your assistant',
    },
    {
      component: Input,
      name: 'prompt',
      type: 'text',
      label: 'Instructions',
      rows: 3,
      textArea: true,
      helperText: 'Set the instructions according to your requirements.',
    },
    {
      component: AssistantOptions,
      name: 'options',
      fileSearch,
      options,
    },
  ];

  const states = {
    name,
    model,
    prompt,
    fileSearch,
    options,
  };
  const FormSchema = {};

  const formik = useFormik({
    initialValues: states,
    validationSchema: FormSchema,
    enableReinitialize: true,
    onSubmit: (values, { setErrors }) => {},
  });

  return (
    <FormikProvider value={formik}>
      <div className={styles.FormContainer}>
        <form className={styles.Form} onSubmit={formik.handleSubmit} data-testid="formLayout">
          <div className={styles.FormFields}>
            {formFields.map((field: any) => (
              <div className={styles.FormSection} key={field.name}>
                <Typography className={styles.Label} variant="h5">
                  {field.label}
                </Typography>

                <Field key={field.name} {...field} />
              </div>
            ))}
          </div>
          <div className={styles.Buttons}>
            <Button variant="contained">Save</Button>

            <Button variant="outlined" color="error">
              Remove
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};
