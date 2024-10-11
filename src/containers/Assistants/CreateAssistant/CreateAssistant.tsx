import { Input } from 'components/UI/Form/Input/Input';
import { AssistantOptions } from '../AssistantOptions/AssistantOptions';
import { useEffect, useState } from 'react';
import { Field, FormikProvider, useFormik } from 'formik';
import { Autocomplete, TextField, Typography } from '@mui/material';

import styles from './CreateAssistant.module.css';
import { Button } from 'components/UI/Form/Button/Button';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_ASSISTANT, GET_MODELS } from 'graphql/queries/Assistant';

interface CreateAssistantProps {
  currentId: string | number | null;
}

export const CreateAssistant = ({ currentId }: CreateAssistantProps) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState();
  const [prompt, setPrompt] = useState('');
  const [fileSearch, setFileSearch] = useState(true);
  const [options, setOptions] = useState({ fileSearch: true, temperature: 1 });

  let modelOptions = [];

  const { data: modelsList, loading: listLoading } = useQuery(GET_MODELS);

  const [getAssistant, { data, loading }] = useLazyQuery(GET_ASSISTANT);

  if (modelsList) {
    modelOptions = modelsList?.listOpenaiModels;
  }

  useEffect(() => {
    if (currentId) {
      getAssistant({
        variables: { assistantId: currentId },
        onCompleted: ({ assistant }) => {
          setName(assistant?.assistant?.name);
          setModel(assistant?.assistant?.model);
          setPrompt(assistant?.assistant?.instructions);
        },
      });
    }
  }, [currentId]);

  const handleCreate = () => {};

  const formFields = [
    {
      component: Autocomplete,
      name: 'model',
      options: modelOptions,
      optionLabel: 'name',
      label: 'Model',
      skipPayload: true,
      helperText: 'Choose the best model for your needs',
      multiple: false,
      noOptionsText: loading ? 'Loading...' : 'No models found',
      // renderInput: (params: any) => <Input {...params} />,
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

  console.log(states);

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
            <Button onClick={handleCreate} variant="contained">
              Save
            </Button>

            <Button variant="outlined" color="error">
              Remove
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};
