import { useQuery } from '@apollo/client';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Button } from 'components/UI/Form/Button/Button';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_EVALUATION } from 'graphql/mutations/AIEvaluations';
import { LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import { GET_ASSISTANT_CONFIG_VERSIONS } from 'graphql/queries/Assistant';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import { setNotification } from 'common/notification';

import { UploadGoldenQaDialog } from 'containers/AIEvals/UploadGoldenQaDialog/UploadGoldenQaDialog';
import styles from './AIEvaluationCreate.module.css';

const goldenQAHelperContent = (
  <div className={styles.GoldenQAHelper}>
    <p className={styles.GoldenQAHelperDescription}>
      Select the Golden QA dataset from the existing list or upload a new set of Golden QA in CSV format to run the
      evaluation on.
    </p>
    <div className={styles.CSVFormatBox}>
      <div className={styles.CSVFormatExample}>Expected CSV Format:</div>
      <div className={styles.CSVFormatExample}>Question, Answer</div>
      <div className={styles.CSVFormatExample}>{'{"What Is X"},{"Answer"}'}</div>
      <a href="#" className={styles.TemplateLink} target="_blank" rel="noopener noreferrer">
        Click Here For The Template Csv
      </a>
    </div>
  </div>
);

const GoldenQaField = (props: any) => {
  const { onUploadGoldenQaClick, form, helperText, newlyAddedDataset, options, field, ...rest } = props;

  useEffect(() => {
    if (newlyAddedDataset != null) {
      form.setFieldValue('goldenQaId', newlyAddedDataset);
    }
  }, [newlyAddedDataset]);

  return (
    <div>
      <div className={styles.GoldenQaRow}>
        <div className={styles.GoldenQaLeft}>
          <AutoComplete
            {...rest}
            field={field}
            form={form}
            options={options}
            optionLabel="label"
            multiple={false}
            disableClearable={false}
            noOptionsText="No Golden QA datasets available"
            placeholder="Search or select a Golden QA dataset"
          />
        </div>
        <div className={styles.GoldenQaRight}>
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
      </div>
      {helperText && <div className={styles.GoldenQaHelperText}>{helperText}</div>}
    </div>
  );
};

const SectionDivider = (_props: any) => null;

interface GoldenQaOption {
  id: string | number;
  label: string;
}

export default function AIEvaluationCreate() {
  const navigate = useNavigate();
  const [uploadedDatasets, setUploadedDatasets] = useState<GoldenQaOption[]>([]);
  const [showUploadGoldenQaDialog, setShowUploadGoldenQaDialog] = useState(false);
  const [selectedGoldenQaFileName, setSelectedGoldenQaFileName] = useState<string | null>(null);
  const [selectedGoldenQaFile, setSelectedGoldenQaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newlyAddedDataset, setNewlyAddedDataset] = useState<GoldenQaOption | null>(null);

  const { data: versionsData, loading: versionsLoading, error: versionsError } = useQuery(
    GET_ASSISTANT_CONFIG_VERSIONS,
    { variables: { filter: {} }, fetchPolicy: 'network-only' }
  );

  const { data: goldenQaData, error: goldenQaError } = useQuery(LIST_GOLDEN_QA, {
    variables: { filter: {}, opts: {} },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (versionsError) {
      setNotification(versionsError.message, 'warning');
    }
  }, [versionsError]);

  useEffect(() => {
    if (goldenQaError) {
      setNotification(goldenQaError.message, 'warning');
    }
  }, [goldenQaError]);

  const backendOptions: GoldenQaOption[] =
    goldenQaData?.goldenQas?.map((qa: any) => ({ id: qa.datasetId, label: qa.name })) ?? [];

  const uploadedIds = new Set(uploadedDatasets.map((d) => String(d.id)));
  const goldenQaOptions: GoldenQaOption[] = [
    ...uploadedDatasets,
    ...backendOptions.filter((opt) => !uploadedIds.has(String(opt.id))),
  ];

  const assistantOptions = versionsLoading
    ? [{ id: '', label: 'Fetching assistants...' }]
    : versionsData?.assistantConfigVersions?.length > 0
      ? versionsData.assistantConfigVersions.map((v: any) => ({
          id: v.id,
          label: `${v.assistantName} (Version ${v.versionNumber})`,
        }))
      : [{ id: '', label: 'No assistants available' }];

  const validationSchema = Yup.object().shape({
    evaluationName: Yup.string().required('Evaluation name is required'),
    goldenQaId: Yup.object().nullable().required('Please select a Golden QA dataset'),
    assistantId: Yup.string().required('Please select an AI Assistant'),
  });

  const [states, setStates] = useState<{ evaluationName: string; goldenQaId: GoldenQaOption | null; assistantId: string }>({
    evaluationName: '',
    goldenQaId: null,
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
    const newOption: GoldenQaOption = { id: values.datasetId, label: values.name };
    setUploadedDatasets((prev) => [newOption, ...prev]);
    setNewlyAddedDataset(newOption);
    setShowUploadGoldenQaDialog(false);
  };

  const formFields = [
    {
      component: GoldenQaField,
      name: 'goldenQaId',
      label: <strong>Select Golden QA</strong>,
      options: goldenQaOptions,
      helperText: goldenQAHelperContent,
      onUploadGoldenQaClick: handleUploadGoldenQaButtonClick,
      newlyAddedDataset,
    },
    {
      component: SectionDivider,
      name: '__evaluationDetailsDivider',
      label: <span className={styles.SectionDividerLabel}>Evaluation Details</span>,
      placeholder: '',
    },
    {
      component: Input,
      name: 'evaluationName',
      type: 'text',
      label: <strong>Evaluation Name*</strong>,
      placeholder: 'Give a unique name for the evaluation experiment',
    },
    {
      component: Dropdown,
      name: 'assistantId',
      label: <strong>AI Assistant*</strong>,
      options: assistantOptions,
      placeholder: '',
    },
  ];

  const dialogMessage = 'This action cannot be undone.';

  const handleSetPayload = (payload: any) => {
    const selectedVersion = versionsData?.assistantConfigVersions?.find((v: any) => v.id === payload.assistantId);
    return {
      datasetId: payload.goldenQaId?.id,
      experimentName: payload.evaluationName,
      configId: selectedVersion?.kaapiUuid,
      configVersion: selectedVersion?.id,
    };
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
        listItem="evaluation"
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
        afterSave={() => navigate('/chat')}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        title="Upload Golden QA CSV"
        className={styles.HiddenFileInput}
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
