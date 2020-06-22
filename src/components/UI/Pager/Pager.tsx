import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
  Paper,
  TableSortLabel,
} from '@material-ui/core';

interface PagerProps {
  columnNames: Array<string>;
  data: any;
  totalRows: number;
  handleTableChange: Function;
  tableVals: {
    pageNum: number;
    pageRows: number;
    sortCol: string;
    sortDirection: 'asc' | 'desc';
  };
}
// Change name to Pager
export const Pager: React.SFC<PagerProps> = (props) => {
  // Creates the rows for the table
  const createRows = () => {
    const createRow = (entry: any) => {
      return Object.keys(entry).map((item: any, i: number) => {
        return <TableCell key={i}>{entry[item]}</TableCell>;
      });
    };
    return props.data.map((entry: any, i: number) => {
      return <TableRow key={i}>{createRow(entry)}</TableRow>;
    });
  };

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            {props.columnNames.map((name: string, i: number) => {
              return (
                <TableCell key={i}>
                  <TableSortLabel
                    active={name === props.tableVals.sortCol}
                    direction={props.tableVals.sortDirection}
                    onClick={() => {
                      props.handleTableChange('sortCol', name);
                      props.handleTableChange(
                        'sortDirection',
                        props.tableVals.sortDirection === 'asc' ? 'desc' : 'asc'
                      );
                    }}
                  >
                    {name}
                  </TableSortLabel>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>{createRows()}</TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              colSpan={props.columnNames.length}
              count={props.totalRows}
              onChangePage={(e, newPage) => {
                props.handleTableChange('pageNum', newPage);
              }}
              onChangeRowsPerPage={(e) => {
                props.handleTableChange('pageRows', parseInt(e.target.value, 10));
              }}
              page={props.tableVals.pageNum}
              rowsPerPage={props.tableVals.pageRows}
              rowsPerPageOptions={[10, 15, 20, 25, 30]} // for testing purposes, can be removed
            />
          </TableRow>
        </TableFooter>
      </Table>
    </Paper>
  );
};
