import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { IconButton, Tooltip } from '@mui/material';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';
import { assistantListInfo } from 'common/HelpData';
import { setErrorMessage, setNotification } from 'common/notification';
import { copyToClipboard } from 'common/utils';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Heading } from 'components/UI/Heading/Heading';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import { List } from 'containers/List/List';
import { CLONE_ASSISTANT, DELETE_ASSISTANT } from 'graphql/mutations/Assistant';
import { FILTER_ASSISTANTS, GET_ASSISTANT, GET_ASSISTANTS_COUNT } from 'graphql/queries/Assistant';

import styles from './AssistantList.module.css';

dayjs.extend(relativeTime);

const SEARCH_DEBOUNCE_MS = 400;

const HEALTH_SUMMARY = [
  { count: 0, label: 'good' },
  { count: 0, label: 'could improve' },
  { count: 0, label: 'need improvement' },
  { count: 0, label: 'not evaluated' },
] as const;

const getAssistantName = (name: string, assistantDisplayId: string) => (
  <div className={styles.NameCell}>
    <span className={styles.Name}>{name}</span>
    <span className={styles.DisplayIdRow}>
      <Tooltip title="Copy assistant ID" placement="top">
        <IconButton
          size="small"
          className={styles.CopyButton}
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(assistantDisplayId);
          }}
          data-testid="copyAssistantId"
        >
          <CopyIcon />
        </IconButton>
      </Tooltip>
      <span className={styles.DisplayId}>{assistantDisplayId}</span>
    </span>
  </div>
);

const getLiveVersion = (liveVersionNumber: number | null) =>
  liveVersionNumber ? (
    <span className={styles.VersionBadge}>Version {liveVersionNumber}</span>
  ) : (
    <span className={styles.NoVersion}>-</span>
  );

const getLastUpdated = (updatedAt: string) => {
  if (!updatedAt) return '-';
  return dayjs(updatedAt).fromNow();
};

// placeholder until the evaluation health score is available on the assistant
const getEvaluationHealth = () => '-';

const columnStyles = [styles.NameColumn, styles.HealthColumn, styles.VersionColumn, styles.DateColumn, styles.Actions];

const queries = {
  countQuery: GET_ASSISTANTS_COUNT,
  filterItemsQuery: FILTER_ASSISTANTS,
  deleteItemQuery: DELETE_ASSISTANT,
};

