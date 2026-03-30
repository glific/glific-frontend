import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router';

import { List } from 'containers/List/List';
import { Button } from 'components/UI/Form/Button/Button';
import { COUNT_AI_EVALUATIONS, LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import { CREATE_EVALUATION } from 'graphql/mutations/AIEvaluations';
import styles from './AIEvaluationList.module.css';

dayjs.extend(relativeTime);

const STATUS_COLORS: Record<string, string> = {
  completed: '#4caf50',
  failed: '#f44336',
  in_progress: '#ff9800',
  queued: '#9e9e9e',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  failed: 'Failed',
  in_progress: 'In Progress.',
  queued: 'Queued',
};

const getEvaluationName = (name: string) => <div className={styles.EvaluationName}>{name}</div>;

const getStatus = (status: string) => {
  const color = STATUS_COLORS[status] ?? '#9e9e9e';
  const label = STATUS_LABELS[status] ?? status;
  const isInProgress = status === 'in_progress' || status === 'queued';

  return (
    <div className={styles.StatusCell}>
      <span className={styles.StatusDot} style={{ backgroundColor: color }} />
      <div>
        <div className={styles.StatusLabel}>{label}</div>
        {isInProgress && <div className={styles.StatusSub}>May take about 15 mins.</div>}
      </div>
    </div>
  );
};

const getScore = (value: string | null) => (
  <div className={styles.ScoreCell}>{value !== null && value !== undefined ? value : '-'}</div>
);

const getCompletedAt = (updatedAt: string, status: string) => {
  if (status !== 'completed') return <div className={styles.TableText}>-</div>;
  const date = dayjs(updatedAt);
  const diff = dayjs().diff(date, 'hour');
  const display = diff < 24 ? date.fromNow() : date.format('MMM D, h:mm A');
  return <div className={styles.TableText}>{display}</div>;
};

const getColumns = ({ name, status, results, updatedAt }: any) => {
  const parsed = (() => {
    try {
      return typeof results === 'string' ? JSON.parse(results) : results;
    } catch {
      return null;
    }
  })();

  return {
    name: getEvaluationName(name),
    status: getStatus(status),
    cosine: getScore(parsed?.cosine_similarity ?? null),
    llmJudge: getScore(parsed?.llm_as_judge ?? null),
    completedAt: getCompletedAt(updatedAt, status),
  };
};

const columnNames = [
  { name: 'name', label: 'Evaluation Name', sort: true, order: 'asc' },
  { label: 'Status' },
  { label: 'Cosine Similarity' },
  { label: 'LLM-as-judge' },
  { label: 'Completed at' },
  { label: 'Actions' },
];

const columnStyles = [
  styles.NameColumn,
  styles.StatusColumn,
  styles.ScoreColumn,
  styles.ScoreColumn,
  styles.DateColumn,
  styles.ActionsColumn,
];

const columnAttributes = { columnNames, columns: getColumns, columnStyles };

const queries = {
  countQuery: COUNT_AI_EVALUATIONS,
  filterItemsQuery: LIST_AI_EVALUATIONS,
  deleteItemQuery: CREATE_EVALUATION,
};

const listIcon = <AssessmentIcon />;

export const AIEvaluationList = () => {
  return (
    <List
      title="AI Evaluations"
      listItem="aiEvaluations"
      listItemName="AI evaluation"
      pageLink="ai-evaluations"
      listIcon={listIcon}
      {...queries}
      {...columnAttributes}
      button={{ show: true, label: 'Create Evaluation', link: '/ai-evaluations/create' }}
      restrictedAction={() => ({ edit: false, delete: false })}
      searchParameter={['name']}
    />
  );
};

export default AIEvaluationList;
