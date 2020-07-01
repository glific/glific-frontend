import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setNotification } from '../../../common/notification';
import { IconButton, InputBase, Typography, Divider } from '@material-ui/core';
import { Button } from '../../../components/UI/Form/Button/Button';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import { Pager } from '../../../components/UI/Pager/Pager';
import { GET_MESSAGES_COUNT, FILTER_MESSAGES } from '../../../graphql/queries/Message';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { DELETE_MESSAGE } from '../../../graphql/mutations/Message';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import styles from './MessageTemplateList.module.css';

export interface MessageListProps {}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const MessageTemplateList: React.SFC<MessageListProps> = (props) => {
  const client = useApolloClient();

  // DialogBox states
  const [deleteMessageID, setDeleteMessageID] = useState<number | null>(null);
  const [deleteMessageName, setDeleteMessageName] = useState<string>('');

  const [newMessage, setNewMessage] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Table attributes
  const columnNames = ['Name', 'Description', 'Actions'];
  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 10,
    sortCol: columnNames[0],
    sortDirection: 'asc',
  });

  const handleTableChange = (attribute: string, newVal: number | string) => {
    // To handle sorting by columns that are not Name (currently don't support this functionality)
    if (attribute === 'sortCol' && newVal !== 'Name') {
      return;
    }
    // Otherwise, set all values like normal
    setTableVals({
      ...tableVals,
      [attribute]: newVal,
    });
  };

  const filterPayload = () => {
    return {
      filter: {
        label: searchVal,
      },
      order: 'ASC',
    };
  };

  // Get the total number of messages here
  const { loading: l, error: e, data: countData, refetch: refetchCount } = useQuery(
    GET_MESSAGES_COUNT,
    {
      variables: {
        filter: {
          label: '',
        },
      },
    }
  );
  useEffect(() => {
    refetchCount({
      filter: {
        label: searchVal,
      },
    });
  }, [searchVal]);

  // Get message data here
  const { loading, error, data } = useQuery(FILTER_MESSAGES, {
    variables: filterPayload(),
  });

  const message = useQuery(NOTIFICATION);

  let deleteId: number = 0;

  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    update(cache) {
      const messages: any = cache.readQuery({
        query: FILTER_MESSAGES,
        variables: filterPayload(),
      });
      const messagesCopy = JSON.parse(JSON.stringify(messages));
      messagesCopy.sessionTemplates = messages.sessionTemplates.filter(
        (val: any) => val.id !== deleteId
      );
      cache.writeQuery({
        query: FILTER_MESSAGES,
        variables: filterPayload(),
        data: messagesCopy,
      });
    },

    onCompleted: () => {
      refetchCount();
    },
  });

  const showDialogHandler = (id: any, label: string) => {
    setDeleteMessageName(label);
    setDeleteMessageID(id);
  };
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  const closeDialogBox = () => {
    setDeleteMessageID(null);
  };

  const handleDeleteMessage = () => {
    if (deleteMessageID !== null) {
      deleteHandler(deleteMessageID);
    }
    setDeleteMessageID(null);
  };

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  let dialogBox;
  if (deleteMessageID) {
    dialogBox = (
      <DialogBox
        title={`Delete Message: ${deleteMessageName}`}
        handleCancel={closeDialogBox}
        handleOk={handleDeleteMessage}
      >
        Are you sure you want to delete the message?
      </DialogBox>
    );
  }

  if (newMessage) {
    return <Redirect to="/template/add" />;
  }

  if (loading || l) return <Loading />;
  if (error || e) {
    console.log(error);
    return <p>Error :(</p>;
  }

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteMessage({ variables: { id } });
    setNotification(client, 'Message deleted Successfully');
  };

  // Reformat all tags to be entered in table
  function getIcons(id: number | undefined, label: string) {
    if (id) {
      return (
        <>
          <Link to={'/template/' + id + '/edit'}>
            <IconButton aria-label="Edit" color="default">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton
            aria-label="Delete"
            color="default"
            onClick={() => showDialogHandler(id!, label)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      );
    }
  }

  function formatMessages(messages: Array<any>) {
    // Should be type message, but can't import Message type into file
    return messages.map((t: any) => {
      return {
        label: t.label,
        description: t.body,
        operations: getIcons(t.id, t.label),
      };
    });
  }

  const resetTableVals = () => {
    setTableVals({
      pageNum: 0,
      pageRows: 10,
      sortCol: columnNames[0],
      sortDirection: 'asc',
    });
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    let searchVal = e.target.nameSearch.value.trim();
    setSearchVal(searchVal);
    resetTableVals();
  };

  // Get message data and total number of messages.
  let messageList: any;
  if (data) {
    messageList = formatMessages(data.sessionTemplates);
  }

  let messageCount: number = tableVals.pageRows;
  if (countData) {
    messageCount = countData.countSessionTemplates;
  }

  return (
    <>
      <div className={styles.Header}>
        <Typography variant="h5" className={styles.Title}>
          Messages
        </Typography>
        <div className={styles.Buttons}>
          <IconButton className={styles.IconButton} onClick={() => setSearchOpen(!searchOpen)}>
            <SearchIcon className={styles.SearchIcon}></SearchIcon>
          </IconButton>
          <form onSubmit={handleSearch}>
            <div className={searchOpen ? styles.SearchBar : styles.HideSearchBar}>
              <InputBase
                defaultValue={searchVal}
                className={searchOpen ? styles.ShowSearch : styles.HideSearch}
                name="nameSearch"
              />
              {searchOpen ? (
                <div
                  className={styles.ResetSearch}
                  onClick={() => {
                    setSearchVal('');
                    resetTableVals();
                  }}
                >
                  <Divider orientation="vertical" />
                  <CloseIcon className={styles.CloseIcon}></CloseIcon>
                </div>
              ) : null}
            </div>
          </form>
          <div>
            {toastMessage}
            {dialogBox}
            <div className={styles.AddButton}>
              <Button color="primary" variant="contained" onClick={() => setNewMessage(true)}>
                Add New
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rendering list of messages */}
      {messageList ? (
        <Pager
          columnNames={columnNames}
          data={messageList}
          totalRows={messageCount}
          handleTableChange={handleTableChange}
          tableVals={tableVals}
        />
      ) : (
        <div>There are no messages.</div>
      )}
    </>
  );
};
