import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import EditIcon from 'assets/images/icons/Edit.svg?react';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';

import { FILTER_ASSISTANTS, GET_ASSISTANTS_COUNT } from 'graphql/queries/Assistant';
import { CLONE_ASSISTANT, DELETE_ASSISTANT } from 'graphql/mutations/Assistant';
import { List } from 'containers/List/List';
import { assistantsInfo } from 'common/HelpData';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification, setErrorMessage } from 'common/notification';

import styles from './AssistantList.module.css';

dayjs.extend(relativeTime);

const getAssistantName = (name: string, assistantDisplayId: string) => (
  <div className={styles.NameCell}>
    <span className={styles.Name}>{name}</span>
    <span className={styles.DisplayId}>{assistantDisplayId}</span>
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

  const [cloneAssistant, { loading: cloning }] = useMutation(CLONE_ASSISTANT);

  const handleEdit = (id: string) => {
    navigate(`/assistant-new/${id}`);
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

    const variables: Record<string, any> = { cloneAssistantId: selectedAssistant.id };
    variables.versionId = selectedAssistant.activeConfigVersionId;

    setCloneDialogOpen(false);

    try {
      const response = await cloneAssistant({ variables });
      if (response.data?.cloneAssistant?.errors?.length > 0) {
        setErrorMessage(response.data.cloneAssistant.errors[0]);
        return;
      }
      const message = response.data?.cloneAssistant?.message || t('Assistant clone initiated');
      setNotification(message);
    } catch (error: unknown) {
      setErrorMessage(error);
    } finally {
      setSelectedAssistant(null);
    }
  };

  const getColumns = ({ id, name, assistantDisplayId, liveVersionNumber, updatedAt }: any) => ({
    name: getAssistantName(name, assistantDisplayId),
    liveVersion: getLiveVersion(liveVersionNumber),
    lastUpdated: getLastUpdated(updatedAt),
  });

  const columnNames = [
    { name: 'name', label: t('Assistant Name') },
    { label: t('Live Version') },
    { label: t('Last Updated') },
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
      label: t('Clone'),
      icon: <CopyIcon data-testid="copy-icon" />,
      parameter: 'id',
      dialog: handleCloneClick,
    },
  ];

  return (
    <>
      <List
        helpData={assistantsInfo}
        title={t('AI Assistant')}
        listItem="assistants"
        listItemName="assistant"
        pageLink="assistants-new"
        dialogMessage={t("You won't be able to use this assistant.")}
        {...queries}
        {...columnAttributes}
        searchParameter={['name']}
        additionalAction={additionalAction}
        button={{
          show: true,
          label: t('Create New Assistant'),
          action: () => navigate('/assistant-new/add'),
        }}
        editSupport={false}
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
            {t('Are you sure you want to clone the assistant')} <strong>{selectedAssistant.name}</strong>?
          </div>
        </DialogBox>
      )}
    </>
  );
};

export default AssistantList;
