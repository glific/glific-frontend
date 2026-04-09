import { useMutation } from '@apollo/client';
import { InputAdornment, Modal, OutlinedInput, Tooltip, Typography } from '@mui/material';
import { Field, FormikProvider, useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { setErrorMessage, setNotification } from 'common/notification';

import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Button } from 'components/UI/Form/Button/Button';
import { Input } from 'components/UI/Form/Input/Input';

import { CREATE_ASSISTANT, SET_LIVE_VERSION, UPDATE_ASSISTANT } from 'graphql/mutations/Assistant';
import { GET_ASSISTANT, GET_ASSISTANT_VERSIONS } from 'graphql/queries/Assistant';

import ExpandIcon from 'assets/images/icons/ExpandContent.svg?react';

import { AssistantOptions } from '../AssistantOptions/AssistantOptions';
import type { AssistantVersion } from '../VersionPanel/VersionPanel';

import styles from './ConfigEditor.module.css';

const modelOptions: Array<{ id: string; label: string }> = ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini'].map(
  (model) => ({ id: model, label: model })
);

interface ConfigEditorProps {
  assistantId: string;
  assistantName: string;
  version?: AssistantVersion;
  vectorStore: any;
  newVersionInProgress: boolean;
  onSaved: (newId?: string) => void;
  onUnsavedChange?: (hasChanges: boolean) => void;
  onCancel?: () => void;
  createMode?: boolean;
}

const initialValues = {
  name: '',
  model: modelOptions[0] as any,
  instructions: '',
  temperature: 0.1,
  knowledgeBaseVersionId: '',
  knowledgeBaseName: '',
  versionDescription: '',
  initialFiles: [] as any[],
};

const EditFormSchema = Yup.object().shape({
  model: Yup.object().nullable().required('Model is required'),
  instructions: Yup.string().required('Instructions are required'),
});

const CreateFormSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  model: Yup.object().nullable().required('Model is required'),
  instructions: Yup.string().required('Instructions are required'),
});

