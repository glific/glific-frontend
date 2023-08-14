import { Fragment } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
  TableSortLabel,
  TableContainer,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import { ColumnNames } from 'containers/List/List';
import styles from './Pager.module.css';
import Loading from '../Layout/Loading/Loading';

const removeDisplayColumns = ['recordId', 'translations', 'id', 'isActive'];
interface PagerProps {
  columnNames: Array<ColumnNames>;
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
  collapseOpen: boolean;
  loadingList?: boolean;
  collapseRow: string | undefined;
  noItemsText?: any;
}

// TODO: cleanup the translations code
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
      <TableRow key={rowIdentifier}>
        <TableCell className={`${columnStyles ? columnStyles[0] : null}`}>
          <div>
            <div className={styles.LabelText}>{dataObj[key].label}</div>
          </div>
        </TableCell>
        <TableCell className={`${columnStyles ? columnStyles[1] : null}`}>
          <div>
            <p className={styles.TableText}>{dataObj[key].body}</p>
          </div>
        </TableCell>
        <TableCell className={`${columnStyles ? columnStyles[2] : null}`} />
        <TableCell className={`${columnStyles ? columnStyles[3] : null}`} />
      </TableRow>
    );
  });

  return additionalRowInformation;
};

const createRows = (
  data: any,
  columnStyles: any,
  collapseRow?: string,
  collapseOpen: boolean = false,
) => {
  const createRow = (entry: any) => {
    let stylesIndex = -1;
    return Object.keys(entry).map((item: any) => {
      // let's not display recordId in the UI
      if (removeDisplayColumns.includes(item)) {
        return null;
      }
      // maintain columnStyles index
      stylesIndex += 1;

      return (
        <TableCell
          key={item + entry.recordId}
          className={`${columnStyles && columnStyles[stylesIndex]} ${styles.RowStyle}`}
        >
          {entry[item]}
        </TableCell>
      );
    });
  };

  return data.map((entry: any) => {
    console.log(entry);
    let dataObj: any;
    const isActiveRow = entry.isActive === false ? styles.InactiveRow : styles.ActiveRow;
    if (entry.translations) dataObj = JSON.parse(entry.translations);

    return (
      <Fragment key={entry.recordId}>
        <TableRow className={`${isActiveRow}`}>{createRow(entry)}</TableRow>
        {collapseOpen && dataObj && entry.id === collapseRow
          ? collapsedRowData(dataObj, columnStyles, entry.recordId)
          : null}
      </Fragment>
    );
  });
};

const tableHeadColumns = (
  columnNames: Array<any>,
  columnStyles: any,
  tableVals: any,
  handleTableChange: Function,
) => {
  const headerRow = (
    <TableRow className={styles.TableHeadRow}>
      {columnNames.map((field: any, i: number) => (
        <TableCell
          key={uuidv4()}
          className={`${columnStyles && columnStyles[i]} ${styles.RowHeadStyle}`}
        >
          {i !== columnNames.length - 1 && field.name ? (
            <TableSortLabel
              active={field.name === tableVals.sortCol}
              direction={tableVals.sortDirection}
              onClick={() => {
                if (field.name !== tableVals.sortCol) {
                  handleTableChange('sortCol', field.name);
                } else {
                  handleTableChange('sortCol', field.name);
                  handleTableChange(
                    'sortDirection',
                    tableVals.sortDirection === 'asc' ? 'desc' : 'asc',
                  );
                }
              }}
              className={styles.HeaderColor}
            >
              {field.label}
            </TableSortLabel>
          ) : (
            field.label
          )}
        </TableCell>
      ))}
    </TableRow>
  );
  return headerRow;
};

const pagination = (
  columnNames: Array<any>,
  totalRows: number,
  handleTableChange: Function,
  tableVals: any,
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

export const Pager = ({
  data,
  columnStyles,
  columnNames,
  tableVals,
  handleTableChange,
  totalRows,
  collapseOpen,
  collapseRow,
  loadingList = false,
  noItemsText,
}: PagerProps) => {
  const rows = createRows(data, columnStyles, collapseRow, collapseOpen);
  const tableHead = tableHeadColumns(columnNames, columnStyles, tableVals, handleTableChange);
  const tablePagination = pagination(columnNames, totalRows, handleTableChange, tableVals);

  return (
    <div className={styles.TableContainer}>
      <TableContainer className={styles.StyleForContainer}>
        <Table stickyHeader aria-label="sticky table" data-testid="table">
          <TableHead data-testid="tableHead">{tableHead}</TableHead>
          <TableBody data-testid="tableBody">{!loadingList && data.length > 0 && rows}</TableBody>
        </Table>
        {loadingList && (
          <div className={styles.Body}>
            <Loading />
          </div>
        )}
        {!loadingList && data.length == 0 && <div className={styles.Body}>{noItemsText}</div>}
      </TableContainer>
      <TableFooter className={styles.TableFooter} data-testid="tableFooter">
        <TableRow>{tablePagination}</TableRow>
      </TableFooter>
    </div>
  );
};

export default Pager;
