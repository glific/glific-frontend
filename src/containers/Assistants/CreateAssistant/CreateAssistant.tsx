import { Input } from 'components/UI/Form/Input/Input';
import { AssistantOptions } from '../AssistantOptions/AssistantOptions';
import { useEffect, useState } from 'react';
import { Field, FormikProvider, useFormik } from 'formik';
import { Autocomplete, TextField, Typography } from '@mui/material';

import styles from './CreateAssistant.module.css';
import { Button } from 'components/UI/Form/Button/Button';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { GET_ASSISTANT, GET_MODELS } from 'graphql/queries/Assistant';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import * as Yup from 'yup';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { CREATE_ASSISTANT, UPDATE_ASSISTANT } from 'graphql/mutations/Assistant';
import { setNotification } from 'common/notification';

interface CreateAssistantProps {
  currentId: string | number | null;
}

export const CreateAssistant = ({ currentId }: CreateAssistantProps) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState<any>(null);
  const [instructions, setPrompt] = useState('');
  const [options, setOptions] = useState({ fileSearch: true, temperature: 1 });

  const states = {
    name,
    model,
    instructions,
    options,
  };

  let modelOptions = [];

  const { data: modelsList, loading: listLoading } = useQuery(GET_MODELS);
  const [getAssistant, { loading }] = useLazyQuery(GET_ASSISTANT);

  const [updateAssistant, { loading: savingChanges }] = useMutation(UPDATE_ASSISTANT, {
    onCompleted: () => {
      setNotification('Changes saved successfully', 'success');
    },
  });

  if (modelsList) {
    modelOptions = modelsList?.listOpenaiModels.map((item: string, index: number) => ({
      id: index.toString(),
      label: item,
    }));
  }

  useEffect(() => {
    if (currentId && modelsList) {
      getAssistant({
        variables: { assistantId: currentId },
        onCompleted: ({ assistant }) => {
          setName(assistant?.assistant?.name || '');
          let modelValue = modelOptions?.find(
            (item: any) => item.label === assistant?.assistant?.model
          );
          setModel(modelValue);
          setPrompt(assistant?.assistant?.instructions || '');
          setOptions({
            ...options,
            temperature: assistant?.assistant?.temperature,
          });
        },
      });
    }
  }, [currentId, modelsList]);

  const handleCreate = () => {
    console.log(states);
    const {
      instructions: instructionsValue,
      model: modelValue,
      name: nameValue,
      options: optionsValue,
    } = states;

    const payload = {
      instructions: instructionsValue,
      model: modelValue.label,
      name: nameValue,
      temperature: optionsValue?.temperature,
    };

    updateAssistant({
      variables: {
        updateAssistantId: currentId,
        input: payload,
      },
    });
  };

  const formFields: any = [
    {
      component: AutoComplete,
      name: 'model',
      options: modelOptions || [],
      optionLabel: 'label',
      multiple: false,
      label: 'Model',
      helperText: 'Use this to categorize your flows.',
      onChange: (value: any) => setModel(value),
    },
    {
      component: Input,
      name: 'name',
      type: 'text',
      label: 'Name',
      helperText: 'Give a recognizable name for your assistant',
      onChange: (value: any) => setName(value),
    },
    {
      component: Input,
      name: 'instructions',
      type: 'text',
      label: 'Instructions',
      rows: 3,
      textArea: true,
      helperText: 'Set the instructions according to your requirements.',
      onChange: (value: any) => setPrompt(value),
    },
    {
      component: AssistantOptions,
      name: 'options',
      options,
      currentId,
      setOptions,
    },
  ];

  const FormSchema = Yup.object().shape({
    name: Yup.string(),
    model: Yup.object().required('Model is required'),
    instructions: Yup.string(),
  });

  const formik = useFormik({
    initialValues: states,
    validationSchema: FormSchema,
    enableReinitialize: true,
    onSubmit: (values, { setErrors }) => {},
  });

  if (loading || listLoading) {
    return <Loading />;
  }
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
            <Button loading={savingChanges} onClick={handleCreate} variant="contained">
              Save Changes
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