export const AssistantList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<{
    id: string;
    name: string;
    activeConfigVersionId: string | null;
  } | null>(null);

  const client = useApolloClient();
  const [cloneAssistant, { loading: cloning }] = useMutation(CLONE_ASSISTANT);

  const [cloningAssistantId, setCloningAssistantId] = useState<string | null>(null);
  const [assistantToDelete, setAssistantToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteAssistant] = useMutation(DELETE_ASSISTANT);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters = useMemo(() => (searchQuery ? { name_or_assistant_id: searchQuery } : null), [searchQuery]);

  const { data: pollingData, stopPolling } = useQuery(GET_ASSISTANT, {
    variables: { assistantId: cloningAssistantId },
    skip: !cloningAssistantId,
    pollInterval: 5000,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const cloneStatus = pollingData?.assistant?.assistant?.cloneStatus;
    if (cloneStatus === 'completed') {
      stopPolling();
      setCloningAssistantId(null);
      setNotification(t('Assistant cloned successfully'));
      client.refetchQueries({ include: [FILTER_ASSISTANTS] });
    } else if (cloneStatus === 'failed') {
      stopPolling();
      setCloningAssistantId(null);
      setNotification('Assistant clone failed', 'warning');
    }
  }, [pollingData]);

  const handleEdit = (_id: string, item: any) => {
    if (!item) return;
    navigate(`/ai-evaluation-v2/${item.id}`);
  };

  const handleDeleteClick = (_id: string, item: any) => {
    setAssistantToDelete({ id: item.id, name: item.name });
  };

  const handleDeleteConfirm = async () => {
    if (!assistantToDelete) return;
    const { id } = assistantToDelete;
    setAssistantToDelete(null);

    try {
      await deleteAssistant({ variables: { deleteAssistantId: id } });
      setNotification(t('Assistant deleted successfully'));
      client.refetchQueries({ include: [FILTER_ASSISTANTS] });
    } catch (error: unknown) {
      setErrorMessage(error);
    }
  };

  const handleCloneClick = (_id: string, item: any) => {
    setSelectedAssistant({
      id: item.id,
      name: item.name,
      activeConfigVersionId: item.activeConfigVersionId ?? null,
    });
    setCloneDialogOpen(true);
  };

  const handleCloneConfirm = async () => {
    if (!selectedAssistant) return;

    const currentAssistant = { ...selectedAssistant };
    setCloneDialogOpen(false);
    setSelectedAssistant(null);

    const variables: Record<string, any> = { cloneAssistantId: currentAssistant.id };
    variables.versionId = currentAssistant.activeConfigVersionId;

    try {
      const response = await cloneAssistant({ variables });
      if (response.data?.cloneAssistant?.errors?.length > 0) {
        setErrorMessage(response.data.cloneAssistant.errors[0]);
        return;
      }
      const message = response.data?.cloneAssistant?.message || t('Assistant clone initiated');
      setNotification(message);
      setCloningAssistantId(currentAssistant.id);
    } catch (error: unknown) {
      setErrorMessage(error);
    }
  };

  const getColumns = ({ name, assistantDisplayId, liveVersionNumber, updatedAt }: any) => ({
    name: getAssistantName(name, assistantDisplayId),
    evaluationHealth: getEvaluationHealth(),
    liveVersion: getLiveVersion(liveVersionNumber),
    lastUpdated: getLastUpdated(updatedAt),
  });

  const columnNames = [
    { label: t('Assistant Name') },
    {
      label: (
        <Tooltip
          title={t(
            'Scored 0–1 by our automated judge. 0–0.3 = Needs Improvement. 0.3–0.6 = Needs Refinement. 0.6–1 = Good.'
          )}
          placement="top"
          arrow
        >
          <span className={styles.HealthHeader}>{t('Evaluation health')}</span>
        </Tooltip>
      ),
    },
    { label: t('Live Version') },
    { name: 'updated_at', label: t('Last Updated'), sort: true, order: 'desc' },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const debouncedSearchBar = (
    <div className={styles.SearchBar}>
      <SearchBar
        searchVal={searchInput}
        handleChange={(e: any) => setSearchInput(e.target.value)}
        handleSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
        onReset={() => {
          setSearchInput('');
          setSearchQuery('');
        }}
        searchMode
      />
    </div>
  );

  const healthSummary = HEALTH_SUMMARY.map(({ count, label }) => `${count} ${t(label)}`).join(' • ');

  const additionalAction = () => [
    {
      label: t('Edit'),
      icon: <EditIcon data-testid="edit-icon" />,
      parameter: 'id',
      dialog: handleEdit,
    },
    {
      label: t('Copy'),
      icon: <DuplicateIcon data-testid="copy-icon" />,
      parameter: 'id',
      dialog: handleCloneClick,
    },
    {
      label: t('Delete'),
      icon: <DeleteIcon data-testid="DeleteIcon" />,
      parameter: 'id',
      dialog: handleDeleteClick,
    },
  ];

  return (
    <div className={styles.ListWrapper}>
      <Heading
        formTitle={t('AI Assistants')}
        helpData={assistantListInfo}
        headerHelp={healthSummary}
        button={{
          show: true,
          label: t('Create New Assistant'),
          action: () => navigate('/ai-evaluation-v2/add'),
        }}
      />

      <div className={styles.SearchRow}>{debouncedSearchBar}</div>

      <List
        title={t('AI Assistants')}
        listItem="assistants"
        listItemName="assistant"
        pageLink="assistants"
        {...queries}
        {...columnAttributes}
        searchParameter={['name_or_assistant_id']}
        showHeader={false}
        showSearch={false}
        filters={filters}
        searchActive={Boolean(searchQuery)}
        additionalAction={additionalAction}
        restrictedAction={() => ({ edit: false, delete: false })}
        editSupport={false}
        sortConfig={{ sortBy: 'updated_at', sortOrder: 'desc' }}
      />

      {cloneDialogOpen && selectedAssistant && (
        <DialogBox
          title={t('Clone Assistant')}
          handleCancel={() => {
            setCloneDialogOpen(false);
            setSelectedAssistant(null);
          }}
          handleOk={handleCloneConfirm}
          buttonOk={t('Yes')}
          buttonCancel={t('No')}
          alignButtons="center"
          buttonOkLoading={cloning}
          disableOk={cloning}
        >
          <div>
            {t('This will create a copy of the current live version of')} <strong>{selectedAssistant.name}</strong>.{' '}
            {t('Do you want to continue?')}
          </div>
        </DialogBox>
      )}

      {assistantToDelete && (
        <DialogBox
          title={`${t('Are you sure you want to delete the assistant')} "${assistantToDelete.name}"?`}
          handleCancel={() => setAssistantToDelete(null)}
          handleOk={handleDeleteConfirm}
          alignButtons="center"
          colorOk="warning"
        >
          <div>{t("You won't be able to use this assistant.")}</div>
        </DialogBox>
      )}
    </div>
  );
};

export default AssistantList;
