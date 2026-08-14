import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import type { GoldenQaRow, GoldenQaSet } from 'containers/AIEvaluation/types/goldenQaType';
import { downloadFromUrl, goldenQaCategories, parseGoldenQaCsv } from 'containers/AIEvaluation/utils/goldenQa';
import styles from './ViewGoldenQaSetDialog.module.css';

export interface ViewGoldenQaSetDialogProps {
  set: GoldenQaSet;
  onClose: () => void;
  onBack?: () => void;
}

export const ViewGoldenQaSetDialog = ({ set, onClose, onBack }: ViewGoldenQaSetDialogProps) => {
  const { t } = useTranslation();

  const [rows, setRows] = useState<GoldenQaRow[] | null>(null);
  // which step gave up, so the message can say something the reader can act on
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

    if (!signedUrl) return undefined;

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
        // storage may refuse to serve the file to the browser, which is a CORS setting on the
        // bucket rather than anything this app can work around
        // eslint-disable-next-line no-console
        console.error('Golden Q&A set could not be read from storage:', error);
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
  }, [signedUrl, queryFailed]);

  const categories = rows ? goldenQaCategories(rows) : [];
  const hasCategories = categories.length > 0;

  const body = () => {
    if (reading) return <Loading />;

    if (failure || !rows) {
      return (
        <div className={styles.Fallback} data-testid="goldenQaViewFallback">
          <div data-testid="goldenQaViewFailureReason">
            {failure === 'link' && t('This set could not be loaded. Try again in a moment.')}
            {failure === 'file' && t('The stored file could not be read by the browser.')}
            {failure === 'empty' && t('No questions could be read from the stored file.')}
          </div>
          <div className={styles.FallbackNote}>{t('Export the set to read it.')}</div>
          {signedUrl && (
            <Button
              variant="outlined"
              className={styles.FallbackAction}
              onClick={() => downloadFromUrl(signedUrl)}
              data-testid="goldenQaViewDownloadButton"
            >
              {t('Export set')}
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
          <Button
            variant="outlined"
            className={styles.DeleteButton}
            disabled
            title={t('Deleting a set is not available yet.')}
            data-testid="deleteGoldenQaButton"
          >
            {t('Delete set')}
          </Button>
          {signedUrl && (
            <Button
              variant="outlined"
              className={styles.ExportButton}
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => downloadFromUrl(signedUrl)}
              data-testid="goldenQaViewDownloadButton"
            >
              {t('Export set')}
            </Button>
          )}
        </div>

        <div className={styles.TableWrap}>
          <table className={styles.Table}>
            <thead>
              <tr>
                {hasCategories && <th>{t('Category')}</th>}
                <th>{t('Question')}</th>
                <th>{t('Expected answer')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.question}-${index}`} data-testid="goldenQaViewRow">
                  {hasCategories && (
                    <td>
                      <span className={styles.Category}>{row.category || t('Uncategorised')}</span>
                    </td>
                  )}
                  <td className={styles.Question}>{row.question}</td>
                  <td className={styles.Answer}>{row.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      {...(onBack ? { buttonMiddle: `‹ ${t('All sets')}`, handleMiddle: onBack } : {})}
      handleOk={onClose}
      handleCancel={onClose}
      customStyles={{ paper: styles.WidePaper }}
    >
      <div className={styles.Body} data-testid="viewGoldenQaSetDialog">
        <div className={styles.Intro} data-testid="goldenQaViewSummary">
          {rows && (
            <>
              {rows.length} {rows.length === 1 ? t('question') : t('questions')} · {t('showing')} {rows.length}.{' '}
            </>
          )}
          {t('These are the questions every evaluation on this set asks.')}
        </div>
        {body()}
      </div>
    </DialogBox>
  );
};

export default ViewGoldenQaSetDialog;
