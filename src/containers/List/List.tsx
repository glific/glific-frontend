import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation, DocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setNotification } from '../../common/notification';
import { IconButton, Typography } from '@material-ui/core';
import { Button } from '../../components/UI/Form/Button/Button';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { Pager } from '../../components/UI/Pager/Pager';
import { NOTIFICATION } from '../../graphql/queries/Notification';
import { ToastMessage } from '../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import styles from './List.module.css';
import { SearchBar } from '../Chat/ChatConversations/SearchBar';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/Red.svg';
import { ReactComponent as EditIcon } from '../../assets/images/icons/Edit.svg';

export interface ListProps {
  columnNames: Array<string>;
  countQuery: DocumentNode;
  listItem: string;
  filterItemsQuery: DocumentNode;
  deleteItemQuery: DocumentNode;
  listItemName: string;
  dialogMessage: string;
  pageLink: string;
  columns: any;
  listIcon: any;
  columnStyles: any;
  title: string;
  buttonLabel?: string;
  // searchKey: any;
}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const List: React.SFC<ListProps> = ({
  columnNames,
  countQuery,
  listItem,
  listIcon,
  filterItemsQuery,
  deleteItemQuery,
  listItemName,
  dialogMessage,
  pageLink,
  columns,
  columnStyles,
  title,
  buttonLabel = 'Add New',
  // searchKey = null,
}) => {
  const client = useApolloClient();

  // DialogBox states
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');

  const [newItem, setNewItem] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Table attributes

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

  const filterPayload = useCallback(() => {
    return {
      filter: {
        name: searchVal,
      },
      opts: {
        limit: tableVals.pageRows,
        offset: tableVals.pageNum * tableVals.pageRows,
        order: tableVals.sortDirection.toUpperCase(),
      },
    };
  }, [searchVal, tableVals]);

  // Get the total number of items here
  const { loading: l, error: e, data: countData, refetch: refetchCount } = useQuery(countQuery, {
    variables: {
      filter: {
        name: searchVal,
      },
    },
  });

  // Get item data here
  const { loading, error, data, refetch } = useQuery(filterItemsQuery, {
    variables: filterPayload(),
  });

  const message = useQuery(NOTIFICATION);
  let toastMessage;

  useEffect(() => {
    refetch();
  }, [refetch, filterPayload]);

  // Make a new count request for a new count of the # of rows from this query in the back-end.
  useEffect(() => {
    refetchCount();
  }, [searchVal, refetchCount]);

  useEffect(() => {
    return () => {
      setNotification(client, null);
    };
  }, [toastMessage, client]);

  const [deleteItem] = useMutation(deleteItemQuery, {
    onCompleted: () => {
      refetch();
      refetchCount();
    },
  });

  const showDialogHandler = (id: any, label: string) => {
    setDeleteItemName(label);
    setDeleteItemID(id);
  };
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  const closeDialogBox = () => {
    setDeleteItemID(null);
  };

  const handleDeleteItem = () => {
    if (deleteItemID !== null) {
      deleteHandler(deleteItemID);
    }
    setDeleteItemID(null);
  };

  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  let dialogBox;
  if (deleteItemID) {
    dialogBox = (
      <DialogBox
        title={`Are you sure you want to delete the ${listItemName} "${deleteItemName}"?`}
        handleOk={handleDeleteItem}
        handleCancel={closeDialogBox}
        colorOk="secondary"
        alignButtons={styles.ButtonsCenter}
      >
        <p className={styles.DialogText}>{dialogMessage}</p>
      </DialogBox>
    );
  }

  if (newItem) {
    return <Redirect to={`/${pageLink}/add`} />;
  }

  if (loading || l) return <Loading />;
  if (error || e) return <p>Error :(</p>;

  const deleteHandler = (id: number) => {
    deleteItem({ variables: { id } });
    setNotification(client, `${listItemName} deleted Successfully`);
  };

  // Reformat all items to be entered in table
  function getIcons(id: number | undefined, label: string) {
    if (id) {
      return (
        <div className={styles.Icons}>
          <Link to={`/${pageLink}/` + id + '/edit'}>
            <IconButton aria-label="Edit" color="default" data-testid="EditIcon">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton
            aria-label="Delete"
            color="default"
            data-testid="DeleteIcon"
            onClick={() => showDialogHandler(id!, label)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      );
    }
  }

  function formatList(listItems: Array<any>) {
    return listItems.map(({ ...listItem }) => {
      return {
        ...columns(listItem),
        operations: getIcons(listItem.id, listItem.label),
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
    let searchVal = e.target.searchInput.value.trim();
    setSearchVal(searchVal);
    resetTableVals();
  };

  // Get item data and total number of items.
  let itemList: any;
  if (data) {
    itemList = formatList(data[listItem]);
  }

  let itemCount: number = tableVals.pageRows;
  if (countData) {
    itemCount = countData['count' + listItem[0].toUpperCase() + listItem.slice(1)];
  }

  return (
    <>
      <div className={styles.Header}>
        <Typography variant="h5" className={styles.Title}>
          <IconButton disabled={true} className={styles.Icon}>
            {listIcon}
          </IconButton>
          {title}
        </Typography>
        <div className={styles.Buttons}>
          <SearchBar
            handleSubmit={handleSearch}
            onReset={() => {
              setSearchVal('');
              resetTableVals();
            }}
            searchVal={searchVal}
          />
        </div>
        <div>
          {toastMessage}
          {dialogBox}
          <div className={styles.AddButton}>
            <Button color="primary" variant="contained" onClick={() => setNewItem(true)}>
              {buttonLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Rendering list of items */}
      {itemList ? (
        <Pager
          columnStyles={columnStyles}
          columnNames={columnNames}
          data={itemList}
          totalRows={itemCount}
          handleTableChange={handleTableChange}
          tableVals={tableVals}
        />
      ) : (
        <div>There are no {listItemName}s.</div>
      )}
    </>
  );
};
