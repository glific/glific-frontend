import { useState, useEffect, useCallback, Fragment } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, DocumentNode, useLazyQuery } from '@apollo/client';
import { Backdrop, Checkbox, Divider, IconButton, Menu, MenuItem } from '@mui/material';

import { Button } from 'components/UI/Form/Button/Button';
import { Pager } from 'components/UI/Pager/Pager';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';

import MoreOptions from 'assets/images/icons/MoreOptions.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import BackIcon from 'assets/images/icons/BackIconFlow.svg?react';
import AddIcon from 'assets/images/add.svg?react';
import { GET_CURRENT_USER } from 'graphql/queries/User';
import { getUserRole, getUserRolePermissions } from 'context/role';
import { setNotification, setErrorMessage } from 'common/notification';
import { getUpdatedList, setListSession, getLastListSessionValues } from 'services/ListService';
import styles from './List.module.css';
import Track from 'services/TrackService';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';
import { HelpDataProps } from 'common/HelpData';

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

    if (action.link) {
      return (
        <Link to={`${action.link}/${additionalActionParameter}`} key={key}>
          <Tooltip title={`${action.label}`} placement="top">
            <IconButton className={styles.additonalButton} data-testid="additionalButton">
              {action.icon}
            </IconButton>
          </Tooltip>
        </Link>
      );
    }
    if (action.dialog) {
      return (
        <Tooltip title={`${action.label}`} placement="top" key={key}>
          <IconButton
            data-testid="additionalButton"
            className={styles.additonalButton}
            id="additionalButton-icon"
            onClick={() => action.dialog(additionalActionParameter, item)}
            key={key}
          >
            {action.icon}
          </IconButton>{' '}
        </Tooltip>
      );
    }
    return null;
  });
};
export interface ColumnNames {
  name?: string;
  label: any;
  sort?: boolean;
  order?: string;
}

export interface ListProps {
  descriptionBox?: any;
  loadingList?: boolean;
  columnNames?: Array<ColumnNames>;
  countQuery?: DocumentNode;
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
  backLink?: string;

  restrictedAction?: any;
  collapseOpen?: boolean;
  collapseRow?: string;
  showActions?: boolean;
  defaultSortBy?: string | null;
  noItemText?: string | null;
  customStyles?: any;
  showHeader?: boolean;
  refreshList?: boolean;
  showSearch?: boolean;

  refetchQueries?: any;

  checkbox?: { show: boolean; action: any; selectedItems: any[]; setSelectedItems: any; icon: any };
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
  helpData,
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
  additionalAction = () => [],
  backLink,

  restrictedAction,
  collapseOpen = false,
  collapseRow = undefined,
  noItemText = null,
  customStyles,
  showActions = true,
  showHeader = true,
  showSearch = true,

  refetchQueries,

