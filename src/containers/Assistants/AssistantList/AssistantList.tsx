import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { IconButton, Tooltip } from '@mui/material';

import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';

import { assistantListInfo } from 'common/HelpData';
import { setErrorMessage, setNotification } from 'common/notification';
import { copyToClipboard } from 'common/utils';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Heading } from 'components/UI/Heading/Heading';
import { List } from 'containers/List/List';
import { CLONE_ASSISTANT, DELETE_ASSISTANT } from 'graphql/mutations/Assistant';
import { FILTER_ASSISTANTS, GET_ASSISTANT, GET_ASSISTANTS_COUNT } from 'graphql/queries/Assistant';

import styles from './AssistantList.module.css';

dayjs.extend(relativeTime);

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

const columnStyles = [styles.NameColumn, styles.VersionColumn, styles.DateColumn, styles.Actions];

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

  const handleEdit = (id: string) => {
    navigate(`/assistants/${id}`);
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

  const getColumns = ({ id, name, assistantDisplayId, liveVersionNumber, updatedAt }: any) => ({
    name: getAssistantName(name, assistantDisplayId),
    liveVersion: getLiveVersion(liveVersionNumber),
    lastUpdated: getLastUpdated(updatedAt),
  });

  const columnNames = [
    { label: t('Assistant Name') },
    { label: t('Live Version') },
    { name: 'updated_at', label: t('Last Updated'), sort: true, order: 'desc' },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

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
  ];

  return (
    <>
      <Heading
        formTitle={t('AI Assistants')}
        helpData={assistantListInfo}
        headerHelp={t('AI that answers based on your context')}
        button={{
          show: true,
          label: t('Create New Assistant'),
          action: () => navigate('/assistants/add'),
        }}
      />
      <List
        title={t('AI Assistants')}
        showHeader={false}
        listItem="assistants"
        listItemName="assistant"
        pageLink="assistants"
        dialogMessage={t("You won't be able to use this assistant.")}
        {...queries}
        {...columnAttributes}
        searchParameter={['name_or_assistant_id']}
        additionalAction={additionalAction}
        editSupport={false}
        deleteModifier={{ variables: (id: string) => ({ deleteAssistantId: id }) }}
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
    </>
  );
};

export default AssistantList;
