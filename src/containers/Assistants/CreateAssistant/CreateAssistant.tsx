import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { InputAdornment, Modal, OutlinedInput, Typography } from '@mui/material';
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
import { CREATE_ASSISTANT, DELETE_ASSISTANT, UPDATE_ASSISTANT } from 'graphql/mutations/Assistant';

import CopyIcon from 'assets/images/CopyGreen.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/White.svg?react';
import ExpandIcon from 'assets/images/icons/ExpandContent.svg?react';

import { AssistantOptions } from '../AssistantOptions/AssistantOptions';

import styles from './CreateAssistant.module.css';
import { useNavigate, useParams } from 'react-router';

interface CreateAssistantProps {
  updateList: boolean;
  setUpdateList: any;
}

export const CreateAssistant = ({ setUpdateList, updateList }: CreateAssistantProps) => {
  const [assistantId, setAssistantId] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState<any>(null);
  const [instructions, setInstructions] = useState('');
  const [options, setOptions] = useState({ fileSearch: true, temperature: 0.1 });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [openInstructions, setOpenInstructions] = useState(false);
  let isEditing = false;
  const params = useParams();
  let currentId = null;
  if (params.assistantId) {
    currentId = params.assistantId;
    isEditing = true;
  }
  const navigate = useNavigate();

  const { t } = useTranslation();
  const states = {
    name,
    model,
    instructions,
    options,
  };

  let modelOptions: Array<{ id: string; label: string }> = [];

  const { data: modelsList, loading: listLoading } = useQuery(GET_MODELS);
  const [getAssistant, { loading, data }] = useLazyQuery(GET_ASSISTANT);

  const [createAssistant, { loading: createLoading }] = useMutation(CREATE_ASSISTANT);
  const [updateAssistant, { loading: savingChanges }] = useMutation(UPDATE_ASSISTANT);
  const [deleteAssistant, { loading: deletingAssistant }] = useMutation(DELETE_ASSISTANT);

  if (modelsList) {
    modelOptions = modelsList?.listOpenaiModels.map((item: string, index: number) => ({
      id: index.toString(),
      label: item,
    }));
  }

  useEffect(() => {
    if (currentId && isEditing && modelsList) {
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
  }, [currentId, modelsList, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setAssistantId('');
      setName('');
      setModel(null);
      setInstructions('');
      setOptions({ fileSearch: true, temperature: 0.1 });
    }
  }, [isEditing]);

  const handleCreate = () => {
    const { instructions: instructionsValue, model: modelValue, name: nameValue, options: optionsValue } = states;

    const payload = {
      instructions: instructionsValue,
      model: modelValue.label,
      name: nameValue,
      temperature: optionsValue?.temperature,
    };

    if (isEditing) {
      updateAssistant({
        variables: {
          updateAssistantId: currentId,
          input: payload,
        },
        onCompleted: ({ updateAssistant }) => {
          if (updateAssistant.errors && updateAssistant.errors.length > 0) {
            setErrorMessage(updateAssistant.errors[0]);
            return;
          }
          setNotification('Changes saved successfully', 'success');
          setUpdateList(!updateList);
        },
        onError: (errors) => {
          setErrorMessage(errors);
        },
      });
    } else {
      createAssistant({
        variables: {
          input: payload,
        },
        onCompleted: ({ createAssistant }) => {
          setNotification(t('Assistant created successfully'), 'success');
          navigate(`/assistants/${createAssistant.assistant.id}`);
          setUpdateList(!updateList);
        },
        onError: (error) => {
          setErrorMessage(error);
        },
      });
    }
  };

  const expandIcon = (
    <InputAdornment className={styles.Expand} position="end">
      <ExpandIcon data-testid="expandIcon" onClick={() => setOpenInstructions(true)} className={styles.ExpandButton} />
    </InputAdornment>
  );

  const formFields: any = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      label: `${t('Name')}*`,
      onChange: (value: any) => setName(value),
      helperText: (
        <div className={styles.AssistantId}>
          <span className={styles.HelperText}>{t('Give a recognizable name for your assistant')}</span>
          {isEditing && (
            <div data-testid="copyCurrentAssistantId" onClick={() => copyToClipboard(assistantId)}>
              <CopyIcon />
              <span>{assistantId}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      component: AutoComplete,
      name: 'model',
      options: modelOptions || [],
      optionLabel: 'label',
      multiple: false,
      label: `${t('Model')}*`,
      helperText: t('Choose the best model for your needs.'),
      onChange: (value: any) => setModel(value),
    },

    {
      component: Input,
      name: 'instructions',
      type: 'text',
      label: t('Instructions (Prompt)*'),
      rows: 3,
      textArea: true,
      helperText: t('Set the instructions according to your requirements.'),
      onChange: (value: any) => setInstructions(value),
      endAdornment: expandIcon,
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
    name: Yup.string().required('Name is required'),
    model: Yup.object().required('Model is required'),
    instructions: Yup.string().required('Instructions are required'),
  });

  const formik = useFormik({
    initialValues: states,
    validationSchema: FormSchema,
    enableReinitialize: true,
    onSubmit: () => {
      handleCreate();
    },
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
        setUpdateList(!updateList);
        navigate('/assistants');
      },
    });
  };

  let dialog;
  let instructionsDialog;
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
  if (openInstructions) {
    instructionsDialog = (
      <Modal open={openInstructions} onClose={() => setOpenInstructions(false)}>
        <div className={styles.InstructionsBox}>
          <div className={styles.Instructions}>
            <h5>Edit system instructions</h5>
            <OutlinedInput
              name="expand-instructions"
              onChange={(event) => setInstructions(event.target.value)}
              value={instructions}
              className={styles.Input}
              multiline
              rows={16}
            />
            <div className={styles.InstructionButtons}>
              <Button data-testid="cancel-button" onClick={() => setOpenInstructions(false)} variant="outlined">
                Cancel
              </Button>
              <Button data-testid="save-button" onClick={() => setOpenInstructions(false)} variant="contained">
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (loading || listLoading) {
    return <Loading />;
  }

  if (!data?.assistant?.assistant && params.assistantId) {
    return <p className={styles.NotFound}>{t('Assistant not found')}</p>;
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
            <Button
              loading={savingChanges || createLoading}
              onClick={formik.submitForm}
              variant="contained"
              data-testid="submitAction"
            >
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
        {instructionsDialog}
      </div>
    </FormikProvider>
  );
};
