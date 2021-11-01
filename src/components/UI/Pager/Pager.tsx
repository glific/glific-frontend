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
  Checkbox,
} from '@material-ui/core';

import { setColumnToBackendTerms } from 'common/constants';
import styles from './Pager.module.css';

interface PagerProps {
  columnNames: Array<any>;
  removeSortBy: Array<any>;
  data: any;
  columnStyles?: Array<any>;
  totalRows: number;
  handleTableChange: Function;
  listItemName: string;
  tableVals: {
    pageNum: number;
    pageRows: number;
    sortCol: string;
    sortDirection: 'asc' | 'desc';
  };
  showCheckbox?: boolean;
  collapseOpen: boolean;
  collapseRow: string | undefined;
}

// create a collapsible row
const collapsedRowData = (dataObj: any, columnStyles: any, recordId: any) => {
  // if empty dataObj
  if (Object.keys(dataObj).length === 0) {
    return (
      <TableRow className={styles.CollapseTableRow}>
        <TableCell className={`${styles.TableCell} ${columnStyles ? columnStyles[1] : null}`}>
          <div>
            <p className={styles.TableText}>No data available</p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const additionalRowInformation = Object.keys(dataObj).map((key, index) => {
    const rowIdentifier = `collapsedRowData-${recordId}-${index}`;

    return (
      <TableRow className={styles.CollapseTableRow} key={rowIdentifier}>
        <TableCell className={`${styles.TableCell} ${columnStyles ? columnStyles[0] : null}`}>
          <div>
            <div className={styles.LabelText}>{dataObj[key].label}</div>
          </div>
        </TableCell>
        <TableCell className={`${styles.TableCell} ${columnStyles ? columnStyles[1] : null}`}>
          <div>
            <p className={styles.TableText}>{dataObj[key].body}</p>
          </div>
        </TableCell>
        <TableCell className={`${styles.TableCell} ${columnStyles ? columnStyles[2] : null}`} />
        <TableCell className={`${styles.TableCell} ${columnStyles ? columnStyles[3] : null}`} />
      </TableRow>
    );
  });

  return additionalRowInformation;
};

const createRows = (
  data: any,
  columnStyles: any,
  showCheckbox?: boolean,
  collapseOpen: boolean = false,
  collapseRow?: string
) => {
  const createRow = (entry: any) => {
    let stylesIndex = -1;
    return Object.keys(entry).map((item: any) => {
      // let's not display recordId in the UI
      if (item === 'recordId' || item === 'translations' || item === 'id') {
        return null;
      }
      // maintain columnStyles index
      stylesIndex += 1;

      return (
        <TableCell
          key={item + entry.recordId}
          className={`${styles.TableCell} ${columnStyles ? columnStyles[stylesIndex] : null}`}
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

    let dataObj: any;
    if (entry.translations) dataObj = JSON.parse(entry.translations);
    return (
      <React.Fragment key={entry.recordId}>
        <TableRow key={entry.recordId} className={styles.TableRow}>
          {batchAction}
          {createRow(entry)}
        </TableRow>
        {collapseOpen && dataObj && entry.id === collapseRow
          ? collapsedRowData(dataObj, columnStyles, entry.recordId)
          : null}
      </React.Fragment>
    );
  });
};

const tableHeadColumns = (
  columnNames: Array<any>,
  columnStyles: any,
  tableVals: any,
  handleTableChange: Function,
  showCheckbox?: boolean,
  listName?: string,
  removeSortBy?: Array<any>
) => {
  let batchAction = null;
  if (showCheckbox) {
    batchAction = <Checkbox />;
  }
  return (
    <TableRow className={styles.TableHeadRow}>
      {batchAction}
      {columnNames.map((name: string, i: number) => (
        <TableCell
          key={name}
          className={`${styles.TableCell} ${columnStyles ? columnStyles[i] : null}`}
        >
          {i !== columnNames.length - 1 && name !== '' && !removeSortBy?.includes(name) ? (
            <TableSortLabel
              active={setColumnToBackendTerms(listName, name) === tableVals.sortCol}
              direction={tableVals.sortDirection}
              onClick={() => {
                if (setColumnToBackendTerms(listName, name) !== tableVals.sortCol) {
                  handleTableChange('sortCol', name);
                } else {
                  handleTableChange('sortCol', name);
                  handleTableChange(
                    'sortDirection',
                    tableVals.sortDirection === 'asc' ? 'desc' : 'asc'
                  );
                }
              }}
            >
              {name}
            </TableSortLabel>
          ) : (
            name
          )}
        </TableCell>
      ))}
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
    onPageChange={(e, newPage) => {
      handleTableChange('pageNum', newPage);
    }}
    onRowsPerPageChange={(e) => {
      handleTableChange('pageRows', parseInt(e.target.value, 10));
    }}
    page={tableVals.pageNum}
    rowsPerPage={tableVals.pageRows}
    rowsPerPageOptions={[50, 75, 100, 150, 200]}
  />
);

export const Pager: React.SFC<PagerProps> = (props) => {
  const {
    data,
    columnStyles,
    showCheckbox,
    columnNames,
    tableVals,
    listItemName,
    handleTableChange,
    totalRows,
    collapseOpen,
    collapseRow,
    removeSortBy = [],
  } = props;

  const rows = createRows(data, columnStyles, showCheckbox, collapseOpen, collapseRow);
  const tableHead = tableHeadColumns(
    columnNames,
    columnStyles,
    tableVals,
    handleTableChange,
    showCheckbox,
    listItemName,
    removeSortBy
  );

  const tablePagination = pagination(columnNames, totalRows, handleTableChange, tableVals);

  return (
    <div className={styles.TableContainer}>
      <Table className={styles.Table} data-testid="table">
        <TableHead className={styles.TagListHeader} data-testid="tableHead">
          {tableHead}
        </TableHead>
        <TableBody data-testid="tableBody">{rows}</TableBody>
        <TableFooter className={styles.TableFooter} data-testid="tableFooter">
          <TableRow>{tablePagination}</TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default Pager;
