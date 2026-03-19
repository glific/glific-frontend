import { useMutation, useQuery } from '@apollo/client';
import { Button } from 'components/UI/Form/Button/Button';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_EVALUATION } from 'graphql/mutations/AIEvaluations';
import { GET_ASSISTANT_CONFIG_VERSIONS } from 'graphql/queries/Assistant';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import { setNotification } from 'common/notification';

import styles from './AIEvaluationCreate.module.css';
import { UploadGoldenQaDialog } from './UploadGoldenQaDialog';

const goldenQAHelperContent = (
  <div className={styles.GoldenQAHelper}>
    <p className={styles.GoldenQAHelperDescription}>
      Select the Golden QA dataset from the existing list or upload a new set of Golden QA in CSV format to run the
      evaluation on.
    </p>
    <div className={styles.CSVFormatBox}>
      <div className={styles.CSVFormatLabel}>Expected CSV Format:</div>
      <div className={styles.CSVFormatExample}>Question,Answer</div>
      <div className={styles.CSVFormatExample}>{'What is the capital of France?,Paris'}</div>
      <a href="#" className={styles.TemplateLink} target="_blank" rel="noopener noreferrer">
        Click here for the template CSV
      </a>
    </div>
  </div>
);

const GoldenQaField = (props: any) => {
  const { onUploadGoldenQaClick, form, helperText, ...dropdownProps } = props;
  return (
    <div>
      <div className={styles.GoldenQaRow}>
        <Dropdown {...dropdownProps} form={form} />
        <Button
          variant="outlined"
          color="primary"
          type="button"
          className={styles.UploadGoldenQaButton}
          onClick={onUploadGoldenQaClick}
        >
          Upload Golden QA
        </Button>
      </div>
      {helperText && <div className={styles.GoldenQaHelperText}>{helperText}</div>}
    </div>
  );
};

const SectionDivider = (_props: any) => null;

export default function AIEvaluationCreate() {
  const navigate = useNavigate();
  const [goldenQADatasets, setGoldenQADatasets] = useState<Array<{ datasetId: number; name: string }>>([]);
  const [showUploadGoldenQaDialog, setShowUploadGoldenQaDialog] = useState(false);
  const [selectedGoldenQaFileName, setSelectedGoldenQaFileName] = useState<string | null>(null);
  const [selectedGoldenQaFile, setSelectedGoldenQaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [createEvaluation, { loading: evaluationLoading }] = useMutation(CREATE_EVALUATION, {
    onCompleted: () => {
      setNotification('Evaluation started successfully!');
      navigate('/chat');
    },
    onError: (error) => {
      setNotification(error.message, 'warning');
    },
  });

  const goldenQaOptions =
    goldenQADatasets.length === 0
      ? [{ id: '0', label: 'No Golden QA available, upload one first' }]
      : goldenQADatasets.map(({ datasetId, name }) => ({ id: datasetId, label: name }));

  const { data: versionsData } = useQuery(GET_ASSISTANT_CONFIG_VERSIONS, {
    variables: { filter: {} },
  });

  const assistantOptions =
    versionsData?.assistantConfigVersions?.length > 0
      ? versionsData.assistantConfigVersions.map((v: any) => ({
          id: v.id,
          label: `${v.assistantName} (Version ${v.versionNumber})`,
        }))
      : [{ id: '', label: 'No assistants available' }];

  const validationSchema = Yup.object().shape({
    evaluationName: Yup.string().required('Evaluation name is required'),
    goldenQaId: Yup.string().required('Please select a Golden QA dataset'),
    assistantId: Yup.string().required('Please select an AI Assistant'),
  });

  const [states, setStates] = useState<{ evaluationName: string; goldenQaId: number; assistantId: string }>({
    evaluationName: '',
    goldenQaId: 0,
    assistantId: '',
  });

  const handleUploadGoldenQaButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleGoldenQaFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    setSelectedGoldenQaFile(file);
    setSelectedGoldenQaFileName(file.name);
    setShowUploadGoldenQaDialog(true);
  };

  const handleUploadGoldenQaProceed = (values: { datasetId: number; name: string }) => {
    setGoldenQADatasets((prev) => [{ datasetId: values.datasetId, name: values.name }, ...prev]);
    setStates((prev) => ({ ...prev, goldenQaId: values.datasetId }));
    setShowUploadGoldenQaDialog(false);
  };

  const formFields = [
    {
      component: GoldenQaField,
      name: 'goldenQaId',
      label: 'Select Golden QA',
      options: goldenQaOptions,
      placeholder: '',
      helperText: goldenQAHelperContent,
      onUploadGoldenQaClick: handleUploadGoldenQaButtonClick,
    },
    {
      component: SectionDivider,
      name: '__evaluationDetailsDivider',
      label: 'Evaluation Details',
      placedolder: '',
    },
    {
      component: Input,
      name: 'evaluationName',
      type: 'text',
      label: 'Evaluation Name*',
      placeholder: 'Give a unique name for the evaluation experiment',
    },
    {
      component: Dropdown,
      name: 'assistantId',
      label: 'AI Assistant*',
      options: assistantOptions,
      placeholder: '',
    },
  ];

  const dialogMessage = 'This action cannot be undone.';

  const handleSetPayload = (payload: any) => {
    const selectedVersion = versionsData?.assistantConfigVersions?.find((v: any) => v.id === payload.assistantId);
    createEvaluation({
      variables: {
        input: {
          datasetId: payload.goldenQaId,
          experimentName: payload.evaluationName,
          configId: selectedVersion?.kaapiUuid ?? payload.assistantId,
          configVersion: payload.assistantId,
        },
      },
    });
    return payload;
  };

  return (
    <div>
      <FormLayout
        states={states}
        setStates={setStates}
        validationSchema={validationSchema}
        listItemName="AI evaluation"
        dialogMessage={dialogMessage}
        formFields={formFields}
        redirectionLink="ai-evaluations"
        listItem="aiEvaluation"
        getItemQuery={GET_ASSISTANT_CONFIG_VERSIONS}
        createItemQuery={CREATE_EVALUATION}
        updateItemQuery={CREATE_EVALUATION}
        deleteItemQuery={CREATE_EVALUATION}
        defaultAttribute={null}
        icon={null}
        refetchQueries={[]}
        redirect={false}
        title="Create AI Evaluation"
        button="Run Evaluation"
        languageSupport={false}
        backLinkButton="ai-evaluations"
        cancelAction={() => window.history.back()}
        getQueryFetchPolicy="cache-first"
        saveOnPageChange={false}
        entityId={null}
        restrictDelete={true}
        languageAttributes={{}}
        noHeading={false}
        partialPage={false}
        confirmationState={{ show: false, title: '', message: '' }}
        setPayload={handleSetPayload}
        customHandler={() => {}}
        buttonState={{ status: evaluationLoading, text: 'Running...', styles: '', show: true }}
        errorButtonState={{ show: !evaluationLoading, text: 'Cancel' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleGoldenQaFileSelected}
      />
      {showUploadGoldenQaDialog && selectedGoldenQaFileName && (
        <UploadGoldenQaDialog
          open={showUploadGoldenQaDialog}
          fileName={selectedGoldenQaFileName}
          file={selectedGoldenQaFile}
          onClose={() => setShowUploadGoldenQaDialog(false)}
          onProceed={handleUploadGoldenQaProceed}
        />
      )}
    </div>
  );
}
