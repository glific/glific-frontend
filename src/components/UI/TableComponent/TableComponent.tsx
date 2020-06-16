import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';

export interface TableComponentProps {
  columns: any;
  data: any;
  totalRows: number;
  handleTableChange?: Function;
  tableVals?: {
    pageNum: number;
    pageRows: number;
    sortDirection: string;
  };
}

export const TableComponent: React.SFC<TableComponentProps> = (props) => {
  return (
    <DataTable
      columns={props.columns}
      data={props.data}
      paginationTotalRows={props.totalRows}
      noHeader
      pagination
      // Props for server-side pagination
      paginationServer
      // paginationServer={props.onChange ? true : false}
      sortServer
      // sortServer={props.onChange ? true : false}
      // Callback methods and var's for server-side pagination (for client-side, these will only change state and not call `useEffect`)
      onChangePage={(page, totalRows) => {
        if (props.handleTableChange) props.handleTableChange('pageNum', page);
      }} // passes (page, totalRows)
      onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
        if (props.handleTableChange) props.handleTableChange('pageRows', currentRowsPerPage);
      }} // passes (currentRowsPerPage, currentPage)
      onSort={(column, sortBy) => {
        // BUG: When trying to sort on a column, you have to click the column twice in order to see any changes.
        if (props.handleTableChange) {
          props.handleTableChange('pageNum', 1);
          props.handleTableChange('sortDirection', sortBy === 'asc' ? 'ASC' : 'DESC');
        }
      }} // passes (column, sortDirection, event)
      paginationPerPage={props.tableVals ? props.tableVals.pageRows : 10}
      defaultSortAsc={props.tableVals ? props.tableVals.sortDirection === 'ASC' : true} // used to change icon direction
    />
  );

  // const [pageNum, setPageNum] = useState(1);
  // const [pageRows, setPageRows] = useState(10);
  // const [sortDirection, setSortDirection] = useState('ASC');

  // // Use this for server-side pagination
  // useEffect(() => {
  //   console.log('called here!');
  //   if (typeof props.onChange != 'undefined') {
  //     props.onChange(pageRows, sortDirection);
  //   }
  // }, [pageRows, sortDirection]);

  // return (
  //   <DataTable
  //     columns={props.columns}
  //     data={props.data}
  //     paginationTotalRows={props.totalRows}
  //     noHeader
  //     pagination
  //     // Props for server-side pagination
  //     paginationComponent={paginationComp}
  //     paginationServer={props.onChange ? true : false}
  //     sortServer={props.onChange ? true : false}
  //     // Callback methods and var's for server-side pagination (for client-side, these will only change state and not call `useEffect`)
  //     onChangePage={(page, totalRows) => {
  //       console.log('setting page number to ', page);
  //       setPageNum(page);
  //     }} // passes (page, totalRows)
  //     onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
  //       console.log('changing num per page to ', currentRowsPerPage);
  //       setPageRows(currentRowsPerPage);
  //     }} // passes (currentRowsPerPage, currentPage)
  //     onSort={(column, sortBy) => {
  //       // BUG: When trying to sort on a column, you have to click the column twice in order to see any changes.
  //       setPageNum(1);
  //       setSortDirection(sortBy === 'asc' ? 'ASC' : 'DESC');
  //     }} // passes (column, sortDirection, event)
  //     paginationPerPage={pageRows}
  //     defaultSortAsc={sortDirection === 'ASC'} // used to change icon direction
  //   />
  // );
};
