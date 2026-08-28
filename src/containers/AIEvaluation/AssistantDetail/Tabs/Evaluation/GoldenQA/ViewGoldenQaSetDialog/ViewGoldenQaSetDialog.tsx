import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { DataTable } from 'components/UI/DataTable/DataTable';
import { GET_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import type { GoldenQaRow, GoldenQaSet } from 'containers/AIEvaluation/types/goldenQaType';
import { downloadFromUrl, goldenQaCategories, parseGoldenQaCsv } from 'containers/AIEvaluation/utils/goldenQa/goldenQa';
import styles from './ViewGoldenQaSetDialog.module.css';

export interface ViewGoldenQaSetDialogProps {
  set: GoldenQaSet;
  onClose: () => void;
  onBack?: () => void;
}

export const ViewGoldenQaSetDialog = ({ set, onClose, onBack }: ViewGoldenQaSetDialogProps) => {
  const { t } = useTranslation();

  const [rows, setRows] = useState<GoldenQaRow[] | null>(null);
  const [failure, setFailure] = useState<'link' | 'file' | 'empty' | null>(null);
  const [reading, setReading] = useState(true);

  const { data, error } = useQuery(GET_GOLDEN_QA, {
    variables: { id: set.id, includeSignedUrl: true },
    fetchPolicy: 'network-only',
  });

  const signedUrl: string | undefined = data?.goldenQa?.goldenQa?.signedUrl;
  const queryFailed = Boolean(error) || Boolean(data?.goldenQa?.errors?.length);

  // the questions live in the stored file, not in the API, so the file itself is read back
  useEffect(() => {
    if (queryFailed) {
      setFailure('link');
      setReading(false);
      return undefined;
    }

    if (!signedUrl) {
      if (data) {
        setFailure('link');
        setReading(false);
      }
      return undefined;
    }

    let cancelled = false;

    const read = async () => {
      try {
        const response = await fetch(signedUrl);
        if (!response.ok) throw new Error(String(response.status));

        const parsed = parseGoldenQaCsv(await response.text());
        if (cancelled) return;

        if (parsed.length === 0) {
          setFailure('empty');
        } else {
          setRows(parsed);
        }
        setReading(false);
      } catch (error: unknown) {
        console.error('Golden Q&A could not be read from storage:', error);
        if (!cancelled) {
          setFailure('file');
          setReading(false);
        }
      }
    };

    read();

    return () => {
      cancelled = true;
    };
  }, [data, signedUrl, queryFailed]);

  const categories = rows ? goldenQaCategories(rows) : [];
  const hasCategories = categories.length > 0;

  const body = () => {
    if (reading) return <Loading />;

    if (failure || !rows) {
      return (
        <div className={styles.Fallback} data-testid="goldenQaViewFallback">
          <div data-testid="goldenQaViewFailureReason">
            {failure === 'link' && t('This Golden Q&A could not be loaded. Try again in a moment.')}
            {failure === 'file' && t('The stored file could not be read by the browser.')}
            {failure === 'empty' && t('No questions could be read from the stored file.')}
          </div>
          <div className={styles.FallbackNote}>{t('Export the Golden Q&A to read it.')}</div>
          {signedUrl && (
            <Button
              variant="outlined"
              className={styles.FallbackAction}
              onClick={() => downloadFromUrl(signedUrl)}
              data-testid="goldenQaViewDownloadButton"
            >
              {t('Export Golden Q&A')}
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className={styles.SummaryRow}>
          <div className={styles.Summary} data-testid="goldenQaViewCategories">
            {categories.length > 0 && categories.join(', ')}
          </div>
          {signedUrl && (
            <Button
              variant="outlined"
              className={styles.ExportButton}
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => downloadFromUrl(signedUrl)}
              data-testid="goldenQaViewDownloadButton"
            >
              {t('Export Golden Q&A')}
            </Button>
          )}
        </div>

        <DataTable
          className={styles.RowsTable}
          testId="goldenQaViewTable"
          rowTestId="goldenQaViewRow"
          maxHeight="30rem"
          columns={[
            ...(hasCategories ? [{ label: t('Category'), className: styles.CategoryColumn }] : []),
            { label: t('Question'), className: styles.QuestionColumn },
            { label: t('Expected answer'), className: styles.AnswerColumn },
          ]}
          rows={rows.map((row, index) => ({
            key: `${row.question}-${index}`,
            cells: [
              ...(hasCategories ? [<span className={styles.Category}>{row.category || t('Uncategorised')}</span>] : []),
              <span className={styles.Question}>{row.question}</span>,
              <span className={styles.Answer}>{row.answer}</span>,
            ],
          }))}
        />
      </>
    );
  };

  return (
    <DialogBox
      open
      titleAlign="left"
      title={t('Uploaded dataset')}
      buttonOk={t('Done')}
      alignButtons="right"
      skipCancel
      {...(onBack
        ? {
            buttonMiddle: (
              <>
                <ChevronLeftIcon className={styles.BackIcon} />
                {t('All Golden Q&A')}
              </>
            ),
            handleMiddle: onBack,
          }
        : {})}
      handleOk={onClose}
      handleCancel={onClose}
      customStyles={{ paper: styles.WidePaper }}
    >
      <div data-testid="viewGoldenQaSetDialog">
        <div className={styles.Intro} data-testid="goldenQaViewSummary">
          <b className={styles.SetName}>{set.name}</b>
          {rows &&
            ' · ' +
              (rows.length === 1
                ? t('Every evaluation on this Golden Q&A asks this 1 question.')
                : t('Every evaluation on this Golden Q&A asks these {{count}} questions.', { count: rows.length }))}
        </div>
        {body()}
      </div>
    </DialogBox>
  );
};
