import { useMutation } from '@apollo/client';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { GOLDEN_QA_TEMPLATE_LINK } from 'config';
import { CREATE_GOLDEN_QA } from 'graphql/mutations/AIEvaluations';
import type { GoldenQaRow } from 'containers/AIEvaluation/types/goldenQaType';
import {
  goldenQaCategories,
  isValidGoldenQaName,
  parseGoldenQaCsv,
  suggestedGoldenQaName,
} from 'containers/AIEvaluation/utils/goldenQa';
import styles from './AddGoldenQaSetDialog.module.css';

export interface AddGoldenQaSetDialogProps {
  onClose: () => void;
  onAdded: () => void;
}

const DEFAULT_DUPLICATION_FACTOR = 1;

export const AddGoldenQaSetDialog = ({ onClose, onAdded }: AddGoldenQaSetDialogProps) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<GoldenQaRow[] | null>(null);
  const [fileError, setFileError] = useState('');
  const [nameError, setNameError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createGoldenQa, { loading }] = useMutation(CREATE_GOLDEN_QA);

  const readFile = async (selected: File) => {
    setFileError('');

    const parsed = parseGoldenQaCsv(await selected.text());
    if (parsed.length === 0) {
      setFile(null);
      setRows(null);
      setFileError(t('No questions found. Check the file has a question column with rows under it.'));
      return;
    }

    setFile(selected);
    setRows(parsed);
    setName((current) => current || suggestedGoldenQaName(selected.name));
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) readFile(dropped);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (!isValidGoldenQaName(trimmed)) {
      setNameError(
        trimmed ? t('Use lowercase letters, numbers and underscores only.') : t('Give this Golden Q&A set a name.')
      );
      return;
    }

    if (!file) {
      setFileError(t('Choose a CSV file to upload.'));
      return;
    }

    try {
      const { data } = await createGoldenQa({
        variables: {
          input: { name: trimmed, file, duplication_factor: DEFAULT_DUPLICATION_FACTOR },
        },
      });

      const errors = data?.createGoldenQa?.errors;
      if (errors?.length) {
        setErrorMessage(errors[0]);
        return;
      }

      setNotification(t('Golden Q&A set added'));
      onAdded();
    } catch (error: unknown) {
      setErrorMessage(error);
    }
  };

  const categories = rows ? goldenQaCategories(rows) : [];

  return (
    <DialogBox
      open
      titleAlign="left"
      title={t('Add a Golden Q&A set')}
      buttonOk={t('Add set')}
      buttonCancel={t('Cancel')}
      alignButtons="right"
      buttonOkLoading={loading}
      disableOk={loading}
      skipCancel={loading}
      handleOk={handleSubmit}
      handleCancel={() => !loading && onClose()}
      fullWidth
      customStyles={{ paper: styles.Paper }}
    >
      <div data-testid="addGoldenQaSetDialog">
        <div className={styles.Intro}>
          {t(
            'A fixed set of questions and their ideal answers. Every version is scored against the same set, so results stay comparable.'
          )}
        </div>

        <div className={styles.FieldLabel}>{t('Name this Golden Q&A set')}</div>
        <Input
          type="text"
          placeholder={t('e.g. maternal_health_core')}
          field={{ name: 'goldenQaName', value: name, onBlur: () => {} }}
          onChange={(value: string) => {
            setName(value);
            setNameError('');
          }}
          inputProp={{ 'data-testid': 'goldenQaNameInput' }}
        />
        {nameError && (
          <div className={styles.Error} data-testid="goldenQaNameError">
            {nameError}
          </div>
        )}

        <button
          type="button"
          className={`${styles.Drop} ${dragging ? styles.DropActive : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          data-testid="goldenQaDropZone"
        >
          <UploadIcon className={styles.DropIcon} />
          <div className={styles.DropTitle}>{t('Drop a CSV here, or click to browse')}</div>
          <div className={styles.Note}>{t('Columns: question, answer, category')}</div>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".csv"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) readFile(selected);
              // let the same file be picked again after a failed read
              event.target.value = '';
            }}
            data-testid="goldenQaFileInput"
          />
        </button>

        <a className={styles.TemplateLink} href={GOLDEN_QA_TEMPLATE_LINK} target="_blank" rel="noopener noreferrer">
          <DescriptionOutlinedIcon className={styles.TemplateIcon} />
          {t('Use our Google Sheet template')}
        </a>

        {fileError && (
          <div className={styles.Error} data-testid="goldenQaFileError">
            {fileError}
          </div>
        )}

        {rows && (
          <div className={styles.Parsed} data-testid="goldenQaParsed">
            <div className={styles.ParsedTitle}>
              {t('Parsed')} {rows.length} {rows.length === 1 ? t('question') : t('questions')}
            </div>
            {categories.length > 0 && (
              <div className={styles.Note}>
                {t('Categories')}: {categories.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </DialogBox>
  );
};

export default AddGoldenQaSetDialog;
