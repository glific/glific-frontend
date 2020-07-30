import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';
import styles from './Pager.module.css';
import Checkbox from '@material-ui/core/Checkbox';

interface PagerProps {
  columnNames: Array<any>;
  data: any;
  columnStyles?: Array<any>;
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

const createRows = (data: any, columnStyles: any) => {
  const createRow = (entry: any) => {
    return Object.keys(entry).map((item: any, i: number) => {
      return (
        <TableCell
          key={i}
          className={`${styles.TableCell} ${columnStyles ? columnStyles[i] : null}`}
        >
          <div>{entry[item]}</div>
        </TableCell>
      );
    });
  };
  return data.map((entry: any, i: number) => {
    return (
      <TableRow key={i} className={styles.TableRow}>
        {createRow(entry)}
      </TableRow>
    );
  });
};

const tableHeadColumns = (
  columnNames: Array<any>,
  columnStyles: any,
  tableVals: any,
  handleTableChange: Function
) => (
  <TableRow className={styles.TableHeadRow}>
    {columnNames.map((name: string, i: number) => {
      return (
        <TableCell
          key={i}
          className={`${styles.TableCell} ${columnStyles ? columnStyles[i] : null}`}
        >
          {i !== columnNames.length - 1 ? (
            <TableSortLabel
              active={name === tableVals.sortCol}
              direction={tableVals.sortDirection}
              onClick={() => {
                handleTableChange('sortCol', name);
                handleTableChange(
                  'sortDirection',
                  tableVals.sortDirection === 'asc' ? 'desc' : 'asc'
                );
              }}
            >
              {name}
            </TableSortLabel>
          ) : (
            name
          )}
        </TableCell>
      );
    })}
  </TableRow>
);

const pagination = (
  columnNames: Array<any>,
  totalRows: number,
  handleTableChange: Function,
  tableVals: any
) => (
  <TablePagination
    className={styles.FooterRow}
    colSpan={columnNames.length}
    count={totalRows}
    onChangePage={(e, newPage) => {
      handleTableChange('pageNum', newPage);
    }}
    onChangeRowsPerPage={(e) => {
      handleTableChange('pageRows', parseInt(e.target.value, 10));
    }}
    page={tableVals.pageNum}
    rowsPerPage={tableVals.pageRows}
    rowsPerPageOptions={[10, 15, 20, 25, 30]} // for testing purposes, can be removed
  />
);

export const Pager: React.SFC<PagerProps> = (props) => {
  // Creates the rows for the table

  const rows = createRows(props.data, props.columnStyles);
  const tableHead = tableHeadColumns(
    props.columnNames,
    props.columnStyles,
    props.tableVals,
    props.handleTableChange
  );

  const tablePagination = pagination(
    props.columnNames,
    props.totalRows,
    props.handleTableChange,
    props.tableVals
  );

  return (
    <div className={styles.TableContainer}>
      <Table className={styles.Table}>
        <TableHead className={styles.TagListHeader}>{tableHead}</TableHead>
        <TableBody>{rows}</TableBody>
        <TableFooter className={styles.TableFooter}>
          <TableRow>{tablePagination}</TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
