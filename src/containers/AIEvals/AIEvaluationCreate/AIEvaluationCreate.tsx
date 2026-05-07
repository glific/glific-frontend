import { useQuery } from '@apollo/client';
import { setNotification } from 'common/notification';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Button } from 'components/UI/Form/Button/Button';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_EVALUATION } from 'graphql/mutations/AIEvaluations';
import { LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import { GET_ASSISTANT_CONFIG_VERSIONS } from 'graphql/queries/Assistant';
import { t } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';

import { UploadGoldenQaDialog } from 'containers/AIEvals/UploadGoldenQaDialog/UploadGoldenQaDialog';
import styles from './AIEvaluationCreate.module.css';

const getGoldenQAHelperContent = () => (
  <div className={styles.GoldenQAHelper}>
    <p className={styles.GoldenQAHelperDescription}>
      {t(
        'Select the Golden QA dataset from the existing list or upload a new set of Golden QA in CSV format to run the evaluation on.'
      )}
    </p>
    <div className={styles.CSVFormatBox}>
      <div className={styles.CSVFormatExample}>{t('Expected CSV Format:')}</div>
      <div className={styles.CSVFormatExample}>{t('Question, Answer')}</div>
      <div className={styles.CSVFormatExample}>{'"What Is X","Answer"'}</div>
      <a href="#" className={styles.TemplateLink} target="_blank" rel="noopener noreferrer">
        {t('Click Here For The Template Csv')}
      </a>
    </div>
  </div>
);

const goldenQaAutoCompleteTextFieldProps = {
  sx: {
    '& .MuiAutocomplete-inputRoot': {
      paddingRight: '72px !important',
    },
    '& .MuiAutocomplete-input': {
      textOverflow: 'ellipsis',
    },
  },
};

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
            noOptionsText={t('No Golden QA datasets available')}
            placeholder={t('Search or select a Golden QA dataset')}
            textFieldProps={goldenQaAutoCompleteTextFieldProps}
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

interface AssistantOption {
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
    goldenQaData?.goldenQas?.map((qa: any) => ({ id: qa.id, label: qa.name })) ?? [];

  const uploadedIds = new Set(uploadedDatasets.map((d) => String(d.id)));
  const goldenQaOptions: GoldenQaOption[] = [
    ...uploadedDatasets,
    ...backendOptions.filter((opt) => !uploadedIds.has(String(opt.id))),
  ];

  const assistantOptions: AssistantOption[] = versionsLoading
    ? []
    : versionsData?.assistantConfigVersions?.length > 0
      ? versionsData.assistantConfigVersions.map((v: any) => ({
          id: v.id,
          label: `${v.assistantName} (Version ${v.versionNumber})`,
        }))
      : [];

  const assistantNoOptionsText = versionsLoading
    ? t('Fetching assistants...')
    : t('No assistants available');

  const validationSchema = Yup.object().shape({
    evaluationName: Yup.string().required(t('Evaluation name is required')),
    goldenQaId: Yup.object().nullable().required(t('Please select a Golden QA dataset')),
    assistantId: Yup.object().nullable().required(t('Please select an AI Assistant')),
  });

  const [states, setStates] = useState<{
    evaluationName: string;
    goldenQaId: GoldenQaOption | null;
    assistantId: AssistantOption | null;
  }>({
    evaluationName: '',
    goldenQaId: null,
    assistantId: null,
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

  const handleUploadGoldenQaProceed = (values: { id: string; name: string }) => {
    const newOption: GoldenQaOption = { id: values.id, label: values.name };
    setUploadedDatasets((prev) => [newOption, ...prev]);
    setNewlyAddedDataset(newOption);
    setShowUploadGoldenQaDialog(false);
  };

  const formFields = [
    {
      component: SectionDivider,
      name: '__evaluationDetailsDivider',
      label: <span className={styles.SectionDividerLabel}>Select Golden QA</span>,
      placeholder: '',
    },
    {
      component: GoldenQaField,
      name: 'goldenQaId',
      options: goldenQaOptions,
      helperText: getGoldenQAHelperContent(),
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
      placeholder: t('Give a unique name for the evaluation experiment'),
    },
    {
      component: AutoComplete,
      name: 'assistantId',
      label: <strong>AI Assistant*</strong>,
      options: assistantOptions,
      optionLabel: 'label',
      multiple: false,
      disableClearable: false,
      noOptionsText: assistantNoOptionsText,
      placeholder: t('Search or select an AI assistant'),
      openOnFocus: true,
    },
  ];

  const dialogMessage = 'This action cannot be undone.';

  const handleSetPayload = (payload: any) => {
    const selectedVersion = versionsData?.assistantConfigVersions?.find(
      (v: any) => v.id === payload.assistantId?.id
    );
    return {
      goldenQaId: payload.goldenQaId?.id,
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
        backLinkButton="/ai-evaluations"
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
        afterSave={() => navigate('/ai-evaluations')}
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
