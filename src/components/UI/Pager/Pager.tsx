import { Fragment } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  TableSortLabel,
  TableContainer,
  Skeleton,
} from '@mui/material';
import { ColumnNames } from 'containers/List/List';
import styles from './Pager.module.css';

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
  showPagination?: boolean;
  checkboxSupport?: { action: any; icon: any; selectedItems: any };
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

    // This is for location translation type where the text is inside body.
    const body = typeof dataObj[key].body === 'string' ? dataObj[key].body : dataObj[key].body.text;

    return (
      <TableRow key={rowIdentifier}>
        <TableCell className={`${columnStyles ? columnStyles[0] : null}`}>
          <div>
            <div className={styles.LabelText}>{dataObj[key].label}</div>
          </div>
        </TableCell>
        <TableCell className={`${columnStyles ? columnStyles[1] : null}`}>
          <div>
            <p className={styles.TableText}>{body}</p>
          </div>
        </TableCell>
      </TableRow>
    );
  });

  return additionalRowInformation;
};

const createRows = (
  data: any,
  columnStyles: any,
  collapseRow?: string,
  collapseOpen: boolean = false
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
  totalRows: number,
  checkboxSupport?: { action: any; icon: any; selectedItems: any }
) => {
  let headerRow;

  if (checkboxSupport?.selectedItems && checkboxSupport?.selectedItems.length > 0) {
    headerRow = (
      <TableRow className={styles.TableHeadRow}>
        <TableCell className={styles.RowHeadStyle}>{columnNames[0].label}</TableCell>
        <TableCell className={styles.SelectedItems}>
          {checkboxSupport?.selectedItems.length} of {totalRows} selected
        </TableCell>
        <TableCell colSpan={3} className={styles.Icon}>
          <span
            onClick={() => {
              checkboxSupport?.action();
            }}
          >
            {checkboxSupport?.icon}
          </span>
        </TableCell>
      </TableRow>
    );
  } else {
    headerRow = (
      <TableRow className={styles.TableHeadRow}>
        {columnNames.map((field: any, i: number) => (
          <TableCell
            key={field.label}
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
                      tableVals.sortDirection === 'asc' ? 'desc' : 'asc'
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
  }

  return headerRow;
};

const pagination = (
  columnNames: Array<any>,
  totalRows: number,
  handleTableChange: Function,
  tableVals: any
) => (
  <TablePagination
    component="div"
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
  showPagination = true,
  checkboxSupport,
}: PagerProps) => {
  const rows = createRows(data, columnStyles, collapseRow, collapseOpen);
  const tableHead = tableHeadColumns(
    columnNames,
    columnStyles,
    tableVals,
    handleTableChange,
    totalRows,
    checkboxSupport
  );
  const tablePagination = pagination(columnNames, totalRows, handleTableChange, tableVals);

  return (
    <div className={styles.TableContainer}>
      <TableContainer
        className={`${styles.StyleForContainer} ${!showPagination ? styles.HeightFull : styles.HeightShort}`}
      >
        <Table stickyHeader aria-label="sticky table" data-testid="table">
          <TableHead data-testid="tableHead">{tableHead}</TableHead>
          <TableBody data-testid="tableBody">{!loadingList && data.length > 0 && rows}</TableBody>
        </Table>
        {loadingList && (
          <div className={styles.Skeleton} data-testid="loading">
            {[...Array(3).keys()].map((key) => (
              <Skeleton
                key={key}
                variant="rounded"
                width={'100%'}
                height={50}
                className={styles.Skeleton}
              />
            ))}
          </div>
        )}
        {!loadingList && data.length == 0 && <div className={`${styles.Body} `}>{noItemsText}</div>}
      </TableContainer>
      {showPagination && (
        <div className={styles.TableFooter} data-testid="tableFooter">
          <div>{tablePagination}</div>
        </div>
      )}
    </div>
  );
};

export default Pager;
