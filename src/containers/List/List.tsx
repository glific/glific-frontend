import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, DocumentNode, useLazyQuery, useApolloClient } from '@apollo/client';
import { IconButton, TableFooter, TablePagination, TableRow, Typography } from '@material-ui/core';

import { ListCard } from 'containers/List/ListCard/ListCard';
import { Button } from 'components/UI/Form/Button/Button';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Pager } from 'components/UI/Pager/Pager';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { ReactComponent as DeleteIcon } from 'assets/images/icons/Delete/Red.svg';
import { ReactComponent as EditIcon } from 'assets/images/icons/Edit.svg';
import { ReactComponent as CrossIcon } from 'assets/images/icons/Cross.svg';
import { ReactComponent as BackIcon } from 'assets/images/icons/Back.svg';
import { GET_CURRENT_USER } from 'graphql/queries/User';
import { getUserRole, getUserRolePermissions } from 'context/role';
import { setNotification, setErrorMessage } from 'common/notification';
import { setColumnToBackendTerms } from 'common/constants';
import { getUpdatedList, setListSession, getLastListSessionValues } from 'services/ListService';
import styles from './List.module.css';

export interface ListProps {
  columnNames?: Array<string>;
  countQuery: DocumentNode;
  listItem: string;
  filterItemsQuery: DocumentNode;
  deleteItemQuery: DocumentNode | null;
  listItemName: string;
  dialogMessage?: string | any;
  pageLink: string;
  columns: Function;
  listIcon: Object;
  columnStyles: Array<any>;
  secondaryButton?: any;
  title: string;
  button?: {
    show: boolean;
    label?: string;
    link?: string;
    action?: Function;
  };
  showCheckbox?: boolean;
  searchParameter?: string;
  filters?: Object | null;
  filterList?: any;
  listOrder?: 'asc' | 'desc';
  displayListType?: string;
  cardLink?: Object | null;
  editSupport?: boolean;
  additionalAction?: Array<{
    icon: any;
    parameter: string;
    link?: string;
    dialog?: any;
    label?: string;
    button?: any;
  }>;
  deleteModifier?: {
    icon: string;
    variables: any;
    label?: string;
  };
  dialogTitle?: string;
  backLinkButton?: {
    text: string;
    link: string;
  };
  restrictedAction?: any;
  collapseOpen?: boolean;
  collapseRow?: string;
  defaultSortBy?: string | null;
  removeSortBy?: Array<any> | null;
  noItemText?: string | null;
  isDetailsPage?: boolean;
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
  dialogMessage = '',
  secondaryButton,
  pageLink,
  columns,
  columnStyles,
  title,
  dialogTitle,
  filterList,
  listOrder = 'asc',
  removeSortBy = null,
  button = {
    show: true,
    label: 'Add New',
  },
  showCheckbox,
  deleteModifier = { icon: 'normal', variables: null, label: 'Delete' },
  editSupport = true,
  searchParameter = 'label',
  filters = null,
  displayListType = 'list',
  cardLink = null,
  additionalAction = [],
  backLinkButton,
  restrictedAction,
  collapseOpen = false,
  collapseRow = undefined,
  defaultSortBy,
  noItemText = null,
  isDetailsPage = false,
}: ListProps) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  // DialogBox states
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [newItem, setNewItem] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // check if the user has access to manage collections
  const userRolePermissions = getUserRolePermissions();
  const capitalListItemName = listItemName
    ? listItemName[0].toUpperCase() + listItemName.slice(1)
    : '';
  let defaultColumnSort = columnNames[0];

  // check if there is a default column set for sorting
  if (defaultSortBy) {
    defaultColumnSort = defaultSortBy;
  }
  // get the last sort column value from local storage if exist else set the default column
  const getSortColumn = (listItemNameValue: string, columnName: string) => {
    // set the column name
    let columnnNameValue;
    if (columnName) {
      columnnNameValue = columnName;
    }

    // check if we have sorting stored in local storage
    const sortValue = getLastListSessionValues(listItemNameValue, false);

    // update column name from the local storage
    if (sortValue) {
      columnnNameValue = sortValue;
    }

    return setColumnToBackendTerms(listItemName, columnnNameValue);
  };

  // get the last sort direction value from local storage if exist else set the default order
  const getSortDirection = (listItemNameValue: string) => {
    let sortDirection: any = listOrder;

    // check if we have sorting stored in local storage
    const sortValue = getLastListSessionValues(listItemNameValue, true);
    if (sortValue) {
      sortDirection = sortValue;
    }

    return sortDirection;
  };

  // Table attributes
  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 50,
    sortCol: getSortColumn(listItemName, defaultColumnSort),
    sortDirection: getSortDirection(listItemName),
  });

  let userRole: any = getUserRole();

  const handleTableChange = (attribute: string, newVal: any) => {
    let updatedList;
    let attributeValue = newVal;
    if (attribute === 'sortCol') {
      attributeValue = setColumnToBackendTerms(listItemName, newVal);
      updatedList = getUpdatedList(listItemName, newVal, false);
    } else {
      updatedList = getUpdatedList(listItemName, newVal, true);
    }

    // set the sort criteria in local storage
    setListSession(JSON.stringify(updatedList));

    setTableVals({
      ...tableVals,
      [attribute]: attributeValue,
    });
  };

  let filter: any = {};

  if (searchVal !== '') {
    filter[searchParameter] = searchVal;
  }
  filter = { ...filter, ...filters };

  const filterPayload = useCallback(() => {
    let order = 'ASC';
    if (tableVals.sortDirection) {
      order = tableVals.sortDirection.toUpperCase();
    }
    return {
      filter,
      opts: {
        limit: tableVals.pageRows,
        offset: tableVals.pageNum * tableVals.pageRows,
        order,
        orderWith: tableVals.sortCol,
      },
    };
  }, [searchVal, tableVals, filters]);

  // Get the total number of items here
  const {
    loading: l,
    error: e,
    data: countData,
    refetch: refetchCount,
  } = useQuery(countQuery, {
    variables: { filter },
  });

  // Get item data here
  const [fetchQuery, { loading, error, data, refetch: refetchValues }] = useLazyQuery(
    filterItemsQuery,
    {
      variables: filterPayload(),
      fetchPolicy: 'cache-and-network',
    }
  );
  // Get item data here
  const [fetchUserCollections, { loading: loadingCollections, data: userCollections }] =
    useLazyQuery(GET_CURRENT_USER);

  const checkUserRole = () => {
    userRole = getUserRole();
  };

  useEffect(() => {
    refetchCount();
  }, [filterPayload, searchVal, filters]);

  useEffect(() => {
    if (userRole.length === 0) {
      checkUserRole();
    } else {
      if (!userRolePermissions.manageCollections && listItem === 'collections') {
        // if user role staff then display collections related to login user
        fetchUserCollections();
      }
      fetchQuery();
    }
  }, [userRole]);

  let deleteItem: any;

  // Make a new count request for a new count of the # of rows from this query in the back-end.
  if (deleteItemQuery) {
    [deleteItem] = useMutation(deleteItemQuery, {
      onCompleted: () => {
        checkUserRole();
        refetchCount();
        if (refetchValues) {
          refetchValues(filterPayload());
        }
      },
    });
  }

  const showDialogHandler = (id: any, label: string) => {
    setDeleteItemName(label);
    setDeleteItemID(id);
  };

  const closeDialogBox = () => {
    setDeleteItemID(null);
  };

  const deleteHandler = (id: number) => {
    const variables = deleteModifier.variables ? deleteModifier.variables(id) : { id };
    deleteItem({ variables });
    setNotification(client, `${capitalListItemName} deleted successfully`);
  };

  const handleDeleteItem = () => {
    if (deleteItemID !== null) {
      deleteHandler(deleteItemID);
    }
    setDeleteItemID(null);
  };

  const useDelete = (message: string | any) => {
    let component = {};
    const props = { disableOk: false, handleOk: handleDeleteItem };
    if (typeof message === 'string') {
      component = message;
    } else {
      /**
       * Custom component to render
       * message should contain 3 params
       * 1. component: Component to render
       * 2. isConfirm: To check true or false value
       * 3. handleOkCallback: Callback action to delete item
       */
      const {
        component: componentToRender,
        isConfirmed,
        handleOkCallback,
      } = message(deleteItemID, deleteItemName);
      component = componentToRender;
      props.disableOk = !isConfirmed;
      props.handleOk = () => handleOkCallback({ refetch: fetchQuery, setDeleteItemID });
    }

    return {
      component,
      props,
    };
  };

  let dialogBox;
  if (deleteItemID) {
    const { component, props } = useDelete(dialogMessage);
    dialogBox = (
      <DialogBox
        title={
          dialogTitle || `Are you sure you want to delete the ${listItemName} "${deleteItemName}"?`
        }
        handleCancel={closeDialogBox}
        colorOk="secondary"
        alignButtons="center"
        {...props}
      >
        <div className={styles.DialogText}>
          <div>{component}</div>
        </div>
      </DialogBox>
    );
  }

  if (newItem) {
    return <Redirect to={`/${pageLink}/add`} />;
  }

  if (loading || l || loadingCollections) return <Loading />;
  if (error || e) {
    if (error) {
      setErrorMessage(client, error);
    } else if (e) {
      setErrorMessage(client, e);
    }
    return null;
  }

  // Reformat all items to be entered in table
  function getIcons(
    // id: number | undefined,
    item: any,
    label: string,
    isReserved: boolean | null,
    listItems: any,
    allowedAction: any | null
  ) {
    // there might be a case when we might want to allow certain actions for reserved items
    // currently we don't allow edit or delete for reserved items. hence return early
    const { id } = item;
    if (isReserved) {
      return null;
    }
    let editButton = null;
    if (editSupport) {
      editButton = allowedAction.edit && (
        <Link to={`/${pageLink}/${id}/edit`}>
          <IconButton aria-label={t('Edit')} color="default" data-testid="EditIcon">
            <Tooltip title={t('Edit')} placement="top">
              <EditIcon />
            </Tooltip>
          </IconButton>
        </Link>
      );
    }

    const deleteButton = (Id: any, text: string) =>
      allowedAction.delete ? (
        <IconButton
          aria-label={t('Delete')}
          color="default"
          data-testid="DeleteIcon"
          onClick={() => showDialogHandler(Id, text)}
        >
          <Tooltip title={`${deleteModifier.label}`} placement="top">
            {deleteModifier.icon === 'cross' ? <CrossIcon /> : <DeleteIcon />}
          </Tooltip>
        </IconButton>
      ) : null;
    if (id) {
      return (
        <div className={styles.Icons}>
          {additionalAction.map((action: any, index: number) => {
            // check if we are dealing with nested element
            let additionalActionParameter: any;
            const params: any = additionalAction[index].parameter.split('.');
            if (params.length > 1) {
              additionalActionParameter = listItems[params[0]][params[1]];
            } else {
              additionalActionParameter = listItems[params[0]];
            }
            const key = index;

            if (action.link) {
              return (
                <Link to={`${action.link}/${additionalActionParameter}`} key={key}>
                  <IconButton
                    color="default"
                    className={styles.additonalButton}
                    data-testid="additionalButton"
                  >
                    <Tooltip title={`${action.label}`} placement="top">
                      {action.icon}
                    </Tooltip>
                  </IconButton>
                </Link>
              );
            }
            if (action.dialog) {
              return (
                <IconButton
                  color="default"
                  data-testid="additionalButton"
                  className={styles.additonalButton}
                  id="additionalButton-icon"
                  onClick={() => action.dialog(additionalActionParameter, item)}
                  key={key}
                >
                  <Tooltip title={`${action.label}`} placement="top" key={key}>
                    {action.icon}
                  </Tooltip>
                </IconButton>
              );
            }
            if (action.button) {
              return action.button(listItems, action, key, fetchQuery);
            }
            return null;
          })}

          {/* do not display edit & delete for staff role in collection */}
          {userRolePermissions.manageCollections || listItems !== 'collections' ? (
            <>
              {editButton}
              {deleteButton(id, label)}
            </>
          ) : null}
        </div>
      );
    }
    return null;
  }

  function formatList(listItems: Array<any>) {
    return listItems.map(({ ...listItemObj }) => {
      const label = listItemObj.label ? listItemObj.label : listItemObj.name;
      const isReserved = listItemObj.isReserved ? listItemObj.isReserved : null;
      // display only actions allowed to the user
      const allowedAction = restrictedAction
        ? restrictedAction(listItemObj)
        : { chat: true, edit: true, delete: true };
      return {
        ...columns(listItemObj),
        operations: getIcons(listItemObj, label, isReserved, listItemObj, allowedAction),
        recordId: listItemObj.id,
      };
    });
  }

  const resetTableVals = () => {
    setTableVals({
      pageNum: 0,
      pageRows: 50,
      sortCol: getSortColumn(listItemName, defaultColumnSort),
      sortDirection: getSortDirection(listItemName),
    });
  };

  const handleSearch = (searchError: any) => {
    searchError.preventDefault();
    const searchValInput = searchError.target.querySelector('input').value.trim();
    setSearchVal(searchValInput);
    resetTableVals();
  };

  // Get item data and total number of items.
  let itemList: any = [];
  if (data) {
    itemList = formatList(data[listItem]);
  }

  if (userCollections) {
    if (listItem === 'collections') {
      itemList = formatList(userCollections.currentUser.user.groups);
    }
  }

  let itemCount: number = tableVals.pageRows;
  if (countData) {
    itemCount = countData[`count${listItem[0].toUpperCase()}${listItem.slice(1)}`];
  }
  let displayList;
  if (displayListType === 'list') {
    displayList = (
      <Pager
        columnStyles={columnStyles}
        removeSortBy={removeSortBy !== null ? removeSortBy : []}
        columnNames={columnNames}
        data={itemList}
        listItemName={listItemName}
        totalRows={itemCount}
        handleTableChange={handleTableChange}
        tableVals={tableVals}
        showCheckbox={showCheckbox}
        collapseOpen={collapseOpen}
        collapseRow={collapseRow}
      />
    );
  } else if (displayListType === 'card') {
    /* istanbul ignore next */
    displayList = (
      <>
        <ListCard data={itemList} link={cardLink} />
        <table>
          <TableFooter className={styles.TableFooter} data-testid="tableFooter">
            <TableRow>
              <TablePagination
                className={styles.FooterRow}
                colSpan={columnNames.length}
                count={itemCount}
                onPageChange={(event, newPage) => {
                  handleTableChange('pageNum', newPage);
                }}
                onRowsPerPageChange={(event) => {
                  handleTableChange('pageRows', parseInt(event.target.value, 10));
                }}
                page={tableVals.pageNum}
                rowsPerPage={tableVals.pageRows}
                rowsPerPageOptions={[50, 75, 100, 150, 200]}
              />
            </TableRow>
          </TableFooter>
        </table>
      </>
    );
  }

  const backLink = backLinkButton ? (
    <div className={styles.BackLink}>
      <Link to={backLinkButton.link}>
        <BackIcon />
        {backLinkButton.text}
      </Link>
    </div>
  ) : null;

  let buttonDisplay;
  if (button.show) {
    let buttonContent;
    if (button.action) {
      buttonContent = (
        <Button
          color="primary"
          variant="contained"
          onClick={() => button.action && button.action()}
        >
          {button.label}
        </Button>
      );
    } else if (!button.link) {
      buttonContent = (
        <Button
          color="primary"
          variant="contained"
          onClick={() => setNewItem(true)}
          data-testid="newItemButton"
        >
          {button.label}
        </Button>
      );
    } else {
      buttonContent = (
        <Link to={button.link}>
          <Button color="primary" variant="contained" data-testid="newItemLink">
            {button.label}
          </Button>
        </Link>
      );
    }
    buttonDisplay = <div className={styles.AddButton}>{buttonContent}</div>;
  }

  const noItemsText = (
    <div className={styles.NoResults}>
      {searchVal ? (
        <div>{t('Sorry, no results found! Please try a different search.')}</div>
      ) : (
        <div>
          There are no {noItemText || listItemName}s right now.{' '}
          {button.show && t('Please create one.')}
        </div>
      )}
    </div>
  );

  let headerSize = styles.Header;

  if (isDetailsPage) {
    headerSize = styles.DetailsPageHeader;
  }

  return (
    <>
      <div className={headerSize} data-testid="listHeader">
        <Typography variant="h5" className={styles.Title}>
          <IconButton disabled className={styles.Icon}>
            {listIcon}
          </IconButton>
          {title}
        </Typography>
        {filterList}
        <div className={styles.Buttons}>
          <SearchBar
            handleSubmit={handleSearch}
            onReset={() => {
              setSearchVal('');
              resetTableVals();
            }}
            searchVal={searchVal}
            handleChange={(err: any) => {
              // reset value only if empty
              if (!err.target.value) setSearchVal('');
            }}
            searchMode
          />
        </div>
        <div>
          {dialogBox}
          <div className={styles.ButtonGroup}>
            {buttonDisplay}
            {secondaryButton}
          </div>
        </div>
      </div>

      <div className={styles.Body}>
        {backLink}
        {/* Rendering list of items */}
        {itemList.length > 0 ? displayList : noItemsText}
      </div>
    </>
  );
};
