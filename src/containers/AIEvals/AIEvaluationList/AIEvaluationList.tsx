import { useLazyQuery } from '@apollo/client';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AssistantsIcon from 'assets/images/Assistants.svg?react';
import DocumentIcon from 'assets/images/icons/Document/Light.svg?react';
import { Tooltip } from '@mui/material';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { setErrorMessage, setNotification } from 'common/notification';
import { List } from 'containers/List/List';
import dayjs from 'dayjs';
import { COUNT_AI_EVALUATIONS, GET_EVALUATION_SCORES, LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import { useNavigate } from 'react-router';
import styles from './AIEvaluationList.module.css';

interface AIEvaluationListProps {
  searchQuery?: string;
}

const columnStyles = [
  styles.Name,
  styles.StatusColumn,
  styles.Metric,
  styles.CompletedAt,
  styles.Actions,
];

const parseResults = (results: any) => {
  if (!results) return { cosineSimilarity: null };
  try {
    const parsed = typeof results === 'string' ? JSON.parse(results) : results;
    const scores: any[] = parsed.summary_scores ?? [];
    const findAvg = (name: string) => scores.find((s: any) => s.name === name)?.avg ?? null;
    return {
      cosineSimilarity: findAvg('Cosine Similarity') ?? parsed.cosine_similarity ?? parsed.cosineSimilarity ?? null,
    };
  } catch {
    return { cosineSimilarity: null };
  }
};

// Extract per-question trace rows from the scores payload.
// Structure: parsed.score.traces → [{question_id, question, ground_truth_answer, llm_answer, scores:[...metrics]}]
const extractRows = (data: any): any[] => {
  if (!data) return [];

  // Primary path: { score: { traces: [...] } }
  if (data.score?.traces && Array.isArray(data.score.traces)) {
    return data.score.traces.filter(Boolean);
  }

  // Fallback: already a flat array of trace-like objects
  if (Array.isArray(data)) {
    const nonNull = data.filter((r) => r !== null && r !== undefined && typeof r === 'object');
    if (nonNull.length) return nonNull;
  }

  return [];
};

// Flatten a trace row into readable CSV columns.
// Output columns: question_id, question, ground_truth_answer, llm_answer, <metric_name per score>
const TRACE_COLUMNS = ['question_id', 'question', 'ground_truth_answer', 'llm_answer'];

const flattenRow = (row: any): Record<string, any> | null => {
  if (row === null || row === undefined || typeof row !== 'object' || Array.isArray(row)) return null;
  const flat: Record<string, any> = {};

  for (const key of TRACE_COLUMNS) {
    flat[key] = row[key] ?? '';
  }

  // Expand scores array: { name: "Cosine Similarity", value: 0.11 } → cosine_similarity: 0.11
  const metrics: any[] = Array.isArray(row.scores) ? row.scores : [];
  for (const metric of metrics) {
    if (metric?.name) {
      const col = metric.name.toLowerCase().replace(/[\s-]+/g, '_');
      flat[col] = metric.value ?? '';
    }
  }

  return flat;
};

const jsonToCsv = (rows: any[]): string => {
  const flat = rows.map(flattenRow).filter((r): r is Record<string, any> => r !== null);
  if (!flat.length) return '';
  // Collect all headers across all rows (rows may have different metric columns)
  const headers = Array.from(new Set(flat.flatMap(Object.keys)));
  const escape = (val: any) => {
    const str = val === null || val === undefined ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [headers.join(','), ...flat.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');
};

const triggerCsvDownload = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface NameCellProps {
  name: string;
  goldenQa?: { id?: string | null; name?: string | null; duplicationFactor?: number | null } | null;
  assistantConfigVersion?: {
    id?: string | null;
    versionNumber?: number | null;
    assistant?: { id?: string | null; name?: string | null } | null;
  } | null;
}

const getName = ({ name, goldenQa, assistantConfigVersion }: NameCellProps) => {
  const assistantName = assistantConfigVersion?.assistant?.name;
  const versionNumber = assistantConfigVersion?.versionNumber;
  const assistantId = assistantConfigVersion?.assistant?.id;
  const goldenQaName = goldenQa?.name;
  const goldenQaDuplicationFactor = goldenQa?.duplicationFactor;

  const assistantLabel =
    (assistantName ?? '—') + (versionNumber != null ? `/Version ${versionNumber}` : '');

  const assistantLink =
    assistantId && versionNumber != null
      ? `/assistants/${assistantId}/version/${versionNumber}`
      : null;

  return (
    <div>
      <div className={styles.NameText}>{name}</div>
      {(assistantName || versionNumber != null) && (
        <div className={styles.NameSubInfo}>
          <AssistantsIcon className={styles.SubInfoIcon} />
          {assistantLink ? (
            <a href={assistantLink} className={styles.SubInfoLink} data-testid="assistantVersionLink">
              {assistantLabel}
            </a>
          ) : (
            <span className={styles.SubInfoLink}>{assistantLabel}</span>
          )}
        </div>
      )}
      {(goldenQaName || goldenQaDuplicationFactor != null) && (
        <div className={styles.NameSubInfo}>
          <DocumentIcon className={styles.SubInfoIcon} />
          <span className={styles.SubInfoText}>
            {goldenQaName ?? '—'}
            {goldenQaDuplicationFactor != null ? ` | ${goldenQaDuplicationFactor}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

const getStatus = (status: string) => {
  const normalizedStatus = status?.toUpperCase();
  const dotMap: Record<string, string> = {
    COMPLETED: styles.DotCompleted,
    RUNNING: styles.DotRunning,
    PROCESSING: styles.DotRunning,
    FAILED: styles.DotFailed,
  };
  const labelMap: Record<string, string> = {
    PROCESSING: 'In Progress',
  };
  const dotCls = dotMap[normalizedStatus] ?? styles.DotPending;
  const label = labelMap[normalizedStatus] ?? (status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Pending');
  const showHelperText = normalizedStatus === 'PROCESSING';

  return (
    <span className={styles.StatusCell}>
      <span className={dotCls} />
      <span className={styles.StatusContent}>
        <span className={styles.StatusLabel}>{showHelperText ? `${label}.` : label}</span>
        {showHelperText && <span className={styles.StatusHelperText}>May take about 15 mins.</span>}
      </span>
    </span>
  );
};

const getMetric = (value: number | null) => {
  if (value === null || value === undefined) return <span className={styles.MetricNA}>—</span>;
  return <span className={styles.MetricValue}>{value.toFixed(2)}</span>;
};

const getCompletedAt = (status: string, updatedAt: string) => {
  if (status?.toUpperCase() !== 'COMPLETED' || !updatedAt) return <span className={styles.MetricNA}>—</span>;
  return <div>{dayjs(updatedAt).format(STANDARD_DATE_TIME_FORMAT)}</div>;
};

const columnNames = [
  { label: 'Evaluation Name' },
  { label: 'Status' },
  {
    label: (
      <div className={styles.HeaderWithIcon}>
        Cosine Similarity
        <Tooltip
          title="Cosine similarity measures how close the assistant’s answer is to the expected answer in meaning. A higher score (more than 0.7) means the answers convey similar intent and information. A lower score (less than 0.3) means the response has drifted in meaning, even if some words overlap."
          arrow
        >
          <InfoOutlinedIcon className={styles.ColumnInfoIcon} />
        </Tooltip>
      </div>
    ),
  },
  { label: 'Completed at', name: 'updated_at', sort: true, order: 'desc' },
  { name: 'actions', label: 'Actions' },
];

const getColumns = ({
  name,
  status,
  results,
  updatedAt,
  goldenQa,
  assistantConfigVersion,
}: Record<string, any>) => {
  const { cosineSimilarity } = parseResults(results);
  return {
    name: getName({ name, goldenQa, assistantConfigVersion }),
    status: getStatus(status),
    cosineSimilarity: getMetric(cosineSimilarity),
    completedAt: getCompletedAt(status, updatedAt),
  };
};

const columnAttributes = { columnNames, columns: getColumns, columnStyles };

const queries = {
  countQuery: COUNT_AI_EVALUATIONS,
  filterItemsQuery: LIST_AI_EVALUATIONS,
  deleteItemQuery: null,
};

export const AIEvaluationList = ({ searchQuery }: AIEvaluationListProps) => {
  const navigate = useNavigate();
  const [fetchEvaluationScores] = useLazyQuery(GET_EVALUATION_SCORES);

  const handleDownload = async (id: string, name: string) => {
    try {
      const { data, error } = await fetchEvaluationScores({ variables: { id } });

      if (error) {
        setErrorMessage(error);
        return;
      }

      const errors: any[] = data?.evaluationScores?.errors ?? [];
      if (errors.length) {
        setErrorMessage(errors.map((e: any) => e.message).join(', '));
        return;
      }

      const raw = data?.evaluationScores?.scores;
      if (!raw) {
        setNotification('No scores available to download', 'warning');
        return;
      }

      // backend returns scores as a JSON string — parse it, then normalise to array
      let parsed: any;
      try {
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        setNotification('Invalid scores data received', 'warning');
        return;
      }

      const scores = extractRows(parsed);

      if (!scores.length) {
        setNotification('No scores available to download', 'warning');
        return;
      }

      const csv = jsonToCsv(scores);
      if (!csv) {
        setNotification('No valid score rows to download', 'warning');
        return;
      }
      triggerCsvDownload(csv, `${name}_scores.csv`);
    } catch (err) {
      setErrorMessage(err as Error);
    }
  };

  const additionalAction = (item: any) => {
    const isNotCompleted = item?.status?.toUpperCase() !== 'COMPLETED';
    return [
      {
        label: 'Download Results',
        icon: (
          <span className={isNotCompleted ? styles.DownloadCsvButtonDisabled : styles.DownloadCsvButton}>
            Download Results
          </span>
        ),
        parameter: 'id',
        dialog: isNotCompleted ? () => {} : (id: string) => handleDownload(id, item.name),
      },
    ];
  };

  return (
    <List
      title="AI Evaluations"
      listItem="aiEvaluations"
      listItemName="evaluation"
      pageLink="ai-evaluations"
      {...queries}
      {...columnAttributes}
      filters={searchQuery ? { name: searchQuery } : null}
      showHeader={false}
      showSearch={false}
      button={{ show: true, label: 'Create New Evaluation', action: () => navigate('/ai-evaluations/create') }}
      dialogMessage="The evaluation will be permanently deleted and cannot be recovered."
      restrictedAction={() => ({ edit: false, delete: false })}
      additionalAction={additionalAction}
    />
  );
};

export default AIEvaluationList;