export const ConfigEditor = ({
  assistantId,
  assistantName,
  version,
  vectorStore,
  newVersionInProgress,
  onSaved,
  onUnsavedChange,
  onCancel,
  createMode = false,
}: ConfigEditorProps) => {
  const { t } = useTranslation();
  const [openInstructions, setOpenInstructions] = useState(false);
  const [hasUnsavedFiles, setHasUnsavedFiles] = useState(false);

  const [updateAssistant, { loading: savingChanges }] = useMutation(UPDATE_ASSISTANT);
  const [createAssistant, { loading: creating }] = useMutation(CREATE_ASSISTANT);
  const [setLiveVersion, { loading: settingLive }] = useMutation(SET_LIVE_VERSION);

  const formik = useFormik({
    initialValues,
    validationSchema: createMode ? CreateFormSchema : EditFormSchema,
    enableReinitialize: false,
    onSubmit: (values) => {
      const payload: Record<string, any> = {
        instructions: values.instructions,
        model: values.model?.label,
        temperature: values.temperature,
      };

      if (values.versionDescription?.trim()) {
        payload.description = values.versionDescription.trim();
      }

      if (values.knowledgeBaseVersionId) {
        payload.knowledgeBaseVersionId = values.knowledgeBaseVersionId;
      }

      if (createMode) {
        payload.name = values.name;
        createAssistant({
          variables: { input: payload },
          onCompleted: ({ createAssistant: data }) => {
            if (data.errors?.length > 0) {
              setErrorMessage(data.errors[0]);
              return;
            }
            setNotification(t('Assistant created successfully'), 'success');
            onSaved(data.assistant.id);
          },
          onError: (error) => {
            setErrorMessage(error);
          },
        });
      } else {
        updateAssistant({
          variables: {
            updateAssistantId: assistantId,
            input: payload,
          },
          refetchQueries: [
            { query: GET_ASSISTANT, variables: { assistantId } },
            { query: GET_ASSISTANT_VERSIONS, variables: { assistantId } },
          ],
          onCompleted: ({ updateAssistant: updateData }) => {
            if (updateData.errors?.length > 0) {
              setErrorMessage(updateData.errors[0]);
            } else {
              setNotification(t('Changes saved successfully'), 'success');
            }
            setHasUnsavedFiles(false);
            onSaved();
          },
          onError: (error) => {
            setErrorMessage(error);
            onSaved();
          },
        });
      }
    },
  });

  // Populate form when version changes (edit mode only)
  useEffect(() => {
    if (!version) return;
    const modelValue = version.model ? { id: version.model, label: version.model } : modelOptions[0];
    const settings = version.settings ?? {};

    formik.resetForm({
      values: {
        name: '',
        model: modelValue,
        instructions: version.prompt ?? '',
        temperature: settings.temperature ?? 0.1,
        knowledgeBaseVersionId: vectorStore?.knowledgeBaseVersionId ?? '',
        knowledgeBaseName: vectorStore?.name ?? '',
        versionDescription: version.description ?? '',
        initialFiles:
          vectorStore?.files?.map((file: any) => ({
            fileId: file.id,
            filename: file.name,
          })) ?? [],
      },
    });
    setHasUnsavedFiles(false);
  }, [version?.id]);

  const handleSetLive = () => {
    if (!version) return;
    setLiveVersion({
      variables: { assistantId, versionId: version.id },
      refetchQueries: [{ query: GET_ASSISTANT_VERSIONS, variables: { assistantId } }],
      onCompleted: ({ setLiveVersion: data }) => {
        if (data.errors?.length > 0) {
          setErrorMessage(data.errors[0]);
          return;
        }
        setNotification(t('Version set as live successfully'), 'success');
        onSaved();
      },
      onError: (error) => {
        setErrorMessage(error);
      },
    });
  };

  const { values: v, initialValues: iv } = formik;
  const hasUnsavedChanges =
    v.instructions?.trim() !== (iv.instructions || '').trim() ||
    v.model?.label !== iv.model?.label ||
    v.temperature !== iv.temperature ||
    hasUnsavedFiles;

  // Notify parent so it can guard version switching
  useEffect(() => {
    onUnsavedChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  // Warn on browser back/forward/tab close when there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const expandIcon = (
    <InputAdornment className={styles.Expand} position="end">
      <ExpandIcon data-testid="expandIcon" onClick={() => setOpenInstructions(true)} className={styles.ExpandButton} />
    </InputAdornment>
  );

  const formFields: any[] = [
    ...(createMode
      ? [
          {
            component: Input,
            name: 'name',
            type: 'text',
            label: `${t('Name')}*`,
            helperText: t('Give a recognizable name for your assistant'),
          },
        ]
      : []),
    {
      component: Input,
      name: 'instructions',
      type: 'text',
      label: t('Instructions (Prompt)*'),
      rows: 3,
      textArea: true,
      helperText: t('Set the instructions according to your requirements.'),
      endAdornment: expandIcon,
      disabled: newVersionInProgress,
    },
    {
      component: AutoComplete,
      name: 'model',
      options: modelOptions,
      optionLabel: 'label',
      multiple: false,
      label: `${t('Model')}*`,
      helperText: t('Choose the best model for your needs.'),
      disabled: newVersionInProgress,
    },
    {
      component: AssistantOptions,
      name: 'assistantOptions',
      formikValues: formik.values,
      setFieldValue: formik.setFieldValue,
      formikErrors: formik.errors,
      formikTouched: formik.touched,
      validateForm: formik.validateForm,
      knowledgeBaseId: vectorStore?.id ?? null,
      isLegacyVectorStore: vectorStore?.legacy ?? false,
      vectorStoreId: vectorStore?.vectorStoreId ?? '',
      initialFiles: formik.values.initialFiles,
      onFilesChange: setHasUnsavedFiles,
      disabled: newVersionInProgress,
    },
    {
      component: Input,
      name: 'versionDescription',
      type: 'text',
      label: t('Notes (Optional)'),
      rows: 2,
      textArea: true,
      helperText: t('Add notes on changes made to this version'),
      disabled: newVersionInProgress,
    },
  ];

  const instructionsDialog = openInstructions ? (
    <Modal open onClose={() => setOpenInstructions(false)}>
      <div className={styles.InstructionsBox}>
        <div className={styles.Instructions}>
          <h5>Edit system instructions</h5>
          <OutlinedInput
            name="expand-instructions"
            onChange={(event) => formik.setFieldValue('instructions', event.target.value)}
            value={formik.values.instructions}
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
  ) : null;

  return (
    <FormikProvider value={formik}>
      <div className={styles.Container} data-testid="configEditorContainer">
        {/* Header */}
        {!createMode && (
          <div className={styles.Header}>
            <span className={styles.Breadcrumb}>{`${assistantName} / ${t('Version')} ${version?.versionNumber}`}</span>
            <div className={styles.HeaderActions}>
              {hasUnsavedChanges && (
                <span className={styles.UnsavedIndicator} data-testid="unsavedIndicator">
                  {t('Unsaved changes')}
                </span>
              )}
              <Tooltip
                title={version?.isLive ? t('This version is already live') : t('Set this version as LIVE tooltip')}
                arrow
              >
                <span>
                  <Button
                    variant="outlined"
                    data-testid="setLiveButton"
                    onClick={handleSetLive}
                    loading={settingLive}
                    disabled={version?.isLive || newVersionInProgress || settingLive}
                  >
                    {t('Set As LIVE')}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip
                title={t(
                  "Save your work as a new version. This version won't be used in flows until you set it as live."
                )}
                arrow
              >
                <span>
                  <Button
                    variant="contained"
                    data-testid="saveVersionButton"
                    onClick={formik.submitForm}
                    loading={savingChanges || creating}
                    disabled={newVersionInProgress || savingChanges || creating}
                  >
                    {t('Save')}
                  </Button>
                </span>
              </Tooltip>
            </div>
          </div>
        )}

        {createMode && (
          <div className={styles.CreateActions}>
            <Button variant="outlined" onClick={onCancel}>
              {t('Cancel')}
            </Button>
            <Button variant="contained" onClick={formik.submitForm} loading={creating}>
              {t('Save')}
            </Button>
          </div>
        )}

        {/* Form */}
        <form className={styles.Form} onSubmit={formik.handleSubmit} data-testid="configEditorForm">
          <div className={styles.FormFields}>
            {formFields.map((field: any) => (
              <div className={styles.FormSection} key={field.name}>
                <Typography className={styles.Label} variant="h5">
                  {field.label}
                </Typography>
                <Field key={field.name} {...field} />
              </div>
            ))}
            {!createMode && (
              <span className={styles.NoEvals} data-testid="noEvalsLink">
                {t('No evals run. Start New Eval >')}
              </span>
            )}
          </div>
        </form>

        {instructionsDialog}
      </div>
    </FormikProvider>
  );
};

export default ConfigEditor;
