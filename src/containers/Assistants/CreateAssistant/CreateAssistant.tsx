import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Typography } from '@mui/material';
import { Field, FormikProvider, useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { copyToClipboard } from 'common/utils';
import { setErrorMessage, setNotification } from 'common/notification';

import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';

import { GET_ASSISTANT, GET_MODELS } from 'graphql/queries/Assistant';
import { DELETE_ASSISTANT, UPDATE_ASSISTANT } from 'graphql/mutations/Assistant';

import CopyIcon from 'assets/images/CopyGreen.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/White.svg?react';

import { AssistantOptions } from '../AssistantOptions/AssistantOptions';

import styles from './CreateAssistant.module.css';

interface CreateAssistantProps {
  currentId: string | number | null;
  updateList: boolean;
  setCurrentId: any;
  setUpdateList: any;
}

export const CreateAssistant = ({ currentId, setUpdateList, setCurrentId, updateList }: CreateAssistantProps) => {
  const [assistantId, setAssistantId] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState<any>(null);
  const [instructions, setInstructions] = useState('');
  const [options, setOptions] = useState({ fileSearch: true, temperature: 1 });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { t } = useTranslation();

  const states = {
    name,
    model,
    instructions,
    options,
  };

  let modelOptions = [];

  const { data: modelsList, loading: listLoading } = useQuery(GET_MODELS);
  const [getAssistant, { loading, data }] = useLazyQuery(GET_ASSISTANT);

  const [updateAssistant, { loading: savingChanges }] = useMutation(UPDATE_ASSISTANT);

  const [deleteAssistant, { loading: deletingAssistant }] = useMutation(DELETE_ASSISTANT);

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
          setAssistantId(assistant?.assistant?.assistantId);
          setName(assistant?.assistant?.name);
          const modelValue = modelOptions?.find(
            (item: { label: string }) => item.label === assistant?.assistant?.model
          );
          setModel(modelValue);
          setInstructions(assistant?.assistant?.instructions || '');
          setOptions({
            ...options,
            temperature: assistant?.assistant?.temperature,
          });
        },
      });
    }
  }, [currentId, modelsList]);

  const handleCreate = () => {
    const { instructions: instructionsValue, model: modelValue, name: nameValue, options: optionsValue } = states;

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
      onCompleted: () => {
        setNotification('Changes saved successfully', 'success');
        setUpdateList(!updateList);
      },
      onError: (errors) => {
        setErrorMessage(errors);
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
      label: t('Model'),
      helperText: t('Choose the best model for your needs.'),
      onChange: (value: any) => setModel(value),
    },
    {
      component: Input,
      name: 'name',
      type: 'text',
      label: t('Name'),
      onChange: (value: any) => setName(value),
      helperText: (
        <div className={styles.AssistantId}>
          <span className={styles.HelperText}>{t('Give a recognizable name for your assistant')}</span>
          <div data-testid="copyCurrentAssistantId" onClick={() => copyToClipboard(assistantId)}>
            <CopyIcon />
            <span>{assistantId}</span>
          </div>
        </div>
      ),
    },
    {
      component: Input,
      name: 'instructions',
      type: 'text',
      label: t('Instructions'),
      rows: 3,
      textArea: true,
      helperText: t('Set the instructions according to your requirements.'),
      onChange: (value: any) => setInstructions(value),
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

  const handleClose = () => {
    setShowConfirmation(false);
  };

  const handleDelete = () => {
    deleteAssistant({
      variables: {
        deleteAssistantId: currentId,
      },
      onCompleted: ({ deleteAssistant }) => {
        setShowConfirmation(false);
        setNotification(`Assistant ${deleteAssistant.assistant.name} deleted successfully`, 'success');
        setCurrentId(null);
        setUpdateList(!updateList);
      },
    });
  };

  let dialog;
  if (showConfirmation) {
    dialog = (
      <DialogBox
        title={`Are you sure you want to delete the assistant ${name}?`}
        handleCancel={handleClose}
        colorOk="warning"
        alignButtons="center"
        handleOk={handleDelete}
        buttonOkLoading={deletingAssistant}
        disableOk={deletingAssistant}
      >
        <div className={styles.DialogContent}>
          {t('Please confirm that this assistant is not being used in any of the active flows.')}
        </div>
      </DialogBox>
    );
  }

  if (loading || listLoading) {
    return <Loading />;
  }

  if (!data?.assistant?.assistant) return;

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
            <Button loading={savingChanges} onClick={handleCreate} variant="contained" data-testid="submitAction">
              {t('Save')}
            </Button>
            <Button
              onClick={() => setShowConfirmation(true)}
              variant="contained"
              color="warning"
              data-testid="removeAssistant"
            >
              <DeleteIcon className={styles.DeleteIcon} />

              {t('Remove')}
            </Button>
          </div>
        </form>
        {dialog}
      </div>
    </FormikProvider>
  );
};
