import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation, DocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setNotification, setErrorMessage } from '../../common/notification';
import { IconButton, Typography } from '@material-ui/core';
import { Button } from '../../components/UI/Form/Button/Button';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { Pager } from '../../components/UI/Pager/Pager';
import { NOTIFICATION } from '../../graphql/queries/Notification';
import { ToastMessage } from '../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import styles from './List.module.css';
import SearchBar from '../../components/UI/SearchBar/SearchBar';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/Red.svg';
import { ReactComponent as EditIcon } from '../../assets/images/icons/Edit.svg';
import { ListCard } from './ListCard/ListCard';

export interface ListProps {
  columnNames?: Array<string>;
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
  showCheckbox?: boolean;
  searchParameter?: string;
  filters?: any;
  displayListType?: string;
  cardLink?: string | null;
  additionalAction?: {
    icon: any;
    parameter: string;
    link: string;
  } | null;
}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const List: React.SFC<ListProps> = ({
  columnNames = [],
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
  showCheckbox,
  searchParameter = 'label',
  filters = null,
  displayListType = 'list',
  cardLink = null,
  additionalAction = null,
}: ListProps) => {
  const client = useApolloClient();

  // DialogBox states
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');

  const [newItem, setNewItem] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const capitalListItemName = listItemName[0].toUpperCase() + listItemName.slice(1);

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
  let filter: any = {};
  filter[searchParameter] = searchVal;
  filter = { ...filter, ...filters };
  const filterPayload = useCallback(() => {
    return {
      filter,
      opts: {
        limit: tableVals.pageRows,
        offset: tableVals.pageNum * tableVals.pageRows,
        order: tableVals.sortDirection.toUpperCase(),
      },
    };
  }, [searchVal, tableVals]);

  // Get the total number of items here
  const { loading: l, error: e, data: countData, refetch: refetchCount } = useQuery(countQuery, {
    variables: { filter },
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
  if (error || e) {
    if (error) {
      setErrorMessage(client, error);
    } else if (e) {
      setErrorMessage(client, e);
    }
    return null;
  }

  const deleteHandler = (id: number) => {
    deleteItem({ variables: { id } });
    setNotification(client, `${capitalListItemName} deleted successfully`);
  };

  // Reformat all items to be entered in table
  function getIcons(
    id: number | undefined,
    label: string,
    isReserved: boolean | null,
    additionalActionParameter: string
  ) {
    // there might be a case when we might want to allow certain actions for reserved items
    // currently we don't allow edit or delete for reserved items. hence return early
    if (isReserved) {
      return null;
    }

    if (id) {
      return (
        <div className={styles.Icons}>
          {additionalAction ? (
            <Link to={`${additionalAction?.link}/${additionalActionParameter}`}>
              <IconButton color="default" className={styles.additonalButton}>
                {additionalAction.icon}
              </IconButton>
            </Link>
          ) : null}
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
      const label = listItem.label ? listItem.label : listItem.name;
      const isReserved = listItem.isReserved ? listItem.isReserved : null;
      const action = additionalAction ? listItem[additionalAction.parameter] : null;
      return {
        ...columns(listItem),
        operations: getIcons(listItem.id, label, isReserved, action),
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
    let searchVal = e.target.querySelector('input').value.trim();
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

  let displayList;
  if (displayListType === 'list') {
    displayList = (
      <Pager
        columnStyles={columnStyles}
        columnNames={columnNames}
        data={itemList}
        totalRows={itemCount}
        handleTableChange={handleTableChange}
        tableVals={tableVals}
        showCheckbox={showCheckbox}
      />
    );
  } else if (displayListType === 'card') {
    displayList = <ListCard data={itemList} link={cardLink} />;
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
      {itemList ? displayList : <div>There are no {listItemName}s.</div>}
    </>
  );
};
