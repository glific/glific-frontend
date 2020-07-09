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
export const Pager: React.SFC<PagerProps> = (props) => {
  // Creates the rows for the table
  const createRows = () => {
    const createRow = (entry: any) => {
      return Object.keys(entry).map((item: any, i: number) => {
        return (
          <TableCell
            key={i}
            className={`${styles.TableCell} ${props.columnStyles ? props.columnStyles[i] : null}`}
          >
            {entry[item]}
          </TableCell>
        );
      });
    };
    return props.data.map((entry: any, i: number) => {
      return (
        <TableRow key={i} className={styles.TableRow}>
          {createRow(entry)}
        </TableRow>
      );
    });
  };

  return (
    <div className={styles.TableContainer}>
      <Table className={styles.Table}>
        <TableHead className={styles.TagListHeader}>
          <TableRow className={styles.TableHeadRow}>
            {props.columnNames.map((name: string, i: number) => {
              return (
                <TableCell
                  key={i}
                  className={`${styles.TableCell} ${
                    props.columnStyles ? props.columnStyles[i] : null
                  }`}
                >
                  {i !== props.columnNames.length - 1 ? (
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
                  ) : (
                    name
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>{createRows()}</TableBody>
        <TableFooter className={styles.TableFooter}>
          <TableRow>
            <TablePagination
              className={styles.FooterRow}
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
    </div>
  );
};
