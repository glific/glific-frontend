import { Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { aiEvalsInfo } from 'common/HelpData';
import { List } from 'containers/List/List';
import dayjs from 'dayjs';
import { LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import { useNavigate } from 'react-router';
import styles from './AIEvaluationList.module.css';

const columnStyles = [styles.Name, styles.StatusColumn, styles.Metric, styles.Metric, styles.CompletedAt, styles.Actions];

const parseResults = (results: any) => {
  if (!results) return { cosineSimilarity: null, llmAsJudge: null };
  try {
    const parsed = typeof results === 'string' ? JSON.parse(results) : results;
    const scores: any[] = parsed.summary_scores ?? [];
    const findAvg = (name: string) => scores.find((s: any) => s.name === name)?.avg ?? null;
    return {
      cosineSimilarity: findAvg('Cosine Similarity') ?? parsed.cosine_similarity ?? parsed.cosineSimilarity ?? null,
      llmAsJudge: findAvg('LLM-as-judge') ?? findAvg('LLM As Judge') ?? parsed.llm_as_judge ?? parsed.llmAsJudge ?? null,
    };
  } catch {
    return { cosineSimilarity: null, llmAsJudge: null };
  }
};

const getName = (name: string) => <div className={styles.NameText}>{name}</div>;

const getStatus = (status: string) => {
  const map: Record<string, string> = {
    COMPLETED: styles.CompletedBadge,
    RUNNING: styles.RunningBadge,
    FAILED: styles.FailedBadge,
  };
  const cls = map[status?.toUpperCase()] ?? styles.PendingBadge;
  const label = status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Pending';
  return <span className={cls}>{label}</span>;
};

const getMetric = (value: number | null) => {
  if (value === null || value === undefined) return <span className={styles.MetricNA}>—</span>;
  return <span className={styles.MetricValue}>{(value * 100).toFixed(1)}%</span>;
};

const getCompletedAt = (status: string, updatedAt: string) => {
  if (status?.toUpperCase() !== 'COMPLETED' || !updatedAt) return <span className={styles.MetricNA}>—</span>;
  return <div>{dayjs(updatedAt).format(STANDARD_DATE_TIME_FORMAT)}</div>;
};

const columnNames = [
  { label: 'Evaluation Name', name: 'name' },
  { label: 'Status' },
  {
    label: (
      <div className={styles.HeaderWithIcon}>
        Cosine Similarity
        <Tooltip
          title="Cosine similarity measures how close the assistant's answer is to the expected answer in meaning. A higher score (more than 0.7) means the answers convey similar intent and information."
          arrow
        >
          <InfoOutlinedIcon className={styles.ColumnInfoIcon} />
        </Tooltip>
      </div>
    ),
  },
  {
    label: (
      <div className={styles.HeaderWithIcon}>
        LLM-as-judge
        <Tooltip
          title="LLM-as-judge uses a language model to evaluate the quality of the assistant's response compared to the expected answer."
          arrow
        >
          <InfoOutlinedIcon className={styles.ColumnInfoIcon} />
        </Tooltip>
      </div>
    ),
  },
  { label: 'Completed at' },
  { name: 'actions', label: 'Actions' },
];

const getColumns = ({ name, status, results, updatedAt }: Record<string, any>) => {
  const { cosineSimilarity, llmAsJudge } = parseResults(results);
  return {
    name: getName(name),
    status: getStatus(status),
    cosineSimilarity: getMetric(cosineSimilarity),
    llmAsJudge: getMetric(llmAsJudge),
    completedAt: getCompletedAt(status, updatedAt),
  };
};

const columnAttributes = { columnNames, columns: getColumns, columnStyles };

const queries = {
  filterItemsQuery: LIST_AI_EVALUATIONS,
  deleteItemQuery: null,
};

export const AIEvaluationList = () => {
  const navigate = useNavigate();

  return (
    <List
      title="AI Evaluations"
      helpData={aiEvalsInfo}
      listItem="aiEvaluations"
      listItemName="evaluation"
      pageLink="ai-evaluations"
      {...queries}
      {...columnAttributes}
      button={{ show: true, label: 'Create New Evaluation', action: () => navigate('/ai-evaluations/create') }}
      searchParameter={['name']}
      dialogMessage="The evaluation will be permanently deleted and cannot be recovered."
      restrictedAction={() => ({ edit: false, delete: false })}
    />
  );
};

export default AIEvaluationList;
