import React from 'react';
import { useQuery } from '@apollo/client';

import { FILTER_FLOW } from 'graphql/queries/Flow';
import Loading from 'components/UI/Layout/Loading/Loading';
import Pager from 'components/UI/Pager/Pager';
import { setErrorMessage } from 'common/notification';
import { formatList } from 'containers/List/List.helper';

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export interface PinnedProps {
  columnNames?: Array<string>;
  columnStyles: Array<any>;
  removeSortBy?: any;
  itemCount?: number;
  handleTableChange?: Function | any;
  tableVals?: TableVals;
  showCheckbox?: boolean;
  collapseOpen?: boolean;
  collapseRow?: string;
  columns: any;
  restrictedAction?: any;
  editIconLink: Function;
  deleteIconLink?: Function | undefined;
  iconsSection: Function;
}

const PinnedFlow: React.FunctionComponent<PinnedProps> = ({
  columnNames = [],
  columnStyles,
  removeSortBy = null,
  tableVals = {
    pageNum: 0,
    pageRows: 50,
    sortCol: 'name',
    sortDirection: 'asc',
  },
  columns,
  restrictedAction,
  editIconLink,
  deleteIconLink,
  iconsSection,
}: PinnedProps) => {
  // Get item data here
  const {
    loading: pinnedDataLoading,
    error: pinnedDataError,
    data: pinnedFlows,
  } = useQuery(FILTER_FLOW, {
    fetchPolicy: 'network-only',
    variables: {
      filter: { isPinned: true },
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: 'name',
      },
    },
  });

  const itemList = pinnedFlows
    ? formatList({
        listItems: pinnedFlows.flows,
        restrictedAction,
        columns,
        pinned: true,
        editSupport: true,
        editIconLink,
        deleteIconLink,
        iconsSection,
      })
    : [];

  if (pinnedDataLoading) return <Loading />;
  if (pinnedDataError) {
    setErrorMessage(pinnedDataError);
    return null;
  }

  return (
    <div>
      <Pager
        columnStyles={columnStyles}
        removeSortBy={removeSortBy}
        columnNames={columnNames}
        data={itemList}
        listItemName="flow"
        totalRows={0}
        handleTableChange={() => {}}
        tableVals={tableVals}
        showCheckbox={false}
        collapseOpen={false}
        collapseRow={undefined}
      />
    </div>
  );
};

export default PinnedFlow;
