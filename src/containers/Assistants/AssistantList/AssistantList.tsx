import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import EditIcon from 'assets/images/icons/Edit.svg?react';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';

import { FILTER_ASSISTANTS, GET_ASSISTANTS_COUNT } from 'graphql/queries/Assistant';
import { DELETE_ASSISTANT } from 'graphql/mutations/Assistant';
import { List } from 'containers/List/List';
import { assistantsInfo } from 'common/HelpData';
import { copyToClipboard } from 'common/utils';

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

  const handleEdit = (id: string) => {
    navigate(`/assistant-new/${id}`);
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
      label: t('Copy ID'),
      icon: <CopyIcon data-testid="copy-icon" />,
      parameter: 'assistantDisplayId',
      dialog: (assistantDisplayId: string) => copyToClipboard(assistantDisplayId),
    },
  ];

  return (
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
        action: () => navigate('/assistants-new/add'),
      }}
      editSupport={false}
    />
  );
};

export default AssistantList;
