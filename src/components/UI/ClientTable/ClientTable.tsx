import React from 'react';
import DataTable from 'react-data-table-component';

export interface ClientTableProps {
  columns: any;
  data: any;
}

export const ClientTable: React.SFC<ClientTableProps> = (props) => {
  return <DataTable columns={props.columns} data={props.data} noHeader pagination />;
};

// export interface TableProps {
//   columns: any;
//   data: any;
//   totalRows: number;
//   handleTableChange?: Function;
//   tableVals?: {
//     pageNum: number;
//     pageRows: number;
//     sortDirection: string;
//   };
// }

// export const Table: React.SFC<TableProps> = (props) => {
//   return (
//     <DataTable
//       columns={props.columns}
//       data={props.data}
//       noHeader
//       pagination
//       // paginationTotalRows={props.totalRows}
//       // // Props for server-side pagination
//       // paginationServer={props.tableVals ? true : false}
//       // sortServer={props.tableVals ? true : false}
//       // onChangePage={(page, totalRows) => {
//       //   // BUG: When trying to change page, you hage to click twice to see any changes.
//       //   if (props.handleTableChange) props.handleTableChange('pageNum', page);
//       // }}
//       // onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
//       //   if (props.handleTableChange) props.handleTableChange('pageRows', currentRowsPerPage);
//       // }}
//       // onSort={(column, sortBy) => {
//       //   // BUG: When trying to sort on a column, you have to click the column twice in order to see any changes.
//       //   if (props.handleTableChange) {
//       //     props.handleTableChange('pageNum', 1);
//       //     props.handleTableChange('sortDirection', sortBy === 'asc' ? 'ASC' : 'DESC');
//       //   }
//       // }} // passes (column, sortDirection, event)
//       // paginationPerPage={props.tableVals ? props.tableVals.pageRows : 10}
//       // defaultSortAsc={props.tableVals ? props.tableVals.sortDirection === 'ASC' : true} // used to change icon direction
//     />
//   );

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
// };
