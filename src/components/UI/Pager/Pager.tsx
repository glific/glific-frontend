import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
  TableSortLabel,
  Checkbox,
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
  showCheckbox?: boolean;
}

const createRows = (data: any, columnStyles: any, showCheckbox?: boolean) => {
  const createRow = (entry: any) => {
    return Object.keys(entry).map((item: any, i: number) => {
      return (
        <TableCell
          // eslint-disable-next-line
          key={i}
          className={`${styles.TableCell} ${columnStyles ? columnStyles[i] : null}`}
        >
          <div>{entry[item]}</div>
        </TableCell>
      );
    });
  };

  return data.map((entry: any) => {
    let batchAction = null;
    if (showCheckbox) {
      batchAction = <Checkbox />;
    }

    return (
      <TableRow key={entry.recordId} className={styles.TableRow}>
        {batchAction}
        {createRow(entry)}
      </TableRow>
    );
  });
};

const tableHeadColumns = (
  columnNames: Array<any>,
  columnStyles: any,
  tableVals: any,
  handleTableChange: Function,
  showCheckbox?: boolean
) => {
  let batchAction = null;
  if (showCheckbox) {
    batchAction = <Checkbox />;
  }
  return (
    <TableRow className={styles.TableHeadRow}>
      {batchAction}
      {columnNames.map((name: string, i: number) => {
        return (
          <TableCell
            // eslint-disable-next-line
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
};

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
  const {
    data,
    columnStyles,
    showCheckbox,
    columnNames,
    tableVals,
    handleTableChange,
    totalRows,
  } = props;

  // Creates the rows for the table
  const [tableFooterStyle, setTableFooterStyle] = useState<string | undefined>(undefined);

  const rows = createRows(data, columnStyles, showCheckbox);
  const tableHead = tableHeadColumns(
    columnNames,
    columnStyles,
    tableVals,
    handleTableChange,
    showCheckbox
  );

  const tablePagination = pagination(columnNames, totalRows, handleTableChange, tableVals);

  useEffect(() => {
    const table = document.querySelector('.MuiTable-root');
    const html = document.querySelector('html');
    if (table && html) {
      if (table.scrollHeight < html.clientHeight - 142) {
        setTableFooterStyle(styles.TableFooter);
      }
    }
  }, []);

  return (
    <div className={styles.TableContainer}>
      <Table className={styles.Table} data-testid="table">
        <TableHead className={styles.TagListHeader} data-testid="tableHead">
          {tableHead}
        </TableHead>
        <TableBody data-testid="tableBody">{rows}</TableBody>
        <TableFooter className={tableFooterStyle} data-testid="tableFooter">
          <TableRow>{tablePagination}</TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default Pager;