  checkbox,
}: ListProps) => {
  const { t } = useTranslation();
  const [showMoreOptions, setShowMoreOptions] = useState<string>('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();

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

  let refetchCount: any;
  let countData;
  let e;
  let l;

  if (countQuery) {
    [, { data: countData, error: e, loading: l, refetch: refetchCount }] = useLazyQuery(
      countQuery,
      {
        variables: { filter },
      }
    );
  }

  // Get item data here
  const [, { loading, error, refetch: refetchValues }] = useLazyQuery(filterItemsQuery, {
    variables: filterPayload(),
    fetchPolicy: 'cache-first',
  });

  const data: any = {
    tickets: [
      {
        __typename: 'Ticket',
        body: '@results',
        contact: {
          __typename: 'Contact',
          fields: '{}',
          id: '2285262',
          maskedPhone: '9199******48',
          name: 'Tuba Afreen',
        },
        id: '24811',
        insertedAt: '2024-08-27T07:54:09Z',
        messageNumber: 7,
        remarks: null,
        status: 'open',
        topic: 'counsellor_queries',
        updatedAt: '2024-08-27T07:54:09Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: '@results',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"0 - 17","type":"string","label":"user_age_group","inserted_at":"2024-04-24T13:08:59.709543Z"},"state":{"value":"@results.location.prov","type":"string","label":"State","inserted_at":"2024-07-17T06:21:06.401858Z"},"preferred_name":{"value":"Yes","type":"string","label":"preferred_name","inserted_at":"2024-07-16T06:07:58.312947Z"},"name":{"value":"Glific Simulator Five","type":"string","label":"Name","inserted_at":"2024-07-16T06:09:00.624576Z"},"long":{"value":"-49.946944","type":"string","label":"long","inserted_at":"2024-07-17T06:21:05.158889Z"},"lat":{"value":"41.725556","type":"string","label":"lat","inserted_at":"2024-07-17T06:21:05.132487Z"},"keyword":{"value":"hi","type":"string","label":"keyword","inserted_at":"2024-07-05T12:58:28.295046Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-04-24T13:08:59.780595Z"},"gender":{"value":"Female","type":"string","label":"Gender","inserted_at":"2024-07-16T06:08:09.168392Z"},"district":{"value":"@results.location.region","type":"string","label":"District","inserted_at":"2024-07-17T06:21:06.372604Z"},"city":{"value":"@results.location.city","type":"string","label":"city","inserted_at":"2024-07-17T06:21:06.335362Z"},"age_group":{"value":"21-30","type":"string","label":"Age Group","inserted_at":"2024-07-16T06:09:02.826006Z"}}',
          id: '15293',
          maskedPhone: '9876******_5',
          name: 'Glific Simulator Five',
        },
        id: '24257',
        insertedAt: '2024-08-21T10:31:09Z',
        messageNumber: 735,
        remarks: null,
        status: 'open',
        topic: 'counsellor_queries',
        updatedAt: '2024-08-21T10:31:09Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: '@results',
        contact: {
          __typename: 'Contact',
          fields:
            '{"state":{"value":"Delhi","type":"string","label":"State","inserted_at":"2024-07-30T08:18:26.569168Z"},"school_id":{"value":"test1","type":"string","label":"School ID","inserted_at":"2024-07-16T04:11:58.082676Z"},"name":{"value":"name2","type":"string","label":"Name","inserted_at":"2024-08-26T05:37:05.104332Z"},"long":{"value":"77.1005630493164","type":"string","label":"long","inserted_at":"2024-07-30T08:18:25.348683Z"},"lat":{"value":"28.528486251831055","type":"string","label":"lat","inserted_at":"2024-07-30T08:18:25.336886Z"},"keyword":{"value":"hi","type":"string","label":"keyword","inserted_at":"2024-08-26T05:34:24.220400Z"},"district":{"value":"South West Delhi","type":"string","label":"District","inserted_at":"2024-07-30T08:18:26.557515Z"},"city":{"value":"Nidra","type":"string","label":"city","inserted_at":"2024-07-30T08:18:26.546856Z"}}',
          id: '1702210',
          maskedPhone: '9194******49',
          name: 'akansha',
        },
        id: '24190',
        insertedAt: '2024-08-21T05:29:05Z',
        messageNumber: 221,
        remarks: null,
        status: 'open',
        topic: 'Poetry',
        updatedAt: '2024-08-21T05:29:05Z',
        user: {
          __typename: 'User',
          id: '1489',
          name: 'Akansha Sakhre',
        },
      },
      {
        __typename: 'Ticket',
        body: '@results',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"23","type":"string","label":"user_age_group","inserted_at":"2024-01-30T10:25:44.511224Z"},"state":{"value":"","type":"string","label":"State","inserted_at":"2024-07-19T06:53:22.161533Z"},"long":{"value":"-49.946944","type":"string","label":"long","inserted_at":"2024-07-19T06:53:24.959601Z"},"lat":{"value":"41.725556","type":"string","label":"lat","inserted_at":"2024-07-19T06:53:24.946569Z"},"keyword":{"value":"hi","type":"string","label":"keyword","inserted_at":"2024-08-19T10:03:05.500701Z"},"district":{"value":"","type":"string","label":"District","inserted_at":"2024-07-19T06:53:22.172953Z"},"counter":{"value":"2","type":"string","label":"counter","inserted_at":"2024-07-02T15:12:19.741570Z"},"city":{"value":"","type":"string","label":"city","inserted_at":"2024-07-19T06:53:22.150582Z"}}',
          id: '1619662',
          maskedPhone: '9876******10',
          name: null,
        },
        id: '24091',
        insertedAt: '2024-08-20T06:49:23Z',
        messageNumber: 631,
        remarks: null,
        status: 'open',
        topic: 'counsellor_queries',
        updatedAt: '2024-08-20T06:49:23Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: '@results',
        contact: {
          __typename: 'Contact',
          fields:
            '{"ward_counter":{"value":"1","type":"string","label":"ward_counter","inserted_at":"2024-08-29T10:32:20.089682Z"},"state":{"value":"","type":"string","label":"State","inserted_at":"2024-09-04T03:01:50.629799Z"},"school_name":{"value":"School A","type":"string","label":"school_name","inserted_at":"2024-08-23T13:32:51.284873Z"},"school_naam":{"value":"1","type":"string","label":"school_naam","inserted_at":"2024-08-09T05:02:18.526418Z"},"role":{"value":"student","type":"string","label":"role","inserted_at":"2022-08-30T10:21:59.123564Z"},"recent_flow_id":{"value":"dbdb35d2-65d9-447a-b1ff-6bdacc6fd374","type":"string","label":"recent_flow_id","inserted_at":"2022-11-02T20:04:01.624164Z"},"question":{"value":"super sad, i got yelled at by my boss","type":"string","label":"question","inserted_at":"2024-08-14T13:45:11.927590Z"},"parent_action":{"value":"Didnt tutor student","type":"string","label":"parent_action","inserted_at":"2024-08-23T12:40:38.068210Z"},"optin_status":{"value":"optin","type":"string","label":"optin_status","inserted_at":"2024-08-23T12:39:32.394663Z"},"name":{"value":"Male","type":"string","label":"Name","inserted_at":"2023-05-08T07:38:01.995959Z"},"keyword":{"value":"draftrwanda","type":"string","label":"keyword","inserted_at":"2024-08-16T11:50:32.108029Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-08-09T05:02:18.588042Z"},"gender":{"value":"Male","type":"string","label":"Gender","inserted_at":"2023-05-08T07:34:56.428700Z"},"district":{"value":"","type":"string","label":"District","inserted_at":"2024-09-04T03:01:50.652836Z"},"clusteroption":{"value":"Cluster A","type":"string","label":"clusteroption","inserted_at":"2024-08-23T13:32:50.312353Z"},"cityname":{"value":"Bangalore","type":"string","label":"CityName","inserted_at":"2023-08-23T07:25:20.479840Z"},"city":{"value":"","type":"string","label":"city","inserted_at":"2024-09-04T03:01:50.610635Z"},"aravindflow1_name":{"value":"@results.aravindflow1_name","type":"string","label":"aravindflow1_name","inserted_at":"2023-05-04T04:15:34.767338Z"},"aravindflow1_gender":{"value":"results.aravindflow1_gender","type":"string","label":"aravindflow1_gender","inserted_at":"2023-05-04T04:15:34.746198Z"},"answer":{"value":"I\'m really sorry to hear that you\'re feeling this way, but I\'m unable to provide the help that you need. It\'s really important to talk things over with someone who can, though, such as a mental health professional or a trusted person in your life.","type":"string","label":"answer","inserted_at":"2024-08-14T13:45:15.797865Z"},"age":{"value":"11 to 14","type":"string","label":"age","inserted_at":"2022-08-30T10:21:59.169800Z"}}',
          id: '15292',
          maskedPhone: '9876******_4',
          name: 'Glific Simulator Four',
        },
        id: '23498',
        insertedAt: '2024-08-14T11:00:13Z',
        messageNumber: 983,
        remarks: null,
        status: 'open',
        topic: 'counsellor_queries',
        updatedAt: '2024-08-14T11:00:13Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: '@results',
        contact: {
          __typename: 'Contact',
          fields:
            '{"ward_counter":{"value":"1","type":"string","label":"ward_counter","inserted_at":"2024-08-29T10:32:20.089682Z"},"state":{"value":"","type":"string","label":"State","inserted_at":"2024-09-04T03:01:50.629799Z"},"school_name":{"value":"School A","type":"string","label":"school_name","inserted_at":"2024-08-23T13:32:51.284873Z"},"school_naam":{"value":"1","type":"string","label":"school_naam","inserted_at":"2024-08-09T05:02:18.526418Z"},"role":{"value":"student","type":"string","label":"role","inserted_at":"2022-08-30T10:21:59.123564Z"},"recent_flow_id":{"value":"dbdb35d2-65d9-447a-b1ff-6bdacc6fd374","type":"string","label":"recent_flow_id","inserted_at":"2022-11-02T20:04:01.624164Z"},"question":{"value":"super sad, i got yelled at by my boss","type":"string","label":"question","inserted_at":"2024-08-14T13:45:11.927590Z"},"parent_action":{"value":"Didnt tutor student","type":"string","label":"parent_action","inserted_at":"2024-08-23T12:40:38.068210Z"},"optin_status":{"value":"optin","type":"string","label":"optin_status","inserted_at":"2024-08-23T12:39:32.394663Z"},"name":{"value":"Male","type":"string","label":"Name","inserted_at":"2023-05-08T07:38:01.995959Z"},"keyword":{"value":"draftrwanda","type":"string","label":"keyword","inserted_at":"2024-08-16T11:50:32.108029Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-08-09T05:02:18.588042Z"},"gender":{"value":"Male","type":"string","label":"Gender","inserted_at":"2023-05-08T07:34:56.428700Z"},"district":{"value":"","type":"string","label":"District","inserted_at":"2024-09-04T03:01:50.652836Z"},"clusteroption":{"value":"Cluster A","type":"string","label":"clusteroption","inserted_at":"2024-08-23T13:32:50.312353Z"},"cityname":{"value":"Bangalore","type":"string","label":"CityName","inserted_at":"2023-08-23T07:25:20.479840Z"},"city":{"value":"","type":"string","label":"city","inserted_at":"2024-09-04T03:01:50.610635Z"},"aravindflow1_name":{"value":"@results.aravindflow1_name","type":"string","label":"aravindflow1_name","inserted_at":"2023-05-04T04:15:34.767338Z"},"aravindflow1_gender":{"value":"results.aravindflow1_gender","type":"string","label":"aravindflow1_gender","inserted_at":"2023-05-04T04:15:34.746198Z"},"answer":{"value":"I\'m really sorry to hear that you\'re feeling this way, but I\'m unable to provide the help that you need. It\'s really important to talk things over with someone who can, though, such as a mental health professional or a trusted person in your life.","type":"string","label":"answer","inserted_at":"2024-08-14T13:45:15.797865Z"},"age":{"value":"11 to 14","type":"string","label":"age","inserted_at":"2022-08-30T10:21:59.169800Z"}}',
          id: '15292',
          maskedPhone: '9876******_4',
          name: 'Glific Simulator Four',
        },
        id: '23490',
        insertedAt: '2024-08-14T10:09:38Z',
        messageNumber: 949,
        remarks: null,
        status: 'open',
        topic: 'counsellor_queries',
        updatedAt: '2024-08-14T10:09:38Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: '@results',
        contact: {
          __typename: 'Contact',
          fields:
            '{"ward_counter":{"value":"1","type":"string","label":"ward_counter","inserted_at":"2024-08-29T10:32:20.089682Z"},"state":{"value":"","type":"string","label":"State","inserted_at":"2024-09-04T03:01:50.629799Z"},"school_name":{"value":"School A","type":"string","label":"school_name","inserted_at":"2024-08-23T13:32:51.284873Z"},"school_naam":{"value":"1","type":"string","label":"school_naam","inserted_at":"2024-08-09T05:02:18.526418Z"},"role":{"value":"student","type":"string","label":"role","inserted_at":"2022-08-30T10:21:59.123564Z"},"recent_flow_id":{"value":"dbdb35d2-65d9-447a-b1ff-6bdacc6fd374","type":"string","label":"recent_flow_id","inserted_at":"2022-11-02T20:04:01.624164Z"},"question":{"value":"super sad, i got yelled at by my boss","type":"string","label":"question","inserted_at":"2024-08-14T13:45:11.927590Z"},"parent_action":{"value":"Didnt tutor student","type":"string","label":"parent_action","inserted_at":"2024-08-23T12:40:38.068210Z"},"optin_status":{"value":"optin","type":"string","label":"optin_status","inserted_at":"2024-08-23T12:39:32.394663Z"},"name":{"value":"Male","type":"string","label":"Name","inserted_at":"2023-05-08T07:38:01.995959Z"},"keyword":{"value":"draftrwanda","type":"string","label":"keyword","inserted_at":"2024-08-16T11:50:32.108029Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-08-09T05:02:18.588042Z"},"gender":{"value":"Male","type":"string","label":"Gender","inserted_at":"2023-05-08T07:34:56.428700Z"},"district":{"value":"","type":"string","label":"District","inserted_at":"2024-09-04T03:01:50.652836Z"},"clusteroption":{"value":"Cluster A","type":"string","label":"clusteroption","inserted_at":"2024-08-23T13:32:50.312353Z"},"cityname":{"value":"Bangalore","type":"string","label":"CityName","inserted_at":"2023-08-23T07:25:20.479840Z"},"city":{"value":"","type":"string","label":"city","inserted_at":"2024-09-04T03:01:50.610635Z"},"aravindflow1_name":{"value":"@results.aravindflow1_name","type":"string","label":"aravindflow1_name","inserted_at":"2023-05-04T04:15:34.767338Z"},"aravindflow1_gender":{"value":"results.aravindflow1_gender","type":"string","label":"aravindflow1_gender","inserted_at":"2023-05-04T04:15:34.746198Z"},"answer":{"value":"I\'m really sorry to hear that you\'re feeling this way, but I\'m unable to provide the help that you need. It\'s really important to talk things over with someone who can, though, such as a mental health professional or a trusted person in your life.","type":"string","label":"answer","inserted_at":"2024-08-14T13:45:15.797865Z"},"age":{"value":"11 to 14","type":"string","label":"age","inserted_at":"2022-08-30T10:21:59.169800Z"}}',
          id: '15292',
          maskedPhone: '9876******_4',
          name: 'Glific Simulator Four',
        },
        id: '23481',
        insertedAt: '2024-08-14T09:49:17Z',
        messageNumber: 898,
        remarks: null,
        status: 'open',
        topic: 'counsellor_queries',
        updatedAt: '2024-08-14T09:49:17Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: '@results',
        contact: {
          __typename: 'Contact',
          fields:
            '{"ward_counter":{"value":"1","type":"string","label":"ward_counter","inserted_at":"2024-08-29T10:32:20.089682Z"},"state":{"value":"","type":"string","label":"State","inserted_at":"2024-09-04T03:01:50.629799Z"},"school_name":{"value":"School A","type":"string","label":"school_name","inserted_at":"2024-08-23T13:32:51.284873Z"},"school_naam":{"value":"1","type":"string","label":"school_naam","inserted_at":"2024-08-09T05:02:18.526418Z"},"role":{"value":"student","type":"string","label":"role","inserted_at":"2022-08-30T10:21:59.123564Z"},"recent_flow_id":{"value":"dbdb35d2-65d9-447a-b1ff-6bdacc6fd374","type":"string","label":"recent_flow_id","inserted_at":"2022-11-02T20:04:01.624164Z"},"question":{"value":"super sad, i got yelled at by my boss","type":"string","label":"question","inserted_at":"2024-08-14T13:45:11.927590Z"},"parent_action":{"value":"Didnt tutor student","type":"string","label":"parent_action","inserted_at":"2024-08-23T12:40:38.068210Z"},"optin_status":{"value":"optin","type":"string","label":"optin_status","inserted_at":"2024-08-23T12:39:32.394663Z"},"name":{"value":"Male","type":"string","label":"Name","inserted_at":"2023-05-08T07:38:01.995959Z"},"keyword":{"value":"draftrwanda","type":"string","label":"keyword","inserted_at":"2024-08-16T11:50:32.108029Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-08-09T05:02:18.588042Z"},"gender":{"value":"Male","type":"string","label":"Gender","inserted_at":"2023-05-08T07:34:56.428700Z"},"district":{"value":"","type":"string","label":"District","inserted_at":"2024-09-04T03:01:50.652836Z"},"clusteroption":{"value":"Cluster A","type":"string","label":"clusteroption","inserted_at":"2024-08-23T13:32:50.312353Z"},"cityname":{"value":"Bangalore","type":"string","label":"CityName","inserted_at":"2023-08-23T07:25:20.479840Z"},"city":{"value":"","type":"string","label":"city","inserted_at":"2024-09-04T03:01:50.610635Z"},"aravindflow1_name":{"value":"@results.aravindflow1_name","type":"string","label":"aravindflow1_name","inserted_at":"2023-05-04T04:15:34.767338Z"},"aravindflow1_gender":{"value":"results.aravindflow1_gender","type":"string","label":"aravindflow1_gender","inserted_at":"2023-05-04T04:15:34.746198Z"},"answer":{"value":"I\'m really sorry to hear that you\'re feeling this way, but I\'m unable to provide the help that you need. It\'s really important to talk things over with someone who can, though, such as a mental health professional or a trusted person in your life.","type":"string","label":"answer","inserted_at":"2024-08-14T13:45:15.797865Z"},"age":{"value":"11 to 14","type":"string","label":"age","inserted_at":"2022-08-30T10:21:59.169800Z"}}',
          id: '15292',
          maskedPhone: '9876******_4',
          name: 'Glific Simulator Four',
        },
        id: '23480',
        insertedAt: '2024-08-14T09:48:57Z',
        messageNumber: 891,
        remarks: null,
        status: 'open',
        topic: 'counsellor_queries',
        updatedAt: '2024-08-14T09:48:57Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'How to add template message',
        contact: {
          __typename: 'Contact',
          fields:
            '{"state":{"value":"Bihar","type":"string","label":"State","inserted_at":"2024-07-23T06:38:58.975243Z"},"stage":{"value":"quiz","type":"string","label":"Stage","inserted_at":"2024-05-23T13:48:37.259152Z"},"preferred_name":{"value":"saas admin","type":"string","label":"preferred_name","inserted_at":"2024-06-28T09:20:11.715814Z"},"number":{"value":"7896","type":"string","label":"number","inserted_at":"2024-07-23T06:37:02.897776Z"},"name_to_use":{"value":"SAAS Admin","type":"string","label":"name_to_use","inserted_at":"2024-07-16T06:12:50.883530Z"},"long":{"value":"85.13774871826172","type":"string","label":"long","inserted_at":"2024-07-23T06:38:57.718742Z"},"lat":{"value":"25.609970092773438","type":"string","label":"lat","inserted_at":"2024-07-23T06:38:57.704528Z"},"keyword":{"value":"hi","type":"string","label":"keyword","inserted_at":"2024-07-12T10:34:32.620012Z"},"gender":{"value":"@results.gender.category","type":"string","label":"Gender","inserted_at":"2024-06-28T09:20:21.044569Z"},"email":{"value":"sangeeta@gmail.com","type":"string","label":"Email","inserted_at":"2024-07-23T06:36:53.030925Z"},"district":{"value":"Patna","type":"string","label":"District","inserted_at":"2024-07-23T06:38:58.957788Z"},"colour":{"value":"Red","type":"string","label":"Colour","inserted_at":"2024-07-12T10:35:08.120771Z"},"city":{"value":"Chanakya","type":"string","label":"city","inserted_at":"2024-07-23T06:38:58.942526Z"},"age_group":{"value":"21-30","type":"string","label":"Age Group","inserted_at":"2024-07-16T06:12:54.414250Z"},"age":{"value":"20","type":"string","label":"age","inserted_at":"2024-03-19T12:42:47.325474Z"}}',
          id: '1937437',
          maskedPhone: '9186******81',
          name: 'SAAS Admin',
        },
        id: '21156',
        insertedAt: '2024-07-23T04:51:16Z',
        messageNumber: 330,
        remarks: null,
        status: 'open',
        topic: 'Query',
        updatedAt: '2024-07-23T04:51:16Z',
        user: {
          __typename: 'User',
          id: '1577',
          name: 'Sangeeta Mishra',
        },
      },
      {
        __typename: 'Ticket',
        body: 'What is Glific',
        contact: {
          __typename: 'Contact',
          fields:
            '{"state":{"value":"@results.location.prov","type":"string","label":"State","inserted_at":"2024-07-23T04:58:17.146129Z"},"only_name":{"value":"@results.onlyname","type":"string","label":"only name","inserted_at":"2024-02-14T12:30:52.810491Z"},"name":{"value":"aishwarya","type":"string","label":"Name","inserted_at":"2024-08-23T06:03:57.774620Z"},"longitude":{"value":"-49.946944","type":"string","label":"longitude","inserted_at":"2024-07-05T10:37:36.506545Z"},"long":{"value":"-49.946944","type":"string","label":"long","inserted_at":"2024-07-23T04:58:15.823261Z"},"latidute":{"value":"41.725556","type":"string","label":"Latidute","inserted_at":"2024-07-05T10:37:36.493656Z"},"lat":{"value":"41.725556","type":"string","label":"lat","inserted_at":"2024-07-23T04:58:15.810132Z"},"keyword":{"value":"hi","type":"string","label":"keyword","inserted_at":"2024-07-05T14:11:59.049270Z"},"interest":{"value":"Mathematics","type":"string","label":"Interest","inserted_at":"2023-05-24T04:53:00.164550Z"},"fullname":{"value":"My name is sangeeta","type":"string","label":"fullname","inserted_at":"2024-02-14T12:12:53.593490Z"},"full_name":{"value":"i m sangeeta","type":"string","label":"Full name","inserted_at":"2024-02-14T12:30:52.730809Z"},"execution_date":{"value":"2023-08-23","type":"string","label":"execution_date","inserted_at":"2023-08-17T17:39:01.741401Z"},"district":{"value":"@results.location.region","type":"string","label":"District","inserted_at":"2024-07-23T04:58:17.133249Z"},"demo_username":{"value":"AN","type":"string","label":"demo_username","inserted_at":"2023-04-12T02:06:34.675426Z"},"demo_role":{"value":"Student","type":"string","label":"demo_role","inserted_at":"2023-04-12T02:06:34.703647Z"},"current_date":{"value":"2023-08-17","type":"string","label":"current_date","inserted_at":"2023-08-17T17:37:25.731685Z"},"counter":{"value":"1","type":"string","label":"counter","inserted_at":"2023-08-28T12:10:42.499017Z"},"code":{"value":"1","type":"string","label":"Code","inserted_at":"2023-05-25T10:20:48.041522Z"},"cityname":{"value":"Bangalore","type":"string","label":"CityName","inserted_at":"2023-08-24T04:03:03.389169Z"},"city":{"value":"@results.location.city","type":"string","label":"city","inserted_at":"2024-07-23T04:58:17.119925Z"},"age":{"value":"@results.age","type":"string","label":"age","inserted_at":"2023-08-25T04:26:12.774596Z"}}',
          id: '15291',
          maskedPhone: '9876******_3',
          name: 'Glific Simulator Three',
        },
        id: '21155',
        insertedAt: '2024-07-23T04:50:12Z',
        messageNumber: 2061,
        remarks: null,
        status: 'open',
        topic: 'Query',
        updatedAt: '2024-07-23T04:50:12Z',
        user: {
          __typename: 'User',
          id: '1577',
          name: 'Sangeeta Mishra',
        },
      },
      {
        __typename: 'Ticket',
        body: 'Andhra politics',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-07-22T10:55:16.973051Z"},"state":{"value":"Telangana","type":"string","label":"State","inserted_at":"2024-07-22T10:56:21.100781Z"},"name_to_use":{"value":"sanket shastry","type":"string","label":"name_to_use","inserted_at":"2024-07-22T10:55:03.382817Z"},"long":{"value":"78.3827284","type":"string","label":"long","inserted_at":"2024-07-22T10:56:19.515890Z"},"lat":{"value":"17.4339626","type":"string","label":"lat","inserted_at":"2024-07-22T10:56:19.505535Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-07-22T10:54:31.673655Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-07-22T10:55:17.016619Z"},"district":{"value":"Rangareddi","type":"string","label":"District","inserted_at":"2024-07-22T10:56:21.089513Z"},"city":{"value":"United Technologies Corporation","type":"string","label":"city","inserted_at":"2024-07-22T10:56:21.079261Z"}}',
          id: '2245255',
          maskedPhone: '9199******02',
          name: 'sanket shastry',
        },
        id: '21116',
        insertedAt: '2024-07-22T10:56:51Z',
        messageNumber: 23,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-07-22T10:56:51Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'skip',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-07-18T15:18:22.068554Z"},"state":{"value":"Sacatepéquez","type":"string","label":"State","inserted_at":"2024-07-25T21:12:31.910109Z"},"name_to_use":{"value":"Tyler","type":"string","label":"name_to_use","inserted_at":"2024-07-18T15:17:55.808259Z"},"name":{"value":"Tester","type":"string","label":"Name","inserted_at":"2024-07-26T04:23:52.651590Z"},"long":{"value":"-90.7343301","type":"string","label":"long","inserted_at":"2024-07-25T21:12:30.762869Z"},"lat":{"value":"14.5529036","type":"string","label":"lat","inserted_at":"2024-07-25T21:12:30.736112Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-07-25T21:11:03.202570Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-07-18T15:18:22.119700Z"},"district":{"value":"@results.location.region","type":"string","label":"District","inserted_at":"2024-07-25T21:12:31.888851Z"},"city":{"value":"San Cristóbal El Bajo","type":"string","label":"city","inserted_at":"2024-07-25T21:12:31.871857Z"}}',
          id: '2198494',
          maskedPhone: '1317******14',
          name: 'Tyler',
        },
        id: '20826',
        insertedAt: '2024-07-18T15:24:16Z',
        messageNumber: 29,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-07-18T15:24:16Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Yeah please do',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-22T08:40:02.252416Z"},"organisation_name":{"value":"Cost Involved?","type":"string","label":"Organisation name","inserted_at":"2024-06-24T10:23:09.082063Z"},"name_to_use":{"value":"Aswathy Sooraj","type":"string","label":"name_to_use","inserted_at":"2024-06-22T08:39:51.324880Z"},"long":{"value":"75.2275222","type":"string","label":"long","inserted_at":"2024-06-22T08:45:33.458816Z"},"lat":{"value":"12.7403667","type":"string","label":"lat","inserted_at":"2024-06-22T08:45:33.444119Z"},"keyword":{"value":"hi","type":"string","label":"keyword","inserted_at":"2024-06-24T10:21:23.096459Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-22T08:40:02.352644Z"}}',
          id: '2209947',
          maskedPhone: '9197******98',
          name: 'Aswathy Sooraj',
        },
        id: '19486',
        insertedAt: '2024-06-22T08:45:42Z',
        messageNumber: 82,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-22T08:45:42Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Support',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-22T08:39:07.503986Z"},"name_to_use":{"value":"Alhamdulillah","type":"string","label":"name_to_use","inserted_at":"2024-06-22T08:38:47.410666Z"},"long":{"value":"75.9326135","type":"string","label":"long","inserted_at":"2024-06-22T08:42:09.640316Z"},"lat":{"value":"22.7502642","type":"string","label":"lat","inserted_at":"2024-06-22T08:42:09.627952Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-22T08:37:56.735188Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-22T08:39:07.551632Z"}}',
          id: '2211726',
          maskedPhone: '9198******86',
          name: 'Alhamdulillah',
        },
        id: '19485',
        insertedAt: '2024-06-22T08:45:24Z',
        messageNumber: 32,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-22T08:45:24Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Where is nearby police station',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-21T06:19:44.712895Z"},"name_to_use":{"value":"ashok jani","type":"string","label":"name_to_use","inserted_at":"2024-06-21T06:19:31.726854Z"},"long":{"value":"72.9865147","type":"string","label":"long","inserted_at":"2024-06-21T06:22:02.286884Z"},"lat":{"value":"22.5336025","type":"string","label":"lat","inserted_at":"2024-06-21T06:22:02.274044Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-21T06:19:02.184490Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-21T06:19:44.769851Z"}}',
          id: '2210301',
          maskedPhone: '9199******68',
          name: 'ashok jani',
        },
        id: '19392',
        insertedAt: '2024-06-21T06:28:29Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-21T06:28:29Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Am I entitled for PM awas?',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-21T06:20:35.214937Z"},"name_to_use":{"value":"Namita","type":"string","label":"name_to_use","inserted_at":"2024-06-21T06:20:18.369766Z"},"long":{"value":"81.6779906","type":"string","label":"long","inserted_at":"2024-06-21T06:27:02.939061Z"},"lat":{"value":"21.2412646","type":"string","label":"lat","inserted_at":"2024-06-21T06:27:02.924133Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-21T06:19:16.111193Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-21T06:20:35.267226Z"}}',
          id: '2210302',
          maskedPhone: '9194******20',
          name: 'Namita',
        },
        id: '19391',
        insertedAt: '2024-06-21T06:28:13Z',
        messageNumber: 27,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-21T06:28:13Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Need help with finding A positive blood',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:57:46.464636Z"},"name_to_use":{"value":"Aishwarya  Shekar","type":"string","label":"name_to_use","inserted_at":"2024-07-18T09:48:37.859777Z"},"name":{"value":"Aish","type":"string","label":"Name","inserted_at":"2024-09-03T11:23:22.366112Z"},"long":{"value":"77.54151916503906","type":"string","label":"long","inserted_at":"2024-07-05T12:00:56.624508Z"},"lat":{"value":"12.941898345947266","type":"string","label":"lat","inserted_at":"2024-07-05T12:00:56.610195Z"},"keyword":{"value":"higlificteam","type":"string","label":"keyword","inserted_at":"2024-08-07T08:46:30.947186Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:57:46.516958Z"}}',
          id: '2191317',
          maskedPhone: '9196******98',
          name: 'Aishwarya  Shekar',
        },
        id: '19390',
        insertedAt: '2024-06-21T06:27:44Z',
        messageNumber: 146,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-21T06:27:44Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Resturants near by',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-21T06:21:17.474977Z"},"name_to_use":{"value":"Swapna","type":"string","label":"name_to_use","inserted_at":"2024-06-21T06:21:02.889501Z"},"long":{"value":"85.09362649172544","type":"string","label":"long","inserted_at":"2024-06-21T06:23:12.721907Z"},"lat":{"value":"20.91758489951324","type":"string","label":"lat","inserted_at":"2024-06-21T06:23:12.705163Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-21T06:20:30.832472Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-21T06:21:17.523436Z"}}',
          id: '2210305',
          maskedPhone: '9194******73',
          name: 'Swapna',
        },
        id: '19389',
        insertedAt: '2024-06-21T06:26:20Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-21T06:26:20Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Finding a good orthopedist',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-20T06:12:17.160243Z"},"name_to_use":{"value":"Sahil Bhattad","type":"string","label":"name_to_use","inserted_at":"2024-06-20T06:11:38.946671Z"},"long":{"value":"72.8397445678711","type":"string","label":"long","inserted_at":"2024-06-20T06:14:57.493709Z"},"lat":{"value":"19.075647354125977","type":"string","label":"lat","inserted_at":"2024-06-20T06:14:57.480228Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-20T06:11:06.726180Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-20T06:12:17.217820Z"}}',
          id: '2208752',
          maskedPhone: '9190******76',
          name: 'Sahil Bhattad',
        },
        id: '19340',
        insertedAt: '2024-06-20T06:15:39Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-20T06:15:39Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'I want to troubleshoot something',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-20T06:12:06.794569Z"},"name_to_use":{"value":"Lipi Mehta","type":"string","label":"name_to_use","inserted_at":"2024-06-20T06:11:59.223755Z"},"long":{"value":"72.81681060791016","type":"string","label":"long","inserted_at":"2024-06-20T06:13:12.597757Z"},"lat":{"value":"18.99940299987793","type":"string","label":"lat","inserted_at":"2024-06-20T06:13:12.584252Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-20T06:11:38.063549Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-20T06:12:06.849506Z"}}',
          id: '2208761',
          maskedPhone: '9199******07',
          name: 'Lipi Mehta',
        },
        id: '19339',
        insertedAt: '2024-06-20T06:14:14Z',
        messageNumber: 23,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-20T06:14:14Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Water shortage',
        contact: {
          __typename: 'Contact',
          fields:
            '{"organization":{"value":"Mtoto News","type":"string","label":"Organization","inserted_at":"2024-06-17T09:21:48.673513Z"},"name_to_use":{"value":"Jenny","type":"string","label":"name_to_use","inserted_at":"2024-06-17T09:21:37.069245Z"},"long":{"value":"36.1269398","type":"string","label":"long","inserted_at":"2024-06-18T11:14:05.440540Z"},"lat":{"value":"-0.290256","type":"string","label":"lat","inserted_at":"2024-06-18T11:14:05.419991Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-18T11:09:53.619047Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-17T09:22:04.592623Z"}}',
          id: '2204008',
          maskedPhone: '2547******94',
          name: 'Jenny',
        },
        id: '19250',
        insertedAt: '2024-06-18T11:14:45Z',
        messageNumber: 53,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-18T11:14:45Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Rental room in Baltimore',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Div🍀","type":"string","label":"name_to_use","inserted_at":"2024-06-14T14:32:04.934427Z"},"long":{"value":"-75.479248046875","type":"string","label":"long","inserted_at":"2024-06-14T14:42:01.422716Z"},"lat":{"value":"40.04447555541992","type":"string","label":"lat","inserted_at":"2024-06-14T14:42:01.405904Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-14T14:31:26.046628Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-14T14:32:18.535178Z"}}',
          id: '2201988',
          maskedPhone: '9178******25',
          name: 'Div🍀',
        },
        id: '19096',
        insertedAt: '2024-06-14T14:43:17Z',
        messageNumber: 29,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-14T14:43:17Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'agriculture production data of pitapalli village of gangapada gram panchayat of jatni block of khordha district of odiha india',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-13T10:03:18.063676Z"},"name_to_use":{"value":"Chittaranjan Hota","type":"string","label":"name_to_use","inserted_at":"2024-06-13T10:03:05.283523Z"},"long":{"value":"83.9719987","type":"string","label":"long","inserted_at":"2024-06-13T10:05:12.542027Z"},"lat":{"value":"21.4753812","type":"string","label":"lat","inserted_at":"2024-06-13T10:05:12.530320Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T10:02:05.340933Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T10:03:18.159173Z"}}',
          id: '2200401',
          maskedPhone: '9194******74',
          name: 'Chittaranjan Hota',
        },
        id: '19019',
        insertedAt: '2024-06-13T12:18:30Z',
        messageNumber: 26,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T12:18:30Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'documentation of the product',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"wishnew","type":"string","label":"name_to_use","inserted_at":"2024-06-13T10:00:48.282874Z"},"long":{"value":"78.3870323","type":"string","label":"long","inserted_at":"2024-06-13T10:03:29.162310Z"},"lat":{"value":"17.5047468","type":"string","label":"lat","inserted_at":"2024-06-13T10:03:29.149414Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:58:09.829817Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T10:00:58.625905Z"}}',
          id: '2200392',
          maskedPhone: '9191******69',
          name: 'wishnew',
        },
        id: '19008',
        insertedAt: '2024-06-13T10:06:34Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T10:06:34Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'School',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Krishna Kumar","type":"string","label":"name_to_use","inserted_at":"2024-06-13T10:00:30.360599Z"},"long":{"value":"77.275764","type":"string","label":"long","inserted_at":"2024-06-13T10:04:32.382994Z"},"lat":{"value":"23.285778","type":"string","label":"lat","inserted_at":"2024-06-13T10:04:32.371773Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:59:58.003576Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T10:00:45.414372Z"}}',
          id: '2200394',
          maskedPhone: '9184******07',
          name: 'Krishna Kumar',
        },
        id: '19007',
        insertedAt: '2024-06-13T10:05:18Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T10:05:18Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: "Can't understand how to add text",
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-13T09:58:32.852918Z"},"name_to_use":{"value":"Radha","type":"string","label":"name_to_use","inserted_at":"2024-06-13T09:58:23.077921Z"},"long":{"value":"77.21736967563629","type":"string","label":"long","inserted_at":"2024-06-13T09:59:27.326802Z"},"lat":{"value":"28.574852847974736","type":"string","label":"lat","inserted_at":"2024-06-13T09:59:27.313680Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:57:12.063520Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T09:58:32.901168Z"}}',
          id: '2200366',
          maskedPhone: '9179******71',
          name: 'Radha Sharan',
        },
        id: '19006',
        insertedAt: '2024-06-13T10:00:42Z',
        messageNumber: 33,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T10:00:42Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'How to build a chatbot using Glific',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-13T09:48:40.963748Z"},"state":{"value":"","type":"string","label":"State","inserted_at":"2024-07-30T03:55:53.735224Z"},"name_to_use":{"value":"Tushar","type":"string","label":"name_to_use","inserted_at":"2024-06-13T09:48:29.037033Z"},"name":{"value":"Tushar","type":"string","label":"Name","inserted_at":"2024-07-29T05:01:56.882899Z"},"long":{"value":"72.9090102","type":"string","label":"long","inserted_at":"2024-06-13T09:57:00.579693Z"},"lat":{"value":"19.0473258","type":"string","label":"lat","inserted_at":"2024-06-13T09:57:00.566162Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-07-30T03:55:12.431686Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T09:48:41.007596Z"},"district":{"value":"","type":"string","label":"District","inserted_at":"2024-07-30T03:55:53.748557Z"},"city":{"value":"","type":"string","label":"city","inserted_at":"2024-07-30T03:55:53.721573Z"}}',
          id: '2200370',
          maskedPhone: '9185******16',
          name: 'Tushar',
        },
        id: '19005',
        insertedAt: '2024-06-13T09:58:20Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T09:58:20Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'How do I help a bored puppy?',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Linus","type":"string","label":"name_to_use","inserted_at":"2024-06-13T09:49:51.574817Z"},"long":{"value":"121.46484375","type":"string","label":"long","inserted_at":"2024-06-13T09:56:22.082801Z"},"lat":{"value":"25.011573791503906","type":"string","label":"lat","inserted_at":"2024-06-13T09:56:22.067751Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:48:54.244508Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T09:50:02.071512Z"}}',
          id: '2200383',
          maskedPhone: '1650******83',
          name: 'Linus',
        },
        id: '19003',
        insertedAt: '2024-06-13T09:57:03Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T09:57:03Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'How to build chatbot',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-13T06:00:13.990128Z"},"name_to_use":{"value":"Eli","type":"string","label":"name_to_use","inserted_at":"2024-06-13T05:59:44.555840Z"},"long":{"value":"78.2902247","type":"string","label":"long","inserted_at":"2024-06-13T09:54:05.846897Z"},"lat":{"value":"17.456713","type":"string","label":"lat","inserted_at":"2024-06-13T09:54:05.834328Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:53:15.021717Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T06:00:14.036036Z"}}',
          id: '2199910',
          maskedPhone: '9183******18',
          name: 'Satish Eli',
        },
        id: '19002',
        insertedAt: '2024-06-13T09:55:10Z',
        messageNumber: 60,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T09:55:10Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Hiw do I find old spreadsheet',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Amy","type":"string","label":"name_to_use","inserted_at":"2024-06-13T09:48:43.258865Z"},"long":{"value":"77.5757834","type":"string","label":"long","inserted_at":"2024-06-13T09:50:13.377496Z"},"lat":{"value":"13.0674146","type":"string","label":"lat","inserted_at":"2024-06-13T09:50:13.364909Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:47:42.130414Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T09:48:54.041059Z"}}',
          id: '2200369',
          maskedPhone: '9196******15',
          name: 'Amy',
        },
        id: '19001',
        insertedAt: '2024-06-13T09:53:49Z',
        messageNumber: 27,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T09:53:49Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Glific Pricing',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Early Bird","type":"string","label":"name_to_use","inserted_at":"2024-06-13T09:48:25.225635Z"},"long":{"value":"77.5787286","type":"string","label":"long","inserted_at":"2024-06-13T09:50:51.547546Z"},"lat":{"value":"13.0677644","type":"string","label":"lat","inserted_at":"2024-06-13T09:50:51.535113Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:47:46.033080Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T09:48:34.495416Z"}}',
          id: '2200372',
          maskedPhone: '9163******24',
          name: 'Early Bird',
        },
        id: '19000',
        insertedAt: '2024-06-13T09:53:27Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T09:53:27Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'I need to find a house on rent',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-13T09:49:19.251489Z"},"name_to_use":{"value":"Amar","type":"string","label":"name_to_use","inserted_at":"2024-06-13T09:48:47.877987Z"},"long":{"value":"77.1767558","type":"string","label":"long","inserted_at":"2024-06-13T09:50:54.121692Z"},"lat":{"value":"28.5569048","type":"string","label":"lat","inserted_at":"2024-06-13T09:50:54.110227Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:47:39.783079Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T09:49:19.304310Z"}}',
          id: '2200367',
          maskedPhone: '9191******05',
          name: 'प्राणएकं परित्यज्य मानमेव',
        },
        id: '18998',
        insertedAt: '2024-06-13T09:51:46Z',
        messageNumber: 28,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T09:51:46Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Understand about Climate of my location.',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-13T09:48:49.496745Z"},"name_to_use":{"value":"Divya Gupta (She/Her)","type":"string","label":"name_to_use","inserted_at":"2024-06-13T09:48:34.629123Z"},"long":{"value":"81.0244653","type":"string","label":"long","inserted_at":"2024-06-13T09:49:42.789260Z"},"lat":{"value":"26.8007153","type":"string","label":"lat","inserted_at":"2024-06-13T09:49:42.777068Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:47:43.497691Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T09:48:49.543973Z"}}',
          id: '2200371',
          maskedPhone: '9181******08',
          name: 'Divya Gupta (She/Her)',
        },
        id: '18997',
        insertedAt: '2024-06-13T09:51:31Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T09:51:31Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: "To build what's app chatbot",
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-13T09:48:07.067077Z"},"name_to_use":{"value":"SachiN💙","type":"string","label":"name_to_use","inserted_at":"2024-06-13T09:47:57.717392Z"},"long":{"value":"76.8924866","type":"string","label":"long","inserted_at":"2024-06-13T09:49:36.876224Z"},"lat":{"value":"12.5097896","type":"string","label":"lat","inserted_at":"2024-06-13T09:49:36.864907Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-13T09:47:21.090670Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-13T09:48:07.136951Z"}}',
          id: '2200360',
          maskedPhone: '9189******29',
          name: 'SachiN💙',
        },
        id: '18995',
        insertedAt: '2024-06-13T09:50:18Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-13T09:50:18Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'I want to find panchayat office',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Aditya","type":"string","label":"name_to_use","inserted_at":"2024-06-10T10:50:06.315719Z"},"long":{"value":"88.12430572509766","type":"string","label":"long","inserted_at":"2024-06-10T10:52:56.475229Z"},"lat":{"value":"26.425151824951172","type":"string","label":"lat","inserted_at":"2024-06-10T10:52:56.464326Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-10T10:49:24.553939Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-10T10:51:37.622131Z"}}',
          id: '2197551',
          maskedPhone: '9185******82',
          name: 'Aditya',
        },
        id: '18798',
        insertedAt: '2024-06-10T10:53:33Z',
        messageNumber: 26,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-10T10:53:33Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Blood banks',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:57:46.464636Z"},"name_to_use":{"value":"Aishwarya  Shekar","type":"string","label":"name_to_use","inserted_at":"2024-07-18T09:48:37.859777Z"},"name":{"value":"Aish","type":"string","label":"Name","inserted_at":"2024-09-03T11:23:22.366112Z"},"long":{"value":"77.54151916503906","type":"string","label":"long","inserted_at":"2024-07-05T12:00:56.624508Z"},"lat":{"value":"12.941898345947266","type":"string","label":"lat","inserted_at":"2024-07-05T12:00:56.610195Z"},"keyword":{"value":"higlificteam","type":"string","label":"keyword","inserted_at":"2024-08-07T08:46:30.947186Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:57:46.516958Z"}}',
          id: '2191317',
          maskedPhone: '9196******98',
          name: 'Aishwarya  Shekar',
        },
        id: '18797',
        insertedAt: '2024-06-10T10:53:03Z',
        messageNumber: 77,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-10T10:53:03Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Yes',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Martin Rabha","type":"string","label":"name_to_use","inserted_at":"2024-06-09T07:58:29.662448Z"},"long":{"value":"91.47550964355469","type":"string","label":"long","inserted_at":"2024-06-09T08:00:47.648672Z"},"lat":{"value":"25.973466873168945","type":"string","label":"lat","inserted_at":"2024-06-09T08:00:47.633624Z"},"keyword":{"value":"demoo","type":"string","label":"keyword","inserted_at":"2024-04-18T09:56:52.333231Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-09T07:58:57.026760Z"}}',
          id: '2090810',
          maskedPhone: '9199******41',
          name: 'Martin Rabha',
        },
        id: '18764',
        insertedAt: '2024-06-09T08:01:00Z',
        messageNumber: 40,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-09T08:01:00Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Support in finding vegetable shops near me',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:57:46.464636Z"},"name_to_use":{"value":"Aishwarya  Shekar","type":"string","label":"name_to_use","inserted_at":"2024-07-18T09:48:37.859777Z"},"name":{"value":"Aish","type":"string","label":"Name","inserted_at":"2024-09-03T11:23:22.366112Z"},"long":{"value":"77.54151916503906","type":"string","label":"long","inserted_at":"2024-07-05T12:00:56.624508Z"},"lat":{"value":"12.941898345947266","type":"string","label":"lat","inserted_at":"2024-07-05T12:00:56.610195Z"},"keyword":{"value":"higlificteam","type":"string","label":"keyword","inserted_at":"2024-08-07T08:46:30.947186Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:57:46.516958Z"}}',
          id: '2191317',
          maskedPhone: '9196******98',
          name: 'Aishwarya  Shekar',
        },
        id: '18588',
        insertedAt: '2024-06-05T11:00:49Z',
        messageNumber: 40,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-05T11:00:49Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: '3',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:50:03.543370Z"},"name_to_use":{"value":"Ajahar","type":"string","label":"name_to_use","inserted_at":"2024-06-05T10:49:51.448857Z"},"long":{"value":"73.900948","type":"string","label":"long","inserted_at":"2024-06-05T10:56:14.191641Z"},"lat":{"value":"18.4947357","type":"string","label":"lat","inserted_at":"2024-06-05T10:56:14.179765Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-05T10:58:28.893888Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:50:03.604101Z"}}',
          id: '2192591',
          maskedPhone: '9173******38',
          name: 'Ajahar',
        },
        id: '18587',
        insertedAt: '2024-06-05T10:56:52Z',
        messageNumber: 24,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-05T10:56:52Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'This is not the correct location I shared',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:54:45.508009Z"},"name_to_use":{"value":"Akhaya Sagar - ORF","type":"string","label":"name_to_use","inserted_at":"2024-06-05T10:54:30.461667Z"},"long":{"value":"85.8145769","type":"string","label":"long","inserted_at":"2024-06-05T10:55:55.928077Z"},"lat":{"value":"20.3375651","type":"string","label":"lat","inserted_at":"2024-06-05T10:55:55.915333Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-05T10:53:49.067737Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:54:45.558070Z"}}',
          id: '2192601',
          maskedPhone: '9198******61',
          name: 'Akhaya Sagar - ORF',
        },
        id: '18586',
        insertedAt: '2024-06-05T10:56:49Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-05T10:56:49Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Popular hospitals in pune',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:51:13.249512Z"},"name_to_use":{"value":"G_1","type":"string","label":"name_to_use","inserted_at":"2024-06-05T10:50:55.890147Z"},"long":{"value":"73.9009246","type":"string","label":"long","inserted_at":"2024-06-05T10:54:14.260825Z"},"lat":{"value":"18.4947511","type":"string","label":"lat","inserted_at":"2024-06-05T10:54:14.244233Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-05T10:48:44.080952Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:51:13.300685Z"}}',
          id: '2192593',
          maskedPhone: '9173******70',
          name: 'G_1',
        },
        id: '18585',
        insertedAt: '2024-06-05T10:56:19Z',
        messageNumber: 28,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-05T10:56:19Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Swimming pools in the area',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:50:59.736392Z"},"name_to_use":{"value":"Sambhavi","type":"string","label":"name_to_use","inserted_at":"2024-06-05T10:50:33.903319Z"},"long":{"value":"77.21086657070164","type":"string","label":"long","inserted_at":"2024-06-05T10:54:26.680506Z"},"lat":{"value":"28.55826138833819","type":"string","label":"lat","inserted_at":"2024-06-05T10:54:26.668007Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-05T10:50:08.120696Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:50:59.788404Z"}}',
          id: '2192597',
          maskedPhone: '9170******21',
          name: 'Sambhavi',
        },
        id: '18584',
        insertedAt: '2024-06-05T10:54:58Z',
        messageNumber: 29,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-05T10:54:58Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'I need support to find the best filter coffee in my area',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:51:05.195006Z"},"name_to_use":{"value":"Vijay Ganesh","type":"string","label":"name_to_use","inserted_at":"2024-06-05T10:50:56.943123Z"},"long":{"value":"80.2094955444336","type":"string","label":"long","inserted_at":"2024-06-05T10:52:22.748147Z"},"lat":{"value":"13.070674896240234","type":"string","label":"lat","inserted_at":"2024-06-05T10:52:22.734956Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-05T10:50:24.500755Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:51:05.249322Z"}}',
          id: '1403738',
          maskedPhone: '9191******00',
          name: 'Vijay Ganesh',
        },
        id: '18582',
        insertedAt: '2024-06-05T10:54:32Z',
        messageNumber: 60,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-05T10:54:32Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'NGOs',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-06-05T10:48:57.719137Z"},"name_to_use":{"value":"Vikram","type":"string","label":"name_to_use","inserted_at":"2024-06-05T10:48:49.399605Z"},"long":{"value":"80.25860595703125","type":"string","label":"long","inserted_at":"2024-06-05T10:51:34.228668Z"},"lat":{"value":"12.990127563476562","type":"string","label":"lat","inserted_at":"2024-06-05T10:51:34.216551Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-06-05T10:48:16.467582Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-06-05T10:48:57.767510Z"}}',
          id: '2192594',
          maskedPhone: '9198******72',
          name: 'Vikram',
        },
        id: '18581',
        insertedAt: '2024-06-05T10:52:13Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-06-05T10:52:13Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Reporting help',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Working Time","type":"string","label":"name_to_use","inserted_at":"2024-05-28T11:44:15.473600Z"},"long":{"value":"86.316062","type":"string","label":"long","inserted_at":"2024-05-28T11:45:36.035521Z"},"lat":{"value":"24.1955838","type":"string","label":"lat","inserted_at":"2024-05-28T11:45:36.018978Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-05-28T11:43:46.536383Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-05-28T11:44:28.206841Z"}}',
          id: '2155231',
          maskedPhone: '9199******94',
          name: 'Working Time',
        },
        id: '18099',
        insertedAt: '2024-05-28T11:46:11Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-05-28T11:46:11Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'किशोरी लड़कियों के साथ  महावारी पर जागरूकता पर किए गए कार्यों का डाटा',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Sangeeta Kumbhkar","type":"string","label":"name_to_use","inserted_at":"2024-05-28T10:02:10.549457Z"},"long":{"value":"75.0623565","type":"string","label":"long","inserted_at":"2024-05-28T10:07:15.528435Z"},"lat":{"value":"24.0726955","type":"string","label":"lat","inserted_at":"2024-05-28T10:07:15.503342Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-05-28T09:55:45.963025Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-05-28T10:03:02.067064Z"}}',
          id: '2090817',
          maskedPhone: '9196******15',
          name: 'Sangeeta Kumbhkar',
        },
        id: '18097',
        insertedAt: '2024-05-28T10:15:48Z',
        messageNumber: 47,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-05-28T10:15:48Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'https://filemanager.gupshup.io/wa/44674650-e991-41c7-9fd7-b3cd58a8aedb/wa/media/4d573b57-64f5-4aa7-9663-9ae7e6063a5a?download=false',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-05-28T09:59:39.536511Z"},"name_to_use":{"value":"Vishnu","type":"string","label":"name_to_use","inserted_at":"2024-05-28T09:59:06.636073Z"},"long":{"value":"76.441285","type":"string","label":"long","inserted_at":"2024-05-28T10:05:56.204076Z"},"lat":{"value":"26.0875117","type":"string","label":"lat","inserted_at":"2024-05-28T10:05:56.188603Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-05-28T09:57:17.698602Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-05-28T09:59:39.591013Z"}}',
          id: '2155116',
          maskedPhone: '9194******22',
          name: 'Vishnu',
        },
        id: '18096',
        insertedAt: '2024-05-28T10:15:10Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-05-28T10:15:10Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'I want to know the details of all the government schools near me',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Kritika Suman","type":"string","label":"name_to_use","inserted_at":"2024-05-28T09:57:51.361838Z"},"long":{"value":"86.718526","type":"string","label":"long","inserted_at":"2024-05-28T10:06:34.203400Z"},"lat":{"value":"24.4944497","type":"string","label":"lat","inserted_at":"2024-05-28T10:06:34.185112Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-05-28T09:55:38.297260Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-05-28T09:58:12.597025Z"}}',
          id: '2155100',
          maskedPhone: '9182******56',
          name: 'Kritika Suman',
        },
        id: '18095',
        insertedAt: '2024-05-28T10:09:57Z',
        messageNumber: 25,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-05-28T10:09:57Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'What is POCSO act?',
        contact: {
          __typename: 'Contact',
          fields:
            '{"name_to_use":{"value":"Trisha","type":"string","label":"name_to_use","inserted_at":"2024-05-28T09:59:41.982214Z"},"long":{"value":"88.37248992919922","type":"string","label":"long","inserted_at":"2024-05-28T10:07:34.805838Z"},"lat":{"value":"22.487714767456055","type":"string","label":"lat","inserted_at":"2024-05-28T10:07:34.793335Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-05-28T09:55:47.389348Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-05-28T10:03:27.993553Z"}}',
          id: '2155103',
          maskedPhone: '9182******47',
          name: 'Trisha',
        },
        id: '18094',
        insertedAt: '2024-05-28T10:08:09Z',
        messageNumber: 23,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-05-28T10:08:09Z',
        user: null,
      },
      {
        __typename: 'Ticket',
        body: 'Thanks',
        contact: {
          __typename: 'Contact',
          fields:
            '{"user_age_group":{"value":"18 - 80","type":"string","label":"user_age_group","inserted_at":"2024-05-28T10:03:48.800155Z"},"name_to_use":{"value":"anandraj1972","type":"string","label":"name_to_use","inserted_at":"2024-05-28T10:03:36.412628Z"},"long":{"value":"76.813282","type":"string","label":"long","inserted_at":"2024-05-28T10:04:46.933017Z"},"lat":{"value":"17.3233922","type":"string","label":"lat","inserted_at":"2024-05-28T10:04:46.916571Z"},"keyword":{"value":"demo","type":"string","label":"keyword","inserted_at":"2024-05-28T09:58:59.522906Z"},"is_registered":{"value":"y","type":"string","label":"is_registered","inserted_at":"2024-05-28T10:03:48.858309Z"}}',
          id: '2155120',
          maskedPhone: '9194******89',
          name: 'anandraj1972',
        },
        id: '18093',
        insertedAt: '2024-05-28T10:05:35Z',
        messageNumber: 23,
        remarks: null,
        status: 'open',
        topic: 'Support',
        updatedAt: '2024-05-28T10:05:35Z',
        user: null,
      },
    ],
  };

  // Get item data here
  const [fetchUserCollections, { loading: loadingCollections, data: userCollections }] =
    useLazyQuery(GET_CURRENT_USER);

  const checkUserRole = () => {
    userRole = getUserRole();
  };

  useEffect(() => {
    // Todo: refetching values twice. Need to think of a better way to do this
    refetchValues();
    if (countQuery) {
      refetchCount();
    }
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
        countQuery && refetchCount();
        if (refetchValues) {
          refetchValues(filterPayload());
        }
      },
      refetchQueries: () => {
        if (refetchQueries)
          return refetchQueries.map((refetchQuery: any) => ({
            query: refetchQuery.query,
            variables: refetchQuery.variables,
          }));
        return [];
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
          <Tooltip title="Edit" placement="top">
            <IconButton className={styles.additonalButton}>
              <div aria-label={t('Edit')} data-testid="EditIcon">
                <div className={styles.IconWithText}>
                  <EditIcon className={styles.IconSize} />
                </div>
              </div>
            </IconButton>
          </Tooltip>
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

    if (actionsInsideMore.length > 0 || allowedAction.delete) {
      moreButton = (
        <IconButton
          data-testid="MoreIcon"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
            setShowMoreOptions(showMoreOptions == id ? '' : id);
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
          {allowedAction.edit && editButton}

          {/* do not display edit & delete for staff role in collection */}
          {userRolePermissions.manageCollections || item !== 'collections' ? (
            <div className={styles.MoreOptions}>
              {moreButton}
              {showMoreOptions == id && (
                <Backdrop className={styles.Backdrop} open onClick={() => setShowMoreOptions('')}>
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
                      {actionListMap(item, actionsInsideMore, true)}
                      <Divider className={styles.Divider}></Divider>
                      <MenuItem className={styles.MenuItem}>
                        {deleteButton(id, labelValue)}
                      </MenuItem>
                    </div>
                  </Menu>
                </Backdrop>
              )}
            </div>
          ) : null}
        </div>
      );
    }
    return null;
  }

  const getCheckbox = (listItem: any) => {
    if (checkbox && checkbox.show)
      return {
        checkbox: (
          <div className={styles.CheckboxLabel}>
            <Checkbox
              data-testid="checkbox"
              checked={checkbox?.selectedItems.some((item: any) => item.id === listItem.id)}
              onChange={(event: any) => {
                if (event.target.checked) {
                  checkbox?.setSelectedItems([...checkbox?.selectedItems, listItem]);
                } else {
                  checkbox?.setSelectedItems(
                    checkbox?.selectedItems.filter((item: any) => item.id !== listItem.id)
                  );
                }
              }}
            />
          </div>
        ),
      };
  };

  function formatList(listItems: Array<any>) {
    return listItems
      ? listItems.map(({ ...listItemObj }) => {
          // display only actions allowed to the user
          const allowedAction = restrictedAction
            ? restrictedAction(listItemObj)
            : { chat: true, edit: true, delete: true };

          const items = {
            ...getCheckbox(listItemObj),
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

  if (checkbox && checkbox.show) {
    columnStyles = [styles.Checkbox, ...columnStyles];
    columnNames = [
      {
        label: (
          <Checkbox
            checked={
              checkbox?.selectedItems.length !== 0 &&
              checkbox?.selectedItems.length === itemList.length
            }
            onChange={(event) => {
              if (event.target.checked) {
                checkbox?.setSelectedItems(data[listItem]);
              } else {
                checkbox?.setSelectedItems([]);
              }
            }}
          />
        ),
      },
      ...columnNames,
    ];
  }

  const handleCheckBoxAction = () => {
    checkbox?.action(checkbox?.selectedItems);
  };

  const displayList = (
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
      showPagination={countQuery ? true : false}
      checkboxSupport={{
        icon: checkbox?.icon,
        action: handleCheckBoxAction,
        selectedItems: checkbox?.selectedItems,
      }}
    />
  );

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
          data-testid="newItemButton"
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

  const searchBar = showSearch ? (
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
  ) : null;

  return (
    <div className={styles.ListContainer}>
      {showHeader && (
        <>
          <div className={styles.Header} data-testid="listHeader">
            <div>
              <div className={styles.Title}>
                {backLink && (
                  <BackIcon
                    onClick={() => navigate(backLink)}
                    className={styles.BackLink}
                    data-testid="back-button"
                  />
                )}
                <div className={styles.TitleText}> {title}</div>
                {helpData && <HelpIcon helpData={helpData} />}
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
            <div className={styles.FlexCenter}>{filterList}</div>
            {searchBar}
          </div>
        </>
      )}
      <div className={`${styles.Body} ${customStyles}`}>
        {/* Rendering list of items */}
        {displayList}
      </div>
    </div>
  );
};
