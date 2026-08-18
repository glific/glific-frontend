import { useMutation } from '@apollo/client';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Input } from 'components/UI/Form/Input/Input';
import { GOLDEN_QA_TEMPLATE_LINK } from 'config';
import { CREATE_GOLDEN_QA } from 'graphql/mutations/AIEvaluations';
import type { GoldenQaRow } from 'containers/AIEvaluation/types/goldenQaType';
import {
  GOLDEN_QA_NAME_PATTERN,
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

  const [rows, setRows] = useState<GoldenQaRow[] | null>(null);
  // the file could not be read at all — distinct from "no file chosen yet", which Yup reports
  const [readError, setReadError] = useState('');
  // a name the reader typed is theirs to keep; a suggested one follows whichever file is picked
  const [nameTouched, setNameTouched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createGoldenQa, { loading }] = useMutation(CREATE_GOLDEN_QA);

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required(t('Give this Golden Q&A set a name.'))
      .matches(GOLDEN_QA_NAME_PATTERN, t('Use lowercase letters, numbers and underscores only.')),
    file: Yup.mixed().required(t('Choose a CSV file to upload.')),
  });

  const formik = useFormik<{ name: string; file: File | null }>({
    initialValues: { name: '', file: null },
    validationSchema,
    onSubmit: async ({ name, file }) => {
      try {
        const { data } = await createGoldenQa({
          variables: {
            input: { name: name.trim(), file, duplication_factor: DEFAULT_DUPLICATION_FACTOR },
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
    },
  });

  /*
   * Reading a File can reject — a file removed from disk between picking and reading, or a
   * permission the browser withdraws — and this runs unawaited from event handlers, so a
   * rejection here would otherwise surface as nothing at all for the reader.
   */
  const readFile = async (selected: File) => {
    setReadError('');

    try {
      const parsed = parseGoldenQaCsv(await selected.text());

      if (parsed.length === 0) {
        setRows(null);
        formik.setFieldValue('file', null);
        setReadError(t('No questions found. Check the file has a question column with rows under it.'));
        return;
      }

      setRows(parsed);
      formik.setValues({
        file: selected,
        name: nameTouched ? formik.values.name : suggestedGoldenQaName(selected.name),
      });
      formik.setFieldTouched('file', true, false);
    } catch {
      setRows(null);
      formik.setFieldValue('file', null);
      setReadError(t('That file could not be read. Try choosing it again.'));
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) void readFile(dropped);
  };

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
      handleOk={formik.handleSubmit}
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
          field={{ name: 'name', value: formik.values.name, onBlur: formik.handleBlur }}
          onChange={(value: string) => {
            formik.setFieldValue('name', value);
            // clearing the field hands the name back to the file
            setNameTouched(value.trim() !== '');
          }}
          inputProp={{ 'data-testid': 'goldenQaNameInput' }}
        />
        {formik.touched.name && formik.errors.name && (
          <div className={styles.Error} data-testid="goldenQaNameError">
            {formik.errors.name}
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
              if (selected) void readFile(selected);
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

        {(readError || (formik.touched.file && formik.errors.file)) && (
          <div className={styles.Error} data-testid="goldenQaFileError">
            {readError || formik.errors.file}
          </div>
        )}

        {rows && (
          <div className={styles.Parsed} data-testid="goldenQaParsed">
            <div className={styles.ParsedTitle}>
              {rows.length === 1 ? t('Parsed 1 question') : t('Parsed {{count}} questions', { count: rows.length })}
            </div>
          </div>
        )}
      </div>
    </DialogBox>
  );
};
