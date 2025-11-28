import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import CopyAllOutlined from 'assets/images/icons/Flow/Copy.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import ViewIcon from 'assets/images/icons/ViewLight.svg?react';
import { copyToClipboardMethod } from 'common/utils';
import { pollsInfo } from 'common/HelpData';
import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { List } from 'containers/List/List';
import { DELETE_POLL } from 'graphql/mutations/WaPolls';
import { GET_POLLS, GET_POLLS_COUNT } from 'graphql/queries/WaPolls';

import styles from './WaPollsList.module.css';
import { ViewPoll } from './ViewPollDialog/ViewPollDialog';

const queries = {
  countQuery: GET_POLLS_COUNT,
  filterItemsQuery: GET_POLLS,
  deleteItemQuery: DELETE_POLL,
};

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getContent = (content: string) => {
  return <div className={styles.ContentText}>{content.length < 100 ? content : `${content.slice(0, 100)}...`}</div>;
};
export const WaPollsList = () => {
  const [deleteWaPollId, setDeleteWaPollId] = useState<string | null>(null);
  const [viewWaPollId, setViewWaPollId] = useState<string | null>(null);
  const [refreshList, setRefreshList] = useState<boolean>(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deletePoll, { loading }] = useMutation(DELETE_POLL);

  const columnNames = [{ name: 'label', label: 'Title' }, { label: 'Content' }, { label: t('Actions') }];
  const title = t('Group Polls');
  const dialogMessage = t("You won't be able to use this collection again.");
  const columnStyles = [styles.Label, styles.Content, styles.Actions];

  const getColumns = ({ label, pollContent, id }: any) => {
    const content = pollContent ? JSON.parse(pollContent) : {};
    return {
      label: getLabel(label),
      content: getContent(content.text),
    };
  };

  const columnAttributes = {
    columns: getColumns,
    columnStyles,
  };

  const handleCopy = (id: any) => {
    navigate(`/group/polls/${id}/edit`, { state: 'copy' });
  };

  const handleDelete = () => {
    deletePoll({
      variables: { deleteWaPollId },
      onCompleted: () => {
        setNotification('Poll deleted successfully', 'success');
        setDeleteWaPollId(null);
        setRefreshList(!refreshList);
      },
      onError: (error) => setErrorMessage(error),
    });
  };

  const copyUuid = (_id: string, item: any) => {
    if (item.uuid) {
      copyToClipboardMethod(item.uuid);
    } else {
      setNotification('Sorry! UUID not found', 'warning');
    }
  };

  const getRestrictedAction = () => {
    const action: any = { edit: false, delete: false };
    return action;
  };

  const additionalAction = () => [
    {
      label: t('Copy UUID'),
      icon: <CopyAllOutlined data-testid="copy-icon" />,
      parameter: 'id',
      dialog: copyUuid,
    },
    {
      label: t('View'),
      icon: <ViewIcon data-testid="view-icon" />,
      parameter: 'id',
      dialog: (id: any) => setViewWaPollId(id),
    },
    {
      label: t('Copy Poll'),
      icon: <DuplicateIcon data-testid="duplicate-icon" />,
      parameter: 'id',
      dialog: handleCopy,
    },
    {
      label: t('Delete'),
      icon: <DeleteIcon data-testid="delete-icon" />,
      parameter: 'id',
      dialog: (id: any) => setDeleteWaPollId(id),
    },
  ];

  const deletedialog = (
    <DialogBox
      title={`Do you want to delete this poll?`}
      handleOk={handleDelete}
      handleCancel={() => setDeleteWaPollId(null)}
      alignButtons="center"
      colorOk={'warning'}
      buttonOk={'Delete'}
      buttonOkLoading={loading}
      disableOk={loading}
    >
      <p data-testid="delete-dialog" className={styles.DialogText}>
        This action is permanent and cannot be undone. Deleting this poll will remove all associated responses and data
        from the platform.
      </p>
    </DialogBox>
  );

  return (
    <>
      <List
        title={title}
        listItem="poll"
        columnNames={columnNames}
        listItemName="poll"
        pageLink={`group/polls`}
        dialogMessage={dialogMessage}
        additionalAction={additionalAction}
        restrictedAction={getRestrictedAction}
        helpData={pollsInfo}
        refreshList={refreshList}
        button={{
          show: true,
          label: t('Create'),
        }}
        {...queries}
        {...columnAttributes}
      />
      {deleteWaPollId && deletedialog}
      {viewWaPollId && <ViewPoll id={viewWaPollId} onClose={() => setViewWaPollId(null)} />}
    </>
  );
};

export default WaPollsList;
