import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import styles from './WaPollsList.module.css';
import { List } from 'containers/List/List';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { pollsInfo } from 'common/HelpData';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { GET_POLLS, GET_POLLS_COUNT } from 'graphql/queries/WaPolls';
import { DELETE_POLL } from 'graphql/mutations/WaPolls';
import { useMutation } from '@apollo/client';
import { setErrorMessage, setNotification } from 'common/notification';

const queries = {
  countQuery: GET_POLLS_COUNT,
  filterItemsQuery: GET_POLLS,
  deleteItemQuery: DELETE_POLL,
};

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getContent = (content: string, id: number) => {
  const content1 =
    'Which of our communication channels do you find most effective for staying updated on our activities?';
  const content2 =
    'How frequently do you participate in our activities or events, and what influences your level of involvement? Which day works best for our upcoming community workshops?';
  if (!content) {
    content = id % 2 === 0 ? content1 : content2;
  }

  return <div className={styles.ContentText}>{content.length < 100 ? content : `${content.slice(0, 100)}...`}</div>;
};
export const WaPollsList = () => {
  const [deleteWaPollId, setDeleteWaPollId] = useState<string | null>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deletePoll, { loading }] = useMutation(DELETE_POLL);

  const columnNames = [{ name: 'label', label: 'Title' }, { label: 'Content' }, { label: t('Actions') }];
  const title = t('Group polls');
  const collectionIcon = <CollectionIcon />;
  const dialogMessage = t("You won't be able to use this collection again.");
  const columnStyles = [styles.Label, styles.Content, styles.Actions];

  const getColumns = ({ label, content, id }: any) => {
    return {
      label: getLabel(label),
      content: getContent(content, id),
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
      },
      onError: (error) => setErrorMessage(error),
    });
  };

  const getRestrictedAction = () => {
    const action: any = { edit: false, delete: false };
    return action;
  };

  const additionalAction = () => [
    {
      label: t('Copy'),
      icon: <DuplicateIcon />,
      parameter: 'id',
      insideMore: false,
      dialog: handleCopy,
    },
    {
      label: t('Delete'),
      icon: <DeleteIcon data-testid="delete-icon" />,
      parameter: 'label',
      dialog: (id: any) => setDeleteWaPollId(id),
      insideMore: false,
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
        button={{
          show: true,
          label: t('Create'),
        }}
        pageLink={`group/polls`}
        listIcon={collectionIcon}
        dialogMessage={dialogMessage}
        additionalAction={additionalAction}
        restrictedAction={getRestrictedAction}
        helpData={pollsInfo}
        {...queries}
        {...columnAttributes}
      />
      {deleteWaPollId && deletedialog}
    </>
  );
};

export default WaPollsList;
