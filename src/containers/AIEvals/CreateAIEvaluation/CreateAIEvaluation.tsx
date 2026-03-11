import { gql } from '@apollo/client';
import { Button } from 'components/UI/Form/Button/Button';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import React, { useRef, useState } from 'react';
import * as Yup from 'yup';

import styles from './CreateAIEvaluation.module.css';
import { UploadGoldenQaDialog } from './UploadGoldenQaDialog';

// Dummy GraphQL documents until backend supports get/update/delete for AI evaluations (exported for tests)
export const DUMMY_GET_ITEM = gql`
  query DummyAiEvalGet {
    __typename
  }
`;
export const DUMMY_UPDATE = gql`
  mutation DummyAiEvalUpdate {
    __typename
  }
`;
export const DUMMY_DELETE = gql`
  mutation DummyAiEvalDelete {
    __typename
  }
`;
export const DUMMY_CREATE = gql`
  mutation DummyAiEvalCreate {
    __typename
  }
`;

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
  const { onUploadGoldenQaClick, form, ...dropdownProps } = props;
  return (
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
  );
};

export const CreateAIEvaluation = () => {
  const [goldenQADatasets, setGoldenQADatasets] = useState<string[]>([]);
  const [showUploadGoldenQaDialog, setShowUploadGoldenQaDialog] = useState(false);
  const [selectedGoldenQaFileName, setSelectedGoldenQaFileName] = useState<string | null>(null);
  const [selectedGoldenQaFile, setSelectedGoldenQaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const goldenQaOptions =
    goldenQADatasets.length === 0
      ? [{ id: '0', label: 'No Golden QA available, upload one first' }]
      : goldenQADatasets.map((name) => ({ id: name, label: name }));
  const assistantOptions = [{ id: '', label: 'Pick your assistant & version to evaluate' }];

  const validationSchema = Yup.object().shape({
    evaluationName: Yup.string()
      .required('Evaluation name is required')
      .matches(/^[a-zA-Z0-9_-]+$/, 'Invalid evaluation name'),
    goldenQaId: Yup.string().required('Please select a Golden QA dataset'),
    assistantId: Yup.string().required('Please select an AI Assistant'),
  });

  const [states, setStates] = useState<{ evaluationName: string; goldenQaId: string; assistantId: string }>({
    evaluationName: '',
    goldenQaId: '0',
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

  const handleUploadGoldenQaProceed = (values: { name: string }) => {
    // Placeholder for when backend mutation response needs to be used further. New upload at top.
    setGoldenQADatasets((prev) => [values.name, ...prev]);
    setStates((prev) => ({ ...prev, goldenQaId: values.name }));
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
      component: Input,
      name: 'evaluationName',
      type: 'text',
      label: 'Evaluation Name*',
      placeholder: 'Give a unique name for the evaluation experiment.',
    },
    {
      component: Dropdown,
      name: 'assistantId',
      label: 'AI Assistant*',
      options: assistantOptions,
      helperText: "This list includes all assistants and versions you've created.",
    },
  ];

  const dialogMessage = 'This action cannot be undone.';

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
        getItemQuery={DUMMY_GET_ITEM}
        createItemQuery={DUMMY_CREATE}
        updateItemQuery={DUMMY_UPDATE}
        deleteItemQuery={DUMMY_DELETE}
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
        customStyles={styles.FormLayout}
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
};
