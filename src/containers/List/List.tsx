import { useState, useEffect, useCallback, Fragment } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, DocumentNode, useLazyQuery } from '@apollo/client';
import {
  Divider,
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
  TableRow,
} from '@mui/material';
import { ListCard } from 'containers/List/ListCard/ListCard';
import { Button } from 'components/UI/Form/Button/Button';
import { Pager } from 'components/UI/Pager/Pager';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';

import MoreOptions from 'assets/images/icons/MoreOptions.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import BackIcon from 'assets/images/icons/Back.svg?react';
import AddIcon from 'assets/images/add.svg?react';
import { GET_CURRENT_USER } from 'graphql/queries/User';
import { getUserRole, getUserRolePermissions } from 'context/role';
import { setNotification, setErrorMessage } from 'common/notification';
import { getUpdatedList, setListSession, getLastListSessionValues } from 'services/ListService';
import styles from './List.module.css';
import Track from 'services/TrackService';
import Loading from 'components/UI/Layout/Loading/Loading';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';

const actionListMap = (item: any, actionList: any, hasMoreOption: boolean) => {
  return actionList.map((action: any, index: number) => {
    // check if we are dealing with nested element
    let additionalActionParameter: any;
    const params: any = action.parameter.split('.');
    if (params.length > 1) {
      additionalActionParameter = item[params[0]][params[1]];
    } else {
      additionalActionParameter = item[params[0]];
    }
    const key = index;

    if (action.hidden) {
      return null;
    }
    if (hasMoreOption) {
      return (
        <Fragment key={key}>
          <Divider className={styles.Divider} />
          <MenuItem className={styles.MenuItem}>
            <div
              data-testid="additionalButton"
              id="additionalButton-icon"
              onClick={() => action.dialog(additionalActionParameter, item)}
            >
              <div className={styles.IconWithText}>
                {action.icon}
                <div className={styles.TextButton}>{action.label}</div>
              </div>
            </div>
          </MenuItem>
        </Fragment>
      );
    }

    if (action.textButton) {
      return (
        <div
          className={styles.ViewButton}
          onClick={() => action.dialog(additionalActionParameter, item)}
          key={key}
        >
          {action.textButton}
        </div>
      );
    }

    if (action.link) {
      return (
        <Link to={`${action.link}/${additionalActionParameter}`} key={key}>
          <IconButton className={styles.additonalButton} data-testid="additionalButton">
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
    return null;
  });
};
export interface ColumnNames {
  name?: string;
  label: string;
  sort?: boolean;
  order?: string;
}

export interface HelpDataProps {
  heading: string;
  body: JSX.Element;
  link: string;
}

export interface ListProps {
  descriptionBox?: any;
  loadingList?: boolean;
  columnNames?: Array<ColumnNames>;
  countQuery: DocumentNode;
  listItem: string;
  filterItemsQuery: DocumentNode;
  deleteItemQuery: DocumentNode | null;
  listItemName: string;
  dialogMessage?: string | any;
  pageLink: string;
  columns: Function;
  listIcon: React.ReactNode;
  helpData?: HelpDataProps;
  columnStyles: Array<any>;
  secondaryButton?: any;
  title: string;
  button?: {
    show: boolean;
    label?: string;
    link?: string;
    action?: Function;
    symbol?: any;
  };
  searchParameter?: Array<any>;
  filters?: Object | null;
  filterList?: any;
  displayListType?: string;
  editSupport?: boolean;
  additionalAction?: (listValues: any) => Array<{
    icon: any;
    parameter: string;
    link?: string;
    dialog?: any;
    label?: string;
    button?: any;
  }>;
  deleteModifier?: {
    variables: any;
  };
  dialogTitle?: string;
  backLinkButton?: {
    text: string;
    link: string;
  };
  restrictedAction?: any;
  collapseOpen?: boolean;
  collapseRow?: string;
  showActions?: boolean;
  defaultSortBy?: string | null;
  noItemText?: string | null;
  customStyles?: any;
  showHeader?: boolean;
  refreshList?: boolean;
}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const List = ({
  descriptionBox = <></>,
  loadingList = false,
  columnNames = [],
  countQuery,
  listItem,
  filterItemsQuery,
  deleteItemQuery,
  listItemName,
  dialogMessage = '',
  helpData = {
    heading: '',
    body: <></>,
    link: '',
  },
  secondaryButton,
  pageLink,
  columns,
  columnStyles,
  title,
  dialogTitle,
  filterList,
  button = {
    show: true,
    label: 'Add New',
  },
  deleteModifier = { variables: null },
  editSupport = true,
  searchParameter = ['label'],
  filters = null,
  refreshList = false,
  displayListType = 'list',
  additionalAction = () => [],
  backLinkButton,
  restrictedAction,
  collapseOpen = false,
  collapseRow = undefined,
  noItemText = null,
  customStyles,
  showActions = true,
  showHeader = true,
}: ListProps) => {
  const { t } = useTranslation();
  const [showMoreOptions, setShowMoreOptions] = useState<string>('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  // DialogBox states
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [newItem, setNewItem] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // pick the search value from url if present
  const [searchVal, setSearchVal] = useState(new URLSearchParams(searchParams).get('search') || '');

  // check if the user has access to manage collections
  const userRolePermissions = getUserRolePermissions();
  const capitalListItemName = listItemName
    ? listItemName[0].toUpperCase() + listItemName.slice(1)
    : '';

  // function to get the default sorting set for columns
  const getDefaultSortColumn = (columnsFields: any) => {
    const sortColumn = columnsFields.find((field: any) => (field.sort ? field : ''));
    if (sortColumn) {
      return [sortColumn.name, sortColumn.order];
    }

    // if nothing is set assume first column is for sorting and order is 'asc'
    return [columnNames[0].name, 'asc'];
  };

  const [defaultColumnSort, defaultColumnSortOrder] = getDefaultSortColumn(columnNames);

  // get the last sort column value from local storage if exist else set the default column
  const getSortColumn = (listItemNameValue: string) => {
    // set the column name
    let columnnNameValue = defaultColumnSort;

    // check if we have sorting stored in local storage
    const sortValue = getLastListSessionValues(listItemNameValue, false);

    // update column name from the local storage
    if (sortValue) {
      columnnNameValue = sortValue;
    }

    return columnnNameValue;
  };

  // get the last sort direction value from local storage if exist else set the default order
  const getSortDirection = (listItemNameValue: string) => {
    let sortDirection = defaultColumnSortOrder;

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
    sortCol: getSortColumn(listItemName),
    sortDirection: getSortDirection(listItemName),
  });

  let userRole: any = getUserRole();

  const handleTableChange = (attribute: string, newVal: any) => {
    const isSortAttribute = attribute === 'sortCol' || attribute === 'sortDirection';
    if (isSortAttribute) {
      const updatedList = getUpdatedList(listItemName, newVal, attribute === 'sortDirection');
      setListSession(JSON.stringify(updatedList));
    }

    setTableVals({
      ...tableVals,
      [attribute]: newVal,
    });
  };

  let filter: any = {};

  if (searchVal !== '') {
    searchParameter.forEach((parameter: string) => {
      filter[parameter] = searchVal;
    });
  }
  filter = {
    ...filter,
    ...filters,
  };

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
  const [, { loading, error, data, refetch: refetchValues }] = useLazyQuery(filterItemsQuery, {
    variables: filterPayload(),
    fetchPolicy: 'cache-first',
  });

  // Get item data here
  const [fetchUserCollections, { loading: loadingCollections, data: userCollections }] =
    useLazyQuery(GET_CURRENT_USER);

  const checkUserRole = () => {
    userRole = getUserRole();
  };

  useEffect(() => {
    // Todo: refetching values twice. Need to think of a better way to do this
    refetchValues();
    refetchCount();
  }, [searchVal, filters, refreshList]);

  useEffect(() => {
    if (userRole.length === 0) {
      checkUserRole();
    } else {
      if (!userRolePermissions.manageCollections && listItem === 'collections') {
        // if user role staff then display collections related to login user
        fetchUserCollections();
      }
      Track(`Visit ${listItemName}`);
    }
  }, []);

  let deleteItem: any;

  // Make a new count request for a new count of the # of rows from this query in the back-end.
  if (deleteItemQuery) {
    [deleteItem] = useMutation(deleteItemQuery, {
      onCompleted: () => {
        setNotification(`${capitalListItemName} deleted successfully`);
        checkUserRole();
        refetchCount();
        if (refetchValues) {
          refetchValues(filterPayload());
        }
      },
      onError: () => {
        setNotification(`Sorry! An error occurred!`, 'warning');
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
  };

  const handleDeleteItem = () => {
    if (deleteItemID !== null) {
      deleteHandler(deleteItemID);
    }
    setDeleteItemID(null);
  };

  const useDelete = (message: string | any) => {
    if (typeof message === 'string') {
      const props = { handleOk: handleDeleteItem };
      return {
        component: message,
        props,
      };
    } else {
      /**
       * Custom component to render
       * message should contain 3 params
       * 1. component: Component to render
       * 2. props: props to pass to dialog component
       */

      const dialogParams = {
        deleteItemID,
        deleteItemName,
        refetch: refetchValues,
        setDeleteItemID,
      };
      const { component, props } = message(dialogParams);
      if (!props.handleOk) {
        props.handleOk = handleDeleteItem;
      }
      return {
        component,
        props,
      };
    }
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
        colorOk="warning"
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
    return <Navigate to={`/${pageLink}/add`} />;
  }

  if (error || e) {
    if (error) {
      setErrorMessage(error);
    } else if (e) {
      setErrorMessage(e);
    }
    return null;
  }

  // Reformat all items to be entered in table
  function getIcons(
    // id: number | undefined,
    item: any,
    allowedAction: any | null
  ) {
    // there might be a case when we might want to allow certain actions for reserved items
    // currently we don't allow edit or delete for reserved items. hence return early
    const { id, label, name, isReserved } = item;

    let labelValue = label;

    if (name) {
      labelValue = name;
    }

    if (isReserved) {
      return null;
    }
    let moreButton = null;

    let editButton = null;
    if (editSupport) {
      editButton = allowedAction.edit && (
        <Link to={`/${pageLink}/${id}/edit`} className={styles.NoTextDecoration}>
          <div aria-label={t('Edit')} data-testid="EditIcon">
            <div className={styles.IconWithText}>
              <EditIcon className={styles.IconSize} />
              <div className={styles.TextButton}>Edit</div>
            </div>
          </div>
        </Link>
      );
    }

    const deleteButton = (Id: any, text: string) =>
      allowedAction.delete ? (
        <div
          aria-label={t('Delete')}
          data-testid="DeleteIcon"
          onClick={() => showDialogHandler(Id, text)}
        >
          <div className={styles.IconWithText}>
            <DeleteIcon className={styles.IconSize} />
            <div className={styles.TextButton}>Delete</div>
          </div>
        </div>
      ) : null;

    const actionsInsideMore = additionalAction(item).filter((action: any) => action?.insideMore);
    const actionsOutsideMore = additionalAction(item).filter((action: any) => !action?.insideMore);

    if (actionsInsideMore.length > 0 || allowedAction.edit || allowedAction.delete) {
      moreButton = (
        <IconButton
          data-testid="MoreIcon"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
            if (showMoreOptions == id) {
              setShowMoreOptions('');
            } else {
              setShowMoreOptions(id);
            }
          }}
        >
          <Tooltip title={t('More')} placement="top">
            <div className={styles.MoreOptionsIcon}>
              <MoreOptions />
            </div>
          </Tooltip>
        </IconButton>
      );
    }

    if (id) {
      return (
        <div className={styles.Icons}>
          {actionListMap(item, actionsOutsideMore, false)}

          {/* do not display edit & delete for staff role in collection */}
          {userRolePermissions.manageCollections || item !== 'collections' ? (
            <div className={styles.MoreOptions}>
              {moreButton}
              {showMoreOptions == id && (
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  classes={{ list: styles.MenuList }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <div>
                    <MenuItem className={styles.MenuItem}> {editButton}</MenuItem>
                    <Divider className={styles.Divider} />
                    <MenuItem className={styles.MenuItem}> {deleteButton(id, labelValue)}</MenuItem>
                    {actionListMap(item, actionsInsideMore, true)}
                  </div>
                </Menu>
              )}
            </div>
          ) : null}
        </div>
      );
    }
    return null;
  }

  function formatList(listItems: Array<any>) {
    return listItems
      ? listItems.map(({ ...listItemObj }) => {
          // display only actions allowed to the user
          const allowedAction = restrictedAction
            ? restrictedAction(listItemObj)
            : { chat: true, edit: true, delete: true };

          const items = {
            ...columns(listItemObj),

            recordId: listItemObj.id,
            isActive: listItemObj.isActive,
          };
          if (showActions) {
            items.operations = getIcons(listItemObj, allowedAction);
          }
          return items;
        })
      : [];
  }

  const resetTableVals = () => {
    setTableVals({
      pageNum: 0,
      pageRows: 50,
      sortCol: getSortColumn(listItemName),
      sortDirection: getSortDirection(listItemName),
    });
  };

  const handleSearch = (searchError: any) => {
    searchError.preventDefault();
    const searchValInput = searchError.target.querySelector('input').value.trim();

    setSearchParams({
      search: searchValInput,
    });
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

  var noItemsText = (
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
        collapseOpen={collapseOpen}
        collapseRow={collapseRow}
        loadingList={loadingList || loading || l || loadingCollections}
        noItemsText={noItemsText}
      />
    );
  } else if (displayListType === 'card') {
    /* istanbul ignore next */
    displayList = loading ? (
      <Loading />
    ) : (
      <>
        <ListCard columnStyles={columnStyles} data={itemList} />
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
    const addIcon = <AddIcon className={styles.AddIcon} />;
    if (!button.symbol) {
      button.symbol = addIcon;
    }

    let buttonContent;
    if (button.action) {
      buttonContent = (
        <Button
          color="primary"
          variant="contained"
          onClick={() => button.action && button.action()}
        >
          {button.symbol} {button.label}
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
          {button.symbol} {button.label}
        </Button>
      );
    } else {
      buttonContent = (
        <Link to={button.link}>
          <Button color="primary" variant="contained" data-testid="newItemLink">
            {button.symbol} {button.label}
          </Button>
        </Link>
      );
    }
    buttonDisplay = <div className={styles.AddButton}>{buttonContent}</div>;
  }

  return (
    <>
      {showHeader && (
        <>
          <div className={styles.Header} data-testid="listHeader">
            <div>
              <div className={styles.Title}>
                <div className={styles.TitleText}> {title}</div>
                <HelpIcon helpData={helpData} />
              </div>
            </div>
            <div>
              {dialogBox}
              <div className={styles.ButtonGroup}>
                {secondaryButton}
                {buttonDisplay}
              </div>
            </div>
          </div>
          {/* description box */}
          {descriptionBox}

          <div className={styles.FilterFields}>
            <div className={styles.FlexCenter}>
              {filterList}
              {backLink}
            </div>
            <div className={styles.Buttons}>
              <SearchBar
                handleSubmit={handleSearch}
                onReset={() => {
                  setSearchParams({ search: '' });
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
          </div>
        </>
      )}
      <div className={`${styles.Body} ${customStyles}`}>
        {/* Rendering list of items */}
        {displayList}
      </div>
    </>
  );
};
